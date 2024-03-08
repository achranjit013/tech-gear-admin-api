import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import path from "path";
import { connectDB } from "./src/config/dbConfig.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dsdz0nmkk",
  api_key: "579674782944718",
  api_secret: "0aD19YCs58LbcZ0fQHHIb3KnfoU",
});

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

// connection to remote database;
import { connectToDatabase } from "./src/config/databaseConnection.js";
const uri = process.env.MONGO_URL;
(async () => {
  try {
    await connectToDatabase(uri);
  } catch (error) {
    console.error("Error starting the server:", error);
  }
})();

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
import orderRouter from "./src/routers/orderRouter.js";
import { adminAuth } from "./src/middlewares/authMiddleware.js";
app.use("/api/v1/categories", adminAuth, categoryRouter);
app.use("/api/v1/sub-categories", adminAuth, subCategoryRouter);
app.use("/api/v1/products", adminAuth, productRouter);
app.use("/api/v1/orders", adminAuth, orderRouter);

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
