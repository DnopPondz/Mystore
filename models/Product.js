import { Schema, models, model } from "mongoose";

const ProductSchema = new Schema(
  {
    title: String,
    slug: { type: String, unique: true, index: true },
    description: String,
    images: [String],
    price: { type: Number, default: 0, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
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

if (models.Product) {
  const hasCostPrice = Boolean(models.Product.schema?.path("costPrice"));
  if (!hasCostPrice) {
    delete models.Product;
  }
}

export const Product = models.Product || model("Product", ProductSchema);
