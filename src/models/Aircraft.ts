import mongoose, { Schema, Document, Model } from "mongoose";

// @ts-ignore - model field conflicts with Mongoose Document.model
export interface IAircraftDocument extends Document {
  registration: string;
  name: string;
  manufacturer: string;
  model: string;
  category: string;
  type: "commercial" | "private-jet";
  status: string;
  specs: any;
  seatConfiguration: any[];
  amenities: string[];
  hourlyRate?: number;
  images: string[];
  yearManufactured: number;
  totalFlightHours: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  homeBase: string;
  currentLocation?: string;
  isAvailable: boolean;
}

const AircraftSchema = new Schema<IAircraftDocument>(
  {
    registration: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    category: {
      type: String,
      enum: ["light-jet", "midsize-jet", "super-midsize", "heavy-jet", "ultra-long-range", "commercial-narrowbody", "commercial-widebody"],
      required: true,
    },
    type: { type: String, enum: ["commercial", "private-jet"], required: true, index: true },
    status: { type: String, enum: ["active", "maintenance", "grounded", "retired"], default: "active", index: true },
    specs: {
      maxPassengers: { type: Number, required: true },
      maxRange: { type: Number, required: true },
      cruiseSpeed: { type: Number, required: true },
      maxSpeed: Number,
      ceilingAltitude: Number,
      cabinWidth: Number,
      cabinLength: Number,
      cabinHeight: Number,
      baggageCapacity: Number,
    },
    seatConfiguration: [{
      class: { type: String, enum: ["economy", "premium", "business", "first"] },
      seats: Number,
      layout: String,
      pitch: String,
      features: [String],
    }],
    amenities: [String],
    hourlyRate: { type: Number, min: 0 },
    images: [String],
    yearManufactured: { type: Number, required: true },
    totalFlightHours: { type: Number, default: 0 },
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    homeBase: { type: String, required: true },
    currentLocation: String,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Aircraft: Model<IAircraftDocument> = mongoose.models.Aircraft || mongoose.model<IAircraftDocument>("Aircraft", AircraftSchema);
export default Aircraft;
