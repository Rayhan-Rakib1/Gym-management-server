import { Response } from "express";

export interface MetaData {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T | null;
  meta?: MetaData | null;
}

export const sendResponse = <T>(res: Response, response: ApiResponse<T>) => {
  res.status(response.statusCode).json({
    success: response.success,
    message: response.message,
    data: response.data ?? null,
    ...(response.meta && { meta: response.meta }),
    timestamp: new Date().toISOString(),
  });
};
