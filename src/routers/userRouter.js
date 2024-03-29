import express from "express";
import {
  createUser,
  getAUser,
  getAdminPasswordById,
  getAllUsers,
  updateUser,
} from "../modules/user/UserModule.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { v4 as uuidv4 } from "uuid";
import {
  createNewSession,
  deleteSession,
} from "../modules/session/SessionSchema.js";
import {
  passwordUpdatedNotificationEmail,
  profileUpdatedNotificationEmail,
  sendEmailVerificationLinkTemplate,
  sendEmailVerifiedNotification,
  sendOTPEmail,
} from "../utils/nodemailer.js";
import { responder } from "../middlewares/response.js";
import { getJWTs } from "../utils/jwtHelper.js";
import {
  newAdminValidation,
  resetPasswordValidation,
  updateAdminEmailValidation,
  updateAdminProfileValidation,
} from "../middlewares/joiValidation.js";
import { adminAuth, refreshAuth } from "../middlewares/authMiddleware.js";
import { otpGenerator } from "../utils/randomGenerator.js";

const router = express.Router();

// add user (admin)
router.post("/", newAdminValidation, async (req, res, next) => {
  try {
    // encrypt the password
    const { password } = req.body;
    req.body.password = hashPassword(password);

    // creating new user
    const user = await createUser({ ...req.body, role: "admin" });

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
          message:
            "Email verification link has been sent to the provided email. Please ask the user to check their inbox/spam folder.",
        })
      : responder.ERROR({
          res,
          message:
            "Sorry, we are unable to create the user at the moment. Please try again later.",
          errorCode: 200,
        });
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

      // if user is not active or has not verified their email
      if (user?.status === "inactive") {
        return responder.ERROR({
          errorCode: 200,
          message:
            "Your account has not been verified. Please check your email and verify your account to login or contact admin",
          res,
        });
      }

      // verify password match
      if (user?._id) {
        const isMatched = comparePassword(password, user.password);

        if (isMatched) {
          // create and store token
          const jwts = await getJWTs(email);

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

// get admin
router.get("/", adminAuth, async (req, res, next) => {
  try {
    const findCustomers = await getAllUsers({ role: "user", status: "active" });

    const findAdmins = await getAllUsers({ role: "admin", status: "active" });

    responder.SUCESS({
      res,
      message: "user info",
      user: req.userInfo,
      findCustomers,
      findAdmins,
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

// otp request
router.post("/request-otp", async (req, res, next) => {
  try {
    const { email } = req.body;

    // check if valid email
    if (email.includes("@")) {
      const user = await getAUser({ email });
      // check if user exist
      if (user?._id) {
        // create unique otp
        const otp = otpGenerator();

        // store otp and email in the session table
        const otpSession = await createNewSession({
          token: otp,
          associate: email,
        });

        // check if stored
        if (otpSession?._id) {
          // send email to user
          sendOTPEmail({ email, fname: user.fname, otp });
          // response user
        }
      }
    }
    responder.SUCESS({
      res,
      message:
        "If your email is found in our system, we will send an OTP to yor email. Please check your inbox/spam.",
    });
  } catch (error) {
    next(error);
  }
});

// passwrod reset
router.patch("/", resetPasswordValidation, async (req, res, next) => {
  try {
    const { email, password, otp } = req.body;

    // check if otp is valid
    const sessionOtp = await deleteSession({ token: otp, associate: email });

    if (sessionOtp?._id) {
      // encrypt the password
      const hashPass = hashPassword(password);

      // update password in user table
      const user = await updateUser({ email }, { password: hashPass });

      if (user?._id) {
        // send email verification
        passwordUpdatedNotificationEmail({ email, fname: user.fname });

        responder.SUCESS({
          res,
          message: "Your password has been updated. You may login now!",
        });
      }
    }

    responder.ERROR({
      res,
      message: "Invalid token or ...!",
    });
  } catch (error) {
    next(error);
  }
});

// password update
router.patch("/password-update", adminAuth, async (req, res, next) => {
  try {
    // get user info
    const user = req.userInfo;
    const { oldPassword, newPassword } = req.body;

    // get hash password from db
    const { password } = await getAdminPasswordById(user?._id);

    // match the old password with the new one
    const isMatched = comparePassword(oldPassword, password);

    if (isMatched) {
      // encrypt new password
      const newHashPass = hashPassword(newPassword);

      // update user table with new password
      const updatedUser = await updateUser(
        { _id: user?._id },
        { password: newHashPass }
      );

      if (updatedUser?._id) {
        // send email notification
        passwordUpdatedNotificationEmail({
          email: updatedUser.email,
          fname: updatedUser.fname,
        });

        return responder.SUCESS({
          res,
          message:
            "Congratulations, your password has been updated successfully!",
        });
      }
    } else {
      responder.ERROR({
        errorCode: 200,
        res,
        message:
          "Sorry, we are unable to update your password. Please verify your old password and try again.",
      });
    }

    responder.ERROR({
      errorCode: 200,
      res,
      message:
        "Sorry, we are unable to update your password. Please try again later.",
    });
  } catch (error) {
    next(error);
  }
});

// profile update
router.patch(
  "/profile-update",
  updateAdminProfileValidation,
  adminAuth,
  async (req, res, next) => {
    try {
      // get user info
      const user = req.userInfo;

      const result = await getAUser({ email: user?.email });

      const { password, ...rest } = req.body;

      // match the password received from frontend with the one stored in databse table
      const isMatched = comparePassword(password, result?.password);

      if (isMatched) {
        // update user table with new password
        const updatedUser = await updateUser({ _id: user?._id }, rest);

        if (updatedUser?._id) {
          // send email notification
          profileUpdatedNotificationEmail({
            email: updatedUser.email,
            fname: updatedUser.fname,
          });

          return responder.SUCESS({
            res,
            message:
              "Congratulations, your profile has been updated successfully!",
          });
        }
      }

      responder.ERROR({
        errorCode: 200,
        res,
        message:
          "Sorry, we are unable to update your profile. Please try again later.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// profile update
router.patch(
  "/email-update",
  updateAdminEmailValidation,
  adminAuth,
  async (req, res, next) => {
    try {
      // get user info
      const user = req.userInfo;

      const result = await getAUser({ email: user?.email });

      const { password, email } = req.body;

      // match the password received from frontend with the one stored in databse table
      const isMatched = comparePassword(password, result?.password);

      if (isMatched) {
        // update user table with new password
        const updatedUser = await updateUser(
          { _id: user?._id },
          { email, status: "inactive" }
        );

        // if email is updated, create unique url and email that to the user to verify
        if (updatedUser?._id) {
          const c = uuidv4(); //this must be stored in db
          const token = await createNewSession({
            token: c,
            associate: updatedUser.email,
          });

          const url = `${process.env.CLIENT_ROOT_DOMAIN}/verify-email?e=${updatedUser.email}&c=${c}`;

          // send new email
          sendEmailVerificationLinkTemplate({
            email: updatedUser.email,
            url,
            fname: updatedUser.fname,
          });

          return responder.SUCESS({
            res,
            message:
              "Congratulations, your email has been updated successfully!",
          });
        }
      }

      responder.ERROR({
        errorCode: 200,
        res,
        message:
          "Sorry, we are unable to update your email. Please try again later.",
      });
    } catch (error) {
      if (error.message.includes("E11000 duplicate key error collection")) {
        error.errorCode = 200;
        error.message =
          "There is another user with this email. Please login or use another email to update!";
      }
      next(error);
    }
  }
);

export default router;
