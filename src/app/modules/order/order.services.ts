/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Order } from "./order.model";
import { User } from "../user/user.model";
import { Course } from "../course/course.model";
import { Event } from "../event/event.model";
import { PaymentService } from "../payment/payment.services";
import { OrderSource } from "./order.interface";


import { Types } from "mongoose";
import { GamificationServices } from "../gamification/gamification.service";
import { JwtPayload } from "jsonwebtoken";


const assertAdmin = (actor: { userId: string; role: string }) => {
  const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
  if (!isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Admin only");
};

const ensureOrder = async (orderId: string) => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid order id");
  }
  const ord = await Order.findById(orderId);
  if (!ord) throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  return ord;
};

/** Admin: cancel order */
const cancelOrder = async (
  orderId: string,
  payload: { reason?: string },
  actor: { userId: string; role: string }
) => {
  assertAdmin(actor);
  const ord = await ensureOrder(orderId);
  ord.status = "canceled";
  await ord.save();
  return ord;
};




const resolvePrice = async (course: any, couponCode?: string) => {
  const basePrice = Number(course.price ?? 0);
  const currency = course.currency ?? "BDT";

  let originalPrice = basePrice;
  let discountAmount = 0;
  let discountPercentage = 0;
  let finalPrice = basePrice;

  try {
    const { CourseDiscountServices } = await import("../courseDiscount/courseDiscount.service");
    const discount = await CourseDiscountServices.getDiscount();
    if (discount && discount.isActive && discount.percentage > 0 && basePrice > 0) {
      discountPercentage = discount.percentage;
      discountAmount = Math.round((basePrice * discount.percentage) / 100);
      finalPrice = Math.max(0, basePrice - discountAmount);
    }
  } catch (err) {
    console.error("Error checking course discount in resolvePrice:", err);
  }

  return {
    price: finalPrice,
    originalPrice,
    discountAmount,
    discountPercentage,
    currency,
  };
};

/* ----------------------- NORMAL COURSE CHECKOUT ----------------------- */
const createCheckout = async (
  courseId: string,
  userId: string,
  provider: "sslcommerz",
  itemType: OrderSource,
  couponCode?: string,
  billingInfo?: {}
) => {
  const course = await Course.findById(courseId);
  if (!course || (course as any).isDeleted)
    throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const { price, originalPrice, discountAmount, discountPercentage, currency } = await resolvePrice(course, couponCode);
  // Handle free courses - auto-complete order and enroll
  if (price === 0) {
    const order = await Order.create({
      user: userId,
      course: courseId,
      price,
      originalPrice,
      discountAmount,
      discountPercentage,
      currency,
      provider: `"free"_${Math.random() * 100 * 100}`, // Special provider for free courses
      itemType,
      status: "paid", // Mark as completed immediately
      couponCode,
      billingInfo
    });

    if (discountAmount > 0) {
      try {
        const { DonationSpend } = await import("../donationSpend/donationSpend.model");
        const studentUser = await User.findById(userId);
        const spend = await DonationSpend.create({
          title: `Scholarship Subsidy: ${course.title || "Course"}`,
          fund: "educational-scholarships",
          amount: discountAmount,
          category: "Scholarships & Stipends",
          recipient: `${studentUser?.name || "Student"} (${studentUser?.email || ""})`,
          description: `Full scholarship discount (${discountPercentage}%) subsidy applied for course enrollment "${course.title || "Course"}". Subsidized ৳${discountAmount} from original price ৳${originalPrice}.`,
          handledBy: "Auto System (Scholarship Fund)",
          createdBy: userId as any,
          order: order._id,
          course: course._id,
          discountPercentage,
          originalPrice,
          studentUser: userId as any,
          spentDate: new Date()
        });

        order.scholarshipFundDeducted = true;
        order.donationSpendId = spend._id;
        await order.save();
      } catch (deductErr) {
        console.error("Error auto-deducting 100% scholarship discount:", deductErr);
      }
    }


    // Auto-enroll the user in the free course
    const { EnrollmentServices } = await import('../enrollment/enrollment.services');

     
     await EnrollmentServices.enrollSelf(courseId, userId, course?.instructor?.toString());

    // Award enrollment points for free course
    const { GamificationServices } = await import('../gamification/gamification.service');
    await GamificationServices.addPoints({
      userId,
      points: 20,
      sourceType: "enrollment",
      courseId: courseId,
      reason: "Free course enrollment",
    });


    const res = await Course.findByIdAndUpdate(
      courseId,
      {
        $inc: { noOfStudents: 1 },
      },
      { new: true }
    );

    return {
      orderId: String(order._id),
      checkoutUrl: null, // No payment URL needed for free courses
      isFree: true,
      message: "Enrolled successfully in free course!"
    };
  }

  // Handle paid courses - create payment session
  const order = await Order.create({
    user: userId,
    course: courseId,
    price,
    originalPrice,
    discountAmount,
    discountPercentage,
    currency,
    provider,
    itemType,
    status: "pending",
    couponCode,
    billingInfo
  });

  const session = await PaymentService.createCheckoutSession({
    provider,
    orderId: String(order._id),
    amount: price,
    currency,
    courseId: String(course._id),
    userId: String(userId),
    source: itemType,
    billingInfo: billingInfo as any,
  });

  order.providerSessionId = session.sessionId;
  await order.save();

  return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
};

const createDonationCheckout = async (
  fund: string,
  userId?: string,
  provider: "sslcommerz" = "sslcommerz",
  amount: number = 0,
  donorInfo?: { name?: string; email?: string; phone?: string; image?: string; avatar?: string }
) => {
  let linkedUserId: any = userId;
  let existingUser: any = null;

  if (!linkedUserId && (donorInfo?.phone || donorInfo?.email)) {
    existingUser = await User.findOne({
      $or: [
        ...(donorInfo.phone ? [{ phone: donorInfo.phone.trim() }] : []),
        ...(donorInfo.email ? [{ email: donorInfo.email.trim() }] : [])
      ]
    });
    if (existingUser) {
      linkedUserId = existingUser._id;
    }
  } else if (linkedUserId) {
    existingUser = await User.findById(linkedUserId);
  }

  const cleanPhone = donorInfo?.phone?.trim() || "";
  const donorPhoto = donorInfo?.image?.trim() || donorInfo?.avatar?.trim() || existingUser?.picture || "";

  const order = await Order.create({
    user: linkedUserId,
    donorName: donorInfo?.name?.trim(),
    donorEmail: donorInfo?.email?.trim(),
    donorPhone: cleanPhone,
    donorImage: donorPhoto,
    billingInfo: {
      ...donorInfo,
      image: donorPhoto,
    },
    fund: fund,
    price: amount,
    currency: "BDT",
    provider,
    itemType: "Donation",
    status: "pending",
  });

  const session = await PaymentService.createCheckoutSession({
    provider,
    orderId: String(order._id),
    amount: amount,
    currency: 'BDT',
    userId: linkedUserId ? String(linkedUserId) : String(order._id),
    source: "Donation",
    billingInfo: {
      ...donorInfo,
      image: donorPhoto,
    }
  });

  order.providerSessionId = session.sessionId;
  await order.save();

  return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
};

const getDonationsByPhone = async (phone: string) => {
  if (!phone) throw new AppError(httpStatus.BAD_REQUEST, "Phone number is required");
  const cleanPhone = phone.trim();

  const usersWithPhone = await User.find({ phone: cleanPhone }).select('_id');
  const userIds = usersWithPhone.map(u => u._id);

  const query: any = {
    itemType: "Donation",
    isDeleted: false,
    $or: [
      { donorPhone: cleanPhone },
      { "billingInfo.phone": cleanPhone },
      ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : [])
    ]
  };

  const donations = await Order.find(query).sort({ createdAt: -1 });
  const totalDonated = donations
    .filter(d => d.status === "paid")
    .reduce((sum, d) => sum + (d.price || 0), 0);

  return {
    phone: cleanPhone,
    totalDonated,
    count: donations.length,
    paidCount: donations.filter(d => d.status === "paid").length,
    donations
  };
};


/* ----------------------- ORDERS FETCHING ----------------------- */
const getMyOrders = async (userId: string) =>{
  const orders = await Order.find({ user: userId, isDeleted: false })
    .populate("event", "title eventDate thumbnail location price")
    .sort({ createdAt: -1 });
  return orders;
};

const getOrderById = async (
  orderId: string,
  actor: { userId: string; role: string }
) => {
  const ord = await Order.findById(orderId);
  if (!ord) throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");

  const isOwner = String(ord.user) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
  if (!(isOwner || isAdmin))
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  return ord;
};

const getOrderBySessionId = async (
  sessionId: string,
  actor: { userId: string; role: string }
) => {
  let ord = await Order.findOne({ providerSessionId: sessionId });
  
  if (!ord && sessionId.match(/^[0-9a-fA-F]{24}$/)) {
    ord = await Order.findById(sessionId);
  }

  if (!ord) throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");

  // Allow public access to Donation orders (no login needed)
  if (ord.itemType === "Donation") {
    return ord;
  }

  const isOwner = ord.user && String(ord.user) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
  if (!(isOwner || isAdmin))
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  return ord;
};

const getOrders = async (query: any = {}) => {
  const { q, page = 1, limit = 10, ...filters } = query;

  // Build aggregation pipeline
  const pipeline: any = [
    {
      $match: { isDeleted: false, ...filters }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData"
      },
    },
    {
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: true
      }
    },
    {
    $lookup: {
      from: "events",
      localField: "event",
      foreignField: "_id",
      as: "eventData"
    }
  },
  {
    $unwind: {
      path: "$eventData",
      preserveNullAndEmptyArrays: true
    }
  },
  ];

  // Add search filter if query exists
  if (q) {
    pipeline.push({
      $match: {
        $or: [
          { providerPaymentId: { $regex: q, $options: 'i' } },
          { donorName: { $regex: q, $options: 'i' } },
          { donorEmail: { $regex: q, $options: 'i' } },
          { donorPhone: { $regex: q, $options: 'i' } },
          { "userData.name": { $regex: q, $options: 'i' } },
          { "userData.email": { $regex: q, $options: 'i' } }
        ]
      }
    });
  }

  // Add projection and pagination stages
  pipeline.push(
    {
      $project: {
        transactionId: {
          $cond: {
            if: { $and: [{ $ne: ["$providerPaymentId", null] }, { $ne: ["$providerPaymentId", ""] }] },
            then: "$providerPaymentId",
            else: { $toString: "$_id" }
          }
        },
        userName: {
          $ifNull: [
            "$donorName",
            { $ifNull: ["$billingInfo.name", "$userData.name"] }
          ]
        },
        userEmail: {
          $ifNull: [
            "$donorEmail",
            { $ifNull: ["$billingInfo.email", "$userData.email"] }
          ]
        },
        userPhone: {
          $ifNull: [
            "$donorPhone",
            { $ifNull: ["$billingInfo.phone", "$userData.phone"] }
          ]
        },
        donorName: 1,
        donorEmail: 1,
        donorPhone: 1,
        donorImage: 1,
        billingInfo: 1,
        amount: "$price",
        currency: "$currency",
        originalPrice: 1,
        discountAmount: 1,
        discountPercentage: 1,
        scholarshipFundDeducted: 1,
        date: "$createdAt",
        status: "$status",
        itemType: "$itemType",
        provider: "$provider",
        course: 1,
        createdAt: 1,
        fund: 1,
        event: "$eventData.title"
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $skip: (page - 1) * limit
    },
    {
      $limit: limit * 1
    }
  );

  // Clone pipeline for count (remove pagination stages)
  const countPipeline = [...pipeline];
  countPipeline.splice(-3, 3); // Remove sort, skip, limit stages

  // Execute queries
  const [orders, countResult] = await Promise.all([
    Order.aggregate(pipeline),
    Order.aggregate([...countPipeline, { $count: "total" }])
  ]);

  const total = countResult[0]?.total || 0;

  // Format the data
  const formattedOrders = orders.map(order => ({
    ...order,
    donorName: order.donorName || order.userName,
    donorEmail: order.donorEmail || order.userEmail,
    donorPhone: order.donorPhone || order.userPhone || order.billingInfo?.phone,
    donorImage: order.donorImage || order.billingInfo?.image || order.userData?.picture || null,
    originalPrice: order.originalPrice,
    discountAmount: order.discountAmount || 0,
    discountPercentage: order.discountPercentage || 0,
    scholarshipFundDeducted: order.scholarshipFundDeducted || false,
    amountFormatted: `${order.amount.toFixed(2)} ${order.currency.toUpperCase()}`,
    dateFormatted: new Date(order.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }));

  return {
    orders: formattedOrders,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

const createCheckoutForEvent = async (input: {
  eventId: string;
  userId: string;
  amount: number;
  currency: string;
  name: Record<string, string>;
}) => {
  const order = await Order.create({
    user: input.userId,
    event: input.eventId,
    price: input.amount,
    currency: input.currency,
    provider: "sslcommerz",
    status: "pending",
    itemType: "event",
  });

  const session = await PaymentService.createCheckoutSession({
    provider: "sslcommerz",
    orderId: String(order._id),
    amount: input.amount,
    currency: input.currency,
    eventId: input.eventId,
    userId: input.userId,
    source: "event",
  });
  order.providerSessionId = session.sessionId;
  await order.save();
  return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
};

/* ----------------------- EXPORT ----------------------- */
export const OrderServices = {
  createCheckout,
  getMyOrders,
  getOrderById,
  getOrderBySessionId,
  getOrders,
  cancelOrder,
  createDonationCheckout,
  getDonationsByPhone,
  createCheckoutForEvent
};
