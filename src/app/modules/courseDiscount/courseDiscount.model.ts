import { Schema, model, models } from "mongoose";
import { ICourseDiscount } from "./courseDiscount.interface";

const courseDiscountSchema = new Schema<ICourseDiscount>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true, versionKey: false }
);

export const CourseDiscount =
  models.CourseDiscount || model<ICourseDiscount>("CourseDiscount", courseDiscountSchema);

