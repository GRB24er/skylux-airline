import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICrewDocument extends Document {
  user: mongoose.Types.ObjectId;
  employeeId: string;
  role: string;
  status: string;
  certifications: any[];
  aircraftRatings: string[];
  totalFlightHours: number;
  monthlyFlightHours: number;
  maxMonthlyHours: number;
  homeBase: string;
  currentLocation?: string;
  contactEmergency: { name: string; relation: string; phone: string };
  schedule: any[];
}

const CrewSchema = new Schema<ICrewDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: ["captain", "first-officer", "flight-engineer", "purser", "flight-attendant"],
      required: true, index: true,
    },
    status: {
      type: String,
      enum: ["available", "on-duty", "on-leave", "training", "inactive"],
      default: "available", index: true,
    },
    certifications: [{
      name: { type: String, required: true },
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      number: String,
    }],
    aircraftRatings: [String],
    totalFlightHours: { type: Number, default: 0 },
    monthlyFlightHours: { type: Number, default: 0 },
    maxMonthlyHours: { type: Number, default: 100 },
    homeBase: { type: String, required: true },
    currentLocation: String,
    contactEmergency: {
      name: { type: String, required: true },
      relation: { type: String, required: true },
      phone: { type: String, required: true },
    },
    schedule: [{
      date: { type: Date, required: true },
      flightId: { type: Schema.Types.ObjectId, ref: "Flight" },
      type: { type: String, enum: ["flight", "standby", "training", "leave", "rest"], required: true },
      startTime: Date,
      endTime: Date,
      notes: String,
    }],
  },
  { timestamps: true }
);

const Crew: Model<ICrewDocument> = mongoose.models.Crew || mongoose.model<ICrewDocument>("Crew", CrewSchema);
export default Crew;
