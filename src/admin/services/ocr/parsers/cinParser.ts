// ============================================
// Moroccan CIN parser (Carte d'Identité Nationale)
// Optimized for REAL Moroccan CIN format:
//
// FRONT (Recto):
//   RACHID                ← Prénom
//   ACHERKOUK             ← Nom
//   Né le 01.04.1972
//   à BAB TAZA CHEFCHAOUEN
//   N° LC33683
//   Valable jusqu'au 29.09.2033
//
// BACK (Verso):
//   Adresse COMPLEXE FADL ALLAH IMM 21 NO 119 TANGER
// ============================================
import { CinData, ExtractedField } from "../types";

function field(value: string, confidence = 0.9, rawMatch?: string): ExtractedField {
  return { value: value.trim(), confidence, rawMatch };
}

const CIN_REGEX = /\b([A-Z]{1,2}\s?\d{5,7})\b/;
const DATE_REGEX = /\b(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})\b/;

// Words to strip from captured names
const NAME_NOISE_KEYWORDS = new Set([
  "NOM", "PRENOM", "PRÉNOM", "PRENOMS", "PRÉNOMS",
  "ET", "FAMILY", "NAME", "FIRST", "GIVEN", "LAST",
  "VALABLE", "JUSQU", "JUSQUAU", "VALID", "UNTIL",
  "NÉ", "NEE", "NÉE", "BORN", "LE",
  "À", "AU", "DU", "DE", "LA",
  "CARTE", "NATIONALE", "IDENTITE", "IDENTITÉ", "ÉLECTRONIQUE",
  "ROYAUME", "MAROC", "KINGDOM", "MOROCCO",
  "SEXE", "SEX", "M", "F",
  "CIN", "CNIE", "CNI",
  "ADRESSE", "ADDRESS",
  "FILS", "BENT", "BEN",
  "ETAT", "ÉTAT", "CIVIL",
  "DIRECTEUR", "GENERAL", "GÉNÉRAL", "NATIONALE", "SURETE", "SÛRETÉ",
]);

// Patterns to find the full name
// Strategy: look for 2-3 consecutive uppercase words near "PRENOM/NOM" or "NÉ LE"
const NAME_PATTERNS = [
  // Format: "RACHID\nACHERKOUK" (line-separated)
  /^\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,20})\s*\n\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,20})\s*\n\s*(?:N[ée]|Date)/im,
  // After "Prénom RACHID\nNom ACHERKOUK" structure
  /Pr[ée]nom\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,25})[^A-Z]*?Nom\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,25})/i,
  // After "Nom et prénom" combined
  /(?:NOM\s*(?:ET\s+)?PR[ÉE]NOM(?:S)?|Nom\s*et\s*pr[ée]nom)\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{4,50}?)(?=\s*(?:Date|N[°o]|CIN|né|nee|\d|$))/i,
];

const BIRTHPLACE_PATTERNS = [
  // Standalone "à PLACE" line (most common Moroccan CIN format)
  // Captures "à BAB TAZA CHEFCHAOUEN" even when "à" is at start of line
  /(?:^|\s|\n)à\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{3,60}?)(?=\s*(?:Adresse|N[°o]|CIN|Valable|\d{2}[./\-]|Pr[ée]nom|\n|$))/m,
  // "Né le ... à PLACE" pattern
  /n[ée]\(?e?\)?\s+le[^A-Z]*?à\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{3,60}?)(?=\s*(?:Adresse|N[°o]|CIN|Valable|\d{2}[./\-]|Pr[ée]nom|\n|$))/is,
  // "Lieu de naissance: PLACE"
  /Lieu\s+de\s+naissance\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{3,60}?)(?=\s*(?:Adresse|N[°o]|CIN|Valable|\d{2}[./\-]|Pr[ée]nom|\n|$))/i,
];

// Address patterns — handles both "Adresse:" and standalone French address format
const ADDRESS_PATTERNS = [
  // Standard "Adresse: COMPLEXE FADL ALLAH IMM 21 NO 119 TANGER"
  /(?:Adresse|العنوان)\s*[:\-]?\s*([A-Z0-9][A-Za-z0-9À-ÿ\s\-',./]{8,200}?)(?=\s*(?:Valable|N[°o]\s*CIN|Date|Tel|T[ée]l|\n\n|IDMAR|<<|$))/i,
  // Fallback: line starting with COMPLEX/RUE/AV/BD/QUARTIER followed by uppercase
  /\b(?:COMPLEX[E]?|RUE|AV(?:ENUE)?|BD|BOULEVARD|QUARTIER|HAY|LOT(?:ISSEMENT)?|IMM(?:EUBLE)?|RESIDENCE)\s+([A-Z0-9][A-Za-z0-9À-ÿ\s\-',./]{5,150}?)(?=\s*(?:\n\n|IDMAR|<<|$))/i,
];

export function parseCin(rawText: string): Partial<CinData> {
  const text = rawText.replace(/[ \t]+/g, " ").trim();
  const textOneLine = text.replace(/\s+/g, " ");
  const result: Partial<CinData> = {};

  // ============ CIN number ============
  const cinMatch = textOneLine.match(CIN_REGEX);
  if (cinMatch) {
    result.cinNumber = field(cinMatch[1].replace(/\s/g, "").toUpperCase(), 0.92, cinMatch[0]);
  }

  // ============ Full name (Prénom + Nom combined) ============
  let nameValue = "";
  let nameConfidence = 0.82;

  // Try the "Prénom X / Nom Y" pattern first (highest confidence)
  const prenomNomMatch = textOneLine.match(
    /Pr[ée]nom\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,25})[^A-Z]{0,30}?Nom\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,25})/i
  );
  if (prenomNomMatch) {
    nameValue = `${prenomNomMatch[1]} ${prenomNomMatch[2]}`;
    nameConfidence = 0.95;
  }

  // Try "Nom: X Prénom: Y" structure
  if (!nameValue) {
    const nomPrenomMatch = textOneLine.match(
      /Nom\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,25})[^A-Z]{0,30}?Pr[ée]nom\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,25})/i
    );
    if (nomPrenomMatch) {
      nameValue = `${nomPrenomMatch[2]} ${nomPrenomMatch[1]}`; // Prénom first
      nameConfidence = 0.95;
    }
  }

  // Look for two consecutive UPPERCASE words on separate lines (typical CIN layout)
  if (!nameValue) {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    for (let i = 0; i < lines.length - 1; i++) {
      const a = lines[i];
      const b = lines[i + 1];
      // Both must be single uppercase words 3-25 chars, not noise
      if (
        /^[A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,24}$/.test(a) &&
        /^[A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,24}$/.test(b) &&
        !NAME_NOISE_KEYWORDS.has(a.toUpperCase()) &&
        !NAME_NOISE_KEYWORDS.has(b.toUpperCase())
      ) {
        nameValue = `${a} ${b}`;
        nameConfidence = 0.88;
        break;
      }
    }
  }

  // Try other generic patterns
  if (!nameValue) {
    for (const pat of NAME_PATTERNS) {
      const m = textOneLine.match(pat);
      if (m) {
        nameValue = m.length >= 3 && m[2] ? `${m[1]} ${m[2]}` : m[1];
        if (nameValue.trim().length > 4) {
          nameConfidence = 0.82;
          break;
        }
      }
    }
  }

  // Fallback: longest uppercase Latin sequence
  if (!nameValue) {
    const nameSeq = textOneLine.match(
      /\b([A-Z][A-Z\-]{2,}\s+[A-Z][A-Z\-]{2,}(?:\s+[A-Z][A-Z\-]{2,}){0,2})\b/
    );
    if (nameSeq) {
      nameValue = nameSeq[1];
      nameConfidence = 0.7;
    }
  }

  if (nameValue) {
    const cleaned = cleanName(nameValue);
    if (cleaned.length > 3) {
      result.fullName = field(cleaned, nameConfidence);
    }
  }

  // ============ Dates ============
  const allDateMatches = [...textOneLine.matchAll(new RegExp(DATE_REGEX, "g"))];
  const validDates = allDateMatches
    .map((m) => ({ raw: m[0], iso: normalizeDate(m), index: m.index || 0 }))
    .filter((d) => d.iso !== "");

  if (validDates.length > 0) {
    // Birth date: look for date with context "Né le" or oldest date
    const birthCtx = textOneLine.match(/N[ée]\(?e?\)?\s+le\s*[:\-]?\s*(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})/i);
    if (birthCtx) {
      const iso = normalizeDate(birthCtx);
      if (iso) result.birthDate = field(iso, 0.92, birthCtx[0]);
    }

    // Expiry: look for "Valable jusqu'au"
    const expiryCtx = textOneLine.match(
      /(?:Valable\s+jusqu['']?au?|Date\s+d['']?expiration|Expire\s+le)\s*[:\-]?\s*(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})/i
    );
    if (expiryCtx) {
      const iso = normalizeDate(expiryCtx);
      if (iso) result.expiryDate = field(iso, 0.92, expiryCtx[0]);
    }

    // Fallback: chronological inference
    if (!result.birthDate || !result.expiryDate) {
      const sorted = [...validDates].sort((a, b) => a.iso.localeCompare(b.iso));
      const currentYear = new Date().getFullYear();

      if (!result.birthDate) {
        const oldest = sorted[0];
        const oldestYear = parseInt(oldest.iso.slice(0, 4));
        if (oldestYear < currentYear - 15) {
          result.birthDate = field(oldest.iso, 0.85, oldest.raw);
        } else {
          result.birthDate = field(validDates[0].iso, 0.7, validDates[0].raw);
        }
      }

      if (!result.expiryDate && sorted.length > 1) {
        const newest = sorted[sorted.length - 1];
        const newestYear = parseInt(newest.iso.slice(0, 4));
        if (newestYear >= currentYear) {
          result.expiryDate = field(newest.iso, 0.85, newest.raw);
        }
      }
    }
  }

  // ============ Birthplace ============
  // Try multi-line text first (preserves "\nà PLACE" structure), then single-line
  for (const pat of BIRTHPLACE_PATTERNS) {
    const m = text.match(pat) || textOneLine.match(pat);
    if (m && m[1]) {
      const cleaned = cleanPlaceOrAddress(m[1]);
      if (cleaned.length > 2 && !looksLikeAddress(cleaned)) {
        result.birthPlace = field(cleaned, 0.85, m[0]);
        break;
      }
    }
  }

  // ============ Address ============
  for (const pat of ADDRESS_PATTERNS) {
    const m = textOneLine.match(pat);
    if (m && m[1]) {
      const cleaned = cleanPlaceOrAddress(m[1]);
      if (cleaned.length > 5) {
        // If matched via fallback (COMPLEX/RUE...), prepend the keyword
        const prefix = m[0].split(/\s+/)[0].toUpperCase();
        const full = pat === ADDRESS_PATTERNS[1] ? `${prefix} ${cleaned}` : cleaned;
        result.address = field(full, 0.78, m[0]);
        break;
      }
    }
  }

  // ============ Nationality ============
  if (result.cinNumber) {
    result.nationality = field("Marocaine", 0.99);
  }

  return result;
}

// ============================================
// Helpers
// ============================================

function cleanName(s: string): string {
  let cleaned = s
    .replace(/[^A-Za-zÀ-ÿ\u0600-\u06FF\s\-']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Filter out noise keywords and single letters
  const words = cleaned.split(" ").filter((w) => {
    const upper = w.toUpperCase();
    if (NAME_NOISE_KEYWORDS.has(upper)) return false;
    if (w.length === 1 && /[A-Z]/i.test(w)) return false;
    return true;
  });

  // Limit to first 4 words max (Prénom + Nom usually)
  const limited = words.slice(0, 4);

  // Title case
  return limited
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ")
    .slice(0, 50)
    .trim();
}

function cleanPlaceOrAddress(s: string): string {
  let cleaned = s
    .replace(/[\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Remove trailing single letters
  const words = cleaned.split(" ").filter((w, i, arr) => {
    if (i === arr.length - 1 && w.length === 1 && /[A-Za-z]/.test(w)) return false;
    return true;
  });

  cleaned = words.join(" ").trim();

  // Smart truncation at word boundary near 150 chars
  if (cleaned.length > 150) {
    const cutoff = cleaned.lastIndexOf(" ", 150);
    cleaned = cleaned.slice(0, cutoff > 50 ? cutoff : 150);
  }

  // Convert to UPPER if mostly uppercase (preserve original format)
  return cleaned;
}

function looksLikeAddress(s: string): boolean {
  return /\b(?:RUE|AV|BD|BOULEVARD|COMPLEX|IMM|N[°o]\s*\d|QUARTIER|HAY|LOT)\b/i.test(s);
}

function normalizeDate(match: RegExpMatchArray): string {
  let day = parseInt(match[1], 10);
  let month = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);
  if (year < 100) year += year > 30 ? 1900 : 2000;
  if (month > 12 && day <= 12) [day, month] = [month, day];
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
