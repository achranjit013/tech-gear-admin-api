import express from "express";
import { responder } from "../middlewares/response.js";
import slugify from "slugify";
import {
  createCategory,
  getCategories,
  updateCategory,
} from "../modules/category/CategoryModule.js";
import {
  createSubCategory,
  getSubCategories,
  updateSubCategory,
} from "../modules/subCategory/SubCategoryModule.js";
import {
  newSubCategoryValidation,
  updateSubCategoryValidation,
} from "../middlewares/joiValidation.js";
import mongoose from "mongoose";

const router = express.Router();

// create new sub category
router.post("/", newSubCategoryValidation, async (req, res, next) => {
  try {
    const { title, categoryId } = req.body;
    const obj = {
      title,
      categoryId,
      slug: slugify(title, {
        lower: false, // convert to lower case, defaults to `false`
        trim: true, // trim leading and trailing replacement chars, defaults to `true`
      }),
    };

    const cat = await createSubCategory(obj);

    cat?._id
      ? responder.SUCESS({
          res,
          message: "Congratulations, sub category has been added!",
        })
      : responder.ERROR({
          res,
          message:
            "Sorry, unable to add a new sub category. Please try again later!",
        });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.message =
        "Slug already exist, please try again with a different title for the sub category!";
      error.errorCode = 500;
    }
    next(error);
  }
});

// get sub categories
router.get("/:categoryId?", async (req, res, next) => {
  try {
    let filterCriteria = {};
    const { categoryId } = req.params;

    if (categoryId) {
      filterCriteria = {
        categoryId: new mongoose.Types.ObjectId(categoryId),
        status: "active",
      };
    }

    const subCategories = await getSubCategories(filterCriteria);

    responder.SUCESS({
      res,
      message: "sub categories list",
      subCategories,
    });
  } catch (error) {
    next(error);
  }
});

// update sub category
router.put("/", updateSubCategoryValidation, async (req, res, next) => {
  try {
    const { _id, title, status, categoryId } = req.body;

    const obj = {
      title,
      status,
      categoryId,
      slug: slugify(title, {
        lower: false, // convert to lower case, defaults to `false`
        trim: true, // trim leading and trailing replacement chars, defaults to `true`
      }),
    };

    if (_id) {
      const updateCat = await updateSubCategory({ _id }, obj);

      if (updateCat?._id) {
        return responder.SUCESS({
          res,
          message: "Congratulations, sub category has been updated!",
        });
      }
    }
    responder.ERROR({
      res,
      message:
        "Sorry, unable to update the sub category. Please try again later!",
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.message =
        "Slug already exist, please try again with a different title for the sub category!";
      error.errorCode = 500;
    }
    next(error);
  }
});

// delete sub category
router.delete("/:_id", async (req, res, next) => {
  try {
    const { _id } = req.params;

    const cat = await deleteCategory(_id);

    if (cat?._id) {
      return responder.SUCESS({
        res,
        message: "category has been deleted",
      });
    }
    responder.ERROR({
      res,
      message: "cannot delete",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
