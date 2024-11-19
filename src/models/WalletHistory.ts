import mongoose, { Schema, type Types } from "mongoose";
import type { IBook } from "./Book";
import type { IBorrowHistory } from "./BorrowHistory";
import type { IUser } from "./User";

export interface IWalletHistory extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  amount: number;
  metadata: IWalletHistoryMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWalletHistoryMetadata {
  book?: Types.ObjectId | IBook;
  borrowHistory?: Types.ObjectId | IBorrowHistory;
  transactionKind: "deposit" | "borrow:start" | "borrow:overdue" | "borrow:purchase";
}

const walletHistorySchema = new Schema<IWalletHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    metadata: {
      transactionKind: {
        type: String,
        required: true,
        enum: ["deposit", "borrow:start", "borrow:overdue", "borrow:purchase"],
      },
      book: {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
      borrowHistory: {
        type: Schema.Types.ObjectId,
        ref: "BorrowHistory",
      },
    },
  },
  { timestamps: true },
);

walletHistorySchema.index({ status: 1, user: 1 });
walletHistorySchema.index({ "metadata.book": 1 });

export const WalletHistory = mongoose.model<IWalletHistory>("WalletHistory", walletHistorySchema);
