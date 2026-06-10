// Business constants
export const BUSINESS = {
  name: "VELOX CARS",
  legalName: "VELOX CARS SARL",
  email: "contact@veloxcars.ma",
  phones: ["+212 6 68 35 39 49", "+212 6 32 00 50 07"],
  whatsapp: "+212 6 71 61 59 48",
  whatsappRaw: "212671615948", // for wa.me
  address: "Rue Al Amal, Tanger 90060, Morocco",
  googlePlusCode: "P5V6+86Q Tanger",
  gps: { lat: 35.742669, lng: -5.8415239 },
  rating: 4.7,
  reviewCount: 184,
  hours: "Sat-Thu 8:00-18:00",
  hoursDetailed: { fr: "Sam-Jeu · 8h00 – 18h00", en: "Sat-Thu · 8:00 AM – 6:00 PM", ar: "السبت-الخميس · 8:00 – 18:00" },
  instagram: "@Velox0cars",
  facebook: "VELOX CAR",
  serviceAreas: ["Tanger", "Tétouan", "Martil", "M'diq", "Fnideq", "Tanger Med", "Aéroport Ibn Battouta"],
} as const;

// FX rates (display only, actual billing in MAD)
export const FX = {
  EUR: 0.092, // 1 MAD = 0.092 EUR
  USD: 0.10,   // 1 MAD = 0.10 USD
} as const;

export const CURRENCY_SYMBOLS = {
  MAD: "MAD",
  EUR: "€",
  USD: "$",
} as const;

export type Currency = keyof typeof CURRENCY_SYMBOLS;
