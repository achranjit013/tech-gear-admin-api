import CategorySchema from "./CategorySchema.js";

// create category
export const createCategory = (categoryObj) => {
  return CategorySchema(categoryObj).save();
};

// read category
// get categories
export const getCategories = () => {
  return CategorySchema.find();
};

// update category
export const updateCategory = (filter, update) => {
  return CategorySchema.findOneAndUpdate(filter, update, { new: true });
};

// delete category
export const deleteCategory = (_id) => {
  return CategorySchema.findOneAndDelete(_id);
};
