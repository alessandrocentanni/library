import { Router } from "express";
import authentication from "@/routes/authentication";
import user from "@/routes/user";

const router = Router();

router.use("/auth", authentication);
router.use("/user", user);

export default router;
