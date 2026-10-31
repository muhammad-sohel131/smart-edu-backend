"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const order_model_1 = require("./order.model");
const user_model_1 = require("../user/user.model");
const course_model_1 = require("../course/course.model");
const payment_services_1 = require("../payment/payment.services");
const mongoose_1 = require("mongoose");
const assertAdmin = (actor) => {
    const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
    if (!isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Admin only");
};
const ensureOrder = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(orderId)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid order id");
    }
    const ord = yield order_model_1.Order.findById(orderId);
    if (!ord)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Order not found");
    return ord;
});
/** Admin: cancel order */
const cancelOrder = (orderId, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    assertAdmin(actor);
    const ord = yield ensureOrder(orderId);
    ord.status = "canceled";
    yield ord.save();
    return ord;
});
const resolvePrice = (course, couponCode) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const basePrice = Number((_a = course.price) !== null && _a !== void 0 ? _a : 0);
    const currency = (_b = course.currency) !== null && _b !== void 0 ? _b : "BDT";
    let originalPrice = basePrice;
    let discountAmount = 0;
    let discountPercentage = 0;
    let finalPrice = basePrice;
    let appliedCoupon = null;
    // 1. Check coupon code if provided
    if (couponCode && couponCode.trim() && basePrice > 0) {
        const cleanCode = couponCode.trim().toUpperCase();
        const { Coupon } = yield Promise.resolve().then(() => __importStar(require("../coupon/coupon.model")));
        const couponDoc = yield Coupon.findOne({ code: cleanCode, isDeleted: false });
        if (!couponDoc) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, `Invalid coupon code "${couponCode}"`);
        }
        if (couponDoc.isUsed) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Coupon "${cleanCode}" has already been used and is disabled`);
        }
        if (!couponDoc.isActive) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Coupon "${cleanCode}" is disabled`);
        }
        if (couponDoc.expiryDate && new Date(couponDoc.expiryDate) < new Date()) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Coupon "${cleanCode}" has expired`);
        }
        discountPercentage = couponDoc.discountPercentage;
        discountAmount = Math.round((basePrice * couponDoc.discountPercentage) / 100);
        finalPrice = Math.max(0, basePrice - discountAmount);
        appliedCoupon = couponDoc;
    }
    // 2. If no coupon was applied, check for global scholarship discount
    if (!appliedCoupon && basePrice > 0) {
        try {
            const { CourseDiscountServices } = yield Promise.resolve().then(() => __importStar(require("../courseDiscount/courseDiscount.service")));
            const discount = yield CourseDiscountServices.getDiscount();
            if (discount && discount.isActive && discount.percentage > 0) {
                discountPercentage = discount.percentage;
                discountAmount = Math.round((basePrice * discount.percentage) / 100);
                finalPrice = Math.max(0, basePrice - discountAmount);
            }
        }
        catch (err) {
            console.error("Error checking course discount in resolvePrice:", err);
        }
    }
    return {
        price: finalPrice,
        originalPrice,
        discountAmount,
        discountPercentage,
        appliedCoupon,
        couponCode: appliedCoupon ? appliedCoupon.code : couponCode,
        currency,
    };
});
/* ----------------------- NORMAL COURSE CHECKOUT ----------------------- */
const createCheckout = (courseId, userId, provider, itemType, couponCode, billingInfo) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const course = yield course_model_1.Course.findById(courseId);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const { price, originalPrice, discountAmount, discountPercentage, appliedCoupon, couponCode: resolvedCouponCode, currency } = yield resolvePrice(course, couponCode);
    // Handle free courses - auto-complete order and enroll
    if (price === 0) {
        const order = yield order_model_1.Order.create({
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
            couponCode: resolvedCouponCode,
            billingInfo
        });
        if (discountAmount > 0) {
            try {
                const { DonationSpend } = yield Promise.resolve().then(() => __importStar(require("../donationSpend/donationSpend.model")));
                const studentUser = yield user_model_1.User.findById(userId);
                const spendTitle = appliedCoupon
                    ? `Scholarship Coupon: ${appliedCoupon.code} (${course.title || "Course"})`
                    : `Scholarship Subsidy: ${course.title || "Course"}`;
                const spendDesc = appliedCoupon
                    ? `Full single-use scholarship coupon "${appliedCoupon.code}" (100%) applied for course enrollment "${course.title || "Course"}". Subsidized ৳${discountAmount} from original price ৳${originalPrice}.`
                    : `Full scholarship discount (${discountPercentage}%) subsidy applied for course enrollment "${course.title || "Course"}". Subsidized ৳${discountAmount} from original price ৳${originalPrice}.`;
                const spend = yield DonationSpend.create({
                    title: spendTitle,
                    fund: "educational-scholarships",
                    amount: discountAmount,
                    category: "Scholarships & Stipends",
                    recipient: `${(studentUser === null || studentUser === void 0 ? void 0 : studentUser.name) || "Student"} (${(studentUser === null || studentUser === void 0 ? void 0 : studentUser.email) || ""})`,
                    description: spendDesc,
                    handledBy: appliedCoupon ? "Coupon System (Scholarship Fund)" : "Auto System (Scholarship Fund)",
                    createdBy: userId,
                    order: order._id,
                    course: course._id,
                    discountPercentage,
                    originalPrice,
                    studentUser: userId,
                    spentDate: new Date()
                });
                // If a coupon was applied, mark it used & disabled
                if (appliedCoupon) {
                    appliedCoupon.isUsed = true;
                    appliedCoupon.isActive = false; // Disabled once used
                    appliedCoupon.usedBy = userId;
                    appliedCoupon.usedAt = new Date();
                    appliedCoupon.usedOrder = order._id;
                    appliedCoupon.usedCourse = course._id;
                    appliedCoupon.reducedAmount = discountAmount;
                    appliedCoupon.originalPrice = originalPrice;
                    appliedCoupon.finalPaidPrice = 0;
                    appliedCoupon.donationSpendId = spend._id;
                    yield appliedCoupon.save();
                }
                order.scholarshipFundDeducted = true;
                order.donationSpendId = spend._id;
                yield order.save();
            }
            catch (deductErr) {
                console.error("Error auto-deducting 100% scholarship discount:", deductErr);
            }
        }
        // Auto-enroll the user in the free course
        const { EnrollmentServices } = yield Promise.resolve().then(() => __importStar(require('../enrollment/enrollment.services')));
        yield EnrollmentServices.enrollSelf(courseId, userId, (_a = course === null || course === void 0 ? void 0 : course.instructor) === null || _a === void 0 ? void 0 : _a.toString());
        // Award enrollment points for free course
        const { GamificationServices } = yield Promise.resolve().then(() => __importStar(require('../gamification/gamification.service')));
        yield GamificationServices.addPoints({
            userId,
            points: 20,
            sourceType: "enrollment",
            courseId: courseId,
            reason: "Free course enrollment",
        });
        const res = yield course_model_1.Course.findByIdAndUpdate(courseId, {
            $inc: { noOfStudents: 1 },
        }, { new: true });
        return {
            orderId: String(order._id),
            checkoutUrl: null, // No payment URL needed for free courses
            isFree: true,
            message: "Enrolled successfully in free course!"
        };
    }
    // Handle paid courses - create payment session
    const order = yield order_model_1.Order.create({
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
        couponCode: resolvedCouponCode,
        billingInfo
    });
    const session = yield payment_services_1.PaymentService.createCheckoutSession({
        provider,
        orderId: String(order._id),
        amount: price,
        currency,
        courseId: String(course._id),
        userId: String(userId),
        source: itemType,
        billingInfo: billingInfo,
    });
    order.providerSessionId = session.sessionId;
    yield order.save();
    return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
});
const createDonationCheckout = (fund_1, userId_1, ...args_1) => __awaiter(void 0, [fund_1, userId_1, ...args_1], void 0, function* (fund, userId, provider = "sslcommerz", amount = 0, donorInfo) {
    var _a, _b, _c, _d, _e;
    let linkedUserId = userId;
    let existingUser = null;
    if (!linkedUserId && ((donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.phone) || (donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.email))) {
        existingUser = yield user_model_1.User.findOne({
            $or: [
                ...(donorInfo.phone ? [{ phone: donorInfo.phone.trim() }] : []),
                ...(donorInfo.email ? [{ email: donorInfo.email.trim() }] : [])
            ]
        });
        if (existingUser) {
            linkedUserId = existingUser._id;
        }
    }
    else if (linkedUserId) {
        existingUser = yield user_model_1.User.findById(linkedUserId);
    }
    const cleanPhone = ((_a = donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.phone) === null || _a === void 0 ? void 0 : _a.trim()) || "";
    const donorPhoto = ((_b = donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.image) === null || _b === void 0 ? void 0 : _b.trim()) || ((_c = donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.avatar) === null || _c === void 0 ? void 0 : _c.trim()) || (existingUser === null || existingUser === void 0 ? void 0 : existingUser.picture) || "";
    const order = yield order_model_1.Order.create({
        user: linkedUserId,
        donorName: (_d = donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.name) === null || _d === void 0 ? void 0 : _d.trim(),
        donorEmail: (_e = donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.email) === null || _e === void 0 ? void 0 : _e.trim(),
        donorPhone: cleanPhone,
        donorImage: donorPhoto,
        billingInfo: Object.assign(Object.assign({}, donorInfo), { image: donorPhoto }),
        fund: fund,
        price: amount,
        currency: "BDT",
        provider,
        itemType: "Donation",
        status: "pending",
    });
    const session = yield payment_services_1.PaymentService.createCheckoutSession({
        provider,
        orderId: String(order._id),
        amount: amount,
        currency: 'BDT',
        userId: linkedUserId ? String(linkedUserId) : String(order._id),
        source: "Donation",
        billingInfo: Object.assign(Object.assign({}, donorInfo), { image: donorPhoto })
    });
    order.providerSessionId = session.sessionId;
    yield order.save();
    return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
});
const getDonationsByPhone = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    if (!phone)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Phone number is required");
    const cleanPhone = phone.trim();
    const usersWithPhone = yield user_model_1.User.find({ phone: cleanPhone }).select('_id');
    const userIds = usersWithPhone.map(u => u._id);
    const query = {
        itemType: "Donation",
        isDeleted: false,
        $or: [
            { donorPhone: cleanPhone },
            { "billingInfo.phone": cleanPhone },
            ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : [])
        ]
    };
    const donations = yield order_model_1.Order.find(query).sort({ createdAt: -1 });
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
});
/* ----------------------- ORDERS FETCHING ----------------------- */
const getMyOrders = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.Order.find({ user: userId, isDeleted: false })
        .populate("event", "title eventDate thumbnail location price")
        .sort({ createdAt: -1 });
    return orders;
});
const getOrderById = (orderId, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const ord = yield order_model_1.Order.findById(orderId);
    if (!ord)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Order Not Found");
    const isOwner = String(ord.user) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
    if (!(isOwner || isAdmin))
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    return ord;
});
const getOrderBySessionId = (sessionId, actor) => __awaiter(void 0, void 0, void 0, function* () {
    let ord = yield order_model_1.Order.findOne({ providerSessionId: sessionId });
    if (!ord && sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        ord = yield order_model_1.Order.findById(sessionId);
    }
    if (!ord)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Order Not Found");
    // Allow public access to Donation orders (no login needed)
    if (ord.itemType === "Donation") {
        return ord;
    }
    const isOwner = ord.user && String(ord.user) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
    if (!(isOwner || isAdmin))
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    return ord;
});
const getOrders = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    var _a;
    const { q, page = 1, limit = 10 } = query, filters = __rest(query, ["q", "page", "limit"]);
    // Build aggregation pipeline
    const pipeline = [
        {
            $match: Object.assign({ isDeleted: false }, filters)
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
    pipeline.push({
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
    }, {
        $sort: { createdAt: -1 }
    }, {
        $skip: (page - 1) * limit
    }, {
        $limit: limit * 1
    });
    // Clone pipeline for count (remove pagination stages)
    const countPipeline = [...pipeline];
    countPipeline.splice(-3, 3); // Remove sort, skip, limit stages
    // Execute queries
    const [orders, countResult] = yield Promise.all([
        order_model_1.Order.aggregate(pipeline),
        order_model_1.Order.aggregate([...countPipeline, { $count: "total" }])
    ]);
    const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    // Format the data
    const formattedOrders = orders.map(order => {
        var _a, _b, _c;
        return (Object.assign(Object.assign({}, order), { donorName: order.donorName || order.userName, donorEmail: order.donorEmail || order.userEmail, donorPhone: order.donorPhone || order.userPhone || ((_a = order.billingInfo) === null || _a === void 0 ? void 0 : _a.phone), donorImage: order.donorImage || ((_b = order.billingInfo) === null || _b === void 0 ? void 0 : _b.image) || ((_c = order.userData) === null || _c === void 0 ? void 0 : _c.picture) || null, originalPrice: order.originalPrice, discountAmount: order.discountAmount || 0, discountPercentage: order.discountPercentage || 0, scholarshipFundDeducted: order.scholarshipFundDeducted || false, amountFormatted: `${order.amount.toFixed(2)} ${order.currency.toUpperCase()}`, dateFormatted: new Date(order.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) }));
    });
    return {
        orders: formattedOrders,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
    };
});
const createCheckoutForEvent = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.create({
        user: input.userId,
        event: input.eventId,
        price: input.amount,
        currency: input.currency,
        provider: "sslcommerz",
        status: "pending",
        itemType: "event",
    });
    const session = yield payment_services_1.PaymentService.createCheckoutSession({
        provider: "sslcommerz",
        orderId: String(order._id),
        amount: input.amount,
        currency: input.currency,
        eventId: input.eventId,
        userId: input.userId,
        source: "event",
    });
    order.providerSessionId = session.sessionId;
    yield order.save();
    return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
});
/* ----------------------- EXPORT ----------------------- */
exports.OrderServices = {
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
