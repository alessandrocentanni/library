import type zod from "zod";
import { ValidationError } from "./custom-errors";

// generic function that takes schema as param, and returns the data or throws a custom error with name ValidationError
export function validateSchema<T>(schema: zod.Schema<T>, data: any): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  throw new ValidationError("Validation error");
}
