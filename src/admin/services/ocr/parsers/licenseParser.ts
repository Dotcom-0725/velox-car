// ============================================
// Moroccan Driver License parser - محسّن للهاتف والحاسوب
// ============================================
import { LicenseData, ExtractedField } from "../types";

function field(value: string, confidence = 0.9, rawMatch?: string): ExtractedField {
  return { value: value.trim(), confidence, rawMatch };
}

const DATE_PATTERNS = [
  /(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})/,
  /(\d{4})[./\-\s](\d{1,2})[./\-\s](\d{1,2})/,
];

export function parseLicense(rawText: string): Partial<LicenseData> {
  const text = rawText;
  const textUpper = text.toUpperCase();
  const result: Partial<LicenseData> = {};

  console.log("📝 License Raw text:", text.substring(0, 200));

  // ============================================
  // 1. رقم الرخصة - 52/007657
  // ============================================
  const licensePatterns = [
    // "Permis N° 52/007657"
    /PERMIS\s+N[°o][\s:]+(\d{1,3}\s*[/\\]\s*\d{4,8})/i,
    // "N° du permis: 52/007657"
    /N[°o]\s*(?:DU\s+)?PERMIS[\s:]+(\d{1,3}\s*[/\\]\s*\d{4,8})/i,
    // "رقم الرخصة 52/007657"
    /رقم\s+الرخصة[\s:]+(\d{1,3}\s*[/\\]\s*\d{4,8})/i,
    // نمط عام: رقم/أرقام
    /\b(\d{2,3}\s*[/\\]\s*\d{5,8})\b/,
    // أرقام طويلة فقط
    /\b(\d{10,12})\b/,
  ];

  for (const pat of licensePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const cleaned = match[1].replace(/\s/g, "").replace(/\\/g, "/");
      if (cleaned.length >= 6) {
        result.licenseNumber = field(cleaned, 0.92, match[0]);
        console.log("✅ License Number:", result.licenseNumber.value);
        break;
      }
    }
  }

  // ============================================
  // 2. الاسم الكامل
  // ============================================
  const namePatterns = [
    // "Prénom: RACHID\nNom: ACHERKOUK"
    /PR[ÉE]NOM[\s:]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})\s*(?:NOM|NOM\s+DE\s+FAMILLE)[\s:]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})/i,
    // "Nom: ACHERKOUK\nPrénom: RACHID"
    /NOM[\s:]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})\s*(?:PR[ÉE]NOM|PRENOM)[\s:]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})/i,
    // "الإسم الشخصي رشيد\nالإسم العائلي اشركوك"
    /الإسم\s+الشخصي[\s:]+([\u0600-\u06FF\s]{2,20})\s*الإسم\s+العائلي[\s:]+([\u0600-\u06FF\s]{2,20})/i,
    // سطران متتاليان
    /\n([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})\s*\n([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})\s*\n(?:N[ée]E?|C\.N\.I)/i,
  ];

  for (const pat of namePatterns) {
    const match = text.match(pat);
    if (match) {
      let fullName = "";
      if (match[2]) {
        fullName = `${match[1]} ${match[2]}`;
      } else if (match[1]) {
        fullName = match[1];
      }

      if (fullName.trim().length > 3) {
        result.fullName = field(cleanName(fullName), 0.9, match[0]);
        console.log("✅ Full Name:", result.fullName.value);
        break;
      }
    }
  }

  // ============================================
  // 3. تاريخ الميلاد
  // ============================================
  const birthDatePatterns = [
    /N[ée]E?\s+(?:LE|le)[\s:]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    /(?:DATE\s+DE\s+NAISSANCE|تاريخ\s+الولادة)[\s:]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    /N[ée]\s+le[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
  ];

  for (const pat of birthDatePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const normalized = normalizeDate(match[1]);
      if (normalized) {
        result.birthDate = field(normalized, 0.92, match[0]);
        console.log("✅ Birth Date:", result.birthDate.value);
        break;
      }
    }
  }

  // ============================================
  // 4. تاريخ الإصدار
  // ============================================
  const issuePatterns = [
    // "Délivré le 15/08/1996"
    /(?:D[ée]LIVR[ée]\s+LE|DATE\s+DE\s+D[ée]LIVRANCE|تاريخ\s+التسليم)[\s:]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    // "Chefchaouen le 15/08/1996"
    /\w+\s+LE\s+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
  ];

  for (const pat of issuePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const normalized = normalizeDate(match[1]);
      if (normalized) {
        result.issueDate = field(normalized, 0.9, match[0]);
        console.log("✅ Issue Date:", result.issueDate.value);
        break;
      }
    }
  }

  // ============================================
  // 5. تاريخ الانتهاء
  // ============================================
  const expiryPatterns = [
    // "Date de fin de validité 01/02/2026"
    /(?:DATE\s+DE\s+FIN\s+DE\s+VALIDIT[ÉE]|تاريخ\s+نهاية\s+الصلاحية)[\s:]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    // "Valable jusqu'au 01/02/2026"
    /(?:VALABLE\s+JUSQU['']AU|Expire\s+le)[\s:]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
  ];

  for (const pat of expiryPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const normalized = normalizeDate(match[1]);
      if (normalized) {
        result.expiryDate = field(normalized, 0.9, match[0]);
        console.log("✅ Expiry Date:", result.expiryDate.value);
        break;
      }
    }
  }

  // Fallback: إذا لم نجد تاريخ الإصدار، احسبه من تاريخ الانتهاء - 10 سنوات
  if (!result.issueDate && result.expiryDate) {
    const expDate = new Date(result.expiryDate.value);
    expDate.setFullYear(expDate.getFullYear() - 10);
    result.issueDate = field(expDate.toISOString().split("T")[0], 0.6);
  }

  // ============================================
  // 6. الفئات - B, A, etc.
  // ============================================
  // من verso: جدول الفئات مع التواريخ
  const versoCategories: string[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    // "B 15/08/1996" أو "A1 [icon] 12/05/2010"
    const catMatch = line.match(/^(A[12]?|B|C[1E]?|D[1E]?|EB|EC|ED)\s+.*?\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4}/i);
    if (catMatch) {
      const cat = catMatch[1].toUpperCase();
      if (!versoCategories.includes(cat)) {
        versoCategories.push(cat);
      }
    }
  }

  if (versoCategories.length > 0) {
    result.categories = field(versoCategories.join(","), 0.95);
    console.log("✅ Categories (verso):", result.categories.value);
  } else {
    // من recto: فئة واحدة فقط
    const rectoCatMatch = text.match(/\b(?:CAT[ÉE]GORIE|الصنف)[\s:]+([A-E][12]?)/i);
    if (rectoCatMatch) {
      result.categories = field(rectoCatMatch[1].toUpperCase(), 0.9);
    } else {
      // فئة واحدة في نهاية الوثيقة
      const standaloneCat = text.match(/(?:^|\n)([ABCDE])(?:\s|$)/m);
      if (standaloneCat && standaloneCat[1] !== "M" && standaloneCat[1] !== "F") {
        result.categories = field(standaloneCat[1], 0.75);
      } else {
        result.categories = field("B", 0.5);
      }
    }
  }

  // ============================================
  // 7. البلد - Maroc
  // ============================================
  if (textUpper.includes("MAROC") || textUpper.includes("المملكة المغربية")) {
    result.issuingCountry = field("Maroc", 0.95);
  }

  console.log("📊 Final License Result:", result);
  return result;
}

// ============================================
// Helper Functions
// ============================================

function cleanName(s: string): string {
  return s
    .replace(/[^\u0600-\u06FF A-Za-zÀ-ÿ\s\-']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(w => w.length > 1)
    .map((w) => {
      if (/^[\u0600-\u06FF]+$/.test(w)) return w; // Arabic
      return w[0].toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ")
    .slice(0, 50);
}

function normalizeDate(dateStr: string): string {
  for (const pattern of DATE_PATTERNS) {
    const match = dateStr.match(pattern);
    if (match) {
      let day, month, year;

      if (pattern.source.startsWith("(\\d{4})")) {
        year = parseInt(match[1]);
        month = parseInt(match[2]);
        day = parseInt(match[3]);
      } else {
        day = parseInt(match[1]);
        month = parseInt(match[2]);
        year = parseInt(match[3]);
      }

      if (year < 100) year += year > 50 ? 1900 : 2000;
      if (month > 12 && day <= 12) [day, month] = [month, day];

      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
    }
  }
  return "";
}
