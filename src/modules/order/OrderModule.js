import { ObjectId } from "mongodb";
import { connectToDatabase } from "../../config/databaseConnection.js";

const uri = process.env.MONGO_URL;
const collectionName = "orders";
let collection;

(async () => {
  try {
    const db = await connectToDatabase(uri);
    collection = db.collection(collectionName);
  } catch (error) {
    console.error("Error connecting the database:", error);
  }
})();

// read all orders
export const getAllOrders = () => {
  // optional params
  const options = {
    sort: { createdAt: -1 },
  };

  return collection.find({}, options).toArray();
};

// read all orders
export const getAOrder = (_id) => {
  return collection.findOne({ _id: new ObjectId(_id) });
};

export const updateAOrder = async (
  filter,
  { status, trackingNumber, cartArray }
) => {
  // Find the order by ID
  const order = await collection.findOne(filter);

  // Update the carts array
  for (const updatedCart of cartArray) {
    const index = order.carts.findIndex(
      (cart) => cart.cartId.toString() === updatedCart.cartId
    );

    if (index !== -1) {
      order.carts[index].dispatchedQty =
        order.carts[index].dispatchedQty + Number(updatedCart.dispatchedQty);
      order.carts[index].cartRefund = Number(updatedCart.cartRefund);
    }
  }

  // Save the updated order
  return await collection.updateOne(filter, {
    $set: { status, trackingNumber, carts: order.carts },
  });
};
