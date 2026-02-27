// ═══════════════════════════════════════
// SKYLUX Airways — Type Definitions
// ═══════════════════════════════════════

export type UserRole = "customer" | "admin" | "superadmin" | "pilot" | "crew";
export type FlightStatus = "scheduled" | "boarding" | "departed" | "in-flight" | "landed" | "arrived" | "delayed" | "cancelled";
export type FlightType = "commercial" | "private-jet";
export type CabinClass = "economy" | "premium" | "business" | "first";
export type BookingStatus = "pending" | "confirmed" | "checked-in" | "boarded" | "completed" | "cancelled" | "refunded" | "no-show";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";
export type AircraftCategory = "light-jet" | "midsize-jet" | "super-midsize" | "heavy-jet" | "ultra-long-range" | "commercial-narrowbody" | "commercial-widebody";
export type AircraftStatus = "active" | "maintenance" | "grounded" | "retired";
export type CrewRole = "captain" | "first-officer" | "flight-engineer" | "purser" | "flight-attendant";
export type CrewStatus = "available" | "on-duty" | "on-leave" | "training" | "inactive";
export type NotificationType = "booking-confirmation" | "check-in-reminder" | "flight-update" | "gate-change" | "delay-alert" | "boarding-pass";

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  dateOfBirth?: Date;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: Date;
  address?: IAddress;
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
}

export interface ISeatMap {
  class: CabinClass;
  rows: number;
  seatsPerRow: number;
  totalSeats: number;
  availableSeats: number;
  price: number;
  layout: string;
}

export interface IStopDetail {
  airport: string;
  airportCode: string;
  duration: number;
}

export interface IAirportInfo {
  airport: string;
  airportCode: string;
  city: string;
  country: string;
  terminal?: string;
  gate?: string;
  scheduledTime: Date;
  actualTime?: Date;
  timezone: string;
}

export interface IFlight {
  _id: string;
  flightNumber: string;
  type: FlightType;
  airline: string;
  departure: IAirportInfo;
  arrival: IAirportInfo;
  duration: number;
  distance: number;
  status: FlightStatus;
  aircraft: string | IAircraft;
  seatMap: ISeatMap[];
  amenities: string[];
  baggageAllowance: {
    cabin: { weight: number; pieces: number };
    checked: { weight: number; pieces: number };
  };
  stops: number;
  stopDetails?: IStopDetail[];
  crew: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFlightSearch {
  from?: string;
  to?: string;
  departDate?: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: CabinClass;
  type?: FlightType;
  tripType?: "roundtrip" | "oneway" | "multi-city";
  maxStops?: number;
  maxPrice?: number;
  sortBy?: "price" | "duration" | "departure";
  page?: number;
  limit?: number;
}

export interface IPassenger {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  nationality: string;
  passportNumber: string;
  passportExpiry: Date;
  seatNumber?: string;
  cabinClass: CabinClass;
  specialRequests?: string[];
  mealPreference?: "standard" | "vegetarian" | "vegan" | "halal" | "kosher" | "gluten-free";
  frequentFlyerNumber?: string;
}

export interface IPaymentBreakdown {
  baseFare: number;
  taxes: number;
  surcharges: number;
  discount: number;
  loyaltyPointsUsed: number;
  total: number;
}

export interface IBooking {
  _id: string;
  bookingReference: string;
  user: string | IUser;
  flights: { flight: string | IFlight; direction: "outbound" | "return" }[];
  passengers: IPassenger[];
  cabinClass: CabinClass;
  status: BookingStatus;
  payment: {
    status: PaymentStatus;
    method: "card" | "bank_transfer" | "crypto" | "loyalty_points";
    amount: number;
    currency: string;
    transactionId?: string;
    stripePaymentIntentId?: string;
    paidAt?: Date;
    breakdown: IPaymentBreakdown;
  };
  addOns: {
    extraBaggage?: number;
    seatSelection?: boolean;
    loungeAccess?: boolean;
    travelInsurance?: boolean;
    priorityBoarding?: boolean;
    mealUpgrade?: boolean;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IAircraft {
  _id: string;
  registration: string;
  name: string;
  manufacturer: string;
  model: string;
  category: AircraftCategory;
  type: FlightType;
  status: AircraftStatus;
  specs: {
    maxPassengers: number;
    maxRange: number;
    cruiseSpeed: number;
    maxSpeed: number;
    ceilingAltitude: number;
    cabinWidth: number;
    cabinLength: number;
    cabinHeight: number;
    baggageCapacity: number;
  };
  seatConfiguration: {
    class: CabinClass;
    seats: number;
    layout: string;
    pitch: string;
    features: string[];
  }[];
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ICrew {
  _id: string;
  user: string | IUser;
  employeeId: string;
  role: CrewRole;
  status: CrewStatus;
  certifications: {
    name: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    number: string;
  }[];
  aircraftRatings: string[];
  totalFlightHours: number;
  monthlyFlightHours: number;
  maxMonthlyHours: number;
  homeBase: string;
  currentLocation?: string;
  contactEmergency: { name: string; relation: string; phone: string };
  schedule: {
    date: Date;
    flightId?: string;
    type: "flight" | "standby" | "training" | "leave" | "rest";
    startTime?: Date;
    endTime?: Date;
    notes?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromoCode {
  _id: string;
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  maxUses: number;
  usedCount: number;
  minBookingAmount?: number;
  validFrom: Date;
  validUntil: Date;
  applicableTo: FlightType[];
  applicableCabins: CabinClass[];
  isActive: boolean;
}

export interface INotification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  sentVia: ("email" | "sms" | "push")[];
  createdAt: Date;
}

export interface IDashboardStats {
  revenue: { today: number; thisWeek: number; thisMonth: number; thisYear: number; trend: number };
  bookings: { total: number; pending: number; confirmed: number; cancelled: number; today: number; trend: number };
  flights: { total: number; active: number; delayed: number; cancelled: number; onTimeRate: number };
  passengers: { total: number; thisMonth: number; averagePerFlight: number; loyaltyMembers: number };
  fleet: { totalAircraft: number; active: number; maintenance: number; utilizationRate: number };
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}
