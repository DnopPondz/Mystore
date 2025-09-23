import { Schema, models, model } from "mongoose";

const PAYMENT_METHODS = ["promptpay", "bank"];
const PAYMENT_STATUSES = ["unpaid", "verifying", "paid", "invalid", "cash"];
const FULFILLMENT_STATUSES = ["new", "pending", "shipping", "success", "cancel"];

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
      method: { type: String, enum: PAYMENT_METHODS, default: "promptpay" },
      status: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
      ref: String,
      amountPaid: Number,
      slip: String,
      slipFilename: String,
      confirmedAt: Date,
    },

    // สถานะคำสั่งซื้อ
    status: { type: String, enum: FULFILLMENT_STATUSES, default: "new" },
  },
  { timestamps: true }
);

if (models.Order) {
  const methodPath = models.Order.schema?.path("payment.method");
  const hasAllMethods = Array.isArray(methodPath?.enumValues)
    ? PAYMENT_METHODS.every((value) => methodPath.enumValues.includes(value))
    : false;

  if (!hasAllMethods) {
    delete models.Order;
  }
}

export const Order = models.Order || model("Order", OrderSchema);

export const PAYMENT_STATUS_VALUES = PAYMENT_STATUSES;
export const ORDER_STATUS_VALUES = FULFILLMENT_STATUSES;
