import dotenv from "dotenv";
import { bool, cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  HOST: host({ devDefault: "localhost" }),
  PORT: port({ devDefault: 3000 }),
  TEST: bool({ devDefault: false }),
  BORROW_DURATION: num({ devDefault: 7 }),
  BORROW_COST: num({ devDefault: 3 }),
  BORROW_OVERDUE_DAILY_FINE: num({ devDefault: 0.2 }),
  DATABASE_URL: str({ devDefault: "mongodb://127.0.0.1:27017/?replicaSet=rs0" }),
  PINO_LOG_LEVEL: str({
    devDefault: "debug",
    choices: ["info", "debug", "error", "fatal", "warn", "trace"],
  }),
  JWT_SECRET: str({ devDefault: "dont-snitch-my-jwt" }),
});
