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
exports.CourseDiscountServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const courseDiscount_model_1 = require("./courseDiscount.model");
const order_model_1 = require("../order/order.model");
const donationSpend_service_1 = require("../donationSpend/donationSpend.service");
const getDiscount = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let doc = yield courseDiscount_model_1.CourseDiscount.findOne().populate("updatedBy", "name email");
    if (!doc) {
        doc = yield courseDiscount_model_1.CourseDiscount.create({
            percentage: 0,
            isActive: false,
            fundedBy: "educational-scholarships",
            title: "General Scholarship Subsidy"
        });
    }
    // Get current scholarship fund balance
    let scholarshipFundBalance = 0;
    try {
        const summary = yield donationSpend_service_1.DonationSpendServices.getSummary();
        const scholarshipFund = (_a = summary === null || summary === void 0 ? void 0 : summary.fundBreakdown) === null || _a === void 0 ? void 0 : _a.find((f) => f.fund === "educational-scholarships");
        scholarshipFundBalance = (scholarshipFund === null || scholarshipFund === void 0 ? void 0 : scholarshipFund.balance) || 0;
    }
    catch (err) {
        console.error("Error getting scholarship fund balance:", err);
    }
    return Object.assign(Object.assign({}, doc.toObject()), { scholarshipFundBalance });
});
const updateDiscount = (payload, actorUserId) => __awaiter(void 0, void 0, void 0, function* () {
    let doc = yield courseDiscount_model_1.CourseDiscount.findOne();
    if (!doc) {
        doc = new courseDiscount_model_1.CourseDiscount();
    }
    if (payload.percentage !== undefined) {
        const p = Number(payload.percentage);
        if (isNaN(p) || p < 0 || p > 100) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Discount percentage must be a number between 0 and 100");
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
        doc.updatedBy = actorUserId;
    }
    yield doc.save();
    const populated = yield courseDiscount_model_1.CourseDiscount.findById(doc._id).populate("updatedBy", "name email");
    return populated;
});
const getSubsidyHistory = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const { q, page = 1, limit = 20 } = query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 20);
    const skip = (pageNum - 1) * limitNum;
    // Find paid course orders where a discount was applied
    const filter = {
        itemType: "course",
        status: "paid",
        isDeleted: false,
        $or: [
            { discountAmount: { $gt: 0 } },
            { scholarshipFundDeducted: true }
        ]
    };
    const [orders, total, totalStats] = yield Promise.all([
        order_model_1.Order.find(filter)
            .populate("course", "title slug thumbnail price category level")
            .populate("user", "name email phone picture")
            .populate("donationSpendId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        order_model_1.Order.countDocuments(filter),
        order_model_1.Order.aggregate([
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
    const formattedRecords = orders.map((ord) => {
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
            scholarshipFundDeducted: ord.scholarshipFundDeducted,
            couponCode: ord.couponCode || null,
            isCoupon: Boolean(ord.couponCode)
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
});
exports.CourseDiscountServices = {
    getDiscount,
    updateDiscount,
    getSubsidyHistory
};
