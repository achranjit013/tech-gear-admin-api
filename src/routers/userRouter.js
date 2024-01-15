import express from "express";
import {
  createUser,
  getAUser,
  updateUser,
} from "../modules/user/UserModule.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { v4 as uuidv4 } from "uuid";
import {
  createNewSession,
  deleteSession,
} from "../modules/session/SessionSchema.js";
import {
  sendEmailVerificationLinkTemplate,
  sendEmailVerifiedNotification,
} from "../utils/nodemailer.js";
import { responder } from "../middlewares/response.js";
import { getJWTs } from "../utils/jwtHelper.js";
import { newAdminValidation } from "../middlewares/joiValidation.js";
import { adminAuth, refreshAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// add user
router.post("/", newAdminValidation, async (req, res, next) => {
  try {
    // encrypt the password
    console.log("i am here");
    const { password } = req.body;
    req.body.password = hashPassword(password);

    // creating new user
    const user = await createUser(req.body);

    // if user is created, create unique url and email that to user to verify
    if (user?._id) {
      const c = uuidv4(); //this must be stored in db
      const token = await createNewSession({ token: c, associate: user.email });
      const url = `${process.env.CLIENT_ROOT_DOMAIN}/verify-email?e=${user.email}&c=${c}`;

      // send new email
      sendEmailVerificationLinkTemplate({
        email: user.email,
        url,
        fname: user.fname,
      });
    }

    user?._id
      ? responder.SUCESS({
          res,
          message: "check your inbox/spam to verify your email",
        })
      : responder.ERROR({ res, message: "unable to create", errorCode: 200 });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.errorCode = 200;
      error.message =
        "There is another user with this email. Please login or use another email to signup!";
    }
    next(error);
  }
});

// verify user email
router.post("/verify-email", async (req, res, next) => {
  try {
    const { associate, token } = req.body;

    if (associate && token) {
      // delete from session table
      const session = await deleteSession({ token, associate });

      // if success, then update user status to active
      if (session?._id) {
        // update user table
        const user = await updateUser(
          { email: associate },
          { status: "active" }
        );

        if (user?._id) {
          // send email notification
          sendEmailVerifiedNotification({
            email: associate,
            fname: user.fname,
          });

          return responder.SUCESS({
            res,
            message: "your email has been verifyed. you may login now",
          });
        }
      }
    }

    return responder.ERROR({
      res,
      message: "invalid!",
    });
  } catch (error) {
    next(error);
  }
});

// login user
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (email && password) {
      // get user by email
      const user = await getAUser({ email });

      console.log(user);

      // if user is not active or has not verified their email
      if (user?.status === "inactive") {
        console.log(user.status);
        return responder.ERROR({
          message:
            "Your account have nopt been verified. Please check your email and verify your account or contact admin",
          res,
        });
      }

      // verify password match
      if (user?._id) {
        const isMatched = comparePassword(password, user.password);

        if (isMatched) {
          // create and store token
          const jwts = await getJWTs(email);

          console.log(jwts);

          // response tokens
          return responder.SUCESS({
            message: "success",
            res,
            jwts,
          });
        }
      }
    }

    return responder.ERROR({
      res,
      message: "Invalid login details!",
    });
  } catch (error) {
    next(error);
  }
});

// get user
router.get("/", adminAuth, (req, res, next) => {
  try {
    responder.SUCESS({
      res,
      message: "user info",
      user: req.userInfo,
    });
  } catch (error) {
    next(error);
  }
});

// get access jwt
router.get("/get-accessjwt", refreshAuth);

// logout
router.post("/logout", async (req, res, next) => {
  try {
    const { accessJWT, _id } = req.body;
    accessJWT && (await deleteSession({ token: accessJWT }));
    await updateUser({ _id }, { refreshJWT: "" });

    responder.SUCESS({
      res,
      message: "sucess logout",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
