import { Schema, model } from "mongoose";
import { ICoupon } from "./coupon.interface";

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    title: {
      type: String,
      trim: true,
      default: "Scholarship Coupon"
    },
    fundedBy: {
      type: String,
      default: "educational-scholarships",
      trim: true
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    usedAt: {
      type: Date
    },
    usedOrder: {
      type: Schema.Types.ObjectId,
      ref: "Order"
    },
    usedCourse: {
      type: Schema.Types.ObjectId,
      ref: "Course"
    },
    reducedAmount: {
      type: Number,
      default: 0
    },
    originalPrice: {
      type: Number,
      default: 0
    },
    finalPaidPrice: {
      type: Number,
      default: 0
    },
    donationSpendId: {
      type: Schema.Types.ObjectId,
      ref: "DonationSpend"
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    expiryDate: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Coupon = model<ICoupon>("Coupon", couponSchema);
