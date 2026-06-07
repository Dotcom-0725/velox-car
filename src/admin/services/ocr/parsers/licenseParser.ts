// ============================================
// Moroccan Driver License parser
// CRITICAL FIX: License number must NOT match date formats!
//
// Real Moroccan license format examples:
//   52/007657   ← prefix(1-3 digits) / suffix(6+ digits)
//   10/123456
//   5/0123456
//
// MUST NOT MATCH:
//   01/04/1972  (date — 3 segments)
//   15/08/1996  (date — 3 segments)
//   04/1972     (partial date)
// ============================================
import { LicenseData, ExtractedField } from "../types";

function field(value: string, confidence = 0.9, rawMatch?: string): ExtractedField {
  return { value: value.trim(), confidence, rawMatch };
}

// ============================================
// License number patterns — STRICT rules:
// 1. The number must come AFTER "Permis N°" keyword (highest priority)
// 2. Standalone format: 2 segments only (NOT 3 like dates)
// 3. Suffix must be 5+ digits (dates have at most 4 in year)
// 4. NOT preceded by digit (to avoid matching part of dates)
// ============================================
const LICENSE_PATTERNS = [
  // Highest priority: explicit "Permis N°" context
  /Permis\s*N[°o]?\s*[:\-]?\s*(\d{1,3}\s*[/\\\-]\s*\d{5,10})\b/i,
  // "N° du permis: ..."
  /N[°o]\s*du\s+permis\s*[:\-]?\s*(\d{1,3}\s*[/\\\-]\s*\d{5,10})\b/i,
  // "Numéro: ..."
  /Num[ée]ro\s*[:\-]?\s*(\d{1,3}\s*[/\\\-]\s*\d{5,10})\b/i,
  // Standalone format — STRICT: must be 2 segments (date has 3), suffix 5+ digits, NOT after a digit
  /(?<!\d)(\d{1,3}\s*[/\\]\s*\d{5,10})(?!\d|\s*[/\\\-]\s*\d)/,
  // Long numeric (10-12 digits, no separator) — but not part of date
  /(?<!\d)(\d{10,12})(?!\d|\s*[/\\\-])/,
];

const DATE_REGEX = /\b(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})\b/g;

const NAME_NOISE_KEYWORDS = new Set([
  "NOM", "PRENOM", "PRÉNOM", "PRENOMS", "PRÉNOMS",
  "ET", "FAMILY", "NAME", "PERMIS", "CONDUIRE",
  "DRIVING", "LICENSE", "LICENCE", "DRIVER",
  "ROYAUME", "MAROC", "MOROCCO", "DU", "DE", "LE", "LA",
  "VALABLE", "JUSQU", "JUSQUAU", "VALID", "UNTIL",
  "NÉ", "NEE", "NÉE", "BORN", "À",
  "CNI", "CIN", "CNIE", "CATÉGORIES", "CATEGORIES",
  "ECHANGE", "ÉCHANGE", "DATE", "DELIVRANCE", "DÉLIVRANCE",
  "RESTRICTIONS", "FIN", "VALIDITE", "VALIDITÉ",
  "DIRECTEUR", "TRANSPORTS", "SECURITE", "SÉCURITÉ",
  "ROUTIERE", "ROUTIÈRE",
]);

const CATEGORY_REGEX = /(?:Cat[ée]gorie(?:s)?)\s*[:\-]?\s*([A-E][12]?(?:\s*[+,/]\s*[A-E][12]?){0,5})\b(?!\s*\.)/i;
const COUNTRY_REGEX = /(?:Maroc|MAROC|Morocco|المملكة\s*المغربية|royaume)/i;

const ISSUE_DATE_CONTEXT = /(?:D[ée]livr[ée]\s+le|Date\s+de\s+d[ée]livrance|Issued|Issue\s+date|Chefchaouen\s+le)\s*[:\-]?\s*(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})/i;
const EXPIRY_DATE_CONTEXT = /(?:Valable\s+jusqu['']?au?|Date\s+de\s+fin\s+de\s+validit[ée]|Expire|Valid\s+until|Jusqu['']?au?)\s*[:\-]?\s*(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})/i;
const BIRTH_DATE_CONTEXT = /(?:N[ée]\(?e?\)?\s+le|Date\s+de\s+naissance|Born)\s*[:\-]?\s*(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})/i;
const EXCHANGE_DATE_CONTEXT = /[ÉE]change\s+le\s*[:\-]?\s*(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})/i;

export function parseLicense(rawText: string): Partial<LicenseData> {
  const text = rawText.replace(/[ \t]+/g, " ").trim();
  const textOneLine = text.replace(/\s+/g, " ");
  const result: Partial<LicenseData> = {};

  // ============ Collect all dates FIRST so we can exclude them from license number matching ============
  const allDateMatches = [...textOneLine.matchAll(DATE_REGEX)];
  const dateRanges = allDateMatches.map((m) => ({
    start: m.index || 0,
    end: (m.index || 0) + m[0].length,
    raw: m[0],
    iso: normalizeDate(m),
  }));

  // ============ License number — with date exclusion ============
  for (const pat of LICENSE_PATTERNS) {
    // Find all matches (not just first)
    const regex = new RegExp(pat.source, pat.flags + (pat.flags.includes("g") ? "" : "g"));
    const matches = [...textOneLine.matchAll(regex)];

    for (const m of matches) {
      if (!m[1]) continue;
      const matchStart = m.index || 0;
      const matchEnd = matchStart + m[0].length;

      // Skip if this match overlaps with a date
      const overlapsDate = dateRanges.some(
        (d) => matchStart < d.end && matchEnd > d.start
      );
      if (overlapsDate) continue;

      const cleaned = m[1]
        .replace(/\s+/g, "")
        .replace(/[\\\-]/g, "/")
        .toUpperCase();

      // Final validation
      if (cleaned.length >= 6 && cleaned.length <= 15 && /\d/.test(cleaned)) {
        // Reject if it looks like a date fragment (e.g., "04/1972")
        if (/^\d{1,2}\/\d{4}$/.test(cleaned) && parseInt(cleaned.split("/")[1]) > 1900) {
          continue; // skip year-like suffixes
        }
        result.licenseNumber = field(cleaned, 0.92, m[0]);
        break;
      }
    }
    if (result.licenseNumber) break;
  }

  // ============ Name (Prénom + Nom) ============
  let nameValue = "";
  let nameConfidence = 0.82;

  const prenomNomMatch = textOneLine.match(
    /Pr[ée]nom\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,25})[^A-Z]{0,30}?Nom\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,25})/i
  );
  if (prenomNomMatch) {
    nameValue = `${prenomNomMatch[1]} ${prenomNomMatch[2]}`;
    nameConfidence = 0.95;
  }

  if (!nameValue) {
    const nomPrenomMatch = textOneLine.match(
      /Nom\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,25})[^A-Z]{0,30}?Pr[ée]nom\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,25})/i
    );
    if (nomPrenomMatch) {
      nameValue = `${nomPrenomMatch[2]} ${nomPrenomMatch[1]}`;
      nameConfidence = 0.95;
    }
  }

  if (!nameValue) {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    for (let i = 0; i < lines.length - 1; i++) {
      const a = lines[i];
      const b = lines[i + 1];
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

  if (nameValue) {
    const cleaned = cleanName(nameValue);
    if (cleaned.length > 3) {
      result.fullName = field(cleaned, nameConfidence);
    }
  }

  // ============ Dates with context ============
  const birthCtx = textOneLine.match(BIRTH_DATE_CONTEXT);
  if (birthCtx) {
    const iso = normalizeDate(birthCtx);
    if (iso) result.birthDate = field(iso, 0.92, birthCtx[0]);
  }

  const issueCtx = textOneLine.match(ISSUE_DATE_CONTEXT);
  if (issueCtx) {
    const iso = normalizeDate(issueCtx);
    if (iso) result.issueDate = field(iso, 0.92, issueCtx[0]);
  }

  const expiryCtx = textOneLine.match(EXPIRY_DATE_CONTEXT);
  if (expiryCtx) {
    const iso = normalizeDate(expiryCtx);
    if (iso) result.expiryDate = field(iso, 0.92, expiryCtx[0]);
  }

  if (!result.issueDate) {
    const exchangeCtx = textOneLine.match(EXCHANGE_DATE_CONTEXT);
    if (exchangeCtx) {
      const iso = normalizeDate(exchangeCtx);
      if (iso) result.issueDate = field(iso, 0.85, exchangeCtx[0]);
    }
  }

  // Fallback for missing dates
  if (!result.birthDate || !result.issueDate || !result.expiryDate) {
    const uniqueDates = [...dateRanges]
      .filter((d) => d.iso !== "")
      .filter((d, i, arr) => arr.findIndex((x) => x.iso === d.iso) === i)
      .sort((a, b) => a.iso.localeCompare(b.iso));

    const currentYear = new Date().getFullYear();

    if (uniqueDates.length >= 3) {
      if (!result.birthDate) result.birthDate = field(uniqueDates[0].iso, 0.75, uniqueDates[0].raw);
      if (!result.issueDate) result.issueDate = field(uniqueDates[1].iso, 0.75, uniqueDates[1].raw);
      if (!result.expiryDate) result.expiryDate = field(uniqueDates[uniqueDates.length - 1].iso, 0.78, uniqueDates[uniqueDates.length - 1].raw);
    } else if (uniqueDates.length === 2) {
      if (!result.issueDate) {
        const oldestYr = parseInt(uniqueDates[0].iso.slice(0, 4));
        if (oldestYr < currentYear) result.issueDate = field(uniqueDates[0].iso, 0.72, uniqueDates[0].raw);
      }
      if (!result.expiryDate) {
        const newestYr = parseInt(uniqueDates[1].iso.slice(0, 4));
        if (newestYr >= currentYear) result.expiryDate = field(uniqueDates[1].iso, 0.78, uniqueDates[1].raw);
      }
    }
  }

  if (!result.issueDate && result.expiryDate) {
    const expDate = new Date(result.expiryDate.value);
    expDate.setFullYear(expDate.getFullYear() - 10);
    result.issueDate = field(expDate.toISOString().split("T")[0], 0.6);
  }

  // ============ Categories — IMPROVED LOGIC ============
  result.categories = extractCategories(text, textOneLine);

  // ============ Country ============
  if (COUNTRY_REGEX.test(textOneLine)) {
    result.issuingCountry = field("Maroc", 0.95);
  } else {
    result.issuingCountry = field("Maroc", 0.5);
  }

  return result;
}

// ============================================
// Categories extraction — handles both recto (single B) and verso (multi-line table)
// ============================================
function extractCategories(text: string, textOneLine: string): ExtractedField {
  // ============================================
  // Strategy 1: Verso table — only count categories that HAVE a date next to them
  // Format per line: "B 15/08/1996" or "A1 [icon] 12/05/2010"
  // Empty rows like "A1" alone should NOT be counted
  // ============================================
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const activeCategories: string[] = [];

  for (const line of lines) {
    // Must START with a category letter, then have a date somewhere on the line
    const catMatch = line.match(/^(A[12]?|B[12E]?|C[12E]?|D[12E]?|EB|EC|ED)\b/i);
    if (!catMatch) continue;

    // Check if this line has a date AFTER the category letter
    const dateMatch = line.match(/\b\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4}\b/);
    if (dateMatch && dateMatch.index! > catMatch[0].length - 1) {
      const cat = catMatch[1].toUpperCase();
      if (!activeCategories.includes(cat)) {
        activeCategories.push(cat);
      }
    }
  }

  if (activeCategories.length > 0) {
    return field(activeCategories.join(","), 0.95, activeCategories.join(","));
  }

  // ============================================
  // Strategy 2: Recto — look for "Catégorie: X" explicit format
  // ============================================
  const catContext = textOneLine.match(CATEGORY_REGEX);
  if (catContext && catContext[1]) {
    return field(catContext[1].replace(/\s/g, "").toUpperCase(), 0.9, catContext[0]);
  }

  // ============================================
  // Strategy 3: Recto — single letter at END of doc (typical for Moroccan recto)
  // Look for standalone B/A/C... that isn't part of a word
  // ============================================
  // Find the last 200 chars (usually category is near photo at bottom)
  const lastChunk = textOneLine.slice(-200);
  const standaloneMatch = lastChunk.match(/(?:^|\s)([ABCDE][12]?)(?:\s|$)/);
  if (standaloneMatch && standaloneMatch[1]) {
    const candidate = standaloneMatch[1].toUpperCase();
    // Reject single letters that could be noise (M for sexe etc.)
    if (!["M", "F", "N", "E", "D"].includes(candidate) || candidate === "B") {
      return field(candidate, 0.75, standaloneMatch[0]);
    }
  }

  // ============================================
  // Strategy 4: Default fallback — most common category in Morocco is "B" (car license)
  // ============================================
  return field("B", 0.5);
}

// ============================================
// Helpers
// ============================================

function cleanName(s: string): string {
  let cleaned = s
    .replace(/[^A-Za-zÀ-ÿ\u0600-\u06FF\s\-']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ").filter((w) => {
    const upper = w.toUpperCase();
    if (NAME_NOISE_KEYWORDS.has(upper)) return false;
    if (w.length === 1 && /[A-Z]/i.test(w)) return false;
    return true;
  });

  const limited = words.slice(0, 4);

  return limited
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ")
    .slice(0, 50)
    .trim();
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
