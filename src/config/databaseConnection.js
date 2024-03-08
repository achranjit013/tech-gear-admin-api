import { MongoClient, ServerApiVersion } from "mongodb";

let client;

const connectToDatabase = async (connectionString) => {
  if (!client) {
    client = new MongoClient(connectionString, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    try {
      await client.connect();
      console.log("Connected to the database!");
    } catch (error) {
      console.error("Error connecting to the database:", error);
      throw error;
    }
  }

  return client.db(); // returning the database object
};

export { connectToDatabase };
