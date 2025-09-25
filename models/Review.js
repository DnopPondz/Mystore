import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    userName: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });

export const Review = models.Review || model("Review", ReviewSchema);
