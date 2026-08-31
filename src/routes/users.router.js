import { Router } from "express";

import { getAllUsers } from "../controllers/users.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAllUsers
);

export default router;