import { getSession } from "../modules/session/SessionSchema.js";
import { getAUser } from "../modules/user/UserModule.js";
import {
  createAccessJWT,
  verifyAccessJWT,
  verifyRefreshJWT,
} from "../utils/jwtHelper.js";
import { responder } from "./response.js";

export const adminAuth = async (req, res, next) => {
  try {
    // get the access jwt and verify
    const { authorization } = req.headers;

    const decoded = await verifyAccessJWT(authorization);

    // get the user and check if active
    if (decoded?.email) {
      // check if the token is in the db
      const accessJWT = await getSession({
        token: authorization,
        associate: decoded.email,
      });

      if (accessJWT?._id) {
        // get user by email
        const user = await getAUser({ email: decoded.email });
        if (user?.status === "active" && user?.role === "admin") {
          user.password = undefined;
          req.userInfo = user;
          return next();
        }
      }
    }

    // for all invalid cases
    responder.ERROR({
      res,
      message: "Unauthorized!",
      errorCode: 401,
    });
  } catch (error) {
    // jwt expired
    if (error.message.includes("jwt expired")) {
      return responder.ERROR({
        res,
        errorCode: 403,
        message: "jwt expired",
      });
    }

    next(error);
  }
};

export const refreshAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers; //refresh jwt
    const decoded = await verifyRefreshJWT(authorization);

    if (decoded?.email) {
      const user = await getAUser({
        email: decoded.email,
        refreshJWT: authorization,
      });

      if (user?._id && user?.status === "active") {
        const accessJWT = await createAccessJWT(decoded.email);
        return responder.SUCESS({
          res,
          message: "access jwt",
          accessJWT,
        });
      }
    }

    responder.ERROR({
      res,
      message: "unauthorized",
      errorCode: 401,
    });
  } catch (error) {
    next(error);
  }
};
