import mongoose, { Schema, Document, Model } from "mongoose";

const AirportSchema = new Schema({
  airport: { type: String, required: true },
  airportCode: { type: String, required: true, uppercase: true, maxlength: 4 },
  city: { type: String, required: true },
  country: { type: String, required: true },
  terminal: String,
  gate: String,
  scheduledTime: { type: Date, required: true },
  actualTime: Date,
  timezone: { type: String, required: true },
}, { _id: false });

const SeatMapSchema = new Schema({
  class: { type: String, enum: ["economy", "premium", "business", "first"], required: true },
  rows: { type: Number, required: true },
  seatsPerRow: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  price: { type: Number, required: true, min: 0 },
  layout: { type: String, required: true },
}, { _id: false });

export interface IFlightDocument extends Document {
  flightNumber: string;
  type: "commercial" | "private-jet";
  airline: string;
  departure: {
    airport: string; airportCode: string; city: string; country: string;
    terminal?: string; gate?: string; scheduledTime: Date; actualTime?: Date; timezone: string;
  };
  arrival: {
    airport: string; airportCode: string; city: string; country: string;
    terminal?: string; gate?: string; scheduledTime: Date; actualTime?: Date; timezone: string;
  };
  duration: number;
  distance: number;
  status: string;
  aircraft: mongoose.Types.ObjectId;
  seatMap: {
    class: string; rows: number; seatsPerRow: number;
    totalSeats: number; availableSeats: number; price: number; layout: string;
  }[];
  amenities: string[];
  baggageAllowance: {
    cabin: { weight: number; pieces: number };
    checked: { weight: number; pieces: number };
  };
  stops: number;
  stopDetails?: { airport: string; airportCode: string; duration: number }[];
  crew: mongoose.Types.ObjectId[];
  isActive: boolean;
}

const FlightSchema = new Schema<IFlightDocument>(
  {
    flightNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: [/^SX\s?\d{3,4}$/, "Flight number must follow format SX XXX or SX XXXX"],
      index: true,
    },
    type: { type: String, enum: ["commercial", "private-jet"], required: true, index: true },
    airline: { type: String, default: "SKYLUX Airways" },
    departure: { type: AirportSchema, required: true },
    arrival: { type: AirportSchema, required: true },
    duration: { type: Number, required: true, min: 1 },
    distance: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["scheduled", "boarding", "departed", "in-flight", "landed", "arrived", "delayed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    aircraft: { type: Schema.Types.ObjectId, ref: "Aircraft", required: true },
    seatMap: [SeatMapSchema],
    amenities: [String],
    baggageAllowance: {
      cabin: { weight: { type: Number, default: 7 }, pieces: { type: Number, default: 1 } },
      checked: { weight: { type: Number, default: 23 }, pieces: { type: Number, default: 1 } },
    },
    stops: { type: Number, default: 0, min: 0 },
    stopDetails: [{
      airport: String,
      airportCode: { type: String, uppercase: true },
      duration: Number,
    }],
    crew: [{ type: Schema.Types.ObjectId, ref: "Crew" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound indexes for search
FlightSchema.index({ "departure.airportCode": 1, "arrival.airportCode": 1 });
FlightSchema.index({ "departure.scheduledTime": 1 });
FlightSchema.index({ "departure.city": "text", "arrival.city": "text" });
FlightSchema.index({ status: 1, isActive: 1 });

const Flight: Model<IFlightDocument> = mongoose.models.Flight || mongoose.model<IFlightDocument>("Flight", FlightSchema);
export default Flight;
