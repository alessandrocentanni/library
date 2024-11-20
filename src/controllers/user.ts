import { type IUser, User } from "@/models/User";
import { WalletHistory } from "@/models/WalletHistory";
import { controllerFactory } from "@/utils/controller-factory";
import { ForbiddenError, NotFoundError } from "@/utils/custom-errors";
import type { Request, Response } from "express";

export const getUser = controllerFactory(async (req: Request, res: Response) => {
  // in our case we're not really having "admin permissions" for now. those checks are't really necessary
  // we could simply rely on req.user to get the user id

  if (req.user !== req.params.id) throw new ForbiddenError("User not found");
  const user = await User.findById(req.user).select("-password");
  if (!user) throw new NotFoundError("User not found");

  // get current balance
  const walletHistories = await WalletHistory.find({ user: req.user });
  const balance = walletHistories.reduce((acc, curr) => acc + curr.amount, 0);

  const response: IUser & { balance: number } = { ...user.toObject(), balance };

  res.status(200).json(response);
});
