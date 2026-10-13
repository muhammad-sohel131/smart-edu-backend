import { Router } from "express";
import { checkAuth, optionalAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { orderController } from "./order.controller";


const router = Router();

router.patch(
  "/:id/cancel",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  orderController.cancelOrder
);

router.post(
  "/checkout",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),

  orderController.createCheckout
);

router.post(
  "/donation-checkout",
  optionalAuth,
  orderController.createDonationCheckout
);

router.get("/donations/track", orderController.trackDonationsByPhone);
router.get("/donations/by-phone/:phone", orderController.trackDonationsByPhone);

router.get("/me", checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN), orderController.getMyOrders);

router.get(
  "/",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  orderController.getOrders
);
router.get(
  "/:orderId",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  orderController.getOrderById
);

router.get(
  "/session/:sessionId",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  orderController.getOrderBySession
);

export const OrderRoutes = router;
