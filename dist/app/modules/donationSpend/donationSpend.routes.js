"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationSpendRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const donationSpend_controller_1 = require("./donationSpend.controller");
const router = (0, express_1.Router)();
// Balance and expenditure summary (can be viewed for transparency)
router.get("/summary", donationSpend_controller_1.DonationSpendControllers.getSummary);
// List all spends
router.get("/", donationSpend_controller_1.DonationSpendControllers.getAllSpends);
// Get single spend
router.get("/:id", donationSpend_controller_1.DonationSpendControllers.getSpendById);
// Admin-only operations
router.post("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), donationSpend_controller_1.DonationSpendControllers.createSpend);
router.patch("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), donationSpend_controller_1.DonationSpendControllers.updateSpend);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), donationSpend_controller_1.DonationSpendControllers.deleteSpend);
exports.DonationSpendRoutes = router;
