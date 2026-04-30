import { Router } from "express";

import { getMe } from "./users.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, getMe);

export default router;
