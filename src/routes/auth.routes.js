import { Router } from "express";

import { getMe, syncUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/sync", authenticate, syncUser);
router.get("/me", authenticate, getMe);

export default router;
