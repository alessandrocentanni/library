import type { Request, Response } from "express";
import { controllerFactory } from "@/utils/controller-factory";
import { NotFoundError, ForbiddenError } from "@/utils/custom-errors";
import { Book } from "@/models/Book";
import { validateSchema } from "@/utils/validate-schema";
import { z } from "zod";

export const getBook = controllerFactory(
  async (req: Request, res: Response) => {
    const book = await Book.findById(req.params.id);
    if (!book) throw new NotFoundError("Book not found");
    res.status(200).json(book);
  }
);

export const createBook = controllerFactory(
  async (req: Request, res: Response) => {
    const schema = z.object({
      title: z.string(),
      author: z.string(),
      publicationYear: z.string(),
      publisher: z.string(),
      retailPrice: z.number(),
      availableCopies: z.number(),
    });

    const data = validateSchema(schema, req.body);
    const book = await Book.create(data);
    res.status(201).json(book);
  }
);

export const deleteBook = controllerFactory(
  async (req: Request, res: Response) => {
    const book = await Book.findById(req.params.id);
    if (!book) throw new NotFoundError("Book not found");

    await Book.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  }
);

export const listBooks = controllerFactory(
  async (req: Request, res: Response) => {
    const schema = z.object({
      publicationYear: z.string().optional(),
      titleOrAuthor: z.string().optional(),
      // pagination
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().optional(),
      // TODO: sort?
    });
    const query = validateSchema(schema, req.query);

    const filter: any = {};
    if (query.publicationYear) filter.publicationYear = query.publicationYear;
    if (query.titleOrAuthor) filter.$text = { $search: query.titleOrAuthor };

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find(filter).skip(skip).limit(limit);
    const totalBooks = await Book.countDocuments(filter);
    const totalPages = Math.ceil(totalBooks / limit);

    res.status(200).json({
      books,
      totalBooks,
      page,
      totalPages,
    });
  }
);
