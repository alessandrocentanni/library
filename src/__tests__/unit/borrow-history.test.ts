import { calculateBorrowFine } from "@/controllers/borrow-history";
import type { IBorrowHistory } from "@/models/BorrowHistory";
import { describe, expect, it } from "vitest";

describe("calculateBorrowFine", () => {
  it("should return 0 if the book is returned on time", async () => {
    const borrowHistory = {
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // due date is tomorrow
      borrowEndDate: new Date(),
    } as IBorrowHistory;

    const fine = await calculateBorrowFine(borrowHistory);
    expect(fine).toBe(0);
  });

  it("should return the correct fine if the book is returned late", async () => {
    const borrowHistory = {
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // due date was yesterday
      borrowEndDate: new Date(),
    } as IBorrowHistory;

    const fine = await calculateBorrowFine(borrowHistory);
    expect(fine).toBe(0.2); // 1 day late, 0.20 fine
  });

  it("should return the correct fine for multiple days late", async () => {
    const borrowHistory = {
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // due date was 3 days ago
      borrowEndDate: new Date(),
    } as IBorrowHistory;

    const fine = await calculateBorrowFine(borrowHistory);
    expect(fine).toBe(0.6); // 3 days late, 0.20 fine per day
  });

  it("should return 0 if the book is returned before the due date", async () => {
    const borrowHistory = {
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // due date is 3 days from now
      borrowEndDate: new Date(),
    } as IBorrowHistory;

    const fine = await calculateBorrowFine(borrowHistory);
    expect(fine).toBe(0);
  });
});
