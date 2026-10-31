import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { CourseDiscount } from "./courseDiscount.model";
import { ICourseDiscount } from "./courseDiscount.interface";
import { Order } from "../order/order.model";
import { DonationSpendServices } from "../donationSpend/donationSpend.service";

const getDiscount = async () => {
  let doc = await CourseDiscount.findOne().populate("updatedBy", "name email");
  if (!doc) {
    doc = await CourseDiscount.create({
      percentage: 0,
      isActive: false,
      fundedBy: "educational-scholarships",
      title: "General Scholarship Subsidy"
    });
  }

  // Get current scholarship fund balance
  let scholarshipFundBalance = 0;
  try {
    const summary = await DonationSpendServices.getSummary();
    const scholarshipFund = summary?.fundBreakdown?.find(
      (f: any) => f.fund === "educational-scholarships"
    );
    scholarshipFundBalance = scholarshipFund?.balance || 0;
  } catch (err) {
    console.error("Error getting scholarship fund balance:", err);
  }

  return {
    ...doc.toObject(),
    scholarshipFundBalance
  };
};

const updateDiscount = async (
  payload: Partial<ICourseDiscount>,
  actorUserId?: string
) => {
  let doc = await CourseDiscount.findOne();
  if (!doc) {
    doc = new CourseDiscount();
  }

  if (payload.percentage !== undefined) {
    const p = Number(payload.percentage);
    if (isNaN(p) || p < 0 || p > 100) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Discount percentage must be a number between 0 and 100"
      );
    }
    doc.percentage = p;
  }

  if (payload.isActive !== undefined) {
    doc.isActive = Boolean(payload.isActive);
  }

  if (payload.title) {
    doc.title = payload.title.trim();
  }

  if (payload.fundedBy) {
    doc.fundedBy = payload.fundedBy.trim();
  }

  if (actorUserId) {
    doc.updatedBy = actorUserId as any;
  }

  await doc.save();
  const populated = await CourseDiscount.findById(doc._id).populate(
    "updatedBy",
    "name email"
  );
  return populated;
};

const getSubsidyHistory = async (query: any = {}) => {
  const { q, page = 1, limit = 20 } = query;

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.max(1, parseInt(String(limit), 10) || 20);
  const skip = (pageNum - 1) * limitNum;

  // Find paid course orders where a discount was applied
  const filter: any = {
    itemType: "course",
    status: "paid",
    isDeleted: false,
    $or: [
      { discountAmount: { $gt: 0 } },
      { scholarshipFundDeducted: true }
    ]
  };

  const [orders, total, totalStats] = await Promise.all([
    Order.find(filter)
      .populate("course", "title slug thumbnail price category level")
      .populate("user", "name email phone picture")
      .populate("donationSpendId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
    Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSubsidized: { $sum: "$discountAmount" },
          totalPaid: { $sum: "$price" },
          totalOriginal: { $sum: "$originalPrice" },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const stats = totalStats[0] || {
    totalSubsidized: 0,
    totalPaid: 0,
    totalOriginal: 0,
    count: 0
  };

  // Format records with student, course, original price, discount % and reduced amount
  const formattedRecords = orders.map((ord: any) => {
    const courseObj = ord.course || {};
    const userObj = ord.user || {};
    const billing = ord.billingInfo || {};

    const originalPrice = ord.originalPrice || (ord.price + (ord.discountAmount || 0));
    const discountAmount = ord.discountAmount || 0;
    const studentPrice = ord.price || 0;
    const discountPercentage = ord.discountPercentage || (originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0);

    return {
      orderId: String(ord._id),
      transactionId: ord.providerPaymentId || String(ord._id).slice(-8),
      date: ord.createdAt,
      course: {
        id: courseObj._id,
        title: courseObj.title || "Unknown Course",
        slug: courseObj.slug,
        thumbnail: courseObj.thumbnail,
        category: courseObj.category,
        level: courseObj.level
      },
      student: {
        id: userObj._id,
        name: userObj.name || billing.name || "Student",
        email: userObj.email || billing.email || "N/A",
        phone: userObj.phone || billing.phone || "N/A",
        picture: userObj.picture || null
      },
      originalPrice,
      discountPercentage,
      reducedAmount: discountAmount,
      paidAmount: studentPrice,
      fund: "educational-scholarships",
      scholarshipFundDeducted: ord.scholarshipFundDeducted
    };
  });

  return {
    records: formattedRecords,
    stats,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

export const CourseDiscountServices = {
  getDiscount,
  updateDiscount,
  getSubsidyHistory
};
