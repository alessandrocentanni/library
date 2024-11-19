import request from "supertest";

import { app } from "@/server";
import { faker } from "@faker-js/faker";
import db from "@/database";

describe("Serve API Endpoints for the authentication controller", () => {
  beforeAll(async () => {
    await db.connect();
  });

  describe("POST /api/authentication/signup", () => {
    it("should create a new user", async () => {
      const response = await request(app)
        .post("/api/authentication/signup")
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        });
      expect(response.statusCode).toEqual(200);
    });

    it("should fail to create a new user", async () => {
      const response = await request(app)
        .post("/api/authentication/signup")
        .send({
          // email: faker.internet.email(),
          password: faker.internet.password(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe("POST /api/authentication/login", () => {
    it("should login a user", async () => {
      // create dummy first
      const dummyUser = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      await request(app).post("/api/authentication/signup").send({
        email: dummyUser.email,
        password: dummyUser.password,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });

      const loginResponse = await request(app)
        .post("/api/authentication/login")
        .send({
          email: dummyUser.email,
          password: dummyUser.password,
        });

      expect(loginResponse.statusCode).toEqual(200);
      expect(loginResponse.body).toHaveProperty("accessToken");
    });

    it("should fail to login a user", async () => {
      // create dummy first
      const dummyUser = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      await request(app).post("/api/authentication/signup").send({
        email: dummyUser.email,
        password: dummyUser.password,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });

      const loginResponse = await request(app)
        .post("/api/authentication/login")
        .send({
          email: dummyUser.email,
          password: "wrong-password",
        });

      expect(loginResponse.statusCode).toEqual(401);
    });
  });
});
