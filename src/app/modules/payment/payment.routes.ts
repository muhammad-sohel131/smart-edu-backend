import { Router } from "express";
import { paymentWebhooksController } from "./payment.webhooks.controller";

const router = Router();

router.all("/webhooks/sslcommerz/success", paymentWebhooksController.sslcommerzSuccess);
router.all("/webhooks/sslcommerz/fail", paymentWebhooksController.sslcommerzFail);
router.all("/webhooks/sslcommerz/cancel", paymentWebhooksController.sslcommerzCancel);
router.post("/webhooks/sslcommerz/ipn", paymentWebhooksController.sslcommerzIpn);

export const PaymentRoutes = router;
