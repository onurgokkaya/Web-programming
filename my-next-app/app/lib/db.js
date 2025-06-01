import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log("MongoDB is already connected.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      ssl: true,
    })
    console.log("MongoDB Connection successfully established.");
    isConnected = true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

export async function disconnectDB() {
  if (!isConnected) {
    console.log("MongoDB is already disconnected.");
    return;
  }

  try {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected.");
    isConnected = false;
  } 
  catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
}
