import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { responder } from "../middlewares/response.js";
import slugify from "slugify";
import {
  newProductValidation,
  updateProductValidation,
} from "../middlewares/joiValidation.js";
import {
  createProduct,
  deleteSelectedProduct,
  getAProduct,
  getProducts,
  updateAProduct,
} from "../modules/product/ProductModule.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Add any desired file filtering logic here
    cb(null, true);
  },
  limits: { files: 5 }, // Limit to 5 files per request
});
// end multer config

// Function to extract public ID from image URL
// used while deleting images from cloudinary
const getImagePublicId = (imageUrl) => {
  const parts = imageUrl.split("/");
  const filename = parts[parts.length - 1];
  const publicId = filename.split(".")[0];
  return publicId;
};

// create new product
router.post(
  "/",
  upload.array("images", 5),
  newProductValidation,
  async (req, res, next) => {
    try {
      const images = req.files;

      const uploadPromises = images.map(
        (image) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "auto" },
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );

            stream.write(image.buffer);
            stream.end();
          })
      );

      const uploadedImages = await Promise.all(uploadPromises);

      const imageUrls = uploadedImages.map((result) => result.secure_url);

      req.body.images = imageUrls;
      req.body.thumbnail = imageUrls[0];

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
            message:
              "Congratulations, a new product has been added successfully.",
          })
        : responder.ERROR({
            res,
            message:
              "Sorry, the product cannot be added. Please try again later.",
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
router.get("/:_id?", async (req, res, next) => {
  try {
    const { _id } = req.params;

    const products = _id ? await getAProduct({ _id }) : await getProducts();

    responder.SUCESS({
      res,
      message: "to do get",
      products,
    });
  } catch (error) {
    next(error);
  }
});

// update product
router.put(
  "/",
  upload.array("newImages", 5),
  updateProductValidation,
  async (req, res, next) => {
    try {
      // handle delete image
      const { imgToDelete } = req.body;

      // remove image
      if (imgToDelete?.length) {
        req.body.images = req.body.images
          .split(",")
          .filter((url) => !imgToDelete.includes(url));

        // delete the images from cloudinary
        const deletePromises = imgToDelete.split(",").map(
          (imageUrl) =>
            new Promise((resolve, reject) => {
              const publicId = getImagePublicId(imageUrl);
              cloudinary.uploader.destroy(publicId, (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              });
            })
        );

        // delete the images from cloudinary
        await Promise.all(deletePromises);
      }

      // get the file path where it was uploaded and store in db
      if (req.files?.length) {
        const newImgs = req.files;

        const uploadPromises = newImgs.map(
          (image) =>
            new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                  if (result) {
                    resolve(result);
                  } else {
                    reject(error);
                  }
                }
              );

              stream.write(image.buffer);
              stream.end();
            })
        );

        const uploadedImages = await Promise.all(uploadPromises);

        const imageUrls = uploadedImages.map((result) => result.secure_url);

        req.body.images = [...req.body.images, ...imageUrls];
      }

      // insert into db
      const { _id, ...rest } = req.body;

      const product = await updateAProduct({ _id }, rest);

      product?._id
        ? responder.SUCESS({
            res,
            message:
              "Congratulations, the product has been updated successfully.",
          })
        : responder.ERROR({
            res,
            message:
              "Sorry, the product cannot be updated. Please try again later.",
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

// delete prouct
router.delete("/:_id", async (req, res, next) => {
  try {
    const { _id } = req.params;

    const product = await deleteSelectedProduct(_id);

    if (product?._id) {
      return responder.SUCESS({
        res,
        message: "Congratulations, the product has been deleted successfully.",
      });
    }
    responder.ERROR({
      res,
      message: "Sorry, the product cannot be deleted. Please try again later.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
