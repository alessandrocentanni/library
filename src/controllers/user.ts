import { User } from "@/models/User";
import { controllerFactory } from "@/utils/controller-factory";
import { ForbiddenError, NotFoundError } from "@/utils/custom-errors";
import type { Request, Response } from "express";

export const getUser = controllerFactory(async (req: Request, res: Response) => {
  // in our case we're not really having "admin permissions" for now. those checks are't really necessary
  // we could simply rely on req.user to get the user id

  if (req.user !== req.params.id) throw new ForbiddenError("User not found");
  const user = await User.findById(req.user).select("-password");
  if (!user) throw new NotFoundError("User not found");
  res.status(200).json(user);
});
