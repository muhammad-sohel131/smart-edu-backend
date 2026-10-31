import { Schema, model } from "mongoose";
import { IDonationSpend } from "./donationSpend.interface";

const donationSpendSchema = new Schema<IDonationSpend>(
  {
    title: {
      type: String,
      required: [true, "Title/Purpose of expense is required"],
      trim: true
    },
    fund: {
      type: String,
      required: [true, "Fund type is required"],
      trim: true,
      default: "educational-scholarships"
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1"]
    },
    category: {
      type: String,
      required: [true, "Expense category is required"],
      trim: true,
      default: "Scholarships & Stipends"
    },
    spentDate: {
      type: Date,
      default: Date.now
    },
    recipient: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    receiptUrl: {
      type: String,
      trim: true
    },
    handledBy: {
      type: String,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order"
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course"
    },
    discountPercentage: {
      type: Number
    },
    originalPrice: {
      type: Number
    },
    studentUser: {
      type: Schema.Types.ObjectId,
      ref: "User"
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

donationSpendSchema.index({ fund: 1, isDeleted: 1 });
donationSpendSchema.index({ spentDate: -1 });

export const DonationSpend = model<IDonationSpend>("DonationSpend", donationSpendSchema);
