import type { ZodIssue } from "zod";

class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class HttpError extends CustomError {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class ValidationError extends CustomError {
  status: number;
  issues: ZodIssue[];

  constructor(message: string, issues?: ZodIssue[]) {
    super(message);
    this.status = 400;
    this.issues = issues || [];
  }
}

export class NotFoundError extends CustomError {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = 404;
  }
}

export class UnauthorizedError extends CustomError {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = 401;
  }
}

export class TooManyRequestsError extends CustomError {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = 429;
  }
}

export class ForbiddenError extends CustomError {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = 403;
  }
}
