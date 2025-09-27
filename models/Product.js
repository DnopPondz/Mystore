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
    saleMode: {
      type: String,
      enum: ["regular", "preorder", "both"],
      default: "regular",
    },
    preorderDepositType: {
      type: String,
      enum: ["full", "half"],
      default: "full",
    },
    preorderNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Product = models.Product || model("Product", ProductSchema);
