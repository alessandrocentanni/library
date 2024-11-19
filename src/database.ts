import { env } from "@/config";
import logger from "@/logger";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
const log = logger.child({ module: "database" });

const connect = async () => {
  if (env.TEST) {
    const mongod = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: "wiredTiger" },
    });
    const uri = mongod.getUri();
    log.info("Launched mongodb memory database");
    const connection = await mongoose.connect(uri);
    log.info("Connetcted to mongodb memory database");
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
