import SubCategorySchema from "./SubCategorySchema.js";

// create sub category
export const createSubCategory = (obj) => {
  return SubCategorySchema(obj).save();
};

// read sub category
// get sub categories
export const getSubCategories = (filterCriteria) => {
  return SubCategorySchema.aggregate([
    {
      $match: filterCriteria,
    },
    {
      $group: {
        _id: "$categoryId",
        subCategories: {
          $push: {
            _id: "$_id",
            status: "$status",
            title: "$title",
            slug: "$slug",
            createdAt: "$createdAt",
          },
        },
      },
    },
    {
      $sort: {
        "subCategories.createdAt": 1, // use -1 for descending order
      },
    },
  ])
    .exec()
    .then((result) => {
      return result;
    })
    .catch((err) => {
      console.error(err);
    });
};

// update sub category
export const updateSubCategory = (filter, update) => {
  return SubCategorySchema.findOneAndUpdate(filter, update, { new: true });
};

// delete sub category
export const deleteSubCategory = (_id) => {
  return SubCategorySchema.findOneAndDelete(_id);
};
