import type { Request, Response } from "express";
import { controllerFactory } from "@/utils/controller-factory";
import { User } from "@/models/User";
import { NotFoundError, ForbiddenError } from "@/utils/custom-errors";

export const getUser = controllerFactory(
  async (req: Request, res: Response) => {
    if (req.user !== req.params.id) throw new ForbiddenError("User not found");
    const user = await User.findById(req.user).select("-password");
    if (!user) throw new NotFoundError("User not found");
    res.status(200).json(user);
  }
);
