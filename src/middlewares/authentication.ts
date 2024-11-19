import { UnauthorizedError } from "@/utils/custom-errors";
import type { NextFunction, Request, Response } from "express";
import { veriftyJWT } from "../utils/jwt";

const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["x-access-token"] as string;
  if (!token) next(new UnauthorizedError("No token provided"));

  try {
    const decoded = veriftyJWT(token);
    req.user = decoded.id;
    req.permissions = decoded.permissions;
    next();
  } catch (err) {
    next(new UnauthorizedError("Invalid token"));
  }
};

export default authenticationMiddleware;
