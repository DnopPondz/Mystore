import mongoose from "mongoose";

let conn = null;
export async function connectToDatabase() {
  if (conn) return conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");
  conn = await mongoose.connect(uri);
  return conn;
}
