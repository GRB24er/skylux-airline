import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationDocument extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  sentVia: string[];
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["booking-confirmation", "check-in-reminder", "flight-update", "gate-change", "delay-alert", "boarding-pass", "promo", "loyalty-update"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
    sentVia: [{ type: String, enum: ["email", "sms", "push"] }],
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotificationDocument> = mongoose.models.Notification || mongoose.model<INotificationDocument>("Notification", NotificationSchema);
export default Notification;
