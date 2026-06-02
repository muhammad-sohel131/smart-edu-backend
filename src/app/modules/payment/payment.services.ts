/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateSessionInput } from "./payment.types";
import { SSLCommerzProvider } from "./providers/sslcommerz";
import { Order } from "../order/order.model";
import { EnrollmentServices } from "../enrollment/enrollment.services";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { GamificationServices } from "../gamification/gamification.service";
import { Product } from "../ecom/product/product.model";
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
    userId: string;
    courseId?: string;
    eventId?: string;
  }
) => {

  const order = await Order.findById(normalized.orderId);
  let course, event;
  if (normalized.courseId) {
    course = await Course.findById(normalized.courseId)
  }
  if (normalized.eventId) {
    event = await Event.findById(normalized.eventId)
  }

  if (!order) {
    console.error(`❌ Order not found: ${normalized.orderId}`);
    throw new AppError(httpStatus.NOT_FOUND, `Order not found: ${normalized.orderId}`);
  }

  // Prevent cross-user tampering
  if (String(order.user) !== normalized.userId) {
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
   * 🛍️ HANDLE ECOMMERCE ORDER
   * ------------------------------------------------------------------ */
  if (order.itemType === "ecommerce" && order.ecommerce?.items?.length) {
    for (const item of order.ecommerce.items) {
      const prod: any = await Product.findById(item.product);
      if (!prod) continue;

      prod.stock = Math.max(0, (prod.stock || 0) - item.qty);
      await prod.save();
    }

    const points = Math.floor((order.amount || 0) / 10); // $10 => 1 point
    if (points > 0) {
      await GamificationServices.addPoints({
        userId: String(order.user),
        points,
        sourceType: order.itemType,
        reason: "Store purchase",
      });
    }

    // 3d. Mark fulfillment pending
    order.ecommerce.fulfillment.status = "pending";
    await order.save();
  }

  /* --------------------------------------------------------------------
   * 🎓 HANDLE COURSE / PACKAGE ENROLLMENT
   * ------------------------------------------------------------------ */
  if (order.itemType === "course" && order.course) {
  
    await EnrollmentServices.enrollSelf(String(order.course), normalized.userId, course?.instructor);

    // Optional: auto-award enrollment points
    await GamificationServices.addPoints({
      userId: normalized.userId,
      points: 20,
      sourceType: order.itemType,
      courseId: String(order.course),
      reason: "Course enrollment",
    });
    await Course.findByIdAndUpdate(
      normalized.courseId,
      {
        $inc: { noOfStudents: 1 },
      },
      { new: true }
    );
  }

  if (order.itemType === "event") {
    console.log("Enrolling for event:", event)

    event.attendees = event.attendees || [];

    if (!event.attendees.includes(normalized.userId as any)) {
      event.attendees.push(normalized.userId as any);
      await event.save();
    }
    // Optional: auto-award enrollment points
    await GamificationServices.addPoints({
      userId: normalized.userId,
      points: event.pointsReward || 0,
      sourceType: order.itemType,
      eventId: String(event._id),
      reason: "Registered for event",
    });
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
