import mongoose, { Schema, type Types } from "mongoose";
import type { IBook } from "./Book";
import type { IUser } from "./User";

export interface IBorrowHistory extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  book: Types.ObjectId | IBook;
  status: "borrowed" | "returned" | "purchased";
  dueDate: Date;
  borrowEndDate?: Date;
  notifications?: {
    kind: "late-return" | "upcoming-due-date";
    sentAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const borrowHistorySchema = new Schema<IBorrowHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    status: {
      type: String,
      required: true,
      default: "borrowed",
      enum: ["borrowed", "returned", "purchased"],
    },
    dueDate: { type: Date, required: true },
    borrowEndDate: { type: Date },
    notifications: {
      type: [
        {
          kind: { type: String, required: true },
          sentAt: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

borrowHistorySchema.index({ status: 1, user: 1, book: 1 });

export const BorrowHistory = mongoose.model<IBorrowHistory>("BorrowHistory", borrowHistorySchema);
