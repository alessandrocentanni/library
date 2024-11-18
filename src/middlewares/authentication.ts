import type { Request, Response, NextFunction } from "express";
import { veriftyJWT } from "../utils/jwt";
import { UnauthorizedError } from "@/utils/custom-errors";

const authenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;
  if (!token) next(new UnauthorizedError("No token provided"));

  try {
    const decoded = veriftyJWT(token);
    req.user = decoded.id;
    next();
  } catch (err) {
    next(new UnauthorizedError("Invalid token"));
  }
};

export default authenticationMiddleware;
