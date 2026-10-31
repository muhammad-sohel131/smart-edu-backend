import { Types } from "mongoose";

export interface ICoupon {
  _id?: Types.ObjectId;
  code: string;
  discountPercentage: number; // 0 to 100
  title?: string; // Reason or recipient note (e.g., "Full Scholarship for Rahim")
  fundedBy: string; // "educational-scholarships"
  isUsed: boolean; // Single-use constraint: true once redeemed
  isActive: boolean; // Active or disabled
  usedBy?: Types.ObjectId; // Student who used the coupon
  usedAt?: Date;
  usedOrder?: Types.ObjectId;
  usedCourse?: Types.ObjectId;
  reducedAmount?: number; // How much was deducted/subsidized
  originalPrice?: number;
  finalPaidPrice?: number;
  donationSpendId?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  expiryDate?: Date;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

