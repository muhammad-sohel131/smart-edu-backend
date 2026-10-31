"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", index: true },
    donorName: { type: String },
    donorEmail: { type: String },
    donorPhone: { type: String, index: true },
    donorImage: { type: String },
    itemType: { type: String, enum: ["course", "event", "Donation"], required: true },
    course: { type: String },
    fund: { type: String },
    courseIds: [{ type: String }],
    billingInfo: { type: Object },
    event: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event" },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discountAmount: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    scholarshipFundDeducted: { type: Boolean, default: false },
    donationSpendId: { type: mongoose_1.Schema.Types.ObjectId, ref: "DonationSpend" },
    currency: { type: String, required: true },
    provider: { type: String, required: true },
    providerSessionId: { type: String, index: true },
    providerPaymentId: { type: String, index: true },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded", "canceled"], default: "pending", index: true },
    couponCode: { type: String },
    meta: { type: mongoose_1.Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
exports.Order = mongoose_1.models.Order || (0, mongoose_1.model)("Order", OrderSchema);
