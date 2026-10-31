import { Router } from "express";
import { checkAuth, optionalAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { CourseDiscountControllers } from "./courseDiscount.controller";

const router = Router();

// Public / optional auth to get current discount setting (used by courses page, checkout, etc.)
router.get("/", optionalAuth, CourseDiscountControllers.getDiscount);

// Admin-only: update discount percentage and active state
router.patch(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CourseDiscountControllers.updateDiscount
);

// Admin-only: get history of which student bought which course, original price, reduced amount
router.get(
  "/subsidies",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CourseDiscountControllers.getSubsidyHistory
);

export const CourseDiscountRoutes = router;

