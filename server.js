import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./src/config/dbConfig.js";

const app = express();
const PORT = process.env.PORT || 8000;

// db connect
connectDB();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

// api endpoints
import userRouter from "./src/routers/userRouter.js";
app.use("/api/v1/users", userRouter);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "server is running well...",
  });
});

app.use((error, req, res, next) => {
  const errorCode = error.errorCode || 500;

  res.status(errorCode).json({
    status: "error",
    message: error.message,
  });
});

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`server is running at http://localhost:${PORT}`);
});
