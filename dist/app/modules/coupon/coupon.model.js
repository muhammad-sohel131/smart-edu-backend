"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coupon = void 0;
const mongoose_1 = require("mongoose");
const couponSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    usedAt: {
        type: Date
    },
    usedOrder: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Order"
    },
    usedCourse: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "DonationSpend"
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    expiryDate: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
exports.Coupon = (0, mongoose_1.model)("Coupon", couponSchema);
