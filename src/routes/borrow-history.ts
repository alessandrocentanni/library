import { createBorrowHistory, listBorrowHistory, updateBorrowHistory } from "@/controllers/borrow-history";
import authenticationMiddleware from "@/middlewares/authentication";
import { Router } from "express";

const router = Router();
router.post("/", authenticationMiddleware, createBorrowHistory);
router.get("/", authenticationMiddleware, listBorrowHistory);
router.patch("/:id", authenticationMiddleware, updateBorrowHistory);
export default router;
