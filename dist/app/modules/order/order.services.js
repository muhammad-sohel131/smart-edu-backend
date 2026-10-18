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
    // TODO: add coupon/discount logic here
    return { price: (_a = course.price) !== null && _a !== void 0 ? _a : 0, currency: (_b = course.currency) !== null && _b !== void 0 ? _b : "BDT" };
});
/* ----------------------- NORMAL COURSE CHECKOUT ----------------------- */
const createCheckout = (courseId, userId, provider, itemType, couponCode, billingInfo) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const course = yield course_model_1.Course.findById(courseId);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const { price, currency } = yield resolvePrice(course, couponCode);
    // Handle free courses - auto-complete order and enroll
    if (price === 0) {
        const order = yield order_model_1.Order.create({
            user: userId,
            course: courseId,
            price,
            currency,
            provider: `"free"_${Math.random() * 100 * 100}`, // Special provider for free courses
            itemType,
            status: "paid", // Mark as completed immediately
            couponCode,
            billingInfo
        });
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
        currency,
        provider,
        itemType,
        status: "pending",
        couponCode,
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
    var _a, _b, _c;
    let linkedUserId = userId;
    if (!linkedUserId && ((donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.phone) || (donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.email))) {
        const existingUser = yield user_model_1.User.findOne({
            $or: [
                ...(donorInfo.phone ? [{ phone: donorInfo.phone.trim() }] : []),
                ...(donorInfo.email ? [{ email: donorInfo.email.trim() }] : [])
            ]
        });
        if (existingUser) {
            linkedUserId = existingUser._id;
        }
    }
    const cleanPhone = ((_a = donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.phone) === null || _a === void 0 ? void 0 : _a.trim()) || "";
    const order = yield order_model_1.Order.create({
        user: linkedUserId,
        donorName: (_b = donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.name) === null || _b === void 0 ? void 0 : _b.trim(),
        donorEmail: (_c = donorInfo === null || donorInfo === void 0 ? void 0 : donorInfo.email) === null || _c === void 0 ? void 0 : _c.trim(),
        donorPhone: cleanPhone,
        billingInfo: donorInfo,
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
        billingInfo: donorInfo
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
            billingInfo: 1,
            amount: "$price",
            currency: "$currency",
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
        var _a;
        return (Object.assign(Object.assign({}, order), { donorName: order.donorName || order.userName, donorEmail: order.donorEmail || order.userEmail, donorPhone: order.donorPhone || order.userPhone || ((_a = order.billingInfo) === null || _a === void 0 ? void 0 : _a.phone), amountFormatted: `${order.amount.toFixed(2)} ${order.currency.toUpperCase()}`, dateFormatted: new Date(order.date).toLocaleDateString('en-US', {
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
