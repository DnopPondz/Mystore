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
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    requestedProduct: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    quoteSummary: { type: String, default: "" },
    internalNotes: { type: String, default: "" },
    quotedTotal: { type: Number, default: 0 },
    paymentPlan: { type: String, enum: ["full", "half"], default: "full" },
    depositAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    contactedAt: { type: Date, default: null },
    quotedAt: { type: Date, default: null },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "confirmed", "closed"],
      default: "new",
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["new", "contacted", "quoted", "confirmed", "closed"],
        },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

PreOrderSchema.pre("save", function addInitialHistory(next) {
  if (!Array.isArray(this.statusHistory) || this.statusHistory.length === 0) {
    this.statusHistory = [
      {
        status: this.status || "new",
        changedAt: this.createdAt instanceof Date ? this.createdAt : new Date(),
      },
    ];
  }
  next();
});

export const PreOrder = models.PreOrder || model("PreOrder", PreOrderSchema);
