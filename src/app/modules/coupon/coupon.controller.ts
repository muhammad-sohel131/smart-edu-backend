import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CouponServices } from "./coupon.service";

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as any;
  const result = await CouponServices.createCoupon(req.body, actor?.userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Scholarship coupon created successfully",
    data: result
  });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.getAllCoupons(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupons retrieved successfully",
    data: result
  });
});

const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code, courseId } = req.body;
  const actor = req.user as any;
  const result = await CouponServices.validateCoupon(code, courseId, actor?.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon validated successfully",
    data: result
  });
});

const toggleCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const result = await CouponServices.toggleCoupon(id, isActive);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Coupon ${isActive ? "enabled" : "disabled"} successfully`,
    data: result
  });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CouponServices.deleteCoupon(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon deleted successfully",
    data: null
  });
});

const getCouponHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.getCouponHistory(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon usage history retrieved successfully",
    data: result
  });
});

export const CouponControllers = {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  toggleCoupon,
  deleteCoupon,
  getCouponHistory
};
