/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateSessionInput } from "./payment.types";
import { SSLCommerzProvider } from "./providers/sslcommerz";
import { Order } from "../order/order.model";
import { EnrollmentServices } from "../enrollment/enrollment.services";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { GamificationServices } from "../gamification/gamification.service";
import { Course } from "../course/course.model";
import { Event } from "../event/event.model";

const providers = {
  sslcommerz: new SSLCommerzProvider()
} as const;

const createCheckoutSession = async (input: CreateSessionInput) => {
  console.log("Creating checkout session with input:", input);
  const p = providers[input.provider];
  if (!p) throw new AppError(httpStatus.BAD_REQUEST, "Unsupported provider");
  return p.createCheckoutSession(input);
}

// Webhook handlers (normalized)
const markPaidFromWebhook = async (
  provider: "sslcommerz",
  normalized: {
    providerPaymentId: string;
    providerSessionId?: string;
    amount: number;
    currency: string;
    orderId: string;
    userId?: string;
    courseId?: string;
    eventId?: string;
  }
) => {

  const order = await Order.findById(normalized.orderId);
  if (!order) {
    console.error(`❌ Order not found: ${normalized.orderId}`);
    throw new AppError(httpStatus.NOT_FOUND, `Order not found: ${normalized.orderId}`);
  }

  let course, event;
  const targetCourseId = normalized.courseId || order.course;
  if (targetCourseId) {
    course = await Course.findById(targetCourseId);
  }
  const targetEventId = normalized.eventId || (order as any).event || (order as any).eventId;
  if (targetEventId) {
    event = await Event.findById(targetEventId);
  }

  // Prevent cross-user tampering
  if (order.user && normalized.userId && String(order.user) !== normalized.userId) {
    console.error(`❌ Order user mismatch - Order user: ${order.user}, Webhook user: ${normalized.userId}`);
    throw new AppError(httpStatus.BAD_REQUEST, "Order does not belong to this user");
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
    throw new AppError(httpStatus.BAD_REQUEST, "Payment amount does not match order amount");
  }


  // Mark order as paid (idempotent update)
  order.providerPaymentId = normalized.providerPaymentId;
  order.providerSessionId = normalized.providerSessionId ?? order.providerSessionId;
  order.status = "paid";
  await order.save();

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
};

export const PaymentService = {
  createCheckoutSession,
  markPaidFromWebhook
};
