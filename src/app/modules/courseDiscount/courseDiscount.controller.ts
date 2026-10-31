import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CourseDiscountServices } from "./courseDiscount.service";

const getDiscount = catchAsync(async (req: Request, res: Response) => {
  const data = await CourseDiscountServices.getDiscount();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course discount settings retrieved successfully",
    data
  });
});

const updateDiscount = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const data = await CourseDiscountServices.updateDiscount(
    req.body,
    token?.userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course discount settings updated successfully",
    data
  });
});

const getSubsidyHistory = catchAsync(async (req: Request, res: Response) => {
  const data = await CourseDiscountServices.getSubsidyHistory(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course scholarship subsidy history retrieved successfully",
    data
  });
});

export const CourseDiscountControllers = {
  getDiscount,
  updateDiscount,
  getSubsidyHistory
};

