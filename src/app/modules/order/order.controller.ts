/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OrderServices } from "./order.services";

/**
 * 🧾 Create checkout for normal course/package/event
 */
const createCheckout = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { provider, couponCode, courseId, itemType, billingInfo } = req.body;

  const data = await OrderServices.createCheckout(
    courseId,
    token.userId,
    provider,
    itemType,
    couponCode,
    billingInfo
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Checkout created successfully",
    data,
  });
});

const createDonationCheckout = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { provider, fund, amount, donorInfo, billingInfo } = req.body;
  const info = donorInfo || billingInfo || {};

  const data = await OrderServices.createDonationCheckout(
    fund,
    token?.userId,
    provider,
    amount,
    info
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Checkout created successfully",
    data,
  });
});

const trackDonationsByPhone = catchAsync(async (req: Request, res: Response) => {
  const phone = (req.query.phone as string) || (req.params.phone as string);
  const data = await OrderServices.getDonationsByPhone(phone);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donations fetched successfully",
    data,
  });
});


/**
 * 📦 Get my orders (student/instructor)
 */
const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const orders = await OrderServices.getMyOrders(token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My orders fetched successfully",
    data: orders,
  });
});

/**
 * 📄 Get order details by orderId
 */
const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { orderId } = req.params;

  const doc = await OrderServices.getOrderById(orderId, {
    userId: token.userId,
    role: token.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order details retrieved successfully",
    data: doc,
  });
});

/**
 * 🔍 Get order details by sessionId (SSLCommerz)/Toyyib sessionId
 */
const getOrderBySession = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { sessionId } = req.params;

  const doc = await OrderServices.getOrderBySessionId(sessionId, {
    userId: token.userId,
    role: token.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order details retrieved successfully",
    data: doc,
  });
});

/**
 * 🧾 Admin: Get all orders (global list)
 */
const getOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await OrderServices.getOrders(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All orders retrieved successfully",
    data: orders,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { id } = req.params;
  const result = await OrderServices.cancelOrder(
    id,
    req.body,
    { userId: token.userId, role: token.role }
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order cancelled",
    data: result,
  });
});


export const orderController = {
  createCheckout,
  getMyOrders,
  getOrderById,
  getOrderBySession,
  getOrders,
  cancelOrder,
  createDonationCheckout,
  trackDonationsByPhone
};
