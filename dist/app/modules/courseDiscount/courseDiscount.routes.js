"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseDiscountRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const courseDiscount_controller_1 = require("./courseDiscount.controller");
const router = (0, express_1.Router)();
// Public / optional auth to get current discount setting (used by courses page, checkout, etc.)
router.get("/", checkAuth_1.optionalAuth, courseDiscount_controller_1.CourseDiscountControllers.getDiscount);
// Admin-only: update discount percentage and active state
router.patch("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), courseDiscount_controller_1.CourseDiscountControllers.updateDiscount);
// Admin-only: get history of which student bought which course, original price, reduced amount
router.get("/subsidies", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), courseDiscount_controller_1.CourseDiscountControllers.getSubsidyHistory);
exports.CourseDiscountRoutes = router;
