import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    passwordHash: String,
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    banned: { type: Boolean, default: false, index: true },
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyTier: {
      type: String,
      enum: ["starter", "silver", "gold", "platinum"],
      default: "starter",
    },
    memberSince: { type: Date },
    loyaltyHistory: [
      {
        orderId: { type: Schema.Types.ObjectId, ref: "Order" },
        points: Number,
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
