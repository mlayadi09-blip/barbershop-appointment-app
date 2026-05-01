import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

type Role = "ADMIN" | "USER";

export function roleMiddleware(allowedRoles: Role | Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const rolesArray = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    if (!rolesArray.includes(user.role)) {
      throw new AppError("Forbidden", 403);
    }

    next();
  };
}
