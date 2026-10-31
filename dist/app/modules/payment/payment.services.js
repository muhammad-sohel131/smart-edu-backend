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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const sslcommerz_1 = require("./providers/sslcommerz");
const order_model_1 = require("../order/order.model");
const enrollment_model_1 = require("../enrollment/enrollment.model");
const enrollment_services_1 = require("../enrollment/enrollment.services");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const gamification_service_1 = require("../gamification/gamification.service");
const course_model_1 = require("../course/course.model");
const event_model_1 = require("../event/event.model");
const providers = {
    sslcommerz: new sslcommerz_1.SSLCommerzProvider()
};
const createCheckoutSession = (input) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Creating checkout session with input:", input);
    const p = providers[input.provider];
    if (!p)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Unsupported provider");
    return p.createCheckoutSession(input);
});
// Webhook handlers (normalized)
const markPaidFromWebhook = (provider, normalized) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const order = yield order_model_1.Order.findById(normalized.orderId);
    if (!order) {
        console.error(`❌ Order not found: ${normalized.orderId}`);
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, `Order not found: ${normalized.orderId}`);
    }
    let course, event;
    const targetCourseId = normalized.courseId || order.course;
    if (targetCourseId) {
        course = yield course_model_1.Course.findById(targetCourseId);
    }
    const targetEventId = normalized.eventId || order.event || order.eventId;
    if (targetEventId) {
        event = yield event_model_1.Event.findById(targetEventId);
    }
    // Prevent cross-user tampering
    if (order.user && normalized.userId && String(order.user) !== normalized.userId) {
        console.error(`❌ Order user mismatch - Order user: ${order.user}, Webhook user: ${normalized.userId}`);
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Order does not belong to this user");
    }
    // Check if order is already paid (idempotent)
    if (order.status === "paid") {
        console.log(`⚠️ Order ${normalized.orderId} already marked as paid, skipping`);
        return order;
    }
    // Validate payment amount (allow higher amount to account for gateway convenience fees)
    const expectedAmount = order.price;
    if (order.status !== "paid" && normalized.amount < expectedAmount - 1) {
        console.error(`❌ Amount mismatch - Expected at least: ${expectedAmount - 1}, Received: ${normalized.amount}`);
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Payment amount does not match order amount");
    }
    const studentUserId = normalized.userId || (order.user ? String(order.user) : undefined);
    const courseIdToEnroll = normalized.courseId || (order.course ? String(order.course) : undefined);
    // Mark order as paid (idempotent update)
    if (order.status !== "paid") {
        order.providerPaymentId = normalized.providerPaymentId;
        order.providerSessionId = (_a = normalized.providerSessionId) !== null && _a !== void 0 ? _a : order.providerSessionId;
        order.status = "paid";
        // AUTO-DEDUCT from Scholarship Fund if a discount was applied!
        if (order.itemType === "course" && order.discountAmount > 0 && !order.scholarshipFundDeducted) {
            try {
                const { DonationSpend } = yield Promise.resolve().then(() => __importStar(require("../donationSpend/donationSpend.model")));
                const { User } = yield Promise.resolve().then(() => __importStar(require("../user/user.model")));
                const studentUser = studentUserId ? yield User.findById(studentUserId) : null;
                const courseDoc = targetCourseId ? yield course_model_1.Course.findById(targetCourseId) : null;
                let couponDoc = null;
                if (order.couponCode) {
                    try {
                        const { Coupon } = yield Promise.resolve().then(() => __importStar(require("../coupon/coupon.model")));
                        couponDoc = yield Coupon.findOne({ code: order.couponCode.trim().toUpperCase(), isDeleted: false });
                    }
                    catch (cErr) {
                        console.error("Error looking up coupon in payment webhook:", cErr);
                    }
                }
                const spendTitle = couponDoc
                    ? `Scholarship Coupon: ${couponDoc.code} (${(courseDoc === null || courseDoc === void 0 ? void 0 : courseDoc.title) || "Course"})`
                    : `Scholarship Subsidy: ${(courseDoc === null || courseDoc === void 0 ? void 0 : courseDoc.title) || "Course"}`;
                const spendDesc = couponDoc
                    ? `Single-use scholarship coupon "${couponDoc.code}" (${order.discountPercentage}%) redeemed by ${(studentUser === null || studentUser === void 0 ? void 0 : studentUser.name) || "Student"} for course "${(courseDoc === null || courseDoc === void 0 ? void 0 : courseDoc.title) || "Course"}". Subsidized ৳${order.discountAmount} from original price ৳${order.originalPrice}.`
                    : `Automatic scholarship discount (${order.discountPercentage}%) subsidy applied for course enrollment "${(courseDoc === null || courseDoc === void 0 ? void 0 : courseDoc.title) || "Course"}". Reduced ৳${order.discountAmount} from original price ৳${order.originalPrice}.`;
                const spend = yield DonationSpend.create({
                    title: spendTitle,
                    fund: "educational-scholarships",
                    amount: order.discountAmount,
                    category: "Scholarships & Stipends",
                    recipient: `${(studentUser === null || studentUser === void 0 ? void 0 : studentUser.name) || ((_b = order.billingInfo) === null || _b === void 0 ? void 0 : _b.name) || "Student"} (${(studentUser === null || studentUser === void 0 ? void 0 : studentUser.email) || ((_c = order.billingInfo) === null || _c === void 0 ? void 0 : _c.email) || ""})`,
                    description: spendDesc,
                    handledBy: couponDoc ? "Coupon System (Scholarship Fund)" : "Auto System (Scholarship Fund)",
                    createdBy: studentUserId ? studentUserId : undefined,
                    order: order._id,
                    course: courseDoc === null || courseDoc === void 0 ? void 0 : courseDoc._id,
                    discountPercentage: order.discountPercentage,
                    originalPrice: order.originalPrice,
                    studentUser: studentUserId ? studentUserId : undefined,
                    spentDate: new Date()
                });
                // Mark coupon as used and disabled immediately
                if (couponDoc) {
                    couponDoc.isUsed = true;
                    couponDoc.isActive = false; // Coupon is disabled once used
                    couponDoc.usedBy = studentUserId ? studentUserId : undefined;
                    couponDoc.usedAt = new Date();
                    couponDoc.usedOrder = order._id;
                    couponDoc.usedCourse = courseDoc === null || courseDoc === void 0 ? void 0 : courseDoc._id;
                    couponDoc.reducedAmount = order.discountAmount;
                    couponDoc.originalPrice = order.originalPrice;
                    couponDoc.finalPaidPrice = order.price;
                    couponDoc.donationSpendId = spend._id;
                    yield couponDoc.save();
                    console.log(`✅ Single-use coupon ${couponDoc.code} marked as used & disabled`);
                }
                order.scholarshipFundDeducted = true;
                order.donationSpendId = spend._id;
                console.log(`✅ Auto-deducted ৳${order.discountAmount} from Scholarship Fund for Order ${order._id}`);
            }
            catch (deductErr) {
                console.error("Error creating auto donation spend deduction:", deductErr);
            }
        }
        yield order.save();
    }
    /* --------------------------------------------------------------------
     * 🎓 HANDLE COURSE / PACKAGE ENROLLMENT
     * ------------------------------------------------------------------ */
    if (order.itemType === "course" && courseIdToEnroll && studentUserId) {
        try {
            const existingEnrollment = yield enrollment_model_1.Enrollment.findOne({ course: courseIdToEnroll, user: studentUserId });
            if (!existingEnrollment) {
                yield enrollment_services_1.EnrollmentServices.enrollSelf(String(courseIdToEnroll), studentUserId, (course === null || course === void 0 ? void 0 : course.instructor) ? String(course.instructor) : undefined);
                // Auto-award enrollment points
                try {
                    yield gamification_service_1.GamificationServices.addPoints({
                        userId: studentUserId,
                        points: 20,
                        sourceType: "enrollment",
                        courseId: String(courseIdToEnroll),
                        reason: "Course enrollment",
                    });
                }
                catch (pointErr) {
                    console.warn("Gamification points notice:", pointErr);
                }
                if (targetCourseId) {
                    yield course_model_1.Course.findByIdAndUpdate(targetCourseId, {
                        $inc: { noOfStudents: 1 },
                    }, { new: true });
                }
                console.log(`✅ Successfully enrolled student ${studentUserId} in course ${courseIdToEnroll}`);
            }
            else {
                console.log(`ℹ️ Student ${studentUserId} is already enrolled in course ${courseIdToEnroll}`);
            }
        }
        catch (enrollErr) {
            console.error("Error creating enrollment during payment fulfillment:", enrollErr);
        }
    }
    /* --------------------------------------------------------------------
     * 🎫 HANDLE EVENT REGISTRATION
     * ------------------------------------------------------------------ */
    if (order.itemType === "event") {
        if (!event && targetEventId) {
            event = yield event_model_1.Event.findById(targetEventId);
        }
        console.log("Enrolling for event:", event);
        if (event) {
            event.attendees = event.attendees || [];
            if (studentUserId && !event.attendees.map((a) => String(a)).includes(studentUserId)) {
                event.attendees.push(studentUserId);
                yield event.save();
            }
            // Optional: auto-award enrollment points
            if (studentUserId) {
                try {
                    yield gamification_service_1.GamificationServices.addPoints({
                        userId: studentUserId,
                        points: event.pointsReward || 0,
                        sourceType: order.itemType,
                        eventId: String(event._id),
                        reason: "Registered for event",
                    });
                }
                catch (pointErr) {
                    console.warn("Event points notice:", pointErr);
                }
            }
        }
        else {
            console.warn(`⚠️ Event not found for order ${order._id}`);
        }
    }
    return order;
});
exports.PaymentService = {
    createCheckoutSession,
    markPaidFromWebhook
};
