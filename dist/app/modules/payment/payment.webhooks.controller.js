"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentWebhooksController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const payment_services_1 = require("./payment.services");
const order_model_1 = require("../order/order.model");
const env_1 = require("../../config/env");
const getFrontendUrl = () => env_1.envVars.FRONTEND_URL || "http://localhost:3000";
const sslcommerzSuccess = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.query.orderId;
    const { val_id, amount, currency } = req.body;
    const order = yield order_model_1.Order.findById(orderId);
    if (order && order.status !== "paid") {
        yield payment_services_1.PaymentService.markPaidFromWebhook("sslcommerz", {
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
}));
const sslcommerzFail = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.redirect(`${getFrontendUrl()}/payment/fail`);
}));
const sslcommerzCancel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.redirect(`${getFrontendUrl()}/payment/cancel`);
}));
const sslcommerzIpn = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tran_id, val_id, amount, currency, status } = req.body;
    if (status === 'VALID' || status === 'VALIDATED') {
        const order = yield order_model_1.Order.findById(tran_id);
        if (order && order.status !== "paid") {
            yield payment_services_1.PaymentService.markPaidFromWebhook("sslcommerz", {
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
}));
exports.paymentWebhooksController = { sslcommerzSuccess, sslcommerzFail, sslcommerzCancel, sslcommerzIpn };
