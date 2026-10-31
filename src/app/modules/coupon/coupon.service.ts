import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Coupon } from "./coupon.model";
import { ICoupon } from "./coupon.interface";
import { Course } from "../course/course.model";
import crypto from "crypto";

const generateRandomCode = (pct: number) => {
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SCHOLAR${pct}-${randomStr}`;
};

const createCoupon = async (
  payload: Partial<ICoupon>,
  adminUserId?: string
) => {
  let code = payload.code ? payload.code.trim().toUpperCase() : "";
  const percentage = Number(payload.discountPercentage);

  if (isNaN(percentage) || percentage < 0 || percentage > 100) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Discount percentage must be a number between 0 and 100"
    );
  }

  if (!code) {
    code = generateRandomCode(percentage);
  }

  // Check uniqueness
  const existing = await Coupon.findOne({ code, isDeleted: false });
  if (existing) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Coupon with code "${code}" already exists`
    );
  }

  const coupon = await Coupon.create({
    code,
    discountPercentage: percentage,
    title: payload.title?.trim() || `Scholarship ${percentage}%`,
    fundedBy: payload.fundedBy || "educational-scholarships",
    isUsed: false,
    isActive: true,
    createdBy: adminUserId as any,
    expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : undefined
  });

  return coupon;
};

const getAllCoupons = async (query: any = {}) => {
  const { q, status = "all", page = 1, limit = 50 } = query;

  const filter: any = { isDeleted: false };

  if (status === "active") {
    filter.isUsed = false;
    filter.isActive = true;
  } else if (status === "used") {
    filter.isUsed = true;
  } else if (status === "disabled") {
    filter.isUsed = false;
    filter.isActive = false;
  }

  if (q) {
    filter.$or = [
      { code: { $regex: q, $options: "i" } },
      { title: { $regex: q, $options: "i" } }
    ];
  }

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.max(1, parseInt(String(limit), 10) || 50);
  const skip = (pageNum - 1) * limitNum;

  const [coupons, total, statsResult] = await Promise.all([
    Coupon.find(filter)
      .populate("createdBy", "name email")
      .populate("usedBy", "name email phone picture")
      .populate("usedCourse", "title thumbnail slug price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Coupon.countDocuments(filter),
    Coupon.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          used: {
            $sum: { $cond: [{ $eq: ["$isUsed", true] }, 1, 0] }
          },
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isUsed", false] },
                    { $eq: ["$isActive", true] }
                  ]
                },
                1,
                0
              ]
            }
          },
          disabled: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isUsed", false] },
                    { $eq: ["$isActive", false] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalSubsidized: { $sum: "$reducedAmount" }
        }
      }
    ])
  ]);

  const stats = statsResult[0] || {
    total: 0,
    used: 0,
    active: 0,
    disabled: 0,
    totalSubsidized: 0
  };

  return {
    coupons,
    stats,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

const validateCoupon = async (
  code: string,
  courseId?: string,
  userId?: string
) => {
  if (!code) {
    throw new AppError(httpStatus.BAD_REQUEST, "Coupon code is required");
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode, isDeleted: false });

  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid coupon code");
  }

  if (coupon.isUsed) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This single-use coupon has already been redeemed and is disabled"
    );
  }

  if (!coupon.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "This coupon is currently inactive");
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, "This coupon has expired");
  }

  let originalPrice = 0;
  let discountAmount = 0;
  let finalPrice = 0;

  if (courseId) {
    const course = await Course.findById(courseId);
    if (!course || course.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, "Course not found");
    }
    originalPrice = Number(course.price ?? 0);
    discountAmount = Math.round((originalPrice * coupon.discountPercentage) / 100);
    finalPrice = Math.max(0, originalPrice - discountAmount);
  }

  return {
    valid: true,
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      title: coupon.title,
      fundedBy: coupon.fundedBy
    },
    originalPrice,
    discountAmount,
    finalPrice
  };
};

const toggleCoupon = async (id: string, isActive: boolean) => {
  const coupon = await Coupon.findById(id);
  if (!coupon || coupon.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  if (coupon.isUsed) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Used coupon cannot be re-enabled or modified"
    );
  }

  coupon.isActive = Boolean(isActive);
  await coupon.save();
  return coupon;
};

const deleteCoupon = async (id: string) => {
  const coupon = await Coupon.findById(id);
  if (!coupon || coupon.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  coupon.isDeleted = true;
  await coupon.save();
  return true;
};

const getCouponHistory = async (query: any = {}) => {
  const { page = 1, limit = 50 } = query;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.max(1, parseInt(String(limit), 10) || 50);
  const skip = (pageNum - 1) * limitNum;

  const filter = { isDeleted: false, isUsed: true };

  const [records, total] = await Promise.all([
    Coupon.find(filter)
      .populate("usedBy", "name email phone picture")
      .populate("usedCourse", "title thumbnail slug price category")
      .populate("usedOrder", "providerPaymentId price originalPrice createdAt")
      .populate("createdBy", "name email")
      .sort({ usedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Coupon.countDocuments(filter)
  ]);

  return {
    records,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

export const CouponServices = {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  toggleCoupon,
  deleteCoupon,
  getCouponHistory
};
