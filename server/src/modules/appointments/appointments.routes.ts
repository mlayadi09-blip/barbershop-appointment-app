import { Router } from "express";
import { create } from "./appointments.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/", authMiddleware, asyncHandler(create));

export default router;
