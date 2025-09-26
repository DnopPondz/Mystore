import { Schema, model, models } from "mongoose";

const PreorderMenuItemSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    unitLabel: { type: String, default: "ชุด" },
    depositRate: { type: Number, default: 0.5 },
    active: { type: Boolean, default: true },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const PreorderMenuItem =
  models.PreorderMenuItem || model("PreorderMenuItem", PreorderMenuItemSchema);
