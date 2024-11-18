import type { Request, Response, NextFunction } from "express";
import logger from "@/logger";

const log = logger.child({ module: "error-handler" });

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(err);
  if (err) {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    const data = err.data || {};
    res.status(status).json({ message, data });
    log.error(err.message);
  }
}
