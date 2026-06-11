import { Router } from "express";

import {
  completeOnboarding,
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getProfile);
router.put("/", authenticate, updateProfile);
router.post("/onboarding/complete", authenticate, completeOnboarding);

export default router;
