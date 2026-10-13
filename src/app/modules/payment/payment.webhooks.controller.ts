import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.services";
import { Order } from "../order/order.model";
import { envVars } from "../../config/env";

const getFrontendUrl = () => envVars.FRONTEND_URL || "http://localhost:3000";

const sslcommerzSuccess = catchAsync(async (req: Request, res: Response) => {
    const orderId = (req.query.orderId as string) || req.body?.tran_id || req.body?.orderId;
    const { val_id, amount, currency } = req.body || {};
    
    const order = await Order.findById(orderId);
    if (order && order.status !== "paid") {
        await PaymentService.markPaidFromWebhook("sslcommerz", {
            providerPaymentId: val_id || `sslcz_${orderId}`,
            providerSessionId: val_id,
            amount: Number(amount || order.price),
            currency: currency || "BDT",
            orderId: String(order._id),
            userId: order.user ? String(order.user) : undefined,
            courseId: order.course ? String(order.course) : undefined,
            eventId: (order as any).event ? String((order as any).event) : (order as any).eventId ? String((order as any).eventId) : undefined,
        });
    }

    if (order && order.itemType === "Donation") {
        const phone = order.donorPhone || order.billingInfo?.phone || "";
        const donorName = order.donorName || order.billingInfo?.name || "";
        const donatedAmount = order.price || 0;
        return res.redirect(
            `${getFrontendUrl()}/donation?tab=track&phone=${encodeURIComponent(phone)}&success=true&amount=${donatedAmount}&name=${encodeURIComponent(donorName)}&orderId=${orderId}`
        );
    }

    res.redirect(`${getFrontendUrl()}/payments/success?session_id=${orderId}`);
});

const sslcommerzFail = catchAsync(async (req: Request, res: Response) => {
    const orderId = (req.query.orderId as string) || req.body?.tran_id || req.body?.orderId;
    if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.itemType === "Donation") {
            const phone = order.donorPhone || order.billingInfo?.phone || "";
            return res.redirect(
                `${getFrontendUrl()}/donation?tab=track&phone=${encodeURIComponent(phone)}&failed=true`
            );
        }
    }
    res.redirect(`${getFrontendUrl()}/payments/failed`);
});

const sslcommerzCancel = catchAsync(async (req: Request, res: Response) => {
    const orderId = (req.query.orderId as string) || req.body?.tran_id || req.body?.orderId;
    if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.itemType === "Donation") {
            const phone = order.donorPhone || order.billingInfo?.phone || "";
            return res.redirect(
                `${getFrontendUrl()}/donation?tab=track&phone=${encodeURIComponent(phone)}&canceled=true`
            );
        }
    }
    res.redirect(`${getFrontendUrl()}/payments/failed`);
});

const sslcommerzIpn = catchAsync(async (req: Request, res: Response) => {
    const { tran_id, val_id, amount, currency, status } = req.body || {};
    
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
                eventId: (order as any).event ? String((order as any).event) : (order as any).eventId ? String((order as any).eventId) : undefined,
            });
        }
    }
    
    res.status(200).send('IPN Received');
});

export const paymentWebhooksController = { sslcommerzSuccess, sslcommerzFail, sslcommerzCancel, sslcommerzIpn };
