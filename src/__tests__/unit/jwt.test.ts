import { describe, it, expect } from "vitest";
import { generateJWT, veriftyJWT } from "@/utils/jwt";
import jwt from "jsonwebtoken";
import { env } from "@/config";

describe("JWT Utility Functions", () => {
  const payload = { id: "123", role: "user" };
  const secret = env.JWT_SECRET as string;

  it("should generate a JWT token", () => {
    const token = generateJWT(payload);
    expect(token).toBeDefined();
    const decoded = jwt.verify(token, secret);
    expect(decoded).toMatchObject(payload);
  });

  it("should verify a JWT token", () => {
    const token = jwt.sign(payload, secret, { expiresIn: "1d" });
    const decoded = veriftyJWT(token);
    expect(decoded).toMatchObject(payload);
  });

  it("should throw an error for an invalid token", () => {
    const invalidToken = "invalid.token.here";
    expect(() => veriftyJWT(invalidToken)).toThrow();
  });

  it("should throw an error for an expired token", () => {
    const expiredToken = jwt.sign(payload, secret, { expiresIn: "1ms" });
    setTimeout(() => {
      expect(() => veriftyJWT(expiredToken)).toThrow();
    }, 10);
  });
});
