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
exports.PaymentService = void 0;
const sslcommerz_1 = require("./providers/sslcommerz");
const order_model_1 = require("../order/order.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
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
    var _a;
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
    if (normalized.amount < expectedAmount - 1) {
        console.error(`❌ Amount mismatch - Expected at least: ${expectedAmount - 1}, Received: ${normalized.amount}`);
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Payment amount does not match order amount");
    }
    // Mark order as paid (idempotent update)
    order.providerPaymentId = normalized.providerPaymentId;
    order.providerSessionId = (_a = normalized.providerSessionId) !== null && _a !== void 0 ? _a : order.providerSessionId;
    order.status = "paid";
    yield order.save();
    /* --------------------------------------------------------------------
     * 🎓 HANDLE COURSE / PACKAGE ENROLLMENT
    if (order.itemType === "course" && order.course && normalized.userId) {
      await EnrollmentServices.enrollSelf(String(order.course), normalized.userId, course?.instructor);
  
      // Optional: auto-award enrollment points
      if (normalized.userId) {
        await GamificationServices.addPoints({
          userId: normalized.userId,
          points: 20,
          sourceType: order.itemType,
          courseId: String(order.course),
          reason: "Course enrollment",
        });
      }
      if (targetCourseId) {
        await Course.findByIdAndUpdate(
          targetCourseId,
          {
            $inc: { noOfStudents: 1 },
          },
          { new: true }
        );
      }
    }
  
    if (order.itemType === "event") {
      if (!event && targetEventId) {
        event = await Event.findById(targetEventId);
      }
      console.log("Enrolling for event:", event);
  
      if (event) {
        event.attendees = event.attendees || [];
  
        if (normalized.userId && !event.attendees.includes(normalized.userId as any)) {
          event.attendees.push(normalized.userId as any);
          await event.save();
        }
        // Optional: auto-award enrollment points
        if (normalized.userId) {
          await GamificationServices.addPoints({
            userId: normalized.userId,
            points: event.pointsReward || 0,
            sourceType: order.itemType,
            eventId: String(event._id),
            reason: "Registered for event",
          });
        }
      } else {
        console.warn(`⚠️ Event not found for order ${order._id}`);
      }
    }
  
    /* --------------------------------------------------------------------
     * 📜 Audit Log (optional)
     * ------------------------------------------------------------------ */
    // await ActivityLogServices.record({
    //   userId: normalized.userId,
    //   action: "payment_completed",
    //   referenceId: order._id,
    //   meta: { provider, amount: order.amount, currency: order.currency },
    // });
    return order;
});
exports.PaymentService = {
    createCheckoutSession,
    markPaidFromWebhook
};
