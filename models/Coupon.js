import { Schema, models, model } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "amount"], required: true }, // percent=%, amount=THB
    value: { type: Number, required: true }, // 10 = 10% หรือ 50 = 50 บาท
    minSubtotal: { type: Number, default: 0 }, // ยอดขั้นต่ำ
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
    maxUsesPerUser: { type: Number, default: null, min: 1 },
  },
  { timestamps: true }
);

export const Coupon = models.Coupon || model("Coupon", CouponSchema);
