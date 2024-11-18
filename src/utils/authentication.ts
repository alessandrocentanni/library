import argon2 from "argon2";
import { UnauthorizedError } from "./custom-errors";
import { User } from "@/models/User";

export async function hashPassword(password: string) {
  return await argon2.hash(password);
}

export async function verifyEmail(email: string) {
  const user = await User.findOne({ email: email }).select("+password");
  if (!user) throw new UnauthorizedError("Invalid email or password");

  return user;
}

export async function verifyPasswordHash(
  password: string,
  hashedPassword: string
) {
  const result = await argon2.verify(hashedPassword, password);
  if (!result) throw new UnauthorizedError("Invalid email or password");

  return result;
}
