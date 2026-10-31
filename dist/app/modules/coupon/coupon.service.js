"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const coupon_model_1 = require("./coupon.model");
const course_model_1 = require("../course/course.model");
const crypto_1 = __importDefault(require("crypto"));
const generateRandomCode = (pct) => {
    const randomStr = crypto_1.default.randomBytes(3).toString("hex").toUpperCase();
    return `SCHOLAR${pct}-${randomStr}`;
};
const createCoupon = (payload, adminUserId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let code = payload.code ? payload.code.trim().toUpperCase() : "";
    const percentage = Number(payload.discountPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Discount percentage must be a number between 0 and 100");
    }
    if (!code) {
        code = generateRandomCode(percentage);
    }
    // Check uniqueness
    const existing = yield coupon_model_1.Coupon.findOne({ code, isDeleted: false });
    if (existing) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, `Coupon with code "${code}" already exists`);
    }
    const coupon = yield coupon_model_1.Coupon.create({
        code,
        discountPercentage: percentage,
        title: ((_a = payload.title) === null || _a === void 0 ? void 0 : _a.trim()) || `Scholarship ${percentage}%`,
        fundedBy: payload.fundedBy || "educational-scholarships",
        isUsed: false,
        isActive: true,
        createdBy: adminUserId,
        expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : undefined
    });
    return coupon;
});
const getAllCoupons = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const { q, status = "all", page = 1, limit = 50 } = query;
    const filter = { isDeleted: false };
    if (status === "active") {
        filter.isUsed = false;
        filter.isActive = true;
    }
    else if (status === "used") {
        filter.isUsed = true;
    }
    else if (status === "disabled") {
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
    const [coupons, total, statsResult] = yield Promise.all([
        coupon_model_1.Coupon.find(filter)
            .populate("createdBy", "name email")
            .populate("usedBy", "name email phone picture")
            .populate("usedCourse", "title thumbnail slug price")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        coupon_model_1.Coupon.countDocuments(filter),
        coupon_model_1.Coupon.aggregate([
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
});
const validateCoupon = (code, courseId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!code) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Coupon code is required");
    }
    const cleanCode = code.trim().toUpperCase();
    const coupon = yield coupon_model_1.Coupon.findOne({ code: cleanCode, isDeleted: false });
    if (!coupon) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Invalid coupon code");
    }
    if (coupon.isUsed) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "This single-use coupon has already been redeemed and is disabled");
    }
    if (!coupon.isActive) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "This coupon is currently inactive");
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "This coupon has expired");
    }
    let originalPrice = 0;
    let discountAmount = 0;
    let finalPrice = 0;
    if (courseId) {
        const course = yield course_model_1.Course.findById(courseId);
        if (!course || course.isDeleted) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course not found");
        }
        originalPrice = Number((_a = course.price) !== null && _a !== void 0 ? _a : 0);
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
});
const toggleCoupon = (id, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield coupon_model_1.Coupon.findById(id);
    if (!coupon || coupon.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Coupon not found");
    }
    if (coupon.isUsed) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Used coupon cannot be re-enabled or modified");
    }
    coupon.isActive = Boolean(isActive);
    yield coupon.save();
    return coupon;
});
const deleteCoupon = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield coupon_model_1.Coupon.findById(id);
    if (!coupon || coupon.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Coupon not found");
    }
    coupon.isDeleted = true;
    yield coupon.save();
    return true;
});
const getCouponHistory = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const { page = 1, limit = 50 } = query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 50);
    const skip = (pageNum - 1) * limitNum;
    const filter = { isDeleted: false, isUsed: true };
    const [records, total] = yield Promise.all([
        coupon_model_1.Coupon.find(filter)
            .populate("usedBy", "name email phone picture")
            .populate("usedCourse", "title thumbnail slug price category")
            .populate("usedOrder", "providerPaymentId price originalPrice createdAt")
            .populate("createdBy", "name email")
            .sort({ usedAt: -1 })
            .skip(skip)
            .limit(limitNum),
        coupon_model_1.Coupon.countDocuments(filter)
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
});
exports.CouponServices = {
    createCoupon,
    getAllCoupons,
    validateCoupon,
    toggleCoupon,
    deleteCoupon,
    getCouponHistory
};
