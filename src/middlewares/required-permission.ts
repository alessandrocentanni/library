import { ForbiddenError } from "@/utils/custom-errors";
import type { NextFunction, Request, Response } from "express";

const requiredPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.permissions?.includes(permission)) {
      next();
    } else {
      next(new ForbiddenError("You do not have permission to access this resource"));
    }
  };
};

export default requiredPermission;
