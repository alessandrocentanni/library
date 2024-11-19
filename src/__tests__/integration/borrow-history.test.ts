import db from "@/database";
import { Book, type IBook } from "@/models/Book";
import { BorrowHistory } from "@/models/BorrowHistory";
import { type IUser, User } from "@/models/User";
import { app } from "@/server";
import { generateJWT } from "@/utils/jwt";
import { type HydratedDocument, Types } from "mongoose";
import request from "supertest";
import userDummies from "../dummies/user";

describe("Borrow History API", () => {
  let token: string;
  let dummyUser: IUser;
  let dummyBook: HydratedDocument<IBook>;

  beforeAll(async () => {
    await db.connect();
    await userDummies();

    const user = await User.findOne({ email: "admin@gmail.com" });
    expect(user).not.toBeNull();

    dummyUser = user!.toObject();

    token = generateJWT({
      id: user!._id.toString(),
      permissions: user!.permissions,
    });

    dummyBook = await Book.create({
      title: "Test Book",
      author: "Test Author",
      availableCopies: 5,
      publicationYear: "2021",
      publisher: "Test Publisher",
      retailPrice: 100,
    });
  });

  describe("POST /api/borrow-histories", () => {
    it("should create a borrow history for a valid book ID", async () => {
      const response = await request(app).post("/api/borrow-histories").set("x-access-token", `${token}`).send({ bookId: dummyBook._id.toString() });

      expect(response.status).toBe(201);

      const updatedBook = await Book.findById(dummyBook._id);
      expect(updatedBook!.availableCopies).toBe(dummyBook.availableCopies - 1);

      const borrowHistory = await BorrowHistory.findOne({
        book: dummyBook._id,
        user: dummyUser._id,
      });
      expect(borrowHistory).not.toBeNull();
    });

    it("should return 404 for an invalid book ID", async () => {
      const response = await request(app).post("/api/borrow-histories").set("x-access-token", `${token}`).send({ bookId: new Types.ObjectId() });

      expect(response.status).toBe(404);
    });

    it("should return 402 if the book is not available", async () => {
      dummyBook.availableCopies = 0;
      await dummyBook.save();

      const response = await request(app).post("/api/borrow-histories").set("x-access-token", `${token}`).send({ bookId: dummyBook._id.toString() });

      expect(response.status).toBe(403);
    });

    it("should return 403 if the user tries to borrow the same book again", async () => {
      await request(app).post("/api/borrow-histories").set("x-access-token", `${token}`).send({ bookId: dummyBook._id.toString() });

      const response = await request(app).post("/api/borrow-histories").set("x-access-token", `${token}`).send({ bookId: dummyBook._id.toString() });

      expect(response.status).toBe(403);
    });

    it("should return 403 if the user tries to borrow more than 3 books", async () => {
      const anotherBook1 = await Book.create({
        title: "Another Book 1",
        author: "Another Author",
        availableCopies: 5,
        publicationYear: "2021",
        publisher: "Another Publisher",
        retailPrice: 100,
      });

      const anotherBook2 = await Book.create({
        title: "Another Book 2",
        author: "Another Author",
        availableCopies: 5,
        publicationYear: "2021",
        publisher: "Another Publisher",
        retailPrice: 100,
      });

      const anotherBook3 = await Book.create({
        title: "Another Book 3",
        author: "Another Author",
        availableCopies: 5,
        publicationYear: "2021",
        publisher: "Another Publisher",
        retailPrice: 100,
      });

      await request(app).post("/api/borrow-histories").set("x-access-token", `${token}`).send({ bookId: anotherBook1._id.toString() });
      await request(app).post("/api/borrow-histories").set("x-access-token", `${token}`).send({ bookId: anotherBook2._id.toString() });
      await request(app).post("/api/borrow-histories").set("x-access-token", `${token}`).send({ bookId: anotherBook3._id.toString() });

      const response = await request(app).post("/api/borrow-histories").set("x-access-token", `${token}`).send({ bookId: dummyBook._id.toString() });

      expect(response.status).toBe(403);
    });
  });

  describe("GET /api/borrow-histories", () => {
    it("should list borrow history for the authenticated user", async () => {
      const response = await request(app).get("/api/borrow-histories").set("x-access-token", `${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("results");
      expect(response.body.results).toBeInstanceOf(Array);
    });

    it("should return 401 for missing authentication token", async () => {
      const response = await request(app).get("/api/borrow-histories");

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/borrow-histories/:id", () => {
    let borrowHistoryId: Types.ObjectId;

    beforeAll(async () => {
      const borrowHistory = await BorrowHistory.create({
        book: dummyBook._id,
        user: dummyUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });

      borrowHistoryId = borrowHistory._id;
    });

    it("should update the borrow history to returned status", async () => {
      dummyBook.availableCopies = 10;
      await dummyBook.save();

      const response = await request(app).patch(`/api/borrow-histories/${borrowHistoryId}`).set("x-access-token", `${token}`);

      expect(response.status).toBe(204);

      const updatedBorrowHistory = await BorrowHistory.findById(borrowHistoryId);
      expect(updatedBorrowHistory!.status).toBe("returned");

      const updatedBook = await Book.findById(dummyBook._id);
      expect(updatedBook!.availableCopies).toBe(11);
    });

    it("should return 404 for an invalid borrow history ID", async () => {
      const response = await request(app).patch(`/api/borrow-histories/${new Types.ObjectId()}`).set("x-access-token", `${token}`);

      expect(response.status).toBe(404);
    });

    it("should return 403 if the book is already returned", async () => {
      const borrowHistory = await BorrowHistory.create({
        book: dummyBook._id,
        user: dummyUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "returned",
      });

      const response = await request(app).patch(`/api/borrow-histories/${borrowHistory._id}`).set("x-access-token", `${token}`);

      expect(response.status).toBe(403);
    });
  });
});
