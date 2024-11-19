import { hashPassword, verifyPasswordHash } from "@/utils/authentication";
import { UnauthorizedError } from "@/utils/custom-errors";

describe("verifyPasswordHash", () => {
  it("should return true for a valid password hash", async () => {
    const password = "password123";
    const hash = await hashPassword(password);
    // const hash = "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4a2b5Q9zF5Z5Q9zF5Z5";
    expect(await verifyPasswordHash(password, hash)).toBe(true);
  });

  it("should throw UnauthorizedError for an invalid password hash", async () => {
    const password = "password123";
    const hash = "$2b$10$invalidhash";
    expect(verifyPasswordHash(password, hash)).rejects.toThrow(UnauthorizedError);
  });
});
