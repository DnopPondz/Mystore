import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    passwordHash: String,
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    banned: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
