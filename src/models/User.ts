import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDocument extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "customer" | "admin" | "superadmin" | "pilot" | "crew";
  avatar?: string;
  dateOfBirth?: Date;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  loyaltyPoints: number;
  loyaltyTier: "standard" | "silver" | "gold" | "platinum" | "diamond";
  totalFlights: number;
  totalSpent: number;
  isVerified: boolean;
  isActive: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  fullName: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["customer", "admin", "superadmin", "pilot", "crew"],
      default: "customer",
      index: true,
    },
    avatar: String,
    dateOfBirth: Date,
    nationality: String,
    passportNumber: { type: String, select: false },
    passportExpiry: Date,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zip: String,
    },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    loyaltyTier: {
      type: String,
      enum: ["standard", "silver", "gold", "platinum", "diamond"],
      default: "standard",
    },
    totalFlights: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ loyaltyTier: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual: full name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save: hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
export default User;
