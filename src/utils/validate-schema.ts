import type zod from "zod";
import { ValidationError } from "./custom-errors";

// generic function that takes schema as param, and returns the data or throws a custom error with name ValidationError
export function validateSchema<T>(schema: zod.Schema<T>, data: any): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  console.log(result.error.issues);

  // it would actually be better to return the error message + the errors array from the zod schema
  // so that the FE can display the errors to the user in a more user-friendly way
  throw new ValidationError("Validation error", result.error.issues);
}
