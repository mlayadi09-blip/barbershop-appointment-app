import { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";

import { AppError } from "../errors/AppError";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      type: "ValidationError",

      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown server errors
  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
