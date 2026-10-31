import { Types } from "mongoose";

export interface ICourseDiscount {
  _id?: Types.ObjectId;
  percentage: number;
  isActive: boolean;
  fundedBy: string;
  title?: string;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
