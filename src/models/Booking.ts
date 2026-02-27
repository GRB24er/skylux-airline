import mongoose, { Schema, Document, Model } from "mongoose";

const PassengerSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  phone: String,
  dateOfBirth: { type: Date, required: true },
  nationality: { type: String, required: true },
  passportNumber: { type: String, required: true },
  passportExpiry: { type: Date, required: true },
  seatNumber: String,
  cabinClass: { type: String, enum: ["economy", "premium", "business", "first"], required: true },
  specialRequests: [String],
  mealPreference: { type: String, enum: ["standard", "vegetarian", "vegan", "halal", "kosher", "gluten-free"], default: "standard" },
  frequentFlyerNumber: String,
}, { _id: false });

export interface IBookingDocument extends Document {
  bookingReference: string;
  user: mongoose.Types.ObjectId;
  flights: { flight: mongoose.Types.ObjectId; direction: "outbound" | "return" }[];
  passengers: any[];
  cabinClass: string;
  status: string;
  payment: {
    status: string;
    method: string;
    amount: number;
    currency: string;
    transactionId?: string;
    stripePaymentIntentId?: string;
    paidAt?: Date;
    breakdown: {
      baseFare: number; taxes: number; surcharges: number;
      discount: number; loyaltyPointsUsed: number; total: number;
    };
  };
  addOns: {
    extraBaggage?: number; seatSelection?: boolean; loungeAccess?: boolean;
    travelInsurance?: boolean; priorityBoarding?: boolean; mealUpgrade?: boolean;
  };
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
  loyaltyPointsEarned: number;
  checkInTime?: Date;
  boardingPassGenerated: boolean;
  eTicketSent: boolean;
  cancellationReason?: string;
  cancelledAt?: Date;
}

const BookingSchema = new Schema<IBookingDocument>(
  {
    bookingReference: {
      type: String, required: true, unique: true, uppercase: true, index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    flights: [{
      flight: { type: Schema.Types.ObjectId, ref: "Flight", required: true },
      direction: { type: String, enum: ["outbound", "return"], required: true },
    }],
    passengers: { type: [PassengerSchema], required: true, validate: { validator: (v: any[]) => v.length > 0, message: "At least one passenger is required" } },
    cabinClass: { type: String, enum: ["economy", "premium", "business", "first"], required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "boarded", "completed", "cancelled", "refunded", "no-show"],
      default: "pending",
      index: true,
    },
    payment: {
      status: { type: String, enum: ["pending", "processing", "completed", "failed", "refunded"], default: "pending" },
      method: { type: String, enum: ["card", "bank_transfer", "crypto", "loyalty_points"], required: true },
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "USD" },
      transactionId: String,
      stripePaymentIntentId: String,
      paidAt: Date,
      breakdown: {
        baseFare: { type: Number, required: true },
        taxes: { type: Number, required: true },
        surcharges: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        loyaltyPointsUsed: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
    },
    addOns: {
      extraBaggage: { type: Number, default: 0 },
      seatSelection: { type: Boolean, default: false },
      loungeAccess: { type: Boolean, default: false },
      travelInsurance: { type: Boolean, default: false },
      priorityBoarding: { type: Boolean, default: false },
      mealUpgrade: { type: Boolean, default: false },
    },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    specialRequests: String,
    loyaltyPointsEarned: { type: Number, default: 0 },
    checkInTime: Date,
    boardingPassGenerated: { type: Boolean, default: false },
    eTicketSent: { type: Boolean, default: false },
    cancellationReason: String,
    cancelledAt: Date,
  },
  { timestamps: true }
);

BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ "payment.status": 1 });
BookingSchema.index({ contactEmail: 1 });

const Booking: Model<IBookingDocument> = mongoose.models.Booking || mongoose.model<IBookingDocument>("Booking", BookingSchema);
export default Booking;
