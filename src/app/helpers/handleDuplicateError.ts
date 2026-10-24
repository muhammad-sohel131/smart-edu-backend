/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any) : IGenericErrorResponse => {
  const matchedArray = err.message?.match(/"([^"]*)"/);
  const duplicateVal = matchedArray ? `"${matchedArray[1]}"` : "This record";

  return {
    statusCode: 400,
    message: `${duplicateVal} already exists. Please use a different value or sign in.`,
  };
};