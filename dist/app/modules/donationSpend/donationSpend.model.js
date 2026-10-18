"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationSpend = void 0;
const mongoose_1 = require("mongoose");
const donationSpendSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
donationSpendSchema.index({ fund: 1, isDeleted: 1 });
donationSpendSchema.index({ spentDate: -1 });
exports.DonationSpend = (0, mongoose_1.model)("DonationSpend", donationSpendSchema);
