import mongoose, { Schema, Document } from "mongoose";

export interface ICryptoWallet extends Document {
  currency: string;       // Bitcoin, Ethereum, USDT, etc.
  symbol: string;         // BTC, ETH, USDT
  network: string;        // mainnet, ERC-20, TRC-20, BEP-20
  address: string;        // wallet address
  isActive: boolean;
  icon: string;           // emoji or icon identifier
  minAmount: number;      // minimum USD equivalent
  confirmations: number;  // required confirmations
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CryptoWalletSchema = new Schema<ICryptoWallet>({
  currency: { type: String, required: true },
  symbol: { type: String, required: true, uppercase: true },
  network: { type: String, required: true },
  address: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  icon: { type: String, default: "₿" },
  minAmount: { type: Number, default: 0 },
  confirmations: { type: Number, default: 3 },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.CryptoWallet || mongoose.model<ICryptoWallet>("CryptoWallet", CryptoWalletSchema);
