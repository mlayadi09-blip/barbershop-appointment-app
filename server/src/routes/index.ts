import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/users.routes";
import servicesRoutes from "../modules/services/services.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/services", servicesRoutes);

export default router;
