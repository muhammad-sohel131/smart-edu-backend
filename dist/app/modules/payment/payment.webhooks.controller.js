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
    var _a, _b, _c, _d;
    const orderId = req.query.orderId || ((_a = req.body) === null || _a === void 0 ? void 0 : _a.tran_id) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.orderId);
    const { val_id, amount, currency } = req.body || {};
    const order = yield order_model_1.Order.findById(orderId);
    if (order && order.status !== "paid") {
        yield payment_services_1.PaymentService.markPaidFromWebhook("sslcommerz", {
            providerPaymentId: val_id || `sslcz_${orderId}`,
            providerSessionId: val_id,
            amount: Number(amount || order.price),
            currency: currency || "BDT",
            orderId: String(order._id),
            userId: order.user ? String(order.user) : undefined,
            courseId: order.course ? String(order.course) : undefined,
            eventId: order.event ? String(order.event) : order.eventId ? String(order.eventId) : undefined,
        });
    }
    if (order && order.itemType === "Donation") {
        const phone = order.donorPhone || ((_c = order.billingInfo) === null || _c === void 0 ? void 0 : _c.phone) || "";
        const donorName = order.donorName || ((_d = order.billingInfo) === null || _d === void 0 ? void 0 : _d.name) || "";
        const donatedAmount = order.price || 0;
        return res.redirect(`${getFrontendUrl()}/donation?tab=track&phone=${encodeURIComponent(phone)}&success=true&amount=${donatedAmount}&name=${encodeURIComponent(donorName)}&orderId=${orderId}`);
    }
    res.redirect(`${getFrontendUrl()}/payments/success?session_id=${orderId}`);
}));
const sslcommerzFail = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const orderId = req.query.orderId || ((_a = req.body) === null || _a === void 0 ? void 0 : _a.tran_id) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.orderId);
    if (orderId) {
        const order = yield order_model_1.Order.findById(orderId);
        if (order && order.itemType === "Donation") {
            const phone = order.donorPhone || ((_c = order.billingInfo) === null || _c === void 0 ? void 0 : _c.phone) || "";
            return res.redirect(`${getFrontendUrl()}/donation?tab=track&phone=${encodeURIComponent(phone)}&failed=true`);
        }
    }
    res.redirect(`${getFrontendUrl()}/payments/failed`);
}));
const sslcommerzCancel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const orderId = req.query.orderId || ((_a = req.body) === null || _a === void 0 ? void 0 : _a.tran_id) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.orderId);
    if (orderId) {
        const order = yield order_model_1.Order.findById(orderId);
        if (order && order.itemType === "Donation") {
            const phone = order.donorPhone || ((_c = order.billingInfo) === null || _c === void 0 ? void 0 : _c.phone) || "";
            return res.redirect(`${getFrontendUrl()}/donation?tab=track&phone=${encodeURIComponent(phone)}&canceled=true`);
        }
    }
    res.redirect(`${getFrontendUrl()}/payments/failed`);
}));
const sslcommerzIpn = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tran_id, val_id, amount, currency, status } = req.body || {};
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
                eventId: order.event ? String(order.event) : order.eventId ? String(order.eventId) : undefined,
            });
        }
    }
    res.status(200).send('IPN Received');
}));
exports.paymentWebhooksController = { sslcommerzSuccess, sslcommerzFail, sslcommerzCancel, sslcommerzIpn };
