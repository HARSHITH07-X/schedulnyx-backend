import { Router } from "express";

import { generate } from "../controllers/aiController.js";
import { authenticate } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/generate", authenticate, aiLimiter, generate);

export default router;
