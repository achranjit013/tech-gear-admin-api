import ProductSchema from "./ProductSchema.js";

// create product
export const createProduct = (productObj) => {
  return ProductSchema(productObj).save();
};

// read product
// get products
export const getProducts = (filterCriteria) => {
  return ProductSchema.find(filterCriteria);
};

// get products
export const getAProduct = (filter) => {
  return ProductSchema.findOne(filter);
};

// get product by slug
export const getAProductBySlug = (slug) => {
  return ProductSchema.findOne({ slug });
};

// update product
export const updateAProduct = (filter, update) => {
  return ProductSchema.findOneAndUpdate(filter, update, { new: true });
};

// delete product
export const deleteSelectedProduct = (_id) => {
  return ProductSchema.findOneAndDelete({ _id });
};
