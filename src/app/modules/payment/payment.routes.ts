import { Router } from "express";
import { paymentWebhooksController } from "./payment.webhooks.controller";

const router = Router();

router.post("/webhooks/sslcommerz/success", paymentWebhooksController.sslcommerzSuccess);
router.post("/webhooks/sslcommerz/fail", paymentWebhooksController.sslcommerzFail);
router.post("/webhooks/sslcommerz/cancel", paymentWebhooksController.sslcommerzCancel);
router.post("/webhooks/sslcommerz/ipn", paymentWebhooksController.sslcommerzIpn);

export const PaymentRoutes = router;
