// ============================================
// Moroccan CIN parser - محسّن للهاتف والحاسوب
// ============================================
import { CinData, ExtractedField } from "../types";

function field(value: string, confidence = 0.9, rawMatch?: string): ExtractedField {
  return { value: value.trim(), confidence, rawMatch };
}

// أنماط التاريخ - مرنة أكثر
const DATE_PATTERNS = [
  /(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})/, // DD/MM/YYYY
  /(\d{4})[./\-\s](\d{1,2})[./\-\s](\d{1,2})/, // YYYY/MM/DD
];

export function parseCin(rawText: string): Partial<CinData> {
  const text = rawText;
  const textUpper = text.toUpperCase();
  const result: Partial<CinData> = {};

  console.log("📝 CIN Raw text:", text.substring(0, 200));

  // ============================================
  // 1. رقم CIN - LC33683
  // ============================================
  // نمط مرن: حرفين + 5-7 أرقام
  const cinPatterns = [
    /(?:N[°o]?\s*(?:CIN|C\.N\.I)[\s:]*)?([A-Z]{2}\s*\d{5,7})/i,
    /\b([A-Z]{2}\d{5,7})\b/,
  ];

  for (const pat of cinPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      result.cinNumber = field(match[1].replace(/\s/g, "").toUpperCase(), 0.95, match[0]);
      console.log("✅ CIN Number:", result.cinNumber.value);
      break;
    }
  }

  // ============================================
  // 2. الاسم الكامل - RACHID ACHERKOUK
  // ============================================
  // أنماط متعددة للهاتف والحاسوب
  const namePatterns = [
    // "Nom et prénom: RACHID ACHERKOUK"
    /(?:NOM\s+ET\s+PR[ÉE]NOM|NOM\s+PRENOM|NOM\s+ET\s+PRENOMS)[\s:]*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{4,50}?)(?=\s*(?:N[°o]|CIN|NÉ|N[ée]E?|DATE|\d{2}[./\-]))/i,
    // "NOM: ACHERKOUK\nPRÉNOM: RACHID"
    /NOM[\s:]*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})\s*(?:PR[ÉE]NOM|PRENOM)[\s:]*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})/i,
    // "Prénom: RACHID\nNom: ACHERKOUK"
    /PR[ÉE]NOM[\s:]*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})\s*(?:NOM|NOM\s+DE\s+FAMILLE)[\s:]*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})/i,
    // سطران متتاليان من الحروف الكبيرة
    /\n([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})\s*\n([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,25})\s*\n(?:N[ée]E?|NÉ)/i,
  ];

  for (const pat of namePatterns) {
    const match = text.match(pat);
    if (match) {
      let fullName = "";
      if (match[2]) {
        // Pattern مع مجموعتين
        fullName = `${match[1]} ${match[2]}`;
      } else if (match[1]) {
        // Pattern مع مجموعة واحدة
        fullName = match[1];
      }

      if (fullName.trim().length > 3) {
        result.fullName = field(cleanName(fullName), 0.9, match[0]);
        console.log("✅ Full Name:", result.fullName.value);
        break;
      }
    }
  }

  // Fallback: ابحث عن أي نص بعد "NOM" أو "PRÉNOM"
  if (!result.fullName) {
    const nomMatch = text.match(/NOM[\s:]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,})/i);
    const prenomMatch = text.match(/PR[ÉE]NOM[\s:]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,})/i);

    if (nomMatch && prenomMatch) {
      result.fullName = field(`${prenomMatch[1]} ${nomMatch[1]}`.trim(), 0.85);
    } else if (nomMatch) {
      result.fullName = field(nomMatch[1], 0.8);
    }
  }

  // ============================================
  // 3. تاريخ الميلاد - 01/04/1972
  // ============================================
  const birthDatePatterns = [
    // "Né(e) le 01/04/1972"
    /N[ée]E?\s+(?:LE|le)[\s:]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    // "DATE DE NAISSANCE 01/04/1972"
    /(?:DATE\s+DE\s+NAISSANCE|BIRTH\s+DATE)[\s:]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    // "Né le: 01.04.1972"
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
  // 4. مكان الميلاد - BAB TAZA CHEFCHAOUEN
  // ============================================
  const birthPlacePatterns = [
    // "à BAB TAZA CHEFCHAOUEN"
    /(?:N[ée]E?\s+(?:LE|le)[^,]*,?\s*(?:à|au|at)\s+)([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{3,50}?)(?=\s*(?:N[°o]|CIN|ADRESSE|\n{2}))/i,
    // "Lieu de naissance: BAB TAZA"
    /(?:LIEU\s+DE\s+NAISSANCE|BIRTH\s+PLACE)[\s:]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{3,50}?)(?=\s*(?:N[°o]|CIN|ADRESSE|\n{2}))/i,
    // "né à BAB TAZA CHEFCHAOUEN"
    /n[ée]\s+(?:le\s+\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4}\s+)?(?:à|au)\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{3,50}?)(?=\s*(?:N[°o]|CIN|ADRESSE|\n{2}))/i,
  ];

  for (const pat of birthPlacePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const cleaned = match[1].trim();
      if (cleaned.length > 2) {
        result.birthPlace = field(cleaned, 0.85, match[0]);
        console.log("✅ Birth Place:", result.birthPlace.value);
        break;
      }
    }
  }

  // ============================================
  // 5. العنوان - COMPLEXE FADL ALLAH...
  // ============================================
  const addressPatterns = [
    // "Adresse: COMPLEXE FADL ALLAH..."
    /(?:ADRESSE|ADDRESS)[\s:]+([A-Z0-9À-Ÿ][A-Z0-9À-Ÿ\s\-',./]{8,150}?)(?=\s*(?:NATIONALIT|N[°o]|CIN|TEL|\n{2}))/i,
    // "العنوان: ..."
    /(?:العنوان)[\s:]+([^\n]{8,150}?)(?=\s*(?:NATIONALIT|N[°o]|CIN|TEL|\n{2}))/i,
  ];

  for (const pat of addressPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const cleaned = match[1].trim();
      if (cleaned.length > 5) {
        result.address = field(cleaned, 0.8, match[0]);
        console.log("✅ Address:", result.address.value);
        break;
      }
    }
  }

  // ============================================
  // 6. الجنسية - Marocaine
  // ============================================
  if (textUpper.includes("MAROCAINE") || textUpper.includes("MAROCAIN")) {
    result.nationality = field("Marocaine", 0.95);
  } else if (textUpper.includes("MAROC")) {
    result.nationality = field("Marocaine", 0.9);
  }

  // ============================================
  // 7. تاريخ انتهاء CIN - 29/09/2033
  // ============================================
  const expiryPatterns = [
    // "Valable jusqu'au 29/09/2033"
    /(?:VALABLE\s+JUSQU['']AU|VALABLE\s+JUSQU\s+A|EXPIRE\s+LE|EXPIRY)[\s:]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    // "DATE D'EXPIRATION: 29/09/2033"
    /(?:DATE\s+D['']?EXPIRATION|DATE\s+DE\s+FIN\s+DE\s+VALIDIT[ÉE])[\s:]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
  ];

  for (const pat of expiryPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const normalized = normalizeDate(match[1]);
      if (normalized) {
        result.expiryDate = field(normalized, 0.9, match[0]);
        console.log("✅ CIN Expiry:", result.expiryDate.value);
        break;
      }
    }
  }

  console.log("📊 Final CIN Result:", result);
  return result;
}

// ============================================
// Helper Functions
// ============================================

function cleanName(s: string): string {
  return s
    .replace(/[^A-Za-zÀ-ÿ\s\-']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)
    .join(" ")
    .slice(0, 50);
}

function normalizeDate(dateStr: string): string {
  for (const pattern of DATE_PATTERNS) {
    const match = dateStr.match(pattern);
    if (match) {
      let day, month, year;

      if (pattern.source.startsWith("(\\d{4})")) {
        // YYYY/MM/DD
        year = parseInt(match[1]);
        month = parseInt(match[2]);
        day = parseInt(match[3]);
      } else {
        // DD/MM/YYYY
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
