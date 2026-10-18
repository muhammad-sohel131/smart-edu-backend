import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { DonationSpendControllers } from "./donationSpend.controller";

const router = Router();

// Balance and expenditure summary (can be viewed for transparency)
router.get("/summary", DonationSpendControllers.getSummary);

// List all spends
router.get("/", DonationSpendControllers.getAllSpends);

// Get single spend
router.get("/:id", DonationSpendControllers.getSpendById);

// Admin-only operations
router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DonationSpendControllers.createSpend
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DonationSpendControllers.updateSpend
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DonationSpendControllers.deleteSpend
);

export const DonationSpendRoutes = router;
