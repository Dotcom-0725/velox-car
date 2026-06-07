import { CURRENCY_SYMBOLS, Currency, FX } from "../data/info";

export const convertPrice = (mad: number, currency: Currency): number => {
  if (currency === "MAD") return mad;
  return Math.round(mad * FX[currency]);
};

export const formatPrice = (mad: number, currency: Currency = "MAD"): string => {
  const value = convertPrice(mad, currency);
  if (currency === "MAD") return `${value.toLocaleString()} MAD`;
  return `${CURRENCY_SYMBOLS[currency]}${value.toLocaleString()}`;
};

export const formatDate = (date: Date | string, locale: string = "fr-FR"): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
};

export const formatTime = (time: string): string => time;

export const daysBetween = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const isHighSeason = (date: Date): boolean => {
  const month = date.getMonth(); // 0-11
  // June (5) to September (8) inclusive
  return month >= 5 && month <= 8;
};

export const generateBookingRef = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `VELOX-${year}-${random}`;
};

export const cn = (...args: any[]) => {
  return args.filter(Boolean).join(" ");
};

// Google Maps embed URL
export const googleMapsEmbedUrl = (lat: number, lng: number, q?: string): string => {
  const query = q ? encodeURIComponent(q) : `${lat},${lng}`;
  return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};

export const googleMapsDirectionsUrl = (lat: number, lng: number): string => {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};

export const waLink = (message: string): string => {
  return `https://wa.me/212677160264?text=${encodeURIComponent(message)}`;
};

export const formatBookingMessage = (params: {
  reference: string;
  name: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  carModel: string;
  totalPrice: number;
}): string => {
  return `Bonjour VELOX CAR, je confirme ma réservation:
Référence: ${params.reference}
Nom: ${params.name}
Téléphone: ${params.phone}
Dates: ${params.pickupDate} → ${params.returnDate}
Lieu: ${params.pickupLocation}
Voiture: ${params.carModel}
Prix total: ${params.totalPrice} MAD
Documents: Permis + CIN/Passport prêts
Merci!`;
};
