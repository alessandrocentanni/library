import { User } from "@/models/User";
import { generateJWT } from "@/utils/jwt";
import {
  hashPassword,
  verifyEmail,
  verifyPasswordHash,
} from "@/utils/authentication";
import { validateSchema } from "@/utils/validate-schema";
import { z } from "zod";
import { controllerFactory } from "@/utils/controller-factory";

export const login = controllerFactory(async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const data = validateSchema(schema, req.body);

  const user = await verifyEmail(data.email);
  await verifyPasswordHash(data.password, user.password);

  const accessToken = generateJWT({ id: user._id.toString(), role: "user" });

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.sendStatus(200);
});

export const signup = controllerFactory(async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string(),
    lastName: z.string(),
  });

  const data = validateSchema(schema, req.body);

  await User.create({ ...data, password: await hashPassword(data.password) });

  res.sendStatus(200);
});
