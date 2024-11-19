import authentication from "@/routes/authentication";
import book from "@/routes/book";
import borrowHistory from "@/routes/borrow-history";
import user from "@/routes/user";
import { Router } from "express";

const router = Router();

router.use("/authentication", authentication);
router.use("/users", user);
router.use("/books", book);
router.use("/borrow-histories", borrowHistory);

export default router;
