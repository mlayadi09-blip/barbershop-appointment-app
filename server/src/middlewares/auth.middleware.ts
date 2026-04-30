import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma";

import { AppError } from "../errors/AppError";

import { JwtPayload } from "../types/auth.types";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  } catch {
    throw new AppError("Invalid token", 401);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", 401);
  }

  req.user = user;

  next();
}
