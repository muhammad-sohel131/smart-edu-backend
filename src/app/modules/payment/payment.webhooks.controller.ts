import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.services";
import { Order } from "../order/order.model";
import { envVars } from "../../config/env";

const getFrontendUrl = () => envVars.FRONTEND_URL || "http://localhost:3000";

const sslcommerzSuccess = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.query.orderId as string;
    const { val_id, amount, currency } = req.body;
    
    const order = await Order.findById(orderId);
    if (order && order.status !== "paid") {
        await PaymentService.markPaidFromWebhook("sslcommerz", {
            providerPaymentId: val_id || `sslcz_${orderId}`,
            providerSessionId: val_id,
            amount: Number(amount || order.price),
            currency: currency || "BDT",
            orderId: String(order._id),
            userId: String(order.user),
            courseId: order.course ? String(order.course) : undefined,
            eventId: order.eventId ? String(order.eventId) : undefined,
        });
    }

    res.redirect(`${getFrontendUrl()}/payment/success`);
});

const sslcommerzFail = catchAsync(async (req: Request, res: Response) => {
    res.redirect(`${getFrontendUrl()}/payment/fail`);
});

const sslcommerzCancel = catchAsync(async (req: Request, res: Response) => {
    res.redirect(`${getFrontendUrl()}/payment/cancel`);
});

const sslcommerzIpn = catchAsync(async (req: Request, res: Response) => {
    const { tran_id, val_id, amount, currency, status } = req.body;
    
    if (status === 'VALID' || status === 'VALIDATED') {
        const order = await Order.findById(tran_id);
        if (order && order.status !== "paid") {
            await PaymentService.markPaidFromWebhook("sslcommerz", {
                providerPaymentId: val_id || `sslcz_${tran_id}`,
                providerSessionId: val_id,
                amount: Number(amount || order.price),
                currency: currency || "BDT",
                orderId: String(order._id),
                userId: String(order.user),
                courseId: order.course ? String(order.course) : undefined,
                eventId: order.eventId ? String(order.eventId) : undefined,
            });
        }
    }
    
    res.status(200).send('IPN Received');
});

export const paymentWebhooksController = { sslcommerzSuccess, sslcommerzFail, sslcommerzCancel, sslcommerzIpn };
