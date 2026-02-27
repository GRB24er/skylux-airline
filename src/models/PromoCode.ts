import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPromoCodeDocument extends Document {
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  maxUses: number;
  usedCount: number;
  minBookingAmount?: number;
  validFrom: Date;
  validUntil: Date;
  applicableTo: string[];
  applicableCabins: string[];
  isActive: boolean;
}

const PromoCodeSchema = new Schema<IPromoCodeDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    maxUses: { type: Number, required: true, min: 1 },
    usedCount: { type: Number, default: 0 },
    minBookingAmount: Number,
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    applicableTo: [{ type: String, enum: ["commercial", "private-jet"] }],
    applicableCabins: [{ type: String, enum: ["economy", "premium", "business", "first"] }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PromoCode: Model<IPromoCodeDocument> = mongoose.models.PromoCode || mongoose.model<IPromoCodeDocument>("PromoCode", PromoCodeSchema);
export default PromoCode;
