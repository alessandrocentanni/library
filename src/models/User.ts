import mongoose, { Schema, type Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookReferenceSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

export const BookReference = mongoose.model<IUser>(
  "BookReference",
  BookReferenceSchema
);
