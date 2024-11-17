import mongoose from "mongoose";
import { env } from "@/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import logger from "@/logger";
import loadBooksSample from "./seed/load_books_sample";
// import loadData from "./tests/mongo-data/load-data";
const log = logger.child({ module: "database" });

const connect = async () => {
  if (env.TEST) {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    log.info("Launched mongodb memory database");
    const connection = await mongoose.connect(uri);
    log.info("Connetced to mongodb memory database");
    await loadBooksSample();
    return connection;
  }
  const connection = await mongoose.connect(env.DATABASE_URL);
  log.info("Connected to mongodb database");
  return connection;
};

const disconnect = async () => {
  try {
    await mongoose.connection.close();
    log.info("closed mongodb connection");
    process.exit(0);
  } catch (error) {
    log.error("error while shutting down mongo connection", error);
    process.exit(1);
  }
};

// Connect to DB
export default { connect, disconnect };
