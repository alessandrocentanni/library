import { env } from "@/config";
import { Book, type IBook } from "@/models/Book";
import { BorrowHistory, type IBorrowHistory } from "@/models/BorrowHistory";
import type { IWalletHistoryMetadata } from "@/models/WalletHistory";
import { controllerFactory } from "@/utils/controller-factory";
import { ForbiddenError, NotFoundError, PaymentRequiredError } from "@/utils/custom-errors";
import { validateSchema } from "@/utils/validate-schema";
import { processPayment } from "@/services/payments";
import type { Request, Response } from "express";
import mongoose, { type Types, type ClientSession } from "mongoose";
import { z } from "zod";

export const createBorrowHistory = controllerFactory(async (req: Request, res: Response) => {
  const schema = z.object({
    bookId: z.string(),
  });

  const data = validateSchema(schema, req.body);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const book = await Book.findById(data.bookId, null, { session });
    if (!book) throw new NotFoundError("Book not found");

    if (book.availableCopies <= 0) throw new ForbiddenError("Book not available");

    // check if the user has already borrowed the book or more than 3 books already
    const borrowedBooks = await BorrowHistory.find({ user: req.user, status: "borrowed" }, null, { session });
    if (borrowedBooks.length >= 3) throw new ForbiddenError("Maximum borrow limit reached");

    const hasBorrowedSameBook = borrowedBooks.some((borrow) => borrow.book.toString() === book._id.toString());
    if (hasBorrowedSameBook) throw new ForbiddenError("Book already borrowed");

    book.availableCopies -= 1;
    await book.save({ session });

    // Create a new borrow history
    const borrowHistory = await createBorrowHistoryAsset(book._id, req.user!, session);

    const paymentMetadata: IWalletHistoryMetadata = {
      book: book._id,
      transactionKind: "borrow:start",
      borrowHistory: (borrowHistory as Partial<IBorrowHistory>)._id, // TODO: fix this horrible typing
    };

    // Process payment
    await processPayment(req.user!, env.BORROW_COST, paymentMetadata, session);

    await session.commitTransaction();
    await session.endSession();
    res.sendStatus(201);
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
});

const createBorrowHistoryAsset = async (bookId: string | Types.ObjectId, userId: string | Types.ObjectId, session: ClientSession) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const dueDate = new Date(Date.now() + env.BORROW_DURATION * oneDay);

  return await BorrowHistory.create([{ book: bookId, user: userId, dueDate: dueDate }], { session });
};

export const updateBorrowHistory = controllerFactory(async (req: Request, res: Response) => {
  const borrowHistory = await BorrowHistory.findById(req.params.id);
  if (!borrowHistory) throw new NotFoundError("Borrow history not found");

  if (borrowHistory.status === "returned") throw new ForbiddenError("Book already returned");

  if (borrowHistory.status === "purchased") throw new ForbiddenError("Book already purchased");

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const book = await Book.findById(borrowHistory.book, null, { session });
    if (!book) throw new NotFoundError("Book not found");

    borrowHistory.borrowEndDate = new Date();
    borrowHistory.status = "returned";
    book.availableCopies += 1;

    const fine = await calculateBorrowFine(borrowHistory);
    if (fine && book.retailPrice > fine) {
      borrowHistory.status = "purchased";
      book.availableCopies -= 1;
      await purchaseBorrowedBook(book, req.user!, borrowHistory._id, session);
    } else if (fine) {
      await payBorrowFine(book, req.user!, borrowHistory._id, fine, session);
    }

    await borrowHistory.save({ session });
    await book.save({ session });

    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new PaymentRequiredError("Failed to return book");
  }

  res.sendStatus(204);
});

const purchaseBorrowedBook = async (book: IBook, userId: string, borrowHistoryId: Types.ObjectId, session: ClientSession) => {
  const paymentMetadata: IWalletHistoryMetadata = {
    book: book._id,
    transactionKind: "borrow:purchase",
    borrowHistory: borrowHistoryId,
  };

  await processPayment(userId, book.retailPrice, paymentMetadata, session);
};

const payBorrowFine = async (book: IBook, userId: string, borrowHistoryId: Types.ObjectId, fine: number, session: ClientSession) => {
  const paymentMetadata: IWalletHistoryMetadata = {
    book: book._id,
    transactionKind: "borrow:overdue",
    borrowHistory: borrowHistoryId,
  };

  await processPayment(userId, fine, paymentMetadata, session);
};

export const calculateBorrowFine = async (borrowHistory: IBorrowHistory) => {
  const dueDate = new Date(borrowHistory.dueDate);
  const borrowEndDate = new Date(borrowHistory.borrowEndDate || Date.now());

  const diff = borrowEndDate.getTime() - dueDate.getTime();
  if (diff > 0) {
    const overdueDays = Math.ceil(diff / (24 * 60 * 60 * 1000));
    const fine = overdueDays * env.BORROW_OVERDUE_DAILY_FINE; // 0.20 per day
    return Math.round(fine * 100) / 100;
  }

  return 0;
};

export const listBorrowHistory = controllerFactory(async (req: Request, res: Response) => {
  const schema = z.object({
    bookId: z.string().optional(),
    // date range
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    // pagination
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    // TODO: sort?
  });
  const query = validateSchema(schema, req.query);

  const filter: any = { user: req.user };

  if (query.bookId) filter.book = query.bookId;

  if (query.startDate && query.endDate) {
    filter.createdAt = {
      $gte: new Date(query.startDate),
      $lte: new Date(query.endDate),
    };
  }

  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const borrowHistory = await BorrowHistory.find(filter).skip(skip).limit(limit);
  const totalBorrowHistory = await BorrowHistory.countDocuments(filter);
  const totalPages = Math.ceil(totalBorrowHistory / limit);

  res.status(200).json({
    results: borrowHistory,
    totalResults: totalBorrowHistory,
    page,
    totalPages,
  });
});
