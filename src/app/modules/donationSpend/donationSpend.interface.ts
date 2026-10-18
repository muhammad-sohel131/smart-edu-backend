import { Types } from "mongoose";

export interface IDonationSpend {
  title: string;
  fund: string;
  amount: number;
  category: string;
  spentDate: Date;
  recipient?: string;
  description?: string;
  receiptUrl?: string;
  handledBy?: string;
  createdBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
