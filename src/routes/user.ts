import { Router } from "express";
import { getUser } from "@/controllers/user";
import authenticationMiddleware from "@/middlewares/authentication";

const router = Router();

router.get("/:id", authenticationMiddleware, getUser);

export default router;
