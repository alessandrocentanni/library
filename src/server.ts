import express, { type Express } from "express";
import helmet from "helmet";
import { errorHandler } from "@/middlewares/error-handler";

// import routes
import routes from "@/routes";

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

// Routes
app.use("/api", routes);

// Error handler
app.use(errorHandler);

export { app };
