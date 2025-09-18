import { Schema, models, model } from "mongoose";

const ProductSchema = new Schema(
  {
    title: String,
    slug: { type: String, unique: true, index: true },
    description: String,
    images: [String],
    price: Number,
    stock: Number,
    active: { type: Boolean, default: true },
    tags: [String],
  },
  { timestamps: true }
);

export const Product = models.Product || model("Product", ProductSchema);
