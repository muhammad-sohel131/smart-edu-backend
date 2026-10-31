"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const coupon_controller_1 = require("./coupon.controller");
const router = (0, express_1.Router)();
// Validate coupon code (used by student at checkout)
router.post("/validate", checkAuth_1.optionalAuth, coupon_controller_1.CouponControllers.validateCoupon);
// Admin-only coupon management
router.post("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), coupon_controller_1.CouponControllers.createCoupon);
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), coupon_controller_1.CouponControllers.getAllCoupons);
router.get("/history", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), coupon_controller_1.CouponControllers.getCouponHistory);
router.patch("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), coupon_controller_1.CouponControllers.toggleCoupon);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), coupon_controller_1.CouponControllers.deleteCoupon);
exports.CouponRoutes = router;
