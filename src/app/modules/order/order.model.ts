import { Schema, model, models } from "mongoose";
import { IOrder } from "./order.interface";
const OrderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    donorName: { type: String },
    donorEmail: { type: String },
    donorPhone: { type: String, index: true },
    donorImage: { type: String },
    itemType: { type: String, enum: ["course", "event", "Donation"], required: true },
    course: { type: String },
    fund: {type: String},
    courseIds: [{ type: String }],
    billingInfo: {type: Object},
    event: { type: Schema.Types.ObjectId, ref: "Event" },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discountAmount: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    scholarshipFundDeducted: { type: Boolean, default: false },
    donationSpendId: { type: Schema.Types.ObjectId, ref: "DonationSpend" },
    currency: { type: String, required: true },
    provider: { type: String, required: true },
    providerSessionId: { type: String, index: true },
    providerPaymentId: { type: String, index: true },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded", "canceled"], default: "pending", index: true },
    couponCode: { type: String },
    meta: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
