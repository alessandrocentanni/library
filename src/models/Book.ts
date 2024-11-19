import mongoose, { Schema, type Types } from "mongoose";

export interface IBook extends Document {
  _id: Types.ObjectId;
  title: string;
  author: string;
  publicationYear: string;
  publisher: string;
  retailPrice: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    // author could have been a separate collection, but in this case we are keeping it simple.
    // the requirement is to simple search by author name, so we are keeping it as a string. there's no metadata or author-specific functionality to add.
    // this will simplify the queries, but it will also make it harder to update author information in the future.
    author: { type: String, required: true },
    publicationYear: { type: String, required: true },
    retailPrice: { type: Number, required: true },
    publisher: { type: String, required: true },
    availableCopies: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bookSchema.index({ title: "text" });
bookSchema.index({ author: "text" });
bookSchema.index({ publicationYear: 1 });

export const Book = mongoose.model<IBook>("Book", bookSchema);
