import type { Request, Response } from "express";

async function login(req: Request, res: Response) {
  res.send("login");
}

async function signup(req: Request, res: Response) {
  res.send("signup");
}

export { login, signup };
