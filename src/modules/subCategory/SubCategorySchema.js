import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "active",
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      index: 1,
      required: true,
    },
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SubCategory", subCategorySchema);
