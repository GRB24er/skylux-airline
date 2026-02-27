export function generateBookingReference(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "";
  for (let i = 0; i < 6; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
  return "SX-" + ref;
}

export function generateFlightNumber(): string {
  return "SX " + Math.floor(100 + Math.random() * 9900);
}

export function calculatePriceBreakdown(baseFare: number, passengers: number, discount = 0, loyaltyPointsUsed = 0) {
  const subtotal = baseFare * passengers;
  const taxes = subtotal * 0.12;
  const surcharges = subtotal * 0.03;
  const discountAmt = discount > 0 ? subtotal * (discount / 100) : 0;
  const pointsValue = loyaltyPointsUsed / 10;
  const total = subtotal + taxes + surcharges - discountAmt - pointsValue;
  return {
    baseFare: subtotal, taxes: Math.round(taxes * 100) / 100,
    surcharges: Math.round(surcharges * 100) / 100,
    discount: Math.round(discountAmt * 100) / 100,
    loyaltyPointsUsed, total: Math.max(0, Math.round(total * 100) / 100),
  };
}

export function calculatePointsEarned(totalSpent: number, tierMultiplier = 1): number {
  return Math.floor(totalSpent * 10 * tierMultiplier);
}

export function formatDuration(minutes: number): string {
  return Math.floor(minutes / 60) + "h " + (minutes % 60).toString().padStart(2, "0") + "m";
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function parseQueryParams(sp: URLSearchParams) {
  return {
    page: parseInt(sp.get("page") || "1"),
    limit: Math.min(parseInt(sp.get("limit") || "20"), 100),
    sortBy: sp.get("sortBy") || "createdAt",
    sortOrder: (sp.get("sortOrder") || "desc") as "asc" | "desc",
    search: sp.get("search") || "",
  };
}

export function sanitizeQuery(input: string): string { return input.replace(/[${}]/g, "").trim(); }

export function getDateRange(period: "today" | "week" | "month" | "year") {
  const now = new Date(); const start = new Date();
  switch (period) {
    case "today": start.setHours(0, 0, 0, 0); break;
    case "week": start.setDate(now.getDate() - 7); break;
    case "month": start.setMonth(now.getMonth() - 1); break;
    case "year": start.setFullYear(now.getFullYear() - 1); break;
  }
  return { start, end: now };
}
