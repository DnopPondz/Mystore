import { Schema, models, model } from "mongoose";

const NewsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    source: { type: String, default: "" },
    marketingOptIn: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const NewsletterSubscriber =
  models.NewsletterSubscriber || model("NewsletterSubscriber", NewsletterSubscriberSchema);
