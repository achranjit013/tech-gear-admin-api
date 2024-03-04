import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { connectDB } from "./src/config/dbConfig.js";

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

// db connect
connectDB();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "/public")));

// api endpoints
import userRouter from "./src/routers/userRouter.js";
app.use("/api/v1/users", userRouter);
import categoryRouter from "./src/routers/categoryRouter.js";
import subCategoryRouter from "./src/routers/subCategoryRouter.js";
import productRouter from "./src/routers/productRouter.js";
import { adminAuth } from "./src/middlewares/authMiddleware.js";
app.use("/api/v1/categories", adminAuth, categoryRouter);
app.use("/api/v1/sub-categories", adminAuth, subCategoryRouter);
app.use("/api/v1/products", adminAuth, productRouter);

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
