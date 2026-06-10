// ============================================
// Moroccan Driver License parser - Professional Version
// Uses multiple strategies for maximum accuracy
// ============================================
import { LicenseData, ExtractedField } from "../types";

function field(value: string, confidence = 0.9, rawMatch?: string): ExtractedField {
  return { value: value.trim(), confidence, rawMatch };
}

export function parseLicense(rawText: string): Partial<LicenseData> {
  const text = rawText;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const result: Partial<LicenseData> = {};

  console.log("📝 License Raw text:", text.substring(0, 500));

  // ============================================
  // STRATEGY 1: License Number (Most Critical)
  // ============================================
  
  const licensePatterns = [
    // "Permis N° 52/007657" - Most common
    /PERMIS\s+N[°o][\s:]+(\d{2,3}\s*[/\\]\s*\d{4,8})/i,
    // "N° du permis: 52/007657"
    /N[°o]\s*(?:DU\s+)?PERMIS[\s:]+(\d{2,3}\s*[/\\]\s*\d{4,8})/i,
    // "رقم الرخصة 52/007657"
    /رقم\s+الرخصة[\s:]+(\d{2,3}\s*[/\\]\s*\d{4,8})/i,
    // Standalone with slash
    /\b(\d{2,3}\s*[/\\]\s*\d{5,8})\b/,
    // Long numeric only
    /\b(\d{10,12})\b/,
  ];

  for (const pat of licensePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const cleaned = match[1].replace(/\s/g, '').replace(/\\/g, '/');
      if (cleaned.length >= 6 && /\d/.test(cleaned)) {
        // Reject if looks like date (e.g., 04/1972)
        const parts = cleaned.split('/');
        if (parts.length === 2) {
          const second = parseInt(parts[1]);
          if (second > 1900 && second < 2100) {
            console.log("⚠️ Rejected license number (looks like date):", cleaned);
            continue;
          }
        }
        
        result.licenseNumber = field(cleaned, 0.95, match[0]);
        console.log("✅ License Number:", result.licenseNumber.value);
        break;
      }
    }
  }

  // ============================================
  // STRATEGY 2: Full Name
  // ============================================
  
  // "Prénom: RACHID\nNom: ACHERKOUK"
  const prenomNomMatch = text.match(/PR[ÉE]NOM[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,})\s*\n\s*NOM[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,})/i);
  if (prenomNomMatch) {
    result.fullName = field(`${prenomNomMatch[1]} ${prenomNomMatch[2]}`, 0.93);
    console.log("✅ Name from Prénom/Nom:", result.fullName.value);
  }
  
  // "Nom: ACHERKOUK\nPrénom: RACHID"
  if (!result.fullName) {
    const nomPrenomMatch = text.match(/NOM[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,})\s*\n\s*PR[ÉE]NOM[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,})/i);
    if (nomPrenomMatch) {
      result.fullName = field(`${nomPrenomMatch[2]} ${nomPrenomMatch[1]}`, 0.93);
      console.log("✅ Name from Nom/Prénom:", result.fullName.value);
    }
  }
  
  // Arabic name
  if (!result.fullName) {
    const arabicNameMatch = text.match(/الإسم\s+(?:الشخصي|العائلي)[:\s]+([\u0600-\u06FF\s]{3,})/i);
    if (arabicNameMatch) {
      result.fullName = field(arabicNameMatch[1].trim(), 0.87);
      console.log("✅ Name from Arabic:", result.fullName.value);
    }
  }

  // ============================================
  // STRATEGY 3: Birth Date
  // ============================================
  
  const birthPatterns = [
    /N[ée]E?\s+(?:LE|le)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    /(?:DATE\s+DE\s+NAISSANCE|تاريخ\s+الولادة)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
  ];
  
  for (const pat of birthPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const normalized = normalizeDate(match[1]);
      if (normalized) {
        result.birthDate = field(normalized, 0.92);
        console.log("✅ Birth Date:", result.birthDate.value);
        break;
      }
    }
  }

  // ============================================
  // STRATEGY 4: Issue Date
  // ============================================
  
  const issuePatterns = [
    // "Délivré le 15/08/1996"
    /(?:D[ée]LIVR[ée]\s+LE|DATE\s+DE\s+D[ée]LIVRANCE)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    // "Chefchaouen le 15/08/1996"
    /\w+\s+LE\s+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    // "في شفشاون 15/08/1996"
    /في\s+[\u0600-\u06FF\s]+\s+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
  ];
  
  for (const pat of issuePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const normalized = normalizeDate(match[1]);
      if (normalized) {
        result.issueDate = field(normalized, 0.90);
        console.log("✅ Issue Date:", result.issueDate.value);
        break;
      }
    }
  }

  // ============================================
  // STRATEGY 5: Expiry Date
  // ============================================
  
  const expiryPatterns = [
    // "Date de fin de validité 01/02/2026"
    /(?:DATE\s+DE\s+FIN\s+DE\s+VALIDIT[ÉE]|تاريخ\s+نهاية\s+الصلاحية)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    // "Valable jusqu'au 01/02/2026"
    /(?:VALABLE\s+JUSQU['']AU|Expire\s+le)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
  ];
  
  for (const pat of expiryPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const normalized = normalizeDate(match[1]);
      if (normalized) {
        result.expiryDate = field(normalized, 0.92);
        console.log("✅ Expiry Date:", result.expiryDate.value);
        break;
      }
    }
  }

  // Fallback: Calculate issue date from expiry (10 years validity)
  if (!result.issueDate && result.expiryDate) {
    const expDate = new Date(result.expiryDate.value);
    expDate.setFullYear(expDate.getFullYear() - 10);
    result.issueDate = field(expDate.toISOString().split('T')[0], 0.70);
    console.log("✅ Issue Date (calculated):", result.issueDate.value);
  }

  // ============================================
  // STRATEGY 6: Categories (From Verso Table)
  // ============================================
  
  const categories: string[] = [];
  
  // Parse verso table: "B 15/08/1996" or "A1 [icon] 12/05/2010"
  for (const line of lines) {
    // Match category letter + date on same line
    const catMatch = line.match(/^(A[12]?|B|C[1E]?|D[1E]?|EB|EC|ED)\s+.*?\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4}/i);
    if (catMatch) {
      const cat = catMatch[1].toUpperCase();
      if (!categories.includes(cat)) {
        categories.push(cat);
      }
    }
  }
  
  if (categories.length > 0) {
    result.categories = field(categories.join(','), 0.96);
    console.log("✅ Categories (from verso):", result.categories.value);
  } else {
    // Fallback: Single category from recto
    const rectoCatMatch = text.match(/\b(?:CAT[ÉE]GORIE|الصنف)[:\s]+([A-E][12]?)/i);
    if (rectoCatMatch) {
      result.categories = field(rectoCatMatch[1].toUpperCase(), 0.90);
      console.log("✅ Category (from recto):", result.categories.value);
    } else {
      // Last fallback: standalone B (most common)
      const standaloneCat = text.match(/(?:^|\n)([ABCDE])(?:\s|$)/m);
      if (standaloneCat && standaloneCat[1] !== 'M' && standaloneCat[1] !== 'F') {
        result.categories = field(standaloneCat[1], 0.75);
        console.log("✅ Category (standalone):", result.categories.value);
      } else {
        result.categories = field('B', 0.60);
      }
    }
  }

  // ============================================
  // STRATEGY 7: Country
  // ============================================
  
  if (text.toUpperCase().includes('MAROC') || text.includes('المملكة المغربية')) {
    result.issuingCountry = field('Maroc', 0.95);
  }

  console.log("📊 Final License Result:", result);
  return result;
}

// ============================================
// Helper Functions
// ============================================

function normalizeDate(dateStr: string): string {
  dateStr = dateStr.replace(/\s/g, '');
  
  const formats = [
    /(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{2,4})/,
    /(\d{4})[./\-\s](\d{1,2})[./\-\s](\d{1,2})/,
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let day, month, year;
      
      if (format.source.includes('\\d{4}') && format.source.indexOf('\\d{4}') === 1) {
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
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }
  
  return '';
}
