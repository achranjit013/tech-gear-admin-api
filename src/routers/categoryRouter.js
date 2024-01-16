import express from "express";
import { responder } from "../middlewares/response.js";
import slugify from "slugify";
import {
  createCategory,
  getCategories,
  updateCategory,
} from "../modules/category/CategoryModule.js";

const router = express.Router();

// create new category
router.post("/", async (req, res, next) => {
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
          message: "category has been added.",
        })
      : responder.ERROR({
          res,
          message: "unable to add new category",
        });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.message =
        "Slug already exist, try changing the title and try again";
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
      message: "to do get",
      categories,
    });
  } catch (error) {
    next(error);
  }
});

// update category
router.put("/", async (req, res, next) => {
  try {
    const { _id, title, status } = req.body;

    console.log(_id, title, status);

    if (_id && title && status) {
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
          message: "category has been updated",
        });
      }
    }
    responder.ERROR({
      res,
      message: "cannot update",
    });
  } catch (error) {
    next(error);
  }
});

// delete category
router.delete("/:_id", async (req, res, next) => {
  try {
    const { _id } = req.params;

    console.log(_id);

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
