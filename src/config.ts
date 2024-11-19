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
  DATABASE_URL: str({ devDefault: "mongodb://localhost:27017/test" }),
  PINO_LOG_LEVEL: str({
    devDefault: "debug",
    choices: ["info", "debug", "error", "fatal", "warn", "trace"],
  }),
  JWT_SECRET: str({ devDefault: "dont-snitch-my-jwt" }),
});
