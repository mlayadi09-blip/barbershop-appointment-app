import { Router } from "express";

import { create, getAll, getById, update, remove } from "./services.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(create));
router.get("/", asyncHandler(getAll));
router.get("/:id", asyncHandler(getById));
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  asyncHandler(update),
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  asyncHandler(remove),
);

export default router;
