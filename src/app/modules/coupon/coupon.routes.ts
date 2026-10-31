import { Router } from "express";
import { checkAuth, optionalAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { CouponControllers } from "./coupon.controller";

const router = Router();

// Validate coupon code (used by student at checkout)
router.post("/validate", optionalAuth, CouponControllers.validateCoupon);

// Admin-only coupon management
router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CouponControllers.createCoupon
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CouponControllers.getAllCoupons
);

router.get(
  "/history",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CouponControllers.getCouponHistory
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CouponControllers.toggleCoupon
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CouponControllers.deleteCoupon
);

export const CouponRoutes = router;

