// ═══════════════════════════════════════════
// SKYLUX Airways — API Client
// Centralized fetch wrapper for all endpoints
// ═══════════════════════════════════════════

const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// ── Auth ──
export const auth = {
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (data: any) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  me: () => request<{ user: any }>("/auth/me"),
};

// ── Flights ──
export const flights = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ flights: any[] }>(`/flights${qs}`);
  },
  search: (params: Record<string, string>) => {
    const qs = "?" + new URLSearchParams(params).toString();
    return request<{ flights: any[] }>(`/flights/search${qs}`);
  },
  get: (id: string) => request<{ flight: any }>(`/flights/${id}`),
  create: (data: any) => request("/flights", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/flights/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/flights/${id}`, { method: "DELETE" }),
};

// ── Bookings ──
export const bookings = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ bookings: any[] }>(`/bookings${qs}`);
  },
  get: (id: string) => request<{ booking: any }>(`/bookings/${id}`),
  create: (data: any) => request("/bookings/create", { method: "POST", body: JSON.stringify(data) }),
  cancel: (bookingId: string, reason?: string) =>
    request("/bookings/cancel", { method: "POST", body: JSON.stringify({ bookingId, reason }) }),
};

// ── Fleet ──
export const fleet = {
  list: () => request<{ aircraft: any[] }>("/aircraft"),
  create: (data: any) => request("/aircraft", { method: "POST", body: JSON.stringify(data) }),
};

// ── Crew ──
export const crew = {
  list: () => request<{ crew: any[] }>("/crew"),
  schedule: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ schedule: any[] }>(`/crew/schedule${qs}`);
  },
};

// ── Analytics ──
export const analytics = {
  dashboard: () => request<any>("/analytics/dashboard"),
  revenue: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any>(`/analytics/revenue${qs}`);
  },
};
