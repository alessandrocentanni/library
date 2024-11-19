import fs from "node:fs";
import path from "node:path";
import logger from "@/logger";
import { Book } from "@/models/Book";
import Papaparse from "papaparse";
import db from "@/database";

const log = logger.child({ module: "load-books-sample" });

const loadBooksSample = async () => {
  await db.connect();

  log.info("Loading books sample");

  const fileData = fs.readFileSync(path.resolve(__dirname, "./books_sample.csv"), "utf-8");

  log.info("Parsing books sample");
  const books = Papaparse.parse(fileData, {
    header: true,
    delimiter: ",",
    skipEmptyLines: true,
    transformHeader: (header) => {
      if (header === "price") return "retailPrice";
      if (header === "publication_year") return "publicationYear";
      return header;
    },
  });

  log.info("Inserting books sample");
  if (books.errors?.length) {
    log.error("Error parsing books sample");
    throw new Error("Error parsing books sample");
  }

  await Book.insertMany(books.data);
  await Book.updateMany({}, { $set: { availableCopies: 4 } });

  log.info("Books sample loaded");
};

loadBooksSample()
  .then(() => {
    console.log("loaded books sample");
    process.exit(0);
  })
  .catch(() => {
    console.error("error loading books sample");
    process.exit(1);
  });
