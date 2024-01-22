import express from "express";
import multer from "multer";
import { responder } from "../middlewares/response.js";
import slugify from "slugify";
import { newProductValidation } from "../middlewares/joiValidation.js";
import {
  createProduct,
  getProducts,
} from "../modules/product/ProductModule.js";

const router = express.Router();

// multer config
const imgFolderPath = "public/img/product";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let error = null;
    // all sort of test and run cb func
    cb(error, imgFolderPath);
  },
  filename: (req, file, cb) => {
    let error = null;
    // construct the unique file name
    const fullFileName = Date.now() + "-" + file.originalname;
    cb(error, fullFileName);
  },
});

const upload = multer({ storage });
// end multer config

// create new category
router.post(
  "/",
  upload.array("images", 5),
  newProductValidation,
  async (req, res, next) => {
    try {
      // get the file path where it was uploaded and store in db
      if (req.files?.length) {
        const newImgs = req.files.map((item) => item.path.slice(6));
        req.body.images = newImgs;
        req.body.thumbnail = newImgs[0];
      }

      // create slug
      req.body.slug = slugify(req.body.name, {
        lower: false, // convert to lower case, defaults to `false`
        trim: true, // trim leading and trailing replacement chars, defaults to `true`
      });

      // insert into db
      const product = await createProduct(req.body);

      product?._id
        ? responder.SUCESS({
            res,
            message: "new product has been added.",
          })
        : responder.ERROR({
            res,
            message: "product has not been added.",
          });
    } catch (error) {
      if (error.message.includes("E11000 duplicate key error collection")) {
        error.message =
          "Slug already exist, try changing the title and try again";
        error.errorCode = 500;
      }
      next(error);
    }
  }
);

// get products
router.get("/", async (req, res, next) => {
  try {
    const products = await getProducts();

    responder.SUCESS({
      res,
      message: "to do get",
      products,
    });
  } catch (error) {
    next(error);
  }
});

// update category
// router.put("/", async (req, res, next) => {
//   try {
//     const { _id, title, status } = req.body;

//     console.log(_id, title, status);

//     if (_id && title && status) {
//       const cat = await updateCategory(
//         { _id },
//         {
//           title,
//           status,
//         }
//       );

//       if (cat?._id) {
//         return responder.SUCESS({
//           res,
//           message: "category has been updated",
//         });
//       }
//     }
//     responder.ERROR({
//       res,
//       message: "cannot update",
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// delete category
// router.delete("/:_id", async (req, res, next) => {
//   try {
//     const { _id } = req.params;

//     console.log(_id);

//     const cat = await deleteCategory(_id);

//     if (cat?._id) {
//       return responder.SUCESS({
//         res,
//         message: "category has been deleted",
//       });
//     }
//     responder.ERROR({
//       res,
//       message: "cannot delete",
//     });
//   } catch (error) {
//     next(error);
//   }
// });

export default router;
