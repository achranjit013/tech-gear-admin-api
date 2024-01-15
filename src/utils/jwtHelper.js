import jwt from "jsonwebtoken";
import { createNewSession } from "../modules/session/SessionSchema.js";
import { updateUser } from "../modules/user/UserModule.js";

// create access token
export const createAccessJWT = async (email) => {
  const token = jwt.sign({ email }, process.env.JWT_ACCESS_TOKEN, {
    expiresIn: "15m",
  });

  // store access token in session table
  await createNewSession({ token, associate: email });

  return token;
};

// create refresh token
export const createRefreshJWT = async (email) => {
  const token = jwt.sign({ email }, process.env.JWT_REFRESH_TOKEN, {
    expiresIn: "30d",
  });

  // store refresh token in user table
  await updateUser({ email }, { refreshJWT: token });

  return token;
};

// get jwts
export const getJWTs = async (email) => {
  return {
    accessJWT: await createAccessJWT(email),
    refreshJWT: await createRefreshJWT(email),
  };
};
