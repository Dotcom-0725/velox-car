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
    id: "tetouan",
    name: { fr: "Tétouan Centre", en: "Tetouan Center", ar: "مركز تطوان" },
    address: "Avenue Mohammed V, Tétouan",
    city: "Tétouan",
    gps: { lat: 35.5784, lng: -5.3684 },
    phone: "+212 6 32 00 50 07",
    hours: { fr: "Sam-Jeu · 9h00 – 19h00", en: "Sat-Thu · 9:00 AM – 7:00 PM", ar: "السبت-الخميس · 9:00 – 19:00" },
    notes: {
      fr: "Point de remise en centre-ville de Tétouan. Appelez 30 min avant votre arrivée.",
      en: "Hand-over point in downtown Tetouan. Call 30 min before arrival.",
      ar: "نقطة تسليم في وسط تطوان. اتصل قبل 30 دقيقة من وصولك.",
    },
    type: "city",
  },
  {
    id: "martil",
    name: { fr: "Martil (Saisonnier)", en: "Martil (Seasonal)", ar: "مرتيل (موسمي)" },
    address: "Corniche de Martil",
    city: "Martil",
    gps: { lat: 35.6189, lng: -5.2756 },
    phone: "+212 6 77 16 02 64",
    hours: { fr: "Juin – Septembre", en: "June – September", ar: "يونيو – سبتمبر" },
    notes: {
      fr: "Service estival disponible de juin à septembre. Réservation à l'avance recommandée.",
      en: "Summer service from June to September. Advance booking recommended.",
      ar: "خدمة الصيف من يونيو إلى سبتمبر. الحجز المسبق موصى به.",
    },
    type: "seasonal",
  },
  {
    id: "mdiq",
    name: { fr: "M'diq (Saisonnier)", en: "M'diq (Seasonal)", ar: "المضيق (موسمي)" },
    address: "Marina de M'diq",
    city: "M'diq",
    gps: { lat: 35.6853, lng: -5.3325 },
    phone: "+212 6 77 16 02 64",
    hours: { fr: "Juin – Septembre", en: "June – September", ar: "يونيو – سبتمبر" },
    notes: {
      fr: "Livraison à la marina. Idéal pour les excursions côtières vers Fnideq et Ceuta.",
      en: "Marina delivery. Perfect for coastal trips to Fnideq and Ceuta.",
      ar: "التوصيل إلى المارينا. مثالي للرحلات الساحلية إلى الفنيدق وسبتة.",
    },
    type: "seasonal",
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
