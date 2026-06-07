export type FAQ = {
  category: "rental" | "documents" | "payment" | "insurance" | "delivery" | "policy";
  question: { fr: string; en: string; ar: string };
  answer: { fr: string; en: string; ar: string };
};

export const FAQS: FAQ[] = [
  {
    category: "rental",
    question: {
      fr: "Quel est l'âge minimum pour louer une voiture ?",
      en: "What is the minimum age to rent a car?",
      ar: "ما هو الحد الأدنى للعمر لاستئجار سيارة؟",
    },
    answer: {
      fr: "L'âge minimum est de 21 ans pour les catégories économique et compacte, et de 25 ans pour les SUV et véhicules de luxe. Le conducteur doit être en possession d'un permis de conduire valide depuis au moins 2 ans.",
      en: "Minimum age is 21 for economy and compact categories, and 25 for SUV and luxury vehicles. The driver must hold a valid driver's license for at least 2 years.",
      ar: "الحد الأدنى للعمر هو 21 سنة للفئات الاقتصادية والمدمجة، و25 سنة لسيارات الدفع الرباعي والسيارات الفاخرة. يجب أن يكون السائق حاصلاً على رخصة قيادة سارية منذ سنتين على الأقل.",
    },
  },
  {
    category: "documents",
    question: {
      fr: "Quels documents sont nécessaires pour la location ?",
      en: "What documents are required for the rental?",
      ar: "ما هي الوثائق المطلوبة للإيجار؟",
    },
    answer: {
      fr: "Pour les résidents marocains : Permis de conduire valide (2+ ans) + CIN. Pour les non-résidents : Permis international + Passeport. Une carte de crédit au nom du conducteur est requise pour la caution.",
      en: "For Moroccan residents: Valid driver's license (2+ years) + National ID. For non-residents: International license + Passport. A credit card in the driver's name is required for the deposit.",
      ar: "للمقيمين المغاربة: رخصة قيادة سارية (2+ سنوات) + البطاقة الوطنية. لغير المقيمين: رخصة دولية + جواز السفر. يلزم بطاقة ائتمان باسم السائق للضمان.",
    },
  },
  {
    category: "payment",
    question: {
      fr: "Comment se passe le paiement ?",
      en: "How does payment work?",
      ar: "كيف يتم الدفع؟",
    },
    answer: {
      fr: "Aucun paiement en ligne n'est requis lors de la réservation. Le règlement s'effectue à la prise en charge du véhicule, en espèces (MAD ou EUR), par carte bancaire (Visa, Mastercard) ou par virement bancaire. Un acompte peut être demandé pour les réservations longue durée.",
      en: "No online payment is required at booking. Payment is made on vehicle pickup, by cash (MAD or EUR), credit card (Visa, Mastercard) or bank transfer. A deposit may be required for long-term rentals.",
      ar: "لا يلزم الدفع الإلكتروني عند الحجز. يتم الدفع عند استلام السيارة، نقداً (درهم أو يورو)، ببطاقة بنكية (فيزا، ماستركارد) أو بتحويل بنكي. قد يُطلب عربون للإيجارات طويلة المدة.",
    },
  },
  {
    category: "insurance",
    question: {
      fr: "Qu'est-ce que la franchise obligatoire ?",
      en: "What is the mandatory deductible/insurance?",
      ar: "ما هو الفرنشايز الإلزامي؟",
    },
    answer: {
      fr: "La franchise obligatoire est le montant maximum qui reste à votre charge en cas de sinistre. Elle varie de 5 000 MAD (économique) à 15 000 MAD (premium). Vous pouvez la réduire à 0 MAD en souscrivant à notre option « Assurance tous risques » (+120 MAD/jour).",
      en: "The mandatory deductible is the maximum amount you remain liable for in case of damage. It ranges from 5,000 MAD (economy) to 15,000 MAD (premium). You can reduce it to 0 MAD with our Full Coverage option (+120 MAD/day).",
      ar: "الفرنشايز الإلزامي هو المبلغ الأقصى الذي يبقى على عاتقك في حالة وقوع حادث. يتراوح من 5,000 درهم (اقتصادي) إلى 15,000 درهم (فاخر). يمكنك تخفيضه إلى 0 درهم مع خيار التأمين الشامل (+120 درهم/يوم).",
    },
  },
  {
    category: "rental",
    question: {
      fr: "Le kilométrage est-il illimité ?",
      en: "Is mileage unlimited?",
      ar: "هل الكيلومترات غير محدودة؟",
    },
    answer: {
      fr: "Le kilométrage illimité est inclus de série sur toutes nos locations. Aucune restriction de kilométrage ne vous est imposée, vous pouvez voyager librement à travers le Maroc.",
      en: "Unlimited mileage is included by default on all rentals. No mileage restriction is imposed, you can travel freely across Morocco.",
      ar: "الكيلومترات غير المحدودة مشمولة افتراضياً في جميع الإيجارات. لا يتم فرض أي قيود على الكيلومترات، يمكنك السفر بحرية في جميع أنحاء المغرب.",
    },
  },
  {
    category: "rental",
    question: {
      fr: "Quelle est la politique de carburant ?",
      en: "What is the fuel policy?",
      ar: "ما هي سياسة الوقود؟",
    },
    answer: {
      fr: "Nos véhicules sont livrés avec un plein de carburant et doivent être restitués avec un plein. En cas de non-restitution au même niveau, des frais de remise à niveau + frais de service (50 MAD) vous seront facturés.",
      en: "Our vehicles are delivered with a full tank and must be returned with a full tank. If not returned at the same level, refueling + service fees (50 MAD) will be charged.",
      ar: "سياراتنا تُسلَّم بخزان ممتلئ ويجب إعادتها بخزان ممتلئ. في حالة عدم إعادتها بنفس المستوى، سيتم احتساب رسوم إعادة التزود + رسوم خدمة (50 درهم).",
    },
  },
  {
    category: "policy",
    question: {
      fr: "Puis-je annuler ma réservation ?",
      en: "Can I cancel my booking?",
      ar: "هل يمكنني إلغاء حجزي؟",
    },
    answer: {
      fr: "Oui, l'annulation est gratuite jusqu'à 24 heures avant la prise en charge. Au-delà, des frais d'annulation de 30% du montant total s'appliquent. En cas de no-show, le montant total est dû.",
      en: "Yes, cancellation is free up to 24 hours before pickup. After that, a 30% cancellation fee applies. In case of no-show, the full amount is due.",
      ar: "نعم، الإلغاء مجاني حتى 24 ساعة قبل الاستلام. بعد ذلك، تطبق رسوم إلغاء بنسبة 30%. في حالة عدم الحضور، يستحق المبلغ الإجمالي.",
    },
  },
  {
    category: "policy",
    question: {
      fr: "Que se passe-t-il en cas de retard ?",
      en: "What happens if I'm late?",
      ar: "ماذا يحدث إذا تأخرت؟",
    },
    answer: {
      fr: "Une tolérance de 29 minutes est accordée. Au-delà, une journée supplémentaire est facturée au tarif de base. En cas de retard supérieur à 3 heures sans contact, la réservation est considérée comme annulée (no-show).",
      en: "A 29-minute grace period is allowed. Beyond that, an additional day is charged at the base rate. In case of delay over 3 hours without contact, the booking is considered a no-show.",
      ar: "يُمنح سماح 29 دقيقة. بعد ذلك، يتم احتساب يوم إضافي بالسعر الأساسي. في حالة التأخر أكثر من 3 ساعات دون اتصال، يعتبر الحجز عدم حضور.",
    },
  },
  {
    category: "delivery",
    question: {
      fr: "Puis-je traverser la frontière espagnole ?",
      en: "Can I cross the Spanish border?",
      ar: "هل يمكنني عبور الحدود الإسبانية؟",
    },
    answer: {
      fr: "Oui, les traversées vers Ceuta et le reste de l'Espagne sont autorisées moyennant un préavis de 48h et un supplément de 200 MAD (assurance frontalière). Une autorisation écrite et la carte verte vous seront remises.",
      en: "Yes, crossings to Ceuta and the rest of Spain are allowed with 48h notice and a 200 MAD supplement (cross-border insurance). Written authorization and green card will be provided.",
      ar: "نعم، العبور إلى سبتة وباقي إسبانيا مسموح به مع إشعار مسبق بـ 48 ساعة و200 درهم إضافية (تأمين حدودي). سيتم تقديم إذن كتابي وبطاقة خضراء.",
    },
  },
  {
    category: "rental",
    question: {
      fr: "Quelle caution est demandée ?",
      en: "What deposit is required?",
      ar: "ما هو الضمان المطلوب؟",
    },
    answer: {
      fr: "La caution varie selon la catégorie : 3 000 MAD (économique/compacte), 5 000 MAD (SUV), 8 000 MAD (premium). Elle est restituée sous 7 jours après le retour, sous réserve de l'état du véhicule.",
      en: "The deposit varies by category: 3,000 MAD (economy/compact), 5,000 MAD (SUV), 8,000 MAD (premium). It is refunded within 7 days after return, subject to vehicle condition.",
      ar: "يختلف الضمان حسب الفئة: 3,000 درهم (اقتصادي/مدمج)، 5,000 درهم (SUV)، 8,000 درهم (فاخر). يُسترد خلال 7 أيام بعد الإرجاع، مع مراعاة حالة السيارة.",
    },
  },
  {
    category: "delivery",
    question: {
      fr: "Comment se passe la livraison à l'aéroport ?",
      en: "How does airport delivery work?",
      ar: "كيف يعمل التوصيل للمطار؟",
    },
    answer: {
      fr: "La livraison à l'aéroport TNG est gratuite. À votre arrivée, présentez-vous au comptoir VELOX (Hall des arrivées) ou appelez le +212 677 16 02 64. Un agent vous accompagnera jusqu'au véhicule avec une navette gratuite si nécessaire.",
      en: "Delivery to TNG airport is free. On arrival, go to the VELOX counter (Arrivals Hall) or call +212 677 16 02 64. An agent will escort you to the vehicle with a free shuttle if needed.",
      ar: "التوصيل إلى مطار TNG مجاني. عند الوصول، توجه إلى مكتب فيلوكس (قاعة الوصول) أو اتصل بـ +212 677 16 02 64. سيرافقك وكيل إلى السيارة مع shuttle مجاني عند الحاجة.",
    },
  },
  {
    category: "insurance",
    question: {
      fr: "Quelle est la procédure en cas d'accident ?",
      en: "What is the procedure in case of an accident?",
      ar: "ما هو الإجراء في حالة وقوع حادث؟",
    },
    answer: {
      fr: "Contactez immédiatement notre hotline 24/7 : +212 677 16 02 64. Ne déplacez pas le véhicule avant l'arrivée de l'assistance. Un constat amiable doit être rempli. Tout accident non déclaré annule la couverture d'assurance.",
      en: "Contact our 24/7 hotline immediately: +212 677 16 02 64. Do not move the vehicle before assistance arrives. An accident report must be filled. Any unreported accident voids the insurance coverage.",
      ar: "اتصل فوراً بالخط الساخن 24/7: +212 677 16 02 64. لا تحرك السيارة قبل وصول المساعدة. يجب ملء تقرير الحادث. أي حادث غير مُبلغ عنه يُبطل التأمين.",
    },
  },
];

export const FAQ_CATEGORIES = {
  rental: { fr: "Location", en: "Rental", ar: "الإيجار" },
  documents: { fr: "Documents", en: "Documents", ar: "الوثائق" },
  payment: { fr: "Paiement", en: "Payment", ar: "الدفع" },
  insurance: { fr: "Assurance", en: "Insurance", ar: "التأمين" },
  delivery: { fr: "Livraison", en: "Delivery", ar: "التوصيل" },
  policy: { fr: "Conditions", en: "Policy", ar: "الشروط" },
} as const;
