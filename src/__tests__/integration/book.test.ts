import request from "supertest";

import db from "@/database";
import { type IUser, User } from "@/models/User";
import { app } from "@/server";
import { generateJWT } from "@/utils/jwt";
import { faker } from "@faker-js/faker";

import bookDummies from "../dummies/book";
import userDummies from "../dummies/user";

describe("Serve API Endpoints for the book controller", () => {
  let bookId: string;
  let dummyUser: IUser;
  let token: string;
  beforeAll(async () => {
    await db.connect();

    await bookDummies();
    await userDummies();

    const user = await User.findOne({ email: "admin@gmail.com" });
    expect(user).not.toBeNull();

    dummyUser = user!.toObject();

    token = generateJWT({
      id: user!._id.toString(),
      permissions: user!.permissions,
    });
  });

  it("should create a new book", async () => {
    const payload = {
      title: faker.book.title(),
      author: faker.book.author(),
      publicationYear: faker.date.past().getFullYear().toString(),
      publisher: faker.book.publisher(),
      retailPrice: faker.number.float({ fractionDigits: 2 }),
      availableCopies: 4,
    };

    const response = await request(app).post("/api/books").set("x-access-token", `${token}`).send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    bookId = response.body._id;
  });

  it("should get a book by id", async () => {
    const response = await request(app).get(`/api/books/${bookId}`).set("x-access-token", `${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", bookId);
  });

  it("should delete a book by id", async () => {
    const response = await request(app).delete(`/api/books/${bookId}`).set("x-access-token", `${token}`);
    expect(response.status).toBe(204);
  });

  it("should return 404 for a non-existing book", async () => {
    const response = await request(app).get(`/api/books/${bookId}`).set("x-access-token", `${token}`);
    expect(response.status).toBe(404);
  });

  it("should list all books", async () => {
    const response = await request(app).get("/api/books").set("x-access-token", `${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("results");
    expect(response.body.results).toBeInstanceOf(Array);
    expect(response.body.results.length).toBeGreaterThan(0);
  });

  it("should list books with pagination", async () => {
    const response = await request(app).get("/api/books?page=1&limit=2").set("x-access-token", `${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("results");
    expect(response.body.results).toBeInstanceOf(Array);
    expect(response.body.results.length).toBeLessThanOrEqual(2);
    expect(response.body).toHaveProperty("totalResults");
    expect(response.body).toHaveProperty("page", 1);
    expect(response.body).toHaveProperty("totalPages");
  });

  it("should list books filtered by publication year", async () => {
    const response = await request(app).get("/api/books?publicationYear=2021").set("x-access-token", `${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("results");
    expect(response.body.results).toBeInstanceOf(Array);
    for (const book of response.body.results) {
      expect(book).toHaveProperty("publicationYear", "2021");
    }
  });

  it("should list books filtered by title or author", async () => {
    const response = await request(app).get("/api/books?titleOrAuthor=Betina").set("x-access-token", `${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("results");
    expect(response.body.results).toBeInstanceOf(Array);
    for (const book of response.body.results) {
      expect(book.author).toContain("Betina");
    }
  });
});
