import express from "express";
import {
  getAOrder,
  getAllOrders,
  updateAOrder,
} from "../modules/order/OrderModule.js";
import { responder } from "../middlewares/response.js";
import { updateOrderValidation } from "../middlewares/joiValidation.js";
import mongoose from "mongoose";
import { sendOrderDispatchVerificationEmailNotification } from "../utils/nodemailer.js";

const router = express.Router();

router.get("/:_id?", async (req, res, next) => {
  try {
    const { _id } = req.params;

    const findResult = _id ? await getAOrder(_id) : await getAllOrders();

    responder.SUCESS({
      res,
      message: "orders list",
      findResult,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/", updateOrderValidation, async (req, res, next) => {
  try {
    const {
      _id,
      status,
      name,
      email,
      shippingStreet,
      shippingState,
      shippingZip,
      trackingNumber,
      carts,
    } = req.body;

    const findResult = await updateAOrder(
      { _id: new mongoose.Types.ObjectId(_id) },
      { status, trackingNumber, cartArray: carts }
    );

    if (findResult?.modifiedCount) {
      sendOrderDispatchVerificationEmailNotification({
        toEmail: email,
        name,
        shippingStreet,
        shippingState,
        shippingZip,
        carts,
      });

      responder.SUCESS({
        res,
        message: "Congratulations, the order has been processed.",
      });
    } else {
      responder.ERROR({
        res,
        message: "Sorry, couldn't process the order. Please try again later.",
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
