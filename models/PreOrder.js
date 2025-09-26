import { Schema, models, model } from "mongoose";

const PreOrderSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    eventDate: { type: String, default: "" },
    eventTime: { type: String, default: "" },
    servings: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    flavourIdeas: { type: String, default: "" },
    notes: { type: String, default: "" },
    preferredContact: {
      type: String,
      enum: ["phone", "line", "email"],
      default: "phone",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "confirmed", "closed"],
      default: "new",
    },
    orderType: {
      type: String,
      enum: ["menu", "break"],
      default: "break",
    },
    menuItemId: { type: Schema.Types.ObjectId, ref: "PreorderMenuItem", default: null },
    menuSnapshot: {
      title: { type: String, default: "" },
      unitLabel: { type: String, default: "" },
      price: { type: Number, default: 0 },
      depositRate: { type: Number, default: 0.5 },
      imageUrl: { type: String, default: "" },
    },
    quantity: { type: Number, default: 0 },
    itemPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },
    depositStatus: {
      type: String,
      enum: ["pending", "paid", "waived"],
      default: "pending",
    },
    depositOrderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    finalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const PreOrder = models.PreOrder || model("PreOrder", PreOrderSchema);
