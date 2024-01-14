import bcrypt from "bcryptjs";

const salt = 15;

export const hashPassword = (plainPassword) => {
  return bcrypt.hashSync(plainPassword);
};
