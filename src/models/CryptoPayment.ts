import mongoose, { Schema, Document } from "mongoose";

export interface ICryptoPayment extends Document {
  bookingReference: string;
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  walletId: mongoose.Types.ObjectId;
  currency: string;
  symbol: string;
  network: string;
  walletAddress: string;
  amountUSD: number;
  status: "pending" | "confirming" | "confirmed" | "expired" | "failed";
  flightDetails: {
    flightNumber: string;
    from: string;
    to: string;
    date: string;
    passengers: number;
  };
  adminNotes: string;
  confirmedBy: mongoose.Types.ObjectId;
  confirmedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CryptoPaymentSchema = new Schema<ICryptoPayment>({
  bookingReference: { type: String, required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  walletId: { type: Schema.Types.ObjectId, ref: "CryptoWallet", required: true },
  currency: { type: String, required: true },
  symbol: { type: String, required: true },
  network: { type: String, required: true },
  walletAddress: { type: String, required: true },
  amountUSD: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirming", "confirmed", "expired", "failed"], default: "pending" },
  flightDetails: {
    flightNumber: String,
    from: String,
    to: String,
    date: String,
    passengers: Number,
  },
  adminNotes: { type: String, default: "" },
  confirmedBy: { type: Schema.Types.ObjectId, ref: "User" },
  confirmedAt: Date,
  expiresAt: { type: Date, default: () => new Date(Date.now() + 60 * 60 * 1000) }, // 1 hour
}, { timestamps: true });

export default mongoose.models.CryptoPayment || mongoose.model<ICryptoPayment>("CryptoPayment", CryptoPaymentSchema);
