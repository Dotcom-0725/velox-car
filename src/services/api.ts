// ============================================
// Shared API layer
// Used by both PUBLIC SITE and ADMIN DASHBOARD
// All reads/writes go through here so the two stay in sync.
// In production, swap these with real fetch() calls to your backend.
// ============================================
import { db, Booking, Customer, Notification, Review, BookingStatus } from "../admin/data/mockDb";
import { CARS, EXTRAS, getCarById, Car } from "../data/cars";
import { LOCATIONS, getLocationById } from "../data/locations";
import { BUSINESS } from "../data/info";
import { emit } from "./sync";
import { generateBookingRef, isHighSeason, daysBetween } from "../utils/format";

// ============================================
// Settings store (admin-editable; reflected on public site)
// ============================================
export type BusinessSettings = {
  name: string;
  email: string;
  phones: string[];
  whatsapp: string;
  whatsappRaw: string;
  address: string;
  hours: { fr: string; en: string; ar: string };
  instagram: string;
  facebook: string;
};

export type PricingRules = {
  highSeasonStart: string; // MM-DD
  highSeasonEnd: string;   // MM-DD
  weeklyDiscountPct: number;   // e.g. 10
  biweeklyDiscountPct: number; // e.g. 15
  extras: { id: string; pricePerDay: number }[];
  deposits: { economy: number; suv: number; luxury: number };
  minAge: number;
  minAgeLuxury: number;
  minLicenseYears: number;
};

const SETTINGS_KEY = "velox-admin-business-settings";
const PRICING_KEY = "velox-admin-pricing-rules";

const defaultSettings: BusinessSettings = {
  name: BUSINESS.name,
  email: BUSINESS.email,
  phones: [...BUSINESS.phones],
  whatsapp: BUSINESS.whatsapp,
  whatsappRaw: BUSINESS.whatsappRaw,
  address: BUSINESS.address,
  hours: { ...BUSINESS.hoursDetailed },
  instagram: BUSINESS.instagram,
  facebook: BUSINESS.facebook,
};

const defaultPricing: PricingRules = {
  highSeasonStart: "06-01",
  highSeasonEnd: "09-30",
  weeklyDiscountPct: 10,
  biweeklyDiscountPct: 15,
  extras: EXTRAS.map((e) => ({ id: e.id, pricePerDay: e.pricePerDay })),
  deposits: { economy: 3000, suv: 5000, luxury: 8000 },
  minAge: 21,
  minAgeLuxury: 25,
  minLicenseYears: 2,
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch { return fallback; }
}
function writeJSON<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ============================================
// CONTACT MESSAGES store
// ============================================
export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
};

const CONTACT_KEY = "velox-admin-contact-messages";
function getContactMessages(): ContactMessage[] { return readJSON<ContactMessage[]>(CONTACT_KEY, []); }
function saveContactMessages(list: ContactMessage[]) { writeJSON(CONTACT_KEY, list); }

// ============================================
// API surface — used by BOTH public and admin
// ============================================
export const api = {

  // ============ SETTINGS ============
  getBusinessSettings(): BusinessSettings {
    return readJSON(SETTINGS_KEY, defaultSettings);
  },
  updateBusinessSettings(patch: Partial<BusinessSettings>) {
    const next = { ...api.getBusinessSettings(), ...patch };
    writeJSON(SETTINGS_KEY, next);
    emit({ type: "settings:updated", payload: { section: "business" } });
    return next;
  },

  // ============ PRICING RULES ============
  getPricingRules(): PricingRules {
    const rules = readJSON(PRICING_KEY, defaultPricing);
    // Ensure extras array is consistent with default IDs
    const merged = { ...defaultPricing, ...rules };
    merged.extras = defaultPricing.extras.map((d) => {
      const found = rules.extras?.find((e) => e.id === d.id);
      return found ? { ...d, ...found } : d;
    });
    return merged;
  },
  updatePricingRules(patch: Partial<PricingRules>) {
    const next = { ...api.getPricingRules(), ...patch };
    writeJSON(PRICING_KEY, next);
    emit({ type: "pricing:updated", payload: {} });
    return next;
  },

  // ============ CARS ============
  /** Public-facing list of cars, filtered by status (only show non-disabled) */
  getPublicCars(): (Car & { status: string; available: boolean })[] {
    const records = db.getCarRecords();
    return CARS
      .map((car) => {
        const rec = records.find((r) => r.id === car.id);
        const status = rec?.status || "available";
        return { ...car, status, available: status === "available" || status === "rented" };
      })
      .filter((c) => c.status !== "unavailable"); // Hide truly unavailable cars
  },

  /** Check if car is available for the requested date range. */
  checkAvailability(carId: string, pickupDate: string, returnDate: string): { available: boolean; conflicts: number; reason?: string } {
    const records = db.getCarRecords();
    const rec = records.find((r) => r.id === carId);
    if (rec?.status === "maintenance") return { available: false, conflicts: 0, reason: "en maintenance" };
    if (rec?.status === "unavailable") return { available: false, conflicts: 0, reason: "indisponible" };

    const allBookings = db.getBookings();
    const conflicts = allBookings.filter((b) => {
      if (b.carId !== carId) return false;
      if (b.status === "cancelled" || b.status === "no-show") return false;
      const bStart = new Date(b.pickupDate).getTime();
      const bEnd = new Date(b.returnDate).getTime();
      const fStart = new Date(pickupDate).getTime();
      const fEnd = new Date(returnDate).getTime();
      return fStart < bEnd && fEnd > bStart;
    });
    return {
      available: conflicts.length === 0,
      conflicts: conflicts.length,
      reason: conflicts.length > 0 ? `${conflicts.length} réservation(s) sur ces dates` : undefined,
    };
  },

  /** Get all reserved date ranges for a car (used by public availability calendar) */
  getCarReservedRanges(carId: string): { start: string; end: string; status: BookingStatus }[] {
    return db.getBookings()
      .filter((b) => b.carId === carId && b.status !== "cancelled" && b.status !== "no-show")
      .map((b) => ({ start: b.pickupDate, end: b.returnDate, status: b.status }));
  },

  // ============ PRICING ============
  /** Calculate full pricing for a booking. Used by both wizard (public) and new-booking (admin). */
  calculatePrice(carId: string, pickupDate: string, returnDate: string, extrasSelected: Record<string, boolean>): {
    days: number; dailyRate: number; base: number; extrasTotal: number; discount: number; subtotal: number; total: number; deposit: number; isHighSeason: boolean;
  } {
    const car = getCarById(carId);
    const rules = api.getPricingRules();
    if (!car || !pickupDate || !returnDate) {
      return { days: 0, dailyRate: 0, base: 0, extrasTotal: 0, discount: 0, subtotal: 0, total: 0, deposit: rules.deposits.economy, isHighSeason: false };
    }
    const days = daysBetween(pickupDate, returnDate);
    const isHigh = isHighSeason(new Date(pickupDate));
    const dailyRate = isHigh ? car.priceHigh : car.priceLow;
    const base = dailyRate * days;

    const extrasPerDay = rules.extras.reduce((sum, e) => {
      const key = e.id === "gps" ? "gps" : e.id === "child-seat" ? "childSeat" : e.id === "additional-driver" ? "additionalDriver" : "fullInsurance";
      return extrasSelected[key] ? sum + e.pricePerDay : sum;
    }, 0);
    const extrasTotal = extrasPerDay * days;

    const subtotal = base + extrasTotal;
    const pct = days >= 14 ? rules.biweeklyDiscountPct : days >= 7 ? rules.weeklyDiscountPct : 0;
    const discount = Math.round((subtotal * pct) / 100);
    const total = subtotal - discount;
    const deposit =
      car.category === "luxury" ? rules.deposits.luxury :
      car.category === "suv" || car.category === "compact-suv" ? rules.deposits.suv :
      rules.deposits.economy;

    return { days, dailyRate, base, extrasTotal, discount, subtotal, total, deposit, isHighSeason: isHigh };
  },

  // ============ BOOKINGS (Public submission) ============
  /** Called from the public booking wizard. Creates customer + booking + notification. */
  submitPublicBooking(input: {
    fullName: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry: string;
    idType: "CIN" | "Passport";
    idNumber: string;
    notes: string;
    carId: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    pickupLocationId: string;
    returnLocationId: string;
    extras: { gps: boolean; childSeat: boolean; additionalDriver: boolean; fullInsurance: boolean };
  }): { booking: Booking; customer: Customer } {

    // Find existing customer by email or phone, or create new
    const customers = db.getCustomers();
    let customer = customers.find(
      (c) => c.email.toLowerCase() === input.email.toLowerCase() || c.phone === input.phone
    );
    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        licenseNumber: input.licenseNumber,
        licenseExpiry: input.licenseExpiry,
        idType: input.idType,
        idNumber: input.idNumber,
        country: "Maroc",
        city: "Tanger",
        totalBookings: 0,
        totalSpent: 0,
        blacklisted: false,
        vip: false,
        notes: "",
        createdAt: new Date().toISOString().split("T")[0],
      };
      db.upsertCustomer(customer);
    } else {
      // Update license/ID if customer provided new ones
      customer = {
        ...customer,
        fullName: input.fullName || customer.fullName,
        licenseNumber: input.licenseNumber || customer.licenseNumber,
        licenseExpiry: input.licenseExpiry || customer.licenseExpiry,
        idNumber: input.idNumber || customer.idNumber,
      };
      db.upsertCustomer(customer);
    }

    // Calculate price using current rules
    const pricing = api.calculatePrice(input.carId, input.pickupDate, input.returnDate, input.extras as any);
    const car = getCarById(input.carId);

    const booking: Booking = {
      id: `bk-${Date.now()}`,
      reference: generateBookingRef(),
      customerId: customer.id,
      carId: input.carId,
      pickupDate: input.pickupDate,
      pickupTime: input.pickupTime,
      returnDate: input.returnDate,
      returnTime: input.returnTime,
      pickupLocationId: input.pickupLocationId,
      returnLocationId: input.returnLocationId,
      basePrice: pricing.base,
      extrasPrice: pricing.extrasTotal,
      discount: pricing.discount,
      totalPrice: pricing.total,
      deposit: pricing.deposit,
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: "",
      paidAmount: 0,
      extras: input.extras,
      notes: input.notes,
      internalNotes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "website",
    };
    db.upsertBooking(booking);

    // Activity log
    db.addLog({
      userId: "public",
      userName: "Site web",
      action: "BOOKING_CREATED",
      entity: "Booking",
      entityId: booking.id,
      details: `${booking.reference} via site web - ${customer.fullName}`,
    });

    // Push notification to admin
    api.pushNotification({
      type: "booking",
      title: "Nouvelle réservation 🎉",
      message: `${booking.reference} · ${customer.fullName} · ${car ? `${car.make} ${car.model}` : ""}`,
      link: `/admin/bookings/${booking.id}`,
    });

    // Emit real-time event
    emit({
      type: "booking:created",
      payload: {
        id: booking.id,
        reference: booking.reference,
        customerName: customer.fullName,
        carModel: car ? `${car.make} ${car.model}` : "",
        total: booking.totalPrice,
      },
    });

    return { booking, customer };
  },

  // ============ CONTACT MESSAGES ============
  submitContactMessage(input: { name: string; email: string; phone: string; subject: string; message: string }): ContactMessage {
    const msg: ContactMessage = {
      id: `msg-${Date.now()}`,
      ...input,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    const all = getContactMessages();
    all.unshift(msg);
    saveContactMessages(all);

    api.pushNotification({
      type: "alert",
      title: "Nouveau message de contact ✉️",
      message: `${input.name} · ${input.subject}`,
      link: "/admin/messages",
    });

    db.addLog({
      userId: "public", userName: "Site web",
      action: "CONTACT_SUBMITTED", entity: "Contact",
      details: `${input.name} · ${input.subject}`,
    });

    emit({ type: "contact:received", payload: { id: msg.id, name: input.name, subject: input.subject } });
    return msg;
  },
  getContactMessages,
  updateContactMessage(id: string, patch: Partial<ContactMessage>) {
    const all = getContactMessages();
    const idx = all.findIndex((m) => m.id === id);
    if (idx >= 0) { all[idx] = { ...all[idx], ...patch }; saveContactMessages(all); }
  },
  deleteContactMessage(id: string) {
    saveContactMessages(getContactMessages().filter((m) => m.id !== id));
  },

  // ============ REVIEWS ============
  /** Only return approved reviews (used by public site) */
  getPublicReviews(): Review[] {
    return db.getReviews().filter((r) => r.approved).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  /** Average rating from approved reviews + Google's seed rating */
  getPublicAverageRating(): { rating: number; count: number } {
    const approved = db.getReviews().filter((r) => r.approved);
    if (approved.length === 0) return { rating: BUSINESS.rating, count: BUSINESS.reviewCount };
    // Blend with Google baseline so it stays believable
    const seedWeight = BUSINESS.reviewCount;
    const seedSum = BUSINESS.rating * seedWeight;
    const newSum = approved.reduce((s, r) => s + r.rating, 0);
    const total = seedSum + newSum;
    const count = seedWeight + approved.length;
    return { rating: Math.round((total / count) * 10) / 10, count };
  },
  /** Submit a customer review (from public site). Awaits admin approval. */
  submitReview(input: { customerName: string; rating: number; comment: string; carId?: string }): Review {
    const review: Review = {
      id: `rev-${Date.now()}`,
      customerId: "public",
      customerName: input.customerName,
      carId: input.carId,
      rating: input.rating,
      comment: input.comment,
      approved: false,
      source: "site",
      createdAt: new Date().toISOString().split("T")[0],
    };
    const all = db.getReviews();
    all.unshift(review);
    db.saveReviews(all);

    api.pushNotification({
      type: "review",
      title: "Nouvel avis client ⭐",
      message: `${input.customerName} · ${input.rating}/5`,
      link: "/admin/reviews",
    });
    emit({ type: "review:submitted", payload: { id: review.id, name: input.customerName, rating: input.rating } });
    return review;
  },

  // ============ LOCATIONS ============
  getPublicLocations() { return LOCATIONS; },
  getLocation(id: string) { return getLocationById(id); },

  // ============ NOTIFICATIONS ============
  pushNotification(input: { type: Notification["type"]; title: string; message: string; link?: string }): Notification {
    const notif: Notification = {
      id: `n-${Date.now()}`,
      ...input,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const all = db.getNotifications();
    all.unshift(notif);
    db.saveNotifications(all.slice(0, 100));
    return notif;
  },

  // ============ BOOKING STATUS TRACKING (Public lookup) ============
  /** Public tracking — customer can look up their booking by reference */
  trackBooking(reference: string, phone?: string): { booking: Booking | null; customer: Customer | null; car: Car | null } {
    const booking = db.getBookings().find((b) => b.reference.toUpperCase() === reference.toUpperCase());
    if (!booking) return { booking: null, customer: null, car: null };
    const customer = db.getCustomers().find((c) => c.id === booking.customerId) || null;
    // If phone given, verify it matches (security)
    if (phone && customer && customer.phone.replace(/\D/g, "") !== phone.replace(/\D/g, "")) {
      return { booking: null, customer: null, car: null };
    }
    return { booking, customer, car: getCarById(booking.carId) || null };
  },
};
