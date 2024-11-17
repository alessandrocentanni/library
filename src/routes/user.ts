import { Router } from "express";
import { getUser } from "@/controllers/user";

const router = Router();

router.get("/:id", getUser);

export default router;
