import { Schema, models, model } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },

    // สินค้าในออเดอร์
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        title: String,
        price: Number,
        qty: Number,
      },
    ],

    // ยอดรวม
    subtotal: Number,
    discount: Number,
    total: Number,

    // คูปองที่ใช้ (ถ้ามี)
    coupon: {
      code: String,
      type: String,
      value: Number,
    },

    // ข้อมูลลูกค้า/จัดส่ง
    customer: {
      name: String,
      phone: String,
      email: String,
    },
    shipping: {
      address1: String,
      address2: String,
      district: String,
      province: String,
      postcode: String,
      note: String,
    },

    // การชำระเงิน
    payment: {
      method: { type: String, enum: ["promptpay", "bank"], default: "promptpay" },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
      ref: String,
      amountPaid: Number,
      slip: String,
      slipFilename: String,
      confirmedAt: Date,
    },

    // สถานะคำสั่งซื้อ
    status: { type: String, enum: ["new", "preparing", "shipped", "done", "cancelled"], default: "new" },
  },
  { timestamps: true }
);

export const Order = models.Order || model("Order", OrderSchema);
