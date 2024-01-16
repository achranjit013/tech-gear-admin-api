import UserSchema from "./UserSchema.js";

// create user
export const createUser = (userObj) => {
  return UserSchema(userObj).save();
};

// read user
// get a user by their filter (email)
export const getAUser = (filter) => {
  return UserSchema.findOne(filter);
};

// get a admin
export const getOneAdmin = (filter) => {
  return UserSchema.findOne(filter);
};

// get all users who are not admin (i.e. students)
// export const getAllStudents = (filter) => {
//   return UserSchema.find(filter);
// };

// update user
export const updateUser = (filter, update) => {
  return UserSchema.findOneAndUpdate(filter, update, { new: true });
};

// get only password
export const getAdminPasswordById = (_id) => {
  return UserSchema.findById(_id, { password: 1 });
};

// delete user
