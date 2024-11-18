import type { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { TooManyRequestsError } from "../utils/custom-errors";
import { env } from "@/config";

// this is oversimplified compared to what you'd need to do in a real app
// first of all, memory storage is not suitable for a production app - you'd need to use a database (redis pref)
// second, you'd probably want to use a more complex rate limiting strategy for login/signup requests (eg: do not only ratelimit IPs, but also emails)

const authLimiter = new RateLimiterMemory({
  // this translates to 5 requests per second
  points: 5,
  duration: 1,
});

const genericLimiter = new RateLimiterMemory({
  // this translates to 100 requests per minute
  points: 100,
  duration: 60,
});

export const authLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (env.TEST) return next();

  authLimiter
    .consume(req.ip!)
    .then(() => next())
    .catch((_) => next(new TooManyRequestsError("Too many requests")));
};

export const genericLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (env.TEST) return next();

  genericLimiter
    .consume(req.ip!)
    .then(() => next())
    .catch((_) => next(new TooManyRequestsError("Too many requests")));
};
