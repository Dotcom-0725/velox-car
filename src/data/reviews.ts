export type Review = {
  name: string;
  initials: string;
  rating: number;
  date: string;
  text: { fr: string; en: string; ar: string };
  source: "google" | "tripadvisor" | "facebook";
  verified: boolean;
};

export const REVIEWS: Review[] = [
  {
    name: "Youssef El Amrani",
    initials: "YA",
    rating: 5,
    date: "2025-09-12",
    text: {
      fr: "Service impeccable ! Voiture neuve, livraison à l'aéroport parfaite. Je recommande VELOX CAR à 100%.",
      en: "Impeccable service! Brand new car, perfect airport delivery. I recommend VELOX CAR 100%.",
      ar: "خدمة لا تشوبها شائبة! سيارة جديدة، توصيل مثالي للمطار. أنصح بفيلوكس كار 100%.",
    },
    source: "google",
    verified: true,
  },
  {
    name: "Sarah Müller",
    initials: "SM",
    rating: 5,
    date: "2025-08-28",
    text: {
      fr: "Excellent rapport qualité-prix. Le Peugeot 3008 était parfait pour notre road trip Tanger-Chéfchaouen. Équipe très professionnelle.",
      en: "Excellent value for money. The Peugeot 3008 was perfect for our Tangier-Chefchaouen road trip. Very professional team.",
      ar: "قيمة ممتازة مقابل المال. بيجو 3008 كانت مثالية لرحلة طنجة-شفشاون. فريق محترف جداً.",
    },
    source: "google",
    verified: true,
  },
  {
    name: "Mohamed Benali",
    initials: "MB",
    rating: 5,
    date: "2025-07-15",
    text: {
      fr: "Réservation WhatsApp ultra simple. Voiture propre, prix correct, pas de surprises. La meilleure agence de Tanger.",
      en: "Super simple WhatsApp booking. Clean car, fair price, no surprises. The best agency in Tangier.",
      ar: "حجز واتساب بسيط جداً. سيارة نظيفة، سعر عادل، لا مفاجآت. أفضل وكالة في طنجة.",
    },
    source: "google",
    verified: true,
  },
  {
    name: "Emma Thompson",
    initials: "ET",
    rating: 4,
    date: "2025-06-20",
    text: {
      fr: "Great experience overall. The Dacia Duster was reliable and spacious. Only minor wait at the office, but the staff was apologetic and professional.",
      en: "Great experience overall. The Dacia Duster was reliable and spacious. Only minor wait at the office, but the staff was apologetic and professional.",
      ar: "تجربة رائعة بشكل عام. داسيا داستر كانت موثوقة وواسعة. فقط انتظار بسيط في المكتب، لكن Staff كان معتذراً ومهنياً.",
    },
    source: "tripadvisor",
    verified: true,
  },
  {
    name: "Karim Idrissi",
    initials: "KI",
    rating: 5,
    date: "2025-05-10",
    text: {
      fr: "Service 7j/7 confirmé ! J'ai réservé un dimanche soir, voiture prête lundi matin. Sérieux et fiable.",
      en: "7-day service confirmed! Booked Sunday evening, car ready Monday morning. Serious and reliable.",
      ar: "خدمة 7 أيام مؤكدة! حجزت مساء الأحد، السيارة جاهزة صباح الإثنين. جاد وموثوق.",
    },
    source: "google",
    verified: true,
  },
  {
    name: "Pierre Dubois",
    initials: "PD",
    rating: 5,
    date: "2025-04-22",
    text: {
      fr: "Parfait pour un voyage d'affaires. Facture conforme, franchise claire, pas de frais cachés. VELOX CAR est mon choix à Tanger.",
      en: "Perfect for a business trip. Proper invoice, clear deductible, no hidden fees. VELOX CAR is my choice in Tangier.",
      ar: "مثالي لرحلة عمل. فاتورة صحيحة، فرنشايز واضح، لا رسوم خفية. فيلوكس كار اختياري في طنجة.",
    },
    source: "facebook",
    verified: true,
  },
];
