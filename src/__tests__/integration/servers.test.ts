import request from "supertest";

import { app } from "@/server";

describe("Serve API Endpoints", () => {
  describe("GET /", () => {
    it("should return a hello message", async () => {
      const response = await request(app).get("/");
      const responseText = response.text;

      expect(response.statusCode).toEqual(200);
      expect(responseText).toContain("hello there");
    });
  });
});
