import { Router } from "express";
import { login, signup } from "@/controllers/authentication";
import { authLimiterMiddleware } from "@/middlewares/rate-limiter";

const router = Router();

router.use(authLimiterMiddleware);

router.post("/login", login);
router.post("/signup", signup);

export default router;
