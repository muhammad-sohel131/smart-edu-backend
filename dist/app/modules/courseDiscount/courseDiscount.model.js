"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseDiscount = void 0;
const mongoose_1 = require("mongoose");
const courseDiscountSchema = new mongoose_1.Schema({
    percentage: {
        type: Number,
        required: true,
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: false // Initially no discount active
    },
    fundedBy: {
        type: String,
        default: "educational-scholarships"
    },
    title: {
        type: String,
        default: "General Scholarship Subsidy"
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true, versionKey: false });
exports.CourseDiscount = mongoose_1.models.CourseDiscount || (0, mongoose_1.model)("CourseDiscount", courseDiscountSchema);
