import { getUser } from "@/controllers/user";
import authenticationMiddleware from "@/middlewares/authentication";
import { Router } from "express";

const router = Router();

router.get("/:id", authenticationMiddleware, getUser);

export default router;
