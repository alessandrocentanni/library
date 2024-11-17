import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.get("/", (req, res) => {
  res.send("hello there");
});

export { app, logger };
