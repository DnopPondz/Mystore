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
  },
  { timestamps: true }
);

export const PreOrder = models.PreOrder || model("PreOrder", PreOrderSchema);
