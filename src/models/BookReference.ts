import mongoose, { Schema, type Types } from "mongoose";

export interface IBookReference extends Document {
  _id: Types.ObjectId;
  title: string;
  author: string;
  publicationYear?: string;
  publisher?: string;
  retailPrice: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookReferenceSchema = new Schema<IBookReference>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    publicationYear: { type: String, required: true },
    retailPrice: { type: Number, required: true },
    publisher: { type: String, required: true },
    availableCopies: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BookReferenceSchema.index({ title: "text" });
BookReferenceSchema.index({ author: "text" });
BookReferenceSchema.index({ publicationYear: 1 });

export const BookReference = mongoose.model<IBookReference>(
  "BookReference",
  BookReferenceSchema
);
