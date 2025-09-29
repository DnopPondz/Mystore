import { Schema, models, model } from "mongoose";

const PromotionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    type: { type: String, enum: ["buy_x_get_y", "stamp_card", "custom"], default: "custom" },
    buyQuantity: { type: Number, default: 0 },
    getQuantity: { type: Number, default: 0 },
    stampGoal: { type: Number, default: 0 },
    stampReward: { type: String, default: "", trim: true },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Promotion = models.Promotion || model("Promotion", PromotionSchema);
