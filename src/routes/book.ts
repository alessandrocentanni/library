import { createBook, deleteBook, getBook, listBooks } from "@/controllers/book";
// import { getUser } from "@/controllers/user";
import authenticationMiddleware from "@/middlewares/authentication";
import requiredPermission from "@/middlewares/required-permission";
import { Router } from "express";
const router = Router();

router.get("/", authenticationMiddleware, listBooks);

router.get("/:id", authenticationMiddleware, getBook);

router.post("/", authenticationMiddleware, requiredPermission("book:write"), createBook);

router.delete("/:id", authenticationMiddleware, requiredPermission("book:write"), deleteBook);

export default router;
