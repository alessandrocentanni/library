import { env } from "@/config";
import jwt from "jsonwebtoken";

// in a real world scenario you would want to use a more complex payload,
// have short lived access tokens and a refresh token strategy
// but we're good with this for now!

declare interface JwtPayload {
  id: string;
  permissions: string[];
}

export const generateJWT = (payload: JwtPayload) => {
  return jwt.sign(payload, env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

export const veriftyJWT = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET as string);
  return decoded as JwtPayload;
};
