import joi from "joi";
import { responder } from "./response.js";

// constants
const SHORTSTR = joi.string().max(100).allow(null, "");
const SHORTSTRREQ = SHORTSTR.required();
const SHORTNUM = joi.string().max(100).allow(null, "");
const SHORTNUMREQ = SHORTNUM.required();
const LONGSTR = joi.string().max(5000).allow(null, "");
const LONGSTRREQ = LONGSTR.required();
const EMAIL = joi.string().email({ minDomainSegments: 2 }).max(100);
const EMAILREQ = EMAIL.required();
const VARIANTSREQ = joi.array().items(
  joi.object().keys({
    size: SHORTSTRREQ,
    qty: SHORTNUMREQ,
    price: SHORTNUMREQ,
    salesPrice: SHORTNUM,
    salesStartDate: SHORTSTR,
    salesEndDate: SHORTSTR,
  })
);
const CARTSREQ = joi.array().items(
  joi.object().keys({
    cartId: SHORTSTRREQ,
    dispatchedQty: SHORTNUMREQ,
    cartRefund: SHORTNUMREQ,
    totalPrice: SHORTNUMREQ,
    productName: SHORTSTRREQ,
    orderedQty: SHORTNUMREQ,
    orderedSize: SHORTSTRREQ,
    thumbnail: LONGSTRREQ,
  })
);
const TRACKREQ = joi.array().items(SHORTSTRREQ);

const joiValidator = ({ schema, req, res, next }) => {
  try {
    const { error } = schema.validate(req.body);

    if (error) {
      return responder.ERROR({ res, message: error.message });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const newAdminValidation = (req, res, next) => {
  const schema = joi.object({
    fname: SHORTSTRREQ,
    lname: SHORTSTRREQ,
    address: SHORTSTR,
    phone: SHORTSTR,
    email: EMAILREQ,
    password: SHORTSTRREQ,
  });

  joiValidator({ schema, req, res, next });
};

export const resetPasswordValidation = (req, res, next) => {
  const schema = joi.object({
    otp: SHORTSTRREQ,
    email: SHORTSTRREQ,
    password: SHORTSTR,
  });

  joiValidator({ schema, req, res, next });
};

// add new product validation
export const newProductValidation = (req, res, next) => {
  const { variants, ...rest } = JSON.parse(JSON.stringify(req.body));

  req.body = rest;
  req.body.variants = variants.map((item, i) => {
    return JSON.parse(item);
  });

  const schema = joi.object({
    name: SHORTSTRREQ,
    categoryId: SHORTSTRREQ,
    subCategoryId: SHORTSTRREQ,
    sku: SHORTSTRREQ,
    basePrice: SHORTNUMREQ,
    variants: VARIANTSREQ,
    description: LONGSTRREQ,
  });

  joiValidator({ schema, req, res, next });
};

// update product validation
export const updateProductValidation = (req, res, next) => {
  const { variants, ...rest } = JSON.parse(JSON.stringify(req.body));

  req.body = rest;
  req.body.variants = variants.map((item, i) => {
    return JSON.parse(item);
  });

  const schema = joi.object({
    _id: SHORTSTRREQ,
    status: SHORTSTRREQ,
    name: SHORTSTRREQ,
    thumbnail: LONGSTRREQ,
    categoryId: SHORTSTRREQ,
    subCategoryId: SHORTSTRREQ,
    sku: SHORTSTRREQ,
    basePrice: SHORTNUMREQ,
    variants: VARIANTSREQ,
    description: LONGSTRREQ,
    images: LONGSTRREQ,
    imgToDelete: LONGSTR,
  });

  joiValidator({ schema, req, res, next });
};

// add new category validation
export const newCategoryValidation = (req, res, next) => {
  const schema = joi.object({
    title: SHORTSTRREQ,
  });

  joiValidator({ schema, req, res, next });
};

// update category validation
export const updateCategoryValidation = (req, res, next) => {
  const schema = joi.object({
    _id: SHORTSTRREQ,
    title: SHORTSTRREQ,
    status: SHORTSTRREQ,
  });

  joiValidator({ schema, req, res, next });
};

// add new sub category validation
export const newSubCategoryValidation = (req, res, next) => {
  const schema = joi.object({
    title: SHORTSTRREQ,
    categoryId: SHORTSTRREQ,
  });

  joiValidator({ schema, req, res, next });
};

// update sub category validation
export const updateSubCategoryValidation = (req, res, next) => {
  const schema = joi.object({
    _id: SHORTSTRREQ,
    title: SHORTSTRREQ,
    status: SHORTSTRREQ,
    categoryId: SHORTSTRREQ,
  });

  joiValidator({ schema, req, res, next });
};

// update order status validation
export const updateOrderValidation = async (req, res, next) => {
  const schema = joi.object({
    _id: SHORTSTRREQ,
    status: SHORTSTRREQ,
    name: SHORTSTRREQ,
    email: EMAILREQ,
    shippingStreet: SHORTSTRREQ,
    shippingState: SHORTSTRREQ,
    shippingZip: SHORTSTRREQ,
    trackingNumber: TRACKREQ,
    carts: CARTSREQ,
  });

  joiValidator({ schema, req, res, next });
};
