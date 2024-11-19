import { env } from "@/config";
import database from "@/database";
import logger from "@/logger";
import { app } from "@/server";

(async () => {
  try {
    // connect to db
    await database.connect();

    const server = app.listen(env.PORT, () => {
      const { NODE_ENV, HOST, PORT } = env;
      logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
    });

    const onCloseSignal = () => {
      logger.info("sigint received, shutting down");
      server.close(async () => {
        logger.info("server closed");
        await database.disconnect();
      });
      setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
    };

    process.on("SIGINT", onCloseSignal);
    process.on("SIGTERM", onCloseSignal);
  } catch (error) {
    logger.error("Error connecting to database");
    logger.error(error);
    process.exit(1);
  }
})();
