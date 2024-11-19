import request from "supertest";
import { app } from "@/server";
import { describe, it, expect, beforeAll } from "vitest";
import { User, type IUser } from "@/models/User";
import { createDummyUser } from "../dummies/user";
import db from "@/database";
import { generateJWT } from "@/utils/jwt";

describe("GET /users/:id", () => {
  const password = "password";

  let token: string;
  let dummyUser: IUser;

  beforeAll(async () => {
    await db.connect();

    const user = await User.findOne({ email: "admin@gmail.com" });
    expect(user).not.toBeNull();

    dummyUser = user!.toObject();

    token = generateJWT({
      id: user!._id.toString(),
      permissions: user!.permissions,
    });
  });

  it("should return user data for a valid user ID", async () => {
    const userId = dummyUser._id;
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set("x-access-token", `${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", userId.toString());
    expect(response.body).toHaveProperty("email", dummyUser.email);
  });

  it("should return 401 for missing authentication token", async () => {
    const userId = dummyUser._id;
    const response = await request(app).get(`/api/users/${userId}`);

    expect(response.status).toBe(401);
  });

  it("should return 403 for a wrong user ID", async () => {
    const userId = "nonExistentUserId";
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set("x-access-token", `${token}`);

    expect(response.status).toBe(403);
  });
});
