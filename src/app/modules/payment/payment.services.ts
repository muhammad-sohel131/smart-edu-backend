/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateSessionInput } from "./payment.types";
import { SSLCommerzProvider } from "./providers/sslcommerz";
import { Order } from "../order/order.model";
import { Enrollment } from "../enrollment/enrollment.model";
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
  if (order.status !== "paid" && normalized.amount < expectedAmount - 1) { 
    console.error(`❌ Amount mismatch - Expected at least: ${expectedAmount - 1}, Received: ${normalized.amount}`);
    throw new AppError(httpStatus.BAD_REQUEST, "Payment amount does not match order amount");
  }

  // Mark order as paid (idempotent update)
  if (order.status !== "paid") {
    order.providerPaymentId = normalized.providerPaymentId;
    order.providerSessionId = normalized.providerSessionId ?? order.providerSessionId;
    order.status = "paid";
    await order.save();
  }

  const studentUserId = normalized.userId || (order.user ? String(order.user) : undefined);
  const courseIdToEnroll = normalized.courseId || (order.course ? String(order.course) : undefined);

  /* --------------------------------------------------------------------
   * 🎓 HANDLE COURSE / PACKAGE ENROLLMENT
   * ------------------------------------------------------------------ */
  if (order.itemType === "course" && courseIdToEnroll && studentUserId) {
    try {
      const existingEnrollment = await Enrollment.findOne({ course: courseIdToEnroll, user: studentUserId });
      if (!existingEnrollment) {
        await EnrollmentServices.enrollSelf(
          String(courseIdToEnroll),
          studentUserId,
          course?.instructor ? String(course.instructor) : undefined
        );

        // Auto-award enrollment points
        try {
          await GamificationServices.addPoints({
            userId: studentUserId,
            points: 20,
            sourceType: "enrollment",
            courseId: String(courseIdToEnroll),
            reason: "Course enrollment",
          });
        } catch (pointErr) {
          console.warn("Gamification points notice:", pointErr);
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
        console.log(`✅ Successfully enrolled student ${studentUserId} in course ${courseIdToEnroll}`);
      } else {
        console.log(`ℹ️ Student ${studentUserId} is already enrolled in course ${courseIdToEnroll}`);
      }
    } catch (enrollErr) {
      console.error("Error creating enrollment during payment fulfillment:", enrollErr);
    }
  }

  /* --------------------------------------------------------------------
   * 🎫 HANDLE EVENT REGISTRATION
   * ------------------------------------------------------------------ */
  if (order.itemType === "event") {
    if (!event && targetEventId) {
      event = await Event.findById(targetEventId);
    }
    console.log("Enrolling for event:", event);

    if (event) {
      event.attendees = event.attendees || [];

      if (studentUserId && !event.attendees.map((a: any) => String(a)).includes(studentUserId)) {
        event.attendees.push(studentUserId as any);
        await event.save();
      }
      // Optional: auto-award enrollment points
      if (studentUserId) {
        try {
          await GamificationServices.addPoints({
            userId: studentUserId,
            points: event.pointsReward || 0,
            sourceType: order.itemType,
            eventId: String(event._id),
            reason: "Registered for event",
          });
        } catch (pointErr) {
          console.warn("Event points notice:", pointErr);
        }
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
