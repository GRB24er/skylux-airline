export const APP_NAME = "SKYLUX Airways";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const CABIN_CLASSES = ["economy", "premium", "business", "first"] as const;
export const FLIGHT_TYPES = ["commercial", "private-jet"] as const;
export const LOYALTY_TIERS = {
  standard: { minPoints: 0, multiplier: 1, perks: [] as string[] },
  silver: { minPoints: 10000, multiplier: 1.25, perks: ["priority-checkin", "extra-baggage"] },
  gold: { minPoints: 50000, multiplier: 1.5, perks: ["priority-checkin", "extra-baggage", "lounge-access", "priority-boarding"] },
  platinum: { minPoints: 150000, multiplier: 2, perks: ["priority-checkin", "extra-baggage", "lounge-access", "priority-boarding", "free-upgrades", "concierge"] },
  diamond: { minPoints: 500000, multiplier: 3, perks: ["priority-checkin", "extra-baggage", "lounge-access", "priority-boarding", "free-upgrades", "concierge", "companion-ticket"] },
} as const;
export const BOOKING_REFERENCE_LENGTH = 6;
export const POINTS_PER_DOLLAR = 10;
export const TAX_RATE = 0.12;
export const SURCHARGE_RATE = 0.03;
export const PAGINATION = { DEFAULT_PAGE: 1, DEFAULT_LIMIT: 20, MAX_LIMIT: 100 };
