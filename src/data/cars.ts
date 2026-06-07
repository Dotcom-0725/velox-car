export type Car = {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  category: "economy" | "compact" | "suv" | "luxury" | "compact-suv" | "sedan" | "city-car" | "hatchback";
  priceLow: number; // MAD low season
  priceHigh: number; // MAD high season
  transmission: "manual" | "automatic";
  fuel: "essence" | "diesel" | "hybride";
  seats: number;
  doors: number;
  bags: number;
  colors: string[];
  features: string[];
  description: { fr: string; en: string; ar: string };
  badge?: string; // "Best-seller", "Nouveau", "Premium"
  cardBg: string; // CSS class
  illustColor: string; // hex for SVG fallback
  illustAccent: string;
  imageUrl?: string; // real photo
};

export const CARS: Car[] = [
  {
    id: "duster-2025",
    make: "Dacia",
    model: "Duster",
    trim: "Journey",
    year: 2025,
    category: "suv",
    priceLow: 400,
    priceHigh: 600,
    transmission: "manual",
    fuel: "diesel",
    seats: 5,
    doors: 5,
    bags: 4,
    colors: ["Gris Sandstone", "بيج رملي"],
    features: ["Climatisation", "Bluetooth", "GPS intégré", "Caméra de recul", "Cruise control", "Jantes alliage"],
    description: {
      fr: "Le SUV familial nouvelle génération. Le Dacia Duster 2025 en Gris Sandstone allie robustesse, espace et design moderne. Idéal pour les escapades dans le Rif et le long de la côte méditerranéenne.",
      en: "The next-gen family SUV. The Dacia Duster 2025 in Sandstone Grey combines toughness, space and modern design. Perfect for Rif getaways and Mediterranean coast trips.",
      ar: "سيارة الدفع الرباعي العائلية من الجيل الجديد. داسيا داستر 2025 بلون رمادي رملي تجمع بين المتانة والاتساع والتصميم الحديث. مثالية لرحلات الريف والساحل المتوسطي.",
    },
    badge: "Best-seller",
    cardBg: "car-card-bg-1",
    illustColor: "#e6dcc5",
    illustAccent: "#1E3A8A",
    imageUrl: "/cars/dacia-duster-2025.jpg",
  },
  {
    id: "opel-corsa-2025",
    make: "Opel",
    model: "Corsa",
    trim: "Edition",
    year: 2025,
    category: "hatchback",
    priceLow: 300,
    priceHigh: 450,
    transmission: "manual",
    fuel: "essence",
    seats: 5,
    doors: 5,
    bags: 3,
    colors: ["Blanc", "أبيض"],
    features: ["Climatisation", "Bluetooth", "Apple CarPlay", "Android Auto", "Régulateur de vitesse", "LED"],
    description: {
      fr: "Citadine élégante et économique. L'Opel Corsa 2025 blanche offre une conduite agile, un coffre généreux et une faible consommation. Parfaite pour la ville et les longs trajets.",
      en: "Elegant and economical city car. The white Opel Corsa 2025 offers agile handling, generous boot space and low fuel consumption. Perfect for city driving and long trips.",
      ar: "سيارة مدنية أنيقة واقتصادية. أوبل كورسا 2025 البيضاء توفر قيادة رشيقة وصندوقاً واسعاً واستهلاكاً منخفضاً للوقود. مثالية للمدينة والرحلات الطويلة.",
    },
    badge: "Populaire",
    cardBg: "car-card-bg-2",
    illustColor: "#f8fafc",
    illustAccent: "#dc2626",
    imageUrl: "/cars/opel-corsa-2025.jpg",
  },
  {
    id: "renault-kardian-2025",
    make: "Renault",
    model: "Kardian",
    trim: "Evolution",
    year: 2025,
    category: "compact-suv",
    priceLow: 400,
    priceHigh: 600,
    transmission: "automatic",
    fuel: "essence",
    seats: 5,
    doors: 5,
    bags: 4,
    colors: ["Fusion Silver", "فضي معدني"],
    features: ["Climatisation auto", "Écran tactile 8\"", "Apple CarPlay", "Caméra de recul", "Régulateur adaptatif", "Jantes alliage 16\""],
    description: {
      fr: "Le nouveau SUV compact urbain de Renault. Le Kardian 2025 en Fusion Silver allie modernité, technologie et performances. Garde au sol surélevée pour plus de confort.",
      en: "Renault's new urban compact SUV. The Kardian 2025 in Fusion Silver combines modernity, technology and performance. Raised ground clearance for extra comfort.",
      ar: "سيارة الدفع الرباعي المدمجة الحضرية الجديدة من رينو. كارديان 2025 بلون فضي معدني تجمع بين الحداثة والتكنولوجيا والأداء. ارتفاع أعلى للراحة الإضافية.",
    },
    badge: "Nouveau",
    cardBg: "car-card-bg-4",
    illustColor: "#cbd5e1",
    illustAccent: "#475569",
    imageUrl: "/cars/renault-kardian-2025.jpg",
  },
  {
    id: "dacia-logan-2024",
    make: "Dacia",
    model: "Logan",
    trim: "Expression",
    year: 2024,
    category: "sedan",
    priceLow: 250,
    priceHigh: 380,
    transmission: "manual",
    fuel: "essence",
    seats: 5,
    doors: 4,
    bags: 4,
    colors: ["Argent", "Rumba Beige", "فضي أو رملي فاتح"],
    features: ["Climatisation", "Bluetooth", "USB", "Verrouillage central", "Direction assistée", "ABS"],
    description: {
      fr: "La berline familiale fiable et économique. La Dacia Logan 2024 offre un large coffre, un habitacle spacieux et une consommation maîtrisée. Idéale pour les longs trajets.",
      en: "The reliable and economical family sedan. The Dacia Logan 2024 offers a large boot, spacious cabin and controlled consumption. Perfect for long journeys.",
      ar: "سيارة السيدان العائلية الموثوقة والاقتصادية. داسيا لوغان 2024 توفر صندوقاً كبيراً ومقصورة واسعة واستهلاكاً اقتصادياً. مثالية للرحلات الطويلة.",
    },
    badge: "Économique",
    cardBg: "car-card-bg-3",
    illustColor: "#d1d5db",
    illustAccent: "#1E3A8A",
    imageUrl: "/cars/dacia-logan-2024.jpg",
  },
  {
    id: "hyundai-i10-2025",
    make: "Hyundai",
    model: "i10",
    trim: "Trend",
    year: 2025,
    category: "city-car",
    priceLow: 220,
    priceHigh: 320,
    transmission: "manual",
    fuel: "essence",
    seats: 5,
    doors: 5,
    bags: 2,
    colors: ["Beige métallisé", "رملي معدني"],
    features: ["Climatisation", "Bluetooth", "Écran tactile", "USB", "Vitres électriques", "Direction assistée"],
    description: {
      fr: "La citadine maline par excellence. La Hyundai i10 2025 est agile, économique et parfaitement adaptée aux ruelles de Tanger. Très facile à garer.",
      en: "The smart city car par excellence. The Hyundai i10 2025 is agile, economical and perfectly suited to Tangier's narrow streets. Very easy to park.",
      ar: "السيارة المدنية الذكية بامتياز. هيونداي i10 2025 رشيقة واقتصادية ومناسبة تماماً لأزقة طنجة. سهلة الركن جداً.",
    },
    badge: "Éco",
    cardBg: "car-card-bg-3",
    illustColor: "#e6dcc5",
    illustAccent: "#0ea5e9",
    imageUrl: "/cars/hyundai-i10-2025.jpg",
  },
  {
    id: "kia-picanto-2025",
    make: "Kia",
    model: "Picanto",
    trim: "Motion",
    year: 2025,
    category: "city-car",
    priceLow: 220,
    priceHigh: 320,
    transmission: "manual",
    fuel: "essence",
    seats: 5,
    doors: 5,
    bags: 2,
    colors: ["Rumba Beige", "رملي فاتح"],
    features: ["Climatisation", "Bluetooth", "Écran 8\"", "Apple CarPlay", "Caméra de recul", "USB"],
    description: {
      fr: "Petite, agile et bien équipée. La Kia Picanto 2025 séduit par son design moderne et ses équipements technologiques. Excellent rapport qualité/prix.",
      en: "Small, agile and well-equipped. The Kia Picanto 2025 charms with its modern design and tech equipment. Excellent value for money.",
      ar: "صغيرة ورشيقة ومجهزة جيداً. كيا بيكانتو 2025 تجذب بتصميمها العصري وتجهيزاتها التقنية. قيمة ممتازة مقابل السعر.",
    },
    badge: "Populaire",
    cardBg: "car-card-bg-2",
    illustColor: "#f5f0e3",
    illustAccent: "#ea580c",
    imageUrl: "/cars/kia-picanto-2025.jpg",
  },
  {
    id: "peugeot-208-2025",
    make: "Peugeot",
    model: "208",
    trim: "GT Line",
    year: 2025,
    category: "hatchback",
    priceLow: 350,
    priceHigh: 500,
    transmission: "automatic",
    fuel: "essence",
    seats: 5,
    doors: 5,
    bags: 3,
    colors: ["Beige Sable foncé", "رملي غامق"],
    features: ["i-Cockpit 3D", "Climatisation auto", "Apple CarPlay", "Android Auto", "Régulateur adaptatif", "LED full"],
    description: {
      fr: "La citadine sportive premium. La Peugeot 208 GT Line 2025 offre un design audacieux, le célèbre i-Cockpit 3D et une conduite dynamique. Le summum du style français.",
      en: "The premium sporty city car. The Peugeot 208 GT Line 2025 offers bold design, the famous i-Cockpit 3D and dynamic driving. The pinnacle of French style.",
      ar: "السيارة المدنية الرياضية الفاخرة. بيجو 208 GT لاين 2025 تقدم تصميماً جريئاً ولوحة قيادة i-Cockpit ثلاثية الأبعاد الشهيرة وقيادة ديناميكية. قمة الأناقة الفرنسية.",
    },
    badge: "Premium",
    cardBg: "car-card-bg-5",
    illustColor: "#78716c",
    illustAccent: "#F59E0B",
    imageUrl: "/cars/peugeot-208-2025.jpg",
  },
];

export const EXTRAS = [
  { id: "gps", pricePerDay: 50, icon: "MapPin" },
  { id: "child-seat", pricePerDay: 30, icon: "Baby" },
  { id: "additional-driver", pricePerDay: 100, icon: "UserPlus" },
  { id: "full-insurance", pricePerDay: 120, icon: "Shield" },
] as const;

export const getCarById = (id: string) => CARS.find((c) => c.id === id);
