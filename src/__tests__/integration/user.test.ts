import request from "supertest";
import { app } from "@/server";
import { describe, it, expect, beforeAll } from "vitest";
import type { IUser } from "@/models/User";
import { createDummyUser } from "../dummies/user";
import db from "@/database";

describe("GET /users/:id", () => {
  let token: string;
  let dummyUser: IUser;
  let password: string;

  beforeAll(async () => {
    await db.connect();

    password = "testpassword";
    // Create a dummy user
    dummyUser = await createDummyUser({ password });
    // Assuming you have a way to get a valid token for authentication
    const response = await request(app)
      .post("/api/authentication/login")
      .send({ email: dummyUser.email, password });
    token = response.body.accessToken;
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
