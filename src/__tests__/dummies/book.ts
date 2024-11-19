import { Book } from "@/models/Book";
import { faker } from "@faker-js/faker";

const randomBook = () => ({
  title: faker.book.title(),
  author: faker.book.author(),
  publicationYear: faker.date.past().getFullYear().toString(),
  publisher: faker.book.publisher(),
  retailPrice: faker.commerce.price(),
  availableCopies: 4,
});

const loadBooksDummy = async () => {
  const books = Array.from({ length: 10 }, randomBook);
  await Book.insertMany(books);
};

export default loadBooksDummy;
