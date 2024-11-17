import type { Request, Response, NextFunction } from "express";
import logger from "@/logger";

const log = logger.child({ module: "error-handler" });

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err) {
    if (err.name === "ValidationError") {
      res.status(400).send(err.message);
    } else {
      res.status(500).send("Something went wrong");
    }
    log.error(err.message);
  }
}
