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
    currency: { type: String, required: true },
    provider: { type: String, required: true },
    providerSessionId: { type: String, index: true },
    providerPaymentId: { type: String, index: true },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded", "canceled"], default: "pending", index: true },
    couponCode: { type: String },
    meta: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

// OrderSchema.index({ user: 1, course: 1, status: 1 });
// OrderSchema.index({ provider: 1, providerPaymentId: 1 }, { unique: true, sparse: true });

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
