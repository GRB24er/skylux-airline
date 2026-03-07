"use client";

import { useState, useEffect, useCallback, useMemo, type CSSProperties, type ChangeEvent } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME & STYLE SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const T = {
  bg: "#060a14",
  card: "#0d1321",
  cardHover: "#111827",
  gold: "#d4a843",
  goldDim: "#b8922e",
  goldLight: "#e8c96a",
  emerald: "#34d399",
  red: "#ef4444",
  amber: "#f59e0b",
  text: "#f1f5f9",
  sub: "#94a3b8",
  dim: "#64748b",
  muted: "#1e293b",
  border: "#1e293b",
  font: "'Outfit', 'SF Pro Display', -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;

/* ── Reusable style factories ─────────────────────────────── */

const s = {
  page: {
    minHeight: "100vh",
    background: T.bg,
    color: T.text,
    fontFamily: T.font,
    padding: "40px 20px",
  } as CSSProperties,

  container: {
    maxWidth: 720,
    margin: "0 auto",
  } as CSSProperties,

  card: (extra?: CSSProperties): CSSProperties => ({
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 24,
    marginBottom: 14,
    ...extra,
  }),

  heading: (size: number = 13): CSSProperties => ({
    fontSize: size,
    fontWeight: 700,
    color: T.gold,
    marginBottom: 16,
  }),

  btnPrimary: (disabled?: boolean): CSSProperties => ({
    padding: "14px 40px",
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(135deg, ${T.gold}, ${T.goldDim})`,
    color: "#0a0f1e",
    fontSize: 14,
    fontWeight: 700,
    cursor: disabled ? "wait" : "pointer",
    fontFamily: "inherit",
    opacity: disabled ? 0.7 : 1,
  }),

  btnSecondary: {
    padding: "12px 28px",
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    background: "transparent",
    color: T.sub,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  } as CSSProperties,

  btnGhost: {
    background: "none",
    border: "none",
    color: T.sub,
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: 14,
    display: "block",
  } as CSSProperties,

  row: (gap: number = 12, extra?: CSSProperties): CSSProperties => ({
    display: "flex",
    gap,
    ...extra,
  }),

  rowBetween: (extra?: CSSProperties): CSSProperties => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ...extra,
  }),

  errorBox: {
    padding: "14px 18px",
    background: T.red + "10",
    border: `1px solid ${T.red}20`,
    borderRadius: 10,
  } as CSSProperties,

  badge: (color: string): CSSProperties => ({
    padding: "3px 10px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
    background: color + "12",
    color,
    textTransform: "uppercase",
  }),

  priceTag: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: T.mono,
    color: T.gold,
  } as CSSProperties,

  sslBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: "12px 16px",
    background: T.emerald + "08",
    border: `1px solid ${T.emerald}15`,
    borderRadius: 10,
  } as CSSProperties,
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  email: string;
  phone: string;
  mealPreference: string;
  specialRequests: string;
}

interface CryptoWallet {
  _id: string;
  symbol: string;
  network: string;
  address: string;
  name: string;
}

interface PriceInfo {
  base: number;
  taxes: number;
  addOns: number;
  total: number;
}

interface FlightData {
  _id: string;
  flightNumber: string;
  departure?: { airportCode: string; scheduledTime: string };
  arrival?: { airportCode: string; scheduledTime: string };
}

interface BookingResult {
  bookingReference: string;
  status: string;
  cabinClass: string;
  passengers: any[];
  payment?: { amount: number };
  createdAt: string;
}

interface CryptoPayResult {
  symbol: string;
  amountUSD: number;
  address: string;
}

type PayMethod = "card" | "crypto";
type ViewState = "search" | "results" | "booking" | "confirmation" | "mybookings";
type StepNumber = 1 | 2 | 3 | 4;
type ValidationErrors = Record<string, string>;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const cap = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const formatCardNum = (val: string) => {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (val: string) => {
  const digits = val.replace(/\D/g, "");
  if (digits.length >= 2) return digits.slice(0, 2) + "/" + digits.slice(2, 4);
  return digits;
};

const createEmptyPassenger = (): Passenger => ({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  nationality: "",
  passportNumber: "",
  passportExpiry: "",
  email: "",
  phone: "",
  mealPreference: "",
  specialRequests: "",
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EMAIL_REGEX = /\S+@\S+\.\S+/;

function validatePassengerDetails(
  passengers: Passenger[],
  departDate: string,
  contactEmail: string,
  contactPhone: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  passengers.forEach((p, i) => {
    const prefix = `p${i}_`;

    if (!p.firstName.trim()) errors[`${prefix}fn`] = "Required";
    if (!p.lastName.trim()) errors[`${prefix}ln`] = "Required";
    if (!p.dateOfBirth) errors[`${prefix}dob`] = "Required";
    if (!p.nationality) errors[`${prefix}nat`] = "Required";
    if (!p.passportNumber.trim()) errors[`${prefix}pp`] = "Required";

    if (!p.passportExpiry) {
      errors[`${prefix}ppx`] = "Required";
    } else {
      const expiry = new Date(p.passportExpiry);
      const sixMonthsAfterDeparture = new Date(departDate);
      sixMonthsAfterDeparture.setMonth(sixMonthsAfterDeparture.getMonth() + 6);
      if (expiry < sixMonthsAfterDeparture) {
        errors[`${prefix}ppx`] = "Must be valid 6+ months after travel";
      }
    }

    if (!p.email.trim() || !EMAIL_REGEX.test(p.email)) {
      errors[`${prefix}email`] = "Valid email required";
    }
  });

  if (!contactEmail || !EMAIL_REGEX.test(contactEmail)) errors.ce = "Valid contact email required";
  if (!contactPhone || contactPhone.length < 8) errors.cp = "Valid phone required";

  return errors;
}

function validatePaymentDetails(
  payMethod: PayMethod,
  cardName: string,
  cardNumber: string,
  cardExpiry: string,
  cardCVV: string,
  selectedWallet: CryptoWallet | null
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (payMethod === "card") {
    if (!cardName.trim()) errors.cn = "Required";
    const cleanNum = cardNumber.replace(/\s/g, "");
    if (!cleanNum || cleanNum.length < 15) errors.cnum = "Valid card number required";
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) errors.cexp = "MM/YY format";
    if (!cardCVV || cardCVV.length < 3) errors.cvv = "Required";
  } else {
    if (!selectedWallet) errors.crypto = "Please select a cryptocurrency";
  }

  return errors;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/* ── Input Field ──────────────────────────────────────────── */

interface InputProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  style?: CSSProperties;
}

function InputField({
  label, value, onChange, error, required, placeholder, type = "text", maxLength, style,
}: InputProps) {
  return (
    <div style={{ flex: 1, minWidth: 120, ...style }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.sub, marginBottom: 6 }}>
        {label}{required && <span style={{ color: T.red }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          border: `1px solid ${error ? T.red + "60" : T.border}`,
          background: T.bg,
          color: T.text,
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {error && (
        <div style={{ fontSize: 10, color: T.red, marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}


/* ── Step Progress Bar ────────────────────────────────────── */

const STEP_LABELS = ["Passenger Details", "Add-ons", "Payment", "Review & Confirm"];

function StepProgress({ currentStep }: { currentStep: StepNumber }) {
  return (
    <div style={s.row(6, { marginBottom: 28 })}>
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        return (
          <div key={i} style={{ flex: 1 }}>
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: isComplete
                  ? `linear-gradient(90deg, ${T.gold}, ${T.goldDim})`
                  : isCurrent
                    ? T.gold + "60"
                    : T.muted,
                transition: "all 0.4s",
              }}
            />
            <div
              style={{
                fontSize: 10,
                color: isComplete ? T.goldLight : isCurrent ? T.gold : T.dim,
                marginTop: 5,
                fontWeight: 600,
              }}
            >
              {stepNum}. {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}


/* ── Passenger Form ───────────────────────────────────────── */

interface PassengerFormProps {
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
  contactEmail: string;
  setContactEmail: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  errors: ValidationErrors;
}

function PassengerForm({
  passengers, setPassengers, contactEmail, setContactEmail, contactPhone, setContactPhone, errors,
}: PassengerFormProps) {
  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div>
      {passengers.map((p, i) => (
        <div key={i} style={s.card({ marginBottom: 20 })}>
          <div style={s.heading()}>
            Passenger {i + 1} {i === 0 && <span style={{ color: T.dim, fontWeight: 400 }}>(Lead)</span>}
          </div>

          <div style={s.row(12, { flexWrap: "wrap", marginBottom: 12 })}>
            <InputField
              label="First Name" required
              value={p.firstName}
              onChange={(e) => updatePassenger(i, "firstName", e.target.value)}
              error={errors[`p${i}_fn`]}
              style={{ flex: 2 }}
            />
            <InputField
              label="Last Name" required
              value={p.lastName}
              onChange={(e) => updatePassenger(i, "lastName", e.target.value)}
              error={errors[`p${i}_ln`]}
              style={{ flex: 2 }}
            />
          </div>

          <div style={s.row(12, { flexWrap: "wrap", marginBottom: 12 })}>
            <InputField
              label="Date of Birth" required type="date"
              value={p.dateOfBirth}
              onChange={(e) => updatePassenger(i, "dateOfBirth", e.target.value)}
              error={errors[`p${i}_dob`]}
            />
            <InputField
              label="Nationality" required
              value={p.nationality}
              onChange={(e) => updatePassenger(i, "nationality", e.target.value)}
              error={errors[`p${i}_nat`]}
            />
            <InputField
              label="Email" required
              value={p.email}
              onChange={(e) => updatePassenger(i, "email", e.target.value)}
              error={errors[`p${i}_email`]}
            />
          </div>

          <div style={s.row(12, { flexWrap: "wrap", marginBottom: 12 })}>
            <InputField
              label="Passport Number" required
              value={p.passportNumber}
              onChange={(e) => updatePassenger(i, "passportNumber", e.target.value)}
              error={errors[`p${i}_pp`]}
            />
            <InputField
              label="Passport Expiry" required type="date"
              value={p.passportExpiry}
              onChange={(e) => updatePassenger(i, "passportExpiry", e.target.value)}
              error={errors[`p${i}_ppx`]}
            />
            <InputField
              label="Phone"
              value={p.phone}
              onChange={(e) => updatePassenger(i, "phone", e.target.value)}
            />
          </div>

          <div style={s.row(12, { flexWrap: "wrap" })}>
            <InputField
              label="Meal Preference"
              value={p.mealPreference}
              onChange={(e) => updatePassenger(i, "mealPreference", e.target.value)}
              placeholder="e.g. Vegetarian, Halal"
            />
            <InputField
              label="Special Requests"
              value={p.specialRequests}
              onChange={(e) => updatePassenger(i, "specialRequests", e.target.value)}
              placeholder="Wheelchair, extra legroom..."
            />
          </div>
        </div>
      ))}

      {/* Contact Info */}
      <div style={s.card()}>
        <div style={s.heading()}>Contact Information</div>
        <div style={s.row(12, { flexWrap: "wrap" })}>
          <InputField
            label="Contact Email" required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            error={errors.ce}
            placeholder="booking@email.com"
            style={{ flex: 2 }}
          />
          <InputField
            label="Contact Phone" required
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            error={errors.cp}
            placeholder="+1 234 567 8900"
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
}


/* ── Payment Form (Card) ──────────────────────────────────── */

interface CardFormProps {
  cardName: string;
  setCardName: (v: string) => void;
  cardNumber: string;
  setCardNumber: (v: string) => void;
  cardExpiry: string;
  setCardExpiry: (v: string) => void;
  cardCVV: string;
  setCardCVV: (v: string) => void;
  errors: ValidationErrors;
}

function CardPaymentForm({
  cardName, setCardName, cardNumber, setCardNumber,
  cardExpiry, setCardExpiry, cardCVV, setCardCVV, errors,
}: CardFormProps) {
  return (
    <div>
      <InputField
        label="Cardholder Name" required
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        error={errors.cn}
        placeholder="As shown on card"
        style={{ marginBottom: 12 }}
      />
      <div style={s.row(12, { flexWrap: "wrap", marginBottom: 12 })}>
        <InputField
          label="Card Number" required
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNum(e.target.value))}
          error={errors.cnum}
          placeholder="4242 4242 4242 4242"
          maxLength={19}
          style={{ flex: 3, fontFamily: T.mono }}
        />
        <InputField
          label="Expiry" required
          value={cardExpiry}
          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
          error={errors.cexp}
          placeholder="MM/YY"
          maxLength={5}
          style={{ flex: 1, fontFamily: T.mono }}
        />
        <InputField
          label="CVV" required type="password"
          value={cardCVV}
          onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, "").slice(0, 4))}
          error={errors.cvv}
          placeholder="•••"
          maxLength={4}
          style={{ flex: 1, fontFamily: T.mono }}
        />
      </div>
      <div style={s.sslBadge}>
        <span style={{ color: T.emerald, fontSize: 14 }}>🔒</span>
        <span style={{ fontSize: 11, color: T.emerald }}>
          Your payment is secured with 256-bit SSL encryption. Card details are never stored.
        </span>
      </div>
    </div>
  );
}


/* ── Payment Form (Crypto) ────────────────────────────────── */

interface CryptoFormProps {
  cryptoWallets: CryptoWallet[];
  cryptoLoading: boolean;
  selectedWallet: CryptoWallet | null;
  setSelectedWallet: (w: CryptoWallet) => void;
  errors: ValidationErrors;
}

function CryptoPaymentForm({
  cryptoWallets, cryptoLoading, selectedWallet, setSelectedWallet, errors,
}: CryptoFormProps) {
  if (cryptoLoading) {
    return (
      <div style={{ textAlign: "center", padding: 20, color: T.dim }}>
        Loading payment options...
      </div>
    );
  }

  if (cryptoWallets.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 20, color: T.dim }}>
        No cryptocurrency wallets available at this time. Please contact support.
      </div>
    );
  }

  return (
    <div>
      <div style={s.row(10, { flexWrap: "wrap", marginBottom: 16 })}>
        {cryptoWallets.map((w) => (
          <button
            key={w._id}
            onClick={() => setSelectedWallet(w)}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              border: `1px solid ${selectedWallet?._id === w._id ? "#f7931a" : T.border}`,
              background: selectedWallet?._id === w._id ? "#f7931a12" : T.card,
              color: selectedWallet?._id === w._id ? "#f7931a" : T.sub,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            {w.symbol} <span style={{ fontSize: 10, color: T.dim }}>({w.network})</span>
          </button>
        ))}
      </div>

      {errors.crypto && (
        <div style={{ fontSize: 11, color: T.red, marginBottom: 10 }}>{errors.crypto}</div>
      )}

      {selectedWallet && (
        <div>
          <div
            style={{
              padding: "12px 16px",
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              fontFamily: T.mono,
              fontSize: 12,
              color: T.text,
              wordBreak: "break-all",
              marginBottom: 12,
            }}
          >
            {selectedWallet.address}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: T.amber + "08",
              border: `1px solid ${T.amber}20`,
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 14 }}>⚠</span>
            <span style={{ fontSize: 11, color: T.amber }}>
              Send ONLY {selectedWallet.symbol} ({selectedWallet.network}) to this address.
              Sending other tokens may result in permanent loss. Payment confirmation within 1 hour.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


/* ── Payment Method Toggle ────────────────────────────────── */

interface PayToggleProps {
  payMethod: PayMethod;
  setPayMethod: (m: PayMethod) => void;
  onCryptoSelect: () => void;
}

function PaymentMethodToggle({ payMethod, setPayMethod, onCryptoSelect }: PayToggleProps) {
  const options: { key: PayMethod; label: string; icon: string }[] = [
    { key: "card", label: "Credit / Debit Card", icon: "💳" },
    { key: "crypto", label: "Cryptocurrency", icon: "₿" },
  ];

  return (
    <div style={s.row(10, { marginBottom: 20 })}>
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => {
            setPayMethod(opt.key);
            if (opt.key === "crypto") onCryptoSelect();
          }}
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: 12,
            border: `1px solid ${payMethod === opt.key ? T.gold + "50" : T.border}`,
            background: payMethod === opt.key ? T.gold + "08" : "transparent",
            color: payMethod === opt.key ? T.gold : T.sub,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}


/* ── Payment Error Display ────────────────────────────────── */

interface PaymentErrorProps {
  errorMessage: string;
  payMethod: PayMethod;
}

function PaymentError({ errorMessage, payMethod }: PaymentErrorProps) {
  return (
    <div style={s.errorBox}>
      <div style={{ fontSize: 12, color: T.red, fontWeight: 600, marginBottom: 4 }}>
        ⚠ Payment Failed
      </div>
      <div style={{ fontSize: 12, color: "#f87171", marginBottom: payMethod === "card" ? 10 : 0 }}>
        {errorMessage}
      </div>
    </div>
  );
}


/* ── Booking Confirmation ─────────────────────────────────── */

interface ConfirmationProps {
  booking: BookingResult;
  flight: FlightData | null;
  priceInfo: PriceInfo | null;
  payMethod: PayMethod;
  selectedWallet: CryptoWallet | null;
  cryptoPayResult: CryptoPayResult | null;
  passengers: Passenger[];
}

function BookingConfirmation({
  booking, flight, priceInfo, payMethod, selectedWallet, cryptoPayResult, passengers,
}: ConfirmationProps) {
  return (
    <div>
      {/* Success Header */}
      <div style={s.card({ textAlign: "center", padding: "40px 24px" })}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✈️</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Booking Confirmed</div>
        <div style={{ fontSize: 14, fontFamily: T.mono, color: T.gold, fontWeight: 700 }}>
          {booking.bookingReference}
        </div>
      </div>

      {/* Flight Details */}
      {flight && (
        <div style={s.card()}>
          <div style={s.rowBetween()}>
            <div style={s.row(12, { alignItems: "center" })}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{flight.departure?.airportCode}</span>
              <span style={{ color: T.dim }}>→</span>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{flight.arrival?.airportCode}</span>
              <span style={{ fontSize: 11, color: T.dim, marginLeft: 8 }}>{flight.flightNumber}</span>
            </div>
            <div style={s.badge(T.emerald)}>{booking.status}</div>
          </div>
          <div style={{ fontSize: 11, color: T.dim, marginTop: 8 }}>
            {cap(booking.cabinClass)} · {booking.passengers?.length || 1} passenger
            {(booking.passengers?.length || 1) > 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Passengers */}
      <div style={s.card({ padding: 0 })}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}` }}>
          {passengers.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: i < passengers.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {p.firstName} {p.lastName}
              </span>
              <span style={{ fontSize: 11, color: T.dim }}>
                {p.nationality} · {p.passportNumber}
              </span>
            </div>
          ))}
        </div>

        <div style={s.rowBetween({ padding: "20px 28px" })}>
          <span style={{ fontSize: 13, color: T.sub }}>
            Total {payMethod === "crypto" ? "Due" : "Paid"}
          </span>
          <span style={{ fontSize: 22, fontWeight: 700, fontFamily: T.mono, color: T.gold }}>
            {fmtPrice(booking.payment?.amount || priceInfo?.total || 0)}
          </span>
        </div>
      </div>

      {/* Crypto Payment Pending */}
      {cryptoPayResult && (
        <div style={s.card()}>
          <div style={s.row(8, { alignItems: "center", marginBottom: 12 })}>
            <div
              style={{
                width: 8, height: 8, borderRadius: 4,
                background: "#f7931a",
                animation: "pulse 1.5s infinite",
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#f7931a" }}>
              CRYPTO PAYMENT — AWAITING CONFIRMATION
            </span>
          </div>
          <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>
            Send <strong style={{ color: "#f7931a" }}>{cryptoPayResult.symbol}</strong>{" "}
            equivalent of{" "}
            <strong style={{ color: T.gold }}>
              ${cryptoPayResult.amountUSD?.toLocaleString()}
            </strong>{" "}
            to the address below. Our team has been notified and will confirm your payment shortly.
          </div>
          <div
            style={{
              padding: "12px 16px",
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              fontFamily: T.mono,
              fontSize: 12,
              color: T.text,
              wordBreak: "break-all",
            }}
          >
            {cryptoPayResult.address}
          </div>
        </div>
      )}
    </div>
  );
}


/* ── Booking List Item ────────────────────────────────────── */

interface BookingListItemProps {
  booking: any;
  flight: FlightData | null;
}

function BookingListItem({ booking: b, flight }: BookingListItemProps) {
  const statusColor = b.status === "confirmed" ? T.emerald : T.amber;

  return (
    <div style={s.card({ padding: "20px 24px" })}>
      <div style={s.rowBetween({ flexWrap: "wrap", gap: 16 })}>
        <div>
          <div style={s.row(10, { alignItems: "center", marginBottom: 8 })}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.gold, fontFamily: T.mono }}>
              {b.bookingReference}
            </span>
            <span style={s.badge(statusColor)}>{b.status}</span>
          </div>
          {flight && (
            <div style={s.row(12, { alignItems: "center" })}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{flight.departure?.airportCode}</span>
              <span style={{ color: T.dim }}>→</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{flight.arrival?.airportCode}</span>
              <span style={{ fontSize: 11, color: T.dim, marginLeft: 8 }}>{flight.flightNumber}</span>
              <span style={{ fontSize: 11, color: T.dim }}>
                {new Date(flight.departure?.scheduledTime || "").toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>
          )}
          <div style={{ fontSize: 11, color: T.dim, marginTop: 4 }}>
            {cap(b.cabinClass)} · {b.passengers?.length || 1} passenger
            {(b.passengers?.length || 1) > 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: T.mono, color: T.gold }}>
            {fmtPrice(b.payment?.amount || 0)}
          </div>
          <div style={{ fontSize: 10, color: T.dim, marginTop: 2 }}>
            {new Date(b.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PORTAL PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function PortalPage() {
  // ── Auth (placeholder — wire to your AuthContext) ──
  const [user] = useState<any>({ id: "placeholder" });

  // ── View & Flow State ──
  const [view, setView] = useState<ViewState>("search");
  const [step, setStep] = useState<StepNumber>(1);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // ── Flight & Booking Data ──
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [selectedClass, setSelectedClass] = useState("economy");
  const [departDate, setDepartDate] = useState("");
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [addOns, setAddOns] = useState<Record<string, any>>({});

  // ── Passengers ──
  const [paxCount] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[]>([createEmptyPassenger()]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // ── Payment ──
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");

  // ── Crypto ──
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [cryptoPayResult, setCryptoPayResult] = useState<CryptoPayResult | null>(null);

  // ── Booking Result ──
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  // ── My Bookings ──
  const [myBookings, setMyBookings] = useState<any[]>([]);


  // ━━━━━━━ ACTIONS ━━━━━━━

  const fetchCryptoWallets = useCallback(async () => {
    if (cryptoWallets.length > 0) return; // already loaded
    setCryptoLoading(true);
    try {
      const res = await fetch("/api/crypto-payment");
      const data = await res.json();
      if (data.success) setCryptoWallets(data.data.wallets);
    } catch (err) {
      console.error("Failed to fetch crypto wallets:", err);
    }
    setCryptoLoading(false);
  }, [cryptoWallets.length]);

  const handleNext = useCallback(() => {
    if (step === 1) {
      const errs = validatePassengerDetails(passengers, departDate, contactEmail, contactPhone);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }
    if (step === 3) {
      const errs = validatePaymentDetails(
        payMethod, cardName, cardNumber, cardExpiry, cardCVV, selectedWallet
      );
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }
    setStep((prev) => Math.min(prev + 1, 4) as StepNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, passengers, departDate, contactEmail, contactPhone, payMethod, cardName, cardNumber, cardExpiry, cardCVV, selectedWallet]);

  const handleBack = useCallback((toStep: StepNumber) => {
    setStep(toStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);


  /**
   * BOOKING CONFIRMATION
   *
   * KEY FIX: The original code ALWAYS declined card payments using
   * a rotating array of fake bank error messages, funneling ALL users
   * to cryptocurrency. This rewrite sends the actual payment method
   * to the server and processes the response honestly.
   *
   * Card payments go through the /api/bookings/create endpoint with
   * paymentMethod: "card". Crypto payments go through with
   * paymentMethod: "crypto" followed by a /api/crypto-payment call.
   *
   * If the server returns an error, we display it as-is rather than
   * fabricating decline messages.
   */
  const confirmBooking = useCallback(async () => {
    if (!user || !selectedFlight) return;
    setBookingLoading(true);
    setErrors({});

    try {
      const payload = {
        flightIds: [selectedFlight._id],
        passengers: passengers.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          dateOfBirth: p.dateOfBirth,
          nationality: p.nationality,
          passportNumber: p.passportNumber,
          passportExpiry: p.passportExpiry,
          mealPreference: p.mealPreference,
          specialRequests: p.specialRequests ? [p.specialRequests] : [],
          cabinClass: selectedClass,
          phone: p.phone,
        })),
        cabinClass: selectedClass,
        contactEmail,
        contactPhone,
        addOns,
        paymentMethod: payMethod,
      };

      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setErrors({ submit: data.error || "Booking failed. Please try again." });
        setBookingLoading(false);
        return;
      }

      // If crypto, initiate crypto payment record
      if (payMethod === "crypto" && selectedWallet && priceInfo) {
        try {
          const cryptoRes = await fetch("/api/crypto-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletId: selectedWallet._id,
              amountUSD: priceInfo.total,
              bookingReference: data.data.booking.bookingReference,
              flightDetails: {
                flightNumber: selectedFlight.flightNumber,
                from: selectedFlight.departure?.airportCode,
                to: selectedFlight.arrival?.airportCode,
                date: selectedFlight.departure?.scheduledTime,
                passengers: paxCount,
              },
            }),
          });
          const cryptoData = await cryptoRes.json();
          if (cryptoData.success) setCryptoPayResult(cryptoData.data.payment);
        } catch (err) {
          console.error("Crypto payment record failed:", err);
        }
      }

      setBookingResult(data.data.booking);
      setView("confirmation");
    } catch (err) {
      console.error("Booking failed:", err);
      setErrors({ submit: "Booking failed. Please check your connection and try again." });
    }

    setBookingLoading(false);
  }, [user, selectedFlight, passengers, selectedClass, contactEmail, contactPhone, addOns, payMethod, selectedWallet, priceInfo, paxCount]);


  // ━━━━━━━ RENDER ━━━━━━━

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* ── BOOKING FLOW ── */}
        {view === "booking" && selectedFlight && (
          <div>
            <button onClick={() => setView("results")} style={s.btnGhost}>
              ← Back to results
            </button>

            <StepProgress currentStep={step} />

            {/* Step 1: Passenger Details */}
            {step === 1 && (
              <div>
                <PassengerForm
                  passengers={passengers}
                  setPassengers={setPassengers}
                  contactEmail={contactEmail}
                  setContactEmail={setContactEmail}
                  contactPhone={contactPhone}
                  setContactPhone={setContactPhone}
                  errors={errors}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                  <button onClick={handleNext} style={s.btnPrimary()}>
                    Continue to Add-ons →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Add-ons */}
            {step === 2 && (
              <div>
                <div style={s.card()}>
                  <div style={s.heading()}>Flight Add-ons</div>
                  <div style={{ fontSize: 12, color: T.dim }}>
                    {/* Add-on options rendered here — seat selection, baggage, insurance, etc. */}
                    Add-on selection UI goes here.
                  </div>
                </div>
                <div style={s.rowBetween({ marginTop: 20 })}>
                  <button onClick={() => handleBack(1)} style={s.btnSecondary}>
                    ← Passenger Details
                  </button>
                  <button onClick={handleNext} style={s.btnPrimary()}>
                    Continue to Payment →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div>
                <div style={s.card()}>
                  <div style={s.heading()}>Payment Method</div>

                  <PaymentMethodToggle
                    payMethod={payMethod}
                    setPayMethod={setPayMethod}
                    onCryptoSelect={fetchCryptoWallets}
                  />

                  {payMethod === "card" && (
                    <CardPaymentForm
                      cardName={cardName} setCardName={setCardName}
                      cardNumber={cardNumber} setCardNumber={setCardNumber}
                      cardExpiry={cardExpiry} setCardExpiry={setCardExpiry}
                      cardCVV={cardCVV} setCardCVV={setCardCVV}
                      errors={errors}
                    />
                  )}

                  {payMethod === "crypto" && (
                    <CryptoPaymentForm
                      cryptoWallets={cryptoWallets}
                      cryptoLoading={cryptoLoading}
                      selectedWallet={selectedWallet}
                      setSelectedWallet={setSelectedWallet}
                      errors={errors}
                    />
                  )}
                </div>

                <div style={s.rowBetween({ marginTop: 20 })}>
                  <button onClick={() => handleBack(2)} style={s.btnSecondary}>
                    ← Add-ons
                  </button>
                  <button onClick={handleNext} style={s.btnPrimary()}>
                    Review Booking →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {step === 4 && (
              <div>
                {/* Price Summary */}
                {priceInfo && (
                  <div style={s.card({ borderColor: T.gold + "20" })}>
                    <div style={s.rowBetween({ flexWrap: "wrap", gap: 16 })}>
                      <div>
                        <div style={{ fontSize: 12, color: T.sub }}>Total Amount</div>
                        <div style={s.priceTag}>{fmtPrice(priceInfo.total)}</div>
                        <div style={{ fontSize: 11, color: T.dim }}>
                          {payMethod === "card"
                            ? `Card ending ${cardNumber.slice(-4)}`
                            : `Payment via ${selectedWallet?.symbol || "Crypto"}`}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: T.dim, marginBottom: 8 }}>
                          By confirming, you agree to SKYLUX Airways terms & conditions
                        </div>
                        <button
                          onClick={confirmBooking}
                          disabled={bookingLoading}
                          style={s.btnPrimary(bookingLoading)}
                        >
                          {bookingLoading ? "Processing Payment..." : "Confirm & Pay"}
                        </button>
                      </div>
                    </div>

                    {errors.submit && (
                      <div style={{ marginTop: 12 }}>
                        <PaymentError errorMessage={errors.submit} payMethod={payMethod} />
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 12 }}>
                  <button onClick={() => handleBack(3)} style={s.btnSecondary}>
                    ← Back to Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CONFIRMATION VIEW ── */}
        {view === "confirmation" && bookingResult && (
          <BookingConfirmation
            booking={bookingResult}
            flight={selectedFlight}
            priceInfo={priceInfo}
            payMethod={payMethod}
            selectedWallet={selectedWallet}
            cryptoPayResult={cryptoPayResult}
            passengers={passengers}
          />
        )}

        {/* ── MY BOOKINGS VIEW ── */}
        {view === "mybookings" && (
          <div>
            <div style={s.heading(18)}>My Bookings</div>
            {myBookings.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: T.dim }}>
                No bookings found.
              </div>
            )}
            {myBookings.map((b) => (
              <BookingListItem key={b._id} booking={b} flight={null} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}