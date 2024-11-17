import type { Request, Response } from "express";

async function getUser(req: Request, res: Response) {
  res.send("getUser");
}

export { getUser };
