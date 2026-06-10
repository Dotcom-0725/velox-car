export type Location = {
  id: string;
  name: { fr: string; en: string; ar: string };
  address: string;
  city: string;
  gps: { lat: number; lng: number };
  phone?: string;
  hours: { fr: string; en: string; ar: string };
  isAirport?: boolean;
  isPort?: boolean;
  isMain?: boolean;
  notes: { fr: string; en: string; ar: string };
  type: "office" | "airport" | "port" | "city" | "seasonal";
};

export const LOCATIONS: Location[] = [
  {
    id: "main-office",
    name: { fr: "VELOX CAR — Bureau Principal", en: "VELOX CAR — Main Office", ar: "فيلوكس كار — المكتب الرئيسي" },
    address: "Rue Al Amal, Tanger 90060",
    city: "Tanger",
    gps: { lat: 35.742669, lng: -5.8415239 },
    phone: "+212 6 68 35 39 49",
    hours: { fr: "Sam-Jeu · 8h00 – 18h00", en: "Sat-Thu · 8:00 AM – 6:00 PM", ar: "السبت-الخميس · 8:00 – 18:00" },
    isMain: true,
    notes: {
      fr: "Notre bureau principal au cœur de Tanger. Parking privé gratuit, accueil multilingue (AR/FR/EN).",
      en: "Our main office in the heart of Tangier. Free private parking, multilingual reception.",
      ar: "مكتبنا الرئيسي في قلب طنجة. موقف سيارات خاص مجاني، استقبال متعدد اللغات.",
    },
    type: "office",
  },
  {
    id: "tng-airport",
    name: { fr: "Aéroport Ibn Battouta (TNG)", en: "Ibn Battouta Airport (TNG)", ar: "مطار ابن بطوطة (TNG)" },
    address: "Boulevard des Forces Armées Royales, Tanger",
    city: "Tanger",
    gps: { lat: 35.7269, lng: -5.9169 },
    phone: "+212 6 77 16 02 64",
    hours: { fr: "7j/7 · 24h/24", en: "7 days · 24/7", ar: "7 أيام · 24/24" },
    isAirport: true,
    notes: {
      fr: "Livraison gratuite à l'aéroport. Navette VELOX disponible. Présentez votre réservation à l'arrivée.",
      en: "Free airport delivery. VELOX shuttle available. Show your booking upon arrival.",
      ar: "توصيل مجاني للمطار. خدمة shuttle متاحة. اعرض حجزك عند الوصول.",
    },
    type: "airport",
  },
  {
    id: "tanger-med",
    name: { fr: "Port Tanger Med", en: "Tanger Med Port", ar: "ميناء طنجة المتوسط" },
    address: "Tanger Med, Route de Rabat",
    city: "Tanger",
    gps: { lat: 35.8838, lng: -5.5119 },
    phone: "+212 6 32 00 50 07",
    hours: { fr: "Sur rendez-vous · 7j/7", en: "By appointment · 7 days", ar: "بموعد · 7 أيام" },
    isPort: true,
    notes: {
      fr: "Service Meet & Greet au port. Idéal pour les arrivées en ferry depuis l'Espagne.",
      en: "Meet & Greet service at the port. Perfect for ferry arrivals from Spain.",
      ar: "خدمة الاستقبال في الميناء. مثالية لوصول العبارات من إسبانيا.",
    },
    type: "port",
  },
  {
    id: "tetouan-airport",
    name: { fr: "Aéroport Saniat R'mel (TTU)", en: "Sania Ramel Airport (TTU)", ar: "مطار سانية الرمل (TTU)" },
    address: "Route de l'Aéroport, Tétouan",
    city: "Tétouan",
    gps: { lat: 35.5944, lng: -5.3203 },
    phone: "+212 6 71 61 59 48",
    hours: { fr: "7j/7 · Selon les vols", en: "7 days · Flight schedule", ar: "7 أيام · حسب جدول الرحلات" },
    isAirport: true,
    notes: {
      fr: "Livraison gratuite à l'aéroport de Tétouan. Présentez votre réservation à l'arrivée.",
      en: "Free delivery to Tetouan airport. Show your booking upon arrival.",
      ar: "توصيل مجاني لمطار تطوان. اعرض حجزك عند الوصول.",
    },
    type: "airport",
  },
  {
    id: "tanger-ville-port",
    name: { fr: "Port de Tanger Ville", en: "Tangier City Port", ar: "ميناء طنجة المدينة" },
    address: "Port de Tanger Ville, Tanger",
    city: "Tanger",
    gps: { lat: 35.7833, lng: -5.8167 },
    phone: "+212 6 71 61 59 48",
    hours: { fr: "7j/7 · Selon les ferries", en: "7 days · Ferry schedule", ar: "7 أيام · حسب جدول العبارات" },
    isPort: true,
    notes: {
      fr: "Service Meet & Greet au port. Idéal pour les arrivées en ferry depuis l'Espagne (Algésiras, Tarifa).",
      en: "Meet & Greet service at the port. Perfect for ferry arrivals from Spain (Algeciras, Tarifa).",
      ar: "خدمة الاستقبال في الميناء. مثالية لوصول العبارات من إسبانيا (الجزيرة الخضراء، طريفة).",
    },
    type: "port",
  },
  {
    id: "hotels",
    name: { fr: "Livraison Hôtels", en: "Hotel Delivery", ar: "توصيل الفنادق" },
    address: "Tous les hôtels de Tanger & région",
    city: "Tanger",
    gps: { lat: 35.7595, lng: -5.8340 },
    phone: "+212 6 68 35 39 49",
    hours: { fr: "Sur demande · 7j/7", en: "On request · 7 days", ar: "عند الطلب · 7 أيام" },
    notes: {
      fr: "Livraison à votre hôtel, riad ou Airbnb sur simple demande. Service gratuit à partir de 2 jours.",
      en: "Delivery to your hotel, riad or Airbnb on request. Free for stays of 2+ days.",
      ar: "التوصيل إلى فندقك أو رياضك أو Airbnb عند الطلب. مجاني للإقامة لمدة يومين أو أكثر.",
    },
    type: "city",
  },
];

export const getLocationById = (id: string) => LOCATIONS.find((l) => l.id === id);
