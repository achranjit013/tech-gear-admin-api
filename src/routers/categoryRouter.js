import express from "express";
import { responder } from "../middlewares/response.js";
import slugify from "slugify";
import {
  createCategory,
  deleteSelectedCategory,
  getCategories,
  updateCategory,
} from "../modules/category/CategoryModule.js";
import {
  newCategoryValidation,
  updateCategoryValidation,
} from "../middlewares/joiValidation.js";

const router = express.Router();

// create new category
router.post("/", newCategoryValidation, async (req, res, next) => {
  try {
    const { title } = req.body;
    const obj = {
      title,
      slug: slugify(title, {
        lower: false, // convert to lower case, defaults to `false`
        trim: true, // trim leading and trailing replacement chars, defaults to `true`
      }),
    };

    const cat = await createCategory(obj);

    cat?._id
      ? responder.SUCESS({
          res,
          message: "Congratulations, category has been added!",
        })
      : responder.ERROR({
          res,
          message:
            "Sorry, unable to add a new category. Please try again later!",
        });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.message =
        "Slug already exist, please try again with a different title for the category!";
      error.errorCode = 500;
    }
    next(error);
  }
});

// get categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await getCategories();

    responder.SUCESS({
      res,
      message: "categories list",
      categories,
    });
  } catch (error) {
    next(error);
  }
});

// update category
router.put("/", updateCategoryValidation, async (req, res, next) => {
  try {
    const { _id, title, status } = req.body;

    const cat = await updateCategory(
      { _id },
      {
        title,
        status,
      }
    );

    if (cat?._id) {
      return responder.SUCESS({
        res,
        message: "Congratulations, category has been updated!",
      });
    }

    responder.ERROR({
      res,
      message: "Sorry, unable to update the category. Please try again later!",
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.message =
        "Slug already exist, please try again with a different title for the category!";
      error.errorCode = 500;
    }
    next(error);
  }
});

// delete category
router.delete("/:_id", async (req, res, next) => {
  try {
    const { _id } = req.params;

    const cat = await deleteSelectedCategory(_id);

    if (cat?._id) {
      return responder.SUCESS({
        res,
        message: "Congratulations, the category has been deleted successfully.",
      });
    }
    responder.ERROR({
      res,
      message: "Sorry, the category cannot be deleted. Please try again later.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
