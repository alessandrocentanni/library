import { login, signup } from "@/controllers/authentication";
import { authLimiterMiddleware } from "@/middlewares/rate-limiter";
import { Router } from "express";

const router = Router();

router.use(authLimiterMiddleware);

router.post("/login", login);
router.post("/signup", signup);

export default router;
