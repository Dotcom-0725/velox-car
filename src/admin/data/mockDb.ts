// ============================================
// Mock Database — localStorage backed
// Simulates Prisma models for VELOX CAR admin
// ============================================
import { CARS } from "../../data/cars";
import { LOCATIONS } from "../../data/locations";

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled" | "no-show";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type PaymentMethod = "cash" | "card" | "transfer" | "";

export type Booking = {
  id: string;
  reference: string;
  customerId: string;
  carId: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupLocationId: string;
  returnLocationId: string;
  basePrice: number;
  extrasPrice: number;
  discount: number;
  totalPrice: number;
  deposit: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  extras: { gps: boolean; childSeat: boolean; additionalDriver: boolean; fullInsurance: boolean };
  notes: string;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  pickedUpAt?: string;
  returnedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  source: "website" | "phone" | "whatsapp" | "walk-in";
};

export type Customer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  idType: "CIN" | "Passport";
  idNumber: string;
  country: string;
  city: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: string;
  blacklisted: boolean;
  blacklistReason?: string;
  vip: boolean;
  notes: string;
  createdAt: string;
};

export type CarRecord = {
  id: string;
  status: "available" | "rented" | "maintenance" | "unavailable";
  mileage: number;
  immatriculation: string; // Plaque d'immatriculation marocaine ex: 12345-A-1
  lastServiceDate: string;
  nextServiceMileage: number;
  internalNotes: string;
};

// ============== CONTRACT ==============
export type Contract = {
  id: string;
  contractNumber: string;        // ex: "000046"
  bookingId?: string;            // lien optionnel vers réservation
  // Véhicule
  carId: string;
  immatriculation: string;
  // Lieux
  lieuLivraison: string;
  lieuReprise: string;
  // Kilométrage
  kmDepart: number;
  kmRetour: number;
  // Dates précises
  departJour: string; departMois: string; departAnnee: string; departHeure: string; departMinute: string;
  retourJour: string; retourMois: string; retourAnnee: string; retourHeure: string; retourMinute: string;
  retourDefJour: string; retourDefMois: string; retourDefAnnee: string; retourDefHeure: string; retourDefMinute: string;
  dureeJours: number;
  // Locataire (principal)
  locataireNom: string;
  locataireDateNaissance: string;
  locataireAdresseMaroc: string;
  locataireAdresseEtranger: string;
  locataireProfession: string;
  locatairePermisNum: string;
  locatairePermisDelivreLe: string;
  locataireCinPassport: string;
  locataireCinPassportDelivreLe: string;
  locataireTel: string;
  // Conducteur supplémentaire (optionnel)
  conducteurNom: string;
  conducteurPermisNum: string;
  conducteurPermisDelivreLe: string;
  conducteurPassportNum: string;
  // État voiture / Dommages
  etatDommage: boolean;
  commentaires: { num: number; description: string }[];
  // Paiement
  prepaiement: number;
  modePaiement: "especes" | "cheque" | "virement" | "";
  total: number;
  avance: number;
  reste: number;
  observation: string;
  // Métadonnées
  faitA: string;
  faitLe: string;
  signatureClient: boolean;
  createdAt: string;
  createdBy: string;
  // Tracking & lifecycle
  status?: "draft" | "active" | "extended" | "completed" | "cancelled";
  updatedAt?: string;
  updatedBy?: string;
  // History of changes
  history?: ContractHistoryEntry[];
  // Extension tracking
  originalReturnDate?: string;
  extensions?: ContractExtension[];
  // Attached scanned documents
  attachedDocuments?: AttachedDocument[];
};

export type AttachedDocument = {
  id: string;
  type: "cin-recto" | "cin-verso" | "license" | "license-verso" | "passport" | "other";
  filename: string;
  mimeType: string;
  dataUrl: string;      // base64 data URL for persistence
  uploadedAt: string;
  uploadedBy: string;
  sizeBytes: number;
  ocrExtracted?: boolean;
  ocrConfidence?: number;
};

export type ContractHistoryEntry = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: "created" | "modified" | "extended" | "completed" | "cancelled" | "printed" | "sent";
  changes?: { field: string; oldValue: any; newValue: any }[];
  note?: string;
};

export type ContractExtension = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  previousReturnDate: string;
  previousReturnTime: string;
  newReturnDate: string;
  newReturnTime: string;
  additionalDays: number;
  additionalAmount: number;
  reason: string;
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  password: string; // hashed in real app
  role: "super-admin" | "manager" | "staff";
  active: boolean;
  lastLogin?: string;
  createdAt: string;
};

export type ActivityLog = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  timestamp: string;
  ip?: string;
};

export type Notification = {
  id: string;
  type: "booking" | "payment" | "review" | "alert" | "system";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
};

export type Review = {
  id: string;
  customerId: string;
  customerName: string;
  carId?: string;
  rating: number;
  comment: string;
  approved: boolean;
  reply?: string;
  source: "google" | "site" | "facebook";
  createdAt: string;
};

export type MessageTemplate = {
  id: string;
  name: string;
  category: "confirmation" | "reminder" | "thank-you" | "review" | "promo";
  body: string;
  active: boolean;
};

// ============================================
// Storage helpers
// ============================================
const PREFIX = "velox-admin-";
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
}

// ============================================
// Seed data generators
// ============================================
const FIRST_NAMES = ["Youssef", "Mohamed", "Karim", "Sarah", "Emma", "Pierre", "Aicha", "Fatima", "Hassan", "Omar", "Laura", "Khalid", "Imane", "Rachid", "Yasmine", "Driss", "Nadia", "Anas", "Zineb", "Tariq"];
const LAST_NAMES = ["El Amrani", "Bennani", "Idrissi", "Müller", "Thompson", "Dubois", "Alaoui", "Benali", "Tazi", "Berrada", "Cherkaoui", "Fassi", "Hakim", "Naciri", "Sefrioui"];
// CITIES list available in customer seed inline

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateRef(year: number): string {
  return `VELOX-${year}-${String(randInt(1000, 9999))}`;
}

function dateAdd(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function isoDate(d: Date): string { return d.toISOString().split("T")[0]; }

function seedCustomers(): Customer[] {
  const customers: Customer[] = [];
  for (let i = 0; i < 35; i++) {
    const fn = rand(FIRST_NAMES);
    const ln = rand(LAST_NAMES);
    const isMoroccan = Math.random() > 0.4;
    customers.push({
      id: `cust-${i + 1}`,
      fullName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/\s/g, "")}@${rand(["gmail.com", "outlook.com", "yahoo.fr", "hotmail.com"])}`,
      phone: isMoroccan ? `+212 6${randInt(10000000, 99999999)}` : `+33 ${randInt(100000000, 999999999)}`,
      licenseNumber: `${rand(["A", "B", "AB"])}${randInt(100000, 999999)}`,
      licenseExpiry: isoDate(dateAdd(new Date(), randInt(365, 2000))),
      idType: isMoroccan ? "CIN" : "Passport",
      idNumber: isMoroccan ? `${rand(["K", "BE", "TK"])}${randInt(100000, 999999)}` : `${rand(["FR", "GB", "DE"])}${randInt(10000000, 99999999)}`,
      country: isMoroccan ? "Maroc" : rand(["France", "Espagne", "Royaume-Uni", "Allemagne"]),
      city: isMoroccan ? rand(["Tanger", "Tétouan", "Casablanca", "Rabat"]) : rand(["Paris", "Madrid", "London", "Berlin"]),
      totalBookings: 0,
      totalSpent: 0,
      blacklisted: i === 7 || i === 18,
      blacklistReason: i === 7 ? "Retard répété de paiement" : i === 18 ? "Dégradation véhicule non déclarée" : undefined,
      vip: i < 4,
      notes: i < 4 ? "Client fidèle, applique tarif VIP -10%" : "",
      createdAt: isoDate(dateAdd(new Date(), -randInt(30, 800))),
    });
  }
  return customers;
}

function seedBookings(customers: Customer[]): Booking[] {
  const bookings: Booking[] = [];
  const now = new Date();

  // Past bookings (completed)
  for (let i = 0; i < 45; i++) {
    const cust = rand(customers);
    const car = rand(CARS);
    const startOffset = -randInt(2, 220);
    const duration = randInt(2, 14);
    const start = dateAdd(now, startOffset);
    const end = dateAdd(start, duration);
    const isHigh = start.getMonth() >= 5 && start.getMonth() <= 8;
    const dailyRate = isHigh ? car.priceHigh : car.priceLow;
    const basePrice = dailyRate * duration;
    const extrasPrice = randInt(0, 3) * 50 * duration;
    const discount = duration >= 7 ? basePrice * 0.1 : 0;
    const totalPrice = Math.round(basePrice + extrasPrice - discount);
    const isCancelled = Math.random() < 0.1;
    const isNoShow = !isCancelled && Math.random() < 0.05;
    const status: BookingStatus = isCancelled ? "cancelled" : isNoShow ? "no-show" : "completed";
    bookings.push({
      id: `bk-${i + 1}`,
      reference: generateRef(start.getFullYear()),
      customerId: cust.id,
      carId: car.id,
      pickupDate: isoDate(start),
      pickupTime: rand(["09:00", "10:00", "14:00", "16:00"]),
      returnDate: isoDate(end),
      returnTime: rand(["10:00", "12:00", "18:00"]),
      pickupLocationId: rand(LOCATIONS).id,
      returnLocationId: rand(LOCATIONS).id,
      basePrice,
      extrasPrice,
      discount: Math.round(discount),
      totalPrice,
      deposit: car.category === "luxury" ? 8000 : car.category === "suv" ? 5000 : 3000,
      status,
      paymentStatus: status === "cancelled" || status === "no-show" ? "unpaid" : "paid",
      paymentMethod: status === "completed" ? rand(["cash", "card", "transfer"] as const) : "",
      paidAmount: status === "completed" ? totalPrice : 0,
      extras: {
        gps: Math.random() > 0.6,
        childSeat: Math.random() > 0.85,
        additionalDriver: Math.random() > 0.75,
        fullInsurance: Math.random() > 0.7,
      },
      notes: "",
      internalNotes: status === "no-show" ? "Client ne s'est jamais présenté" : "",
      createdAt: isoDate(dateAdd(start, -randInt(1, 14))),
      updatedAt: isoDate(end),
      confirmedAt: isCancelled ? undefined : isoDate(dateAdd(start, -randInt(0, 7))),
      pickedUpAt: status === "completed" ? isoDate(start) : undefined,
      returnedAt: status === "completed" ? isoDate(end) : undefined,
      cancelledAt: isCancelled ? isoDate(dateAdd(start, -randInt(1, 5))) : undefined,
      cancelReason: isCancelled ? rand(["Annulation client", "Vol annulé", "Changement de plans"]) : undefined,
      source: rand(["website", "phone", "whatsapp", "walk-in"] as const),
    });
  }

  // Current active bookings
  for (let i = 0; i < 4; i++) {
    const cust = rand(customers);
    const car = rand(CARS);
    const start = dateAdd(now, -randInt(1, 5));
    const end = dateAdd(now, randInt(1, 7));
    const duration = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    const dailyRate = car.priceLow;
    const basePrice = dailyRate * duration;
    const totalPrice = basePrice + randInt(0, 2) * 50 * duration;
    bookings.push({
      id: `bk-active-${i + 1}`,
      reference: generateRef(now.getFullYear()),
      customerId: cust.id,
      carId: car.id,
      pickupDate: isoDate(start),
      pickupTime: "10:00",
      returnDate: isoDate(end),
      returnTime: "10:00",
      pickupLocationId: "main-office",
      returnLocationId: "main-office",
      basePrice,
      extrasPrice: totalPrice - basePrice,
      discount: 0,
      totalPrice,
      deposit: car.category === "luxury" ? 8000 : 5000,
      status: "active",
      paymentStatus: "paid",
      paymentMethod: "cash",
      paidAmount: totalPrice,
      extras: { gps: true, childSeat: false, additionalDriver: false, fullInsurance: i < 2 },
      notes: "",
      internalNotes: "",
      createdAt: isoDate(dateAdd(start, -3)),
      updatedAt: isoDate(start),
      confirmedAt: isoDate(dateAdd(start, -2)),
      pickedUpAt: isoDate(start),
      source: rand(["website", "phone", "whatsapp"] as const),
    });
  }

  // Upcoming bookings (pending + confirmed)
  for (let i = 0; i < 12; i++) {
    const cust = rand(customers);
    const car = rand(CARS);
    const startOffset = randInt(1, 30);
    const duration = randInt(2, 10);
    const start = dateAdd(now, startOffset);
    const end = dateAdd(start, duration);
    const dailyRate = car.priceLow;
    const basePrice = dailyRate * duration;
    const totalPrice = basePrice + (i % 3 === 0 ? 50 * duration : 0);
    const status: BookingStatus = i < 5 ? "pending" : "confirmed";
    bookings.push({
      id: `bk-upcoming-${i + 1}`,
      reference: generateRef(start.getFullYear()),
      customerId: cust.id,
      carId: car.id,
      pickupDate: isoDate(start),
      pickupTime: rand(["09:00", "10:00", "14:00", "16:00"]),
      returnDate: isoDate(end),
      returnTime: rand(["10:00", "12:00", "18:00"]),
      pickupLocationId: rand(LOCATIONS).id,
      returnLocationId: rand(LOCATIONS).id,
      basePrice,
      extrasPrice: totalPrice - basePrice,
      discount: 0,
      totalPrice,
      deposit: car.category === "luxury" ? 8000 : 5000,
      status,
      paymentStatus: "unpaid",
      paymentMethod: "",
      paidAmount: 0,
      extras: { gps: i % 2 === 0, childSeat: false, additionalDriver: false, fullInsurance: false },
      notes: i === 0 ? "Client demande livraison hôtel" : "",
      internalNotes: "",
      createdAt: isoDate(dateAdd(now, -randInt(0, 5))),
      updatedAt: isoDate(now),
      confirmedAt: status === "confirmed" ? isoDate(dateAdd(now, -randInt(0, 3))) : undefined,
      source: rand(["website", "whatsapp"] as const),
    });
  }

  // Compute customer aggregates
  customers.forEach((c) => {
    const userBookings = bookings.filter((b) => b.customerId === c.id);
    c.totalBookings = userBookings.length;
    c.totalSpent = userBookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.totalPrice, 0);
    const last = userBookings.sort((a, b) => b.pickupDate.localeCompare(a.pickupDate))[0];
    c.lastBookingDate = last?.pickupDate;
  });

  return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function seedCarRecords(): CarRecord[] {
  // Real-style Moroccan plates (format: 12345-A-1)
  const plates = ["12345-A-1", "54321-B-1", "98765-D-7", "11223-A-4", "77889-B-2", "33445-C-3", "66778-A-8"];
  return CARS.map((c, i) => ({
    id: c.id,
    status: i === 3 ? "maintenance" : "available", // Logan in maintenance
    mileage: randInt(5000, 50000),
    immatriculation: plates[i] || `${randInt(10000, 99999)}-A-${randInt(1, 9)}`,
    lastServiceDate: isoDate(dateAdd(new Date(), -randInt(15, 90))),
    nextServiceMileage: randInt(60000, 80000),
    internalNotes: i === 3 ? "Vidange + révision freins prévue le 20" : "",
  }));
}

function seedActivityLog(bookings: Booking[]): ActivityLog[] {
  const logs: ActivityLog[] = [];
  const actions = [
    { action: "BOOKING_CREATED", entity: "Booking" },
    { action: "BOOKING_CONFIRMED", entity: "Booking" },
    { action: "BOOKING_CANCELLED", entity: "Booking" },
    { action: "PAYMENT_RECEIVED", entity: "Booking" },
    { action: "CAR_STATUS_CHANGED", entity: "Car" },
    { action: "USER_LOGIN", entity: "Auth" },
  ];
  for (let i = 0; i < 60; i++) {
    const a = rand(actions);
    const bk = rand(bookings);
    logs.push({
      id: `log-${i + 1}`,
      userId: rand(["u-1", "u-2", "u-3"]),
      userName: rand(["Admin VELOX", "Karim Manager", "Fatima Staff"]),
      action: a.action,
      entity: a.entity,
      entityId: bk.id,
      details: a.action === "USER_LOGIN" ? "Connexion réussie" : `Réservation ${bk.reference}`,
      timestamp: new Date(Date.now() - randInt(0, 30 * 86400000)).toISOString(),
      ip: `196.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(0, 255)}`,
    });
  }
  return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

function seedNotifications(): Notification[] {
  return [
    { id: "n1", type: "booking", title: "Nouvelle réservation", message: "VELOX-2026-4521 - Dacia Duster - Youssef El Amrani", read: false, link: "/admin/bookings", createdAt: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: "n2", type: "payment", title: "Paiement reçu", message: "1 200 MAD - Peugeot 208 - Sarah Müller", read: false, link: "/admin/bookings", createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: "n3", type: "alert", title: "Voiture en maintenance", message: "Dacia Sandero - Révision programmée", read: false, link: "/admin/cars", createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: "n4", type: "review", title: "Nouvel avis Google", message: "5 étoiles de Pierre Dubois", read: true, link: "/admin/reviews", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "n5", type: "booking", title: "Annulation reçue", message: "VELOX-2026-3308 - Renault Captur", read: true, link: "/admin/bookings", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  ];
}

function seedReviews(customers: Customer[]): Review[] {
  const samples = [
    { rating: 5, comment: "Service impeccable ! Voiture neuve, livraison à l'aéroport parfaite.", source: "google" as const, approved: true },
    { rating: 5, comment: "Excellent rapport qualité-prix. Équipe très professionnelle.", source: "google" as const, approved: true },
    { rating: 4, comment: "Bon service, voiture propre. Léger retard au comptoir.", source: "site" as const, approved: true },
    { rating: 5, comment: "Réservation WhatsApp ultra simple. La meilleure agence de Tanger.", source: "google" as const, approved: true },
    { rating: 5, comment: "Parfait pour un voyage d'affaires. Facture conforme, pas de frais cachés.", source: "facebook" as const, approved: true },
    { rating: 3, comment: "Voiture correcte mais attente longue à la livraison.", source: "site" as const, approved: false },
    { rating: 5, comment: "Service 7j/7 confirmé ! Sérieux et fiable.", source: "google" as const, approved: false },
  ];
  return samples.map((s, i) => {
    const c = customers[i];
    return {
      id: `rev-${i + 1}`,
      customerId: c.id,
      customerName: c.fullName,
      carId: rand(CARS).id,
      rating: s.rating,
      comment: s.comment,
      approved: s.approved,
      reply: i === 0 ? "Merci pour votre confiance ! À bientôt sur les routes du Maroc." : undefined,
      source: s.source,
      createdAt: isoDate(dateAdd(new Date(), -randInt(5, 90))),
    };
  });
}

function seedTemplates(): MessageTemplate[] {
  return [
    { id: "t1", name: "Confirmation de réservation", category: "confirmation", body: "Bonjour {nom}, votre réservation {ref} est confirmée ! Voiture: {voiture}. Dates: {pickup} → {return}. Lieu: {lieu}. À bientôt chez VELOX CAR 🚗", active: true },
    { id: "t2", name: "Rappel prise en charge (24h avant)", category: "reminder", body: "Bonjour {nom}, rappel : votre prise en charge est prévue demain à {heure} au {lieu}. Pensez à apporter votre permis + CIN/passeport. À demain ! - VELOX CAR", active: true },
    { id: "t3", name: "Rappel restitution (24h avant)", category: "reminder", body: "Bonjour {nom}, votre restitution est prévue demain à {heure} au {lieu}. Merci de restituer le véhicule avec le plein. À demain ! - VELOX CAR", active: true },
    { id: "t4", name: "Remerciement après location", category: "thank-you", body: "Bonjour {nom}, merci d'avoir choisi VELOX CAR ! Nous espérons que votre expérience a été à la hauteur de vos attentes. À très bientôt !", active: true },
    { id: "t5", name: "Demande d'avis Google", category: "review", body: "Bonjour {nom}, votre avis compte pour nous ! Pourriez-vous laisser une note Google ? https://g.page/r/velox-cars/review Merci infiniment 🙏", active: true },
    { id: "t6", name: "Promotion week-end", category: "promo", body: "🎉 Offre VELOX CAR : -20% sur toutes les réservations week-end ce mois-ci ! Réservez vite : wa.me/212671615948", active: true },
  ];
}

function seedAdminUsers(): AdminUser[] {
  return [
    { id: "u-1", email: "admin@veloxcars.ma", fullName: "Admin VELOX", password: "velox2026", role: "super-admin", active: true, lastLogin: new Date().toISOString(), createdAt: "2024-01-15" },
    { id: "u-2", email: "karim@veloxcars.ma", fullName: "Karim Manager", password: "karim2026", role: "manager", active: true, lastLogin: new Date(Date.now() - 2 * 86400000).toISOString(), createdAt: "2024-03-10" },
    { id: "u-3", email: "fatima@veloxcars.ma", fullName: "Fatima Staff", password: "fatima2026", role: "staff", active: true, lastLogin: new Date(Date.now() - 5 * 86400000).toISOString(), createdAt: "2024-06-22" },
  ];
}

// ============================================
// Public DB API
// ============================================
export const db = {
  init() {
    // Bump version to force reseed when fleet/schema changes
    const SCHEMA_VERSION = "v2-7cars";
    const currentVersion = load<string>("schema-version", "");
    if (currentVersion === SCHEMA_VERSION) return;
    // Clear stale data referencing old car IDs
    save("carRecords", []);
    save("bookings", []);
    save("schema-version", SCHEMA_VERSION);
    const customers = seedCustomers();
    const bookings = seedBookings(customers);
    const carRecords = seedCarRecords();
    const logs = seedActivityLog(bookings);
    const notifications = seedNotifications();
    const reviews = seedReviews(customers);
    const templates = seedTemplates();
    const users = seedAdminUsers();
    save("customers", customers);
    save("bookings", bookings);
    save("carRecords", carRecords);
    save("logs", logs);
    save("notifications", notifications);
    save("reviews", reviews);
    save("templates", templates);
    save("users", users);
    save("initialized", true);
  },
  reset() {
    save("initialized", false);
    this.init();
  },

  // Bookings
  getBookings(): Booking[] { return load("bookings", []); },
  saveBookings(b: Booking[]) { save("bookings", b); },
  upsertBooking(booking: Booking) {
    const all = this.getBookings();
    const idx = all.findIndex((b) => b.id === booking.id);
    if (idx >= 0) all[idx] = booking;
    else all.unshift(booking);
    this.saveBookings(all);
  },
  deleteBooking(id: string) {
    const all = this.getBookings().filter((b) => b.id !== id);
    this.saveBookings(all);
  },

  // Customers
  getCustomers(): Customer[] { return load("customers", []); },
  saveCustomers(c: Customer[]) { save("customers", c); },
  upsertCustomer(c: Customer) {
    const all = this.getCustomers();
    const idx = all.findIndex((x) => x.id === c.id);
    if (idx >= 0) all[idx] = c;
    else all.unshift(c);
    this.saveCustomers(all);
  },

  // Cars
  getCarRecords(): CarRecord[] { return load("carRecords", []); },
  saveCarRecords(c: CarRecord[]) { save("carRecords", c); },

  // Users
  getUsers(): AdminUser[] { return load("users", []); },
  saveUsers(u: AdminUser[]) { save("users", u); },

  // Logs
  getLogs(): ActivityLog[] { return load("logs", []); },
  addLog(log: Omit<ActivityLog, "id" | "timestamp">) {
    const all = this.getLogs();
    all.unshift({ ...log, id: `log-${Date.now()}`, timestamp: new Date().toISOString() });
    save("logs", all.slice(0, 500));
  },

  // Notifications
  getNotifications(): Notification[] { return load("notifications", []); },
  saveNotifications(n: Notification[]) { save("notifications", n); },

  // Reviews
  getReviews(): Review[] { return load("reviews", []); },
  saveReviews(r: Review[]) { save("reviews", r); },

  // Templates
  getTemplates(): MessageTemplate[] { return load("templates", []); },
  saveTemplates(t: MessageTemplate[]) { save("templates", t); },

  // Contracts
  getContracts(): Contract[] { return load("contracts", []); },
  saveContracts(c: Contract[]) { save("contracts", c); },
  getContract(id: string): Contract | undefined {
    return this.getContracts().find((c) => c.id === id);
  },
  upsertContract(c: Contract) {
    const all = this.getContracts();
    const idx = all.findIndex((x) => x.id === c.id);
    if (idx >= 0) all[idx] = c;
    else all.unshift(c);
    this.saveContracts(all);
  },
  deleteContract(id: string) {
    const all = this.getContracts().filter((c) => c.id !== id);
    this.saveContracts(all);
  },
  getNextContractNumber(): string {
    const all = this.getContracts();
    const nums = all.map((c) => parseInt(c.contractNumber, 10)).filter((n) => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 45; // Start at 46 like the paper sample
    return String(max + 1).padStart(6, "0");
  },
};

// Initialize on import
if (typeof window !== "undefined") {
  db.init();
}
