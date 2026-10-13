import { Types } from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "canceled";
export type PaymentProvider = "sslcommerz";

export type OrderSource = "course" | "event" | "Donation";

export interface IOrder {
    _id?: Types.ObjectId;
    user?: Types.ObjectId;
    donorName?: string;
    donorEmail?: string;
    donorPhone?: string;
    itemType: OrderSource;
    courseIds?: string[];
    course?: Types.ObjectId;
    fund?: string;

    event?: Types.ObjectId;
    billingInfo?: object,


    price: number;         // smallest unit (e.g., cents)
    currency: string;      // "USD","MYR","BDT", etc.

    provider: PaymentProvider;
    providerSessionId?: string;
    providerPaymentId?: string;
    status: OrderStatus;
    couponCode?: string;
    meta?: Record<string, any>;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
