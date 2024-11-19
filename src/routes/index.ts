import { Router } from "express";
import authentication from "@/routes/authentication";
import user from "@/routes/user";
import book from "@/routes/book";

const router = Router();

router.use("/authentication", authentication);
router.use("/users", user);
router.use("/books", book);

export default router;
