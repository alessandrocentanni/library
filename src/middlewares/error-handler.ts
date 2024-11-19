import logger from "@/logger";
import type { NextFunction, Request, Response } from "express";

const log = logger.child({ module: "error-handler" });

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err) {
    log.error("error thrown: ", err.name);
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    const data = err.data || err.issues || {};
    res.status(status).json({ message, data });
    log.error(err.message);
  }
}
