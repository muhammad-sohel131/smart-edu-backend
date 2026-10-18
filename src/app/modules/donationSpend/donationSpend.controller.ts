import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DonationSpendServices } from "./donationSpend.service";

const createSpend = catchAsync(async (req: Request, res: Response) => {
  const actorUserId = (req as any).user?.userId || (req as any).user?._id;
  const result = await DonationSpendServices.createSpend(req.body, actorUserId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Donation expense recorded successfully",
    data: result
  });
});

const getAllSpends = catchAsync(async (req: Request, res: Response) => {
  const result = await DonationSpendServices.getAllSpends(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation spends fetched successfully",
    data: result
  });
});

const getSpendById = catchAsync(async (req: Request, res: Response) => {
  const result = await DonationSpendServices.getSpendById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation spend record fetched successfully",
    data: result
  });
});

const updateSpend = catchAsync(async (req: Request, res: Response) => {
  const result = await DonationSpendServices.updateSpend(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation spend updated successfully",
    data: result
  });
});

const deleteSpend = catchAsync(async (req: Request, res: Response) => {
  const result = await DonationSpendServices.deleteSpend(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation spend deleted successfully",
    data: result
  });
});

const getSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await DonationSpendServices.getSummary();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation balance summary fetched successfully",
    data: result
  });
});

export const DonationSpendControllers = {
  createSpend,
  getAllSpends,
  getSpendById,
  updateSpend,
  deleteSpend,
  getSummary
};
