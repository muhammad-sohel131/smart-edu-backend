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

  const studentUserId = normalized.userId || (order.user ? String(order.user) : undefined);
  const courseIdToEnroll = normalized.courseId || (order.course ? String(order.course) : undefined);

  // Mark order as paid (idempotent update)
  if (order.status !== "paid") {
    order.providerPaymentId = normalized.providerPaymentId;
    order.providerSessionId = normalized.providerSessionId ?? order.providerSessionId;
    order.status = "paid";

    // AUTO-DEDUCT from Scholarship Fund if a discount was applied!
    if (order.itemType === "course" && (order as any).discountAmount > 0 && !(order as any).scholarshipFundDeducted) {
      try {
        const { DonationSpend } = await import("../donationSpend/donationSpend.model");
        const { User } = await import("../user/user.model");
        const studentUser = studentUserId ? await User.findById(studentUserId) : null;
        const courseDoc = targetCourseId ? await Course.findById(targetCourseId) : null;

        let couponDoc: any = null;
        if ((order as any).couponCode) {
          try {
            const { Coupon } = await import("../coupon/coupon.model");
            couponDoc = await Coupon.findOne({ code: (order as any).couponCode.trim().toUpperCase(), isDeleted: false });
          } catch (cErr) {
            console.error("Error looking up coupon in payment webhook:", cErr);
          }
        }

        const spendTitle = couponDoc
          ? `Scholarship Coupon: ${couponDoc.code} (${courseDoc?.title || "Course"})`
          : `Scholarship Subsidy: ${courseDoc?.title || "Course"}`;

        const spendDesc = couponDoc
          ? `Single-use scholarship coupon "${couponDoc.code}" (${(order as any).discountPercentage}%) redeemed by ${studentUser?.name || "Student"} for course "${courseDoc?.title || "Course"}". Subsidized ৳${(order as any).discountAmount} from original price ৳${(order as any).originalPrice}.`
          : `Automatic scholarship discount (${(order as any).discountPercentage}%) subsidy applied for course enrollment "${courseDoc?.title || "Course"}". Reduced ৳${(order as any).discountAmount} from original price ৳${(order as any).originalPrice}.`;

        const spend = await DonationSpend.create({
          title: spendTitle,
          fund: "educational-scholarships",
          amount: (order as any).discountAmount,
          category: "Scholarships & Stipends",
          recipient: `${studentUser?.name || (order as any).billingInfo?.name || "Student"} (${studentUser?.email || (order as any).billingInfo?.email || ""})`,
          description: spendDesc,
          handledBy: couponDoc ? "Coupon System (Scholarship Fund)" : "Auto System (Scholarship Fund)",
          createdBy: studentUserId ? (studentUserId as any) : undefined,
          order: order._id,
          course: courseDoc?._id,
          discountPercentage: (order as any).discountPercentage,
          originalPrice: (order as any).originalPrice,
          studentUser: studentUserId ? (studentUserId as any) : undefined,
          spentDate: new Date()
        });

        // Mark coupon as used and disabled immediately
        if (couponDoc) {
          couponDoc.isUsed = true;
          couponDoc.isActive = false; // Coupon is disabled once used
          couponDoc.usedBy = studentUserId ? (studentUserId as any) : undefined;
          couponDoc.usedAt = new Date();
          couponDoc.usedOrder = order._id;
          couponDoc.usedCourse = courseDoc?._id;
          couponDoc.reducedAmount = (order as any).discountAmount;
          couponDoc.originalPrice = (order as any).originalPrice;
          couponDoc.finalPaidPrice = order.price;
          couponDoc.donationSpendId = spend._id;
          await couponDoc.save();
          console.log(`✅ Single-use coupon ${couponDoc.code} marked as used & disabled`);
        }

        (order as any).scholarshipFundDeducted = true;
        (order as any).donationSpendId = spend._id;
        console.log(`✅ Auto-deducted ৳${(order as any).discountAmount} from Scholarship Fund for Order ${order._id}`);
      } catch (deductErr) {
        console.error("Error creating auto donation spend deduction:", deductErr);
      }
    }

    await order.save();
  }

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

  return order;
};

export const PaymentService = {
  createCheckoutSession,
  markPaidFromWebhook
};
