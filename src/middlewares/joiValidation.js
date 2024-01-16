import joi from "joi";

// constants
const SHORTSTR = joi.string().max(100).allow(null, "");
const SHORTSTRREQ = SHORTSTR.required();
const LONGSTR = joi.string().max(5000).allow(null, "");
const LONGSTRREQ = LONGSTR.required();
const EMAIL = joi.string().email({ minDomainSegments: 2 }).max(100);
const EMAILREQ = EMAIL.required();

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
