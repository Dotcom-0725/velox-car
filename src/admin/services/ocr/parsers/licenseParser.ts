// ============================================
// Moroccan Driver License parser - Professional Version
// ============================================
import { LicenseData, ExtractedField } from "../types";

function field(value: string, confidence = 0.9, rawMatch?: string): ExtractedField {
  return { value: value.trim(), confidence, rawMatch };
}

export function parseLicense(rawText: string): Partial<LicenseData> {
  const text = rawText;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const result: Partial<LicenseData> = {};

  console.log("🔍 License Parser - Raw text:", text);
  console.log("🔍 License Parser - Lines:", lines);

  // ============================================
  // 1. License Number (Most Critical)
  // ============================================
  
  const licensePatterns = [
    /PERMIS\s+N[°o][\s:]+(\d{2,3}\s*[/\\]\s*\d{4,8})/i,
    /N[°o]\s*(?:DU\s+)?PERMIS[\s:]+(\d{2,3}\s*[/\\]\s*\d{4,8})/i,
    /رقم\s+الرخصة[\s:]+(\d{2,3}\s*[/\\]\s*\d{4,8})/i,
    /\b(\d{2,3}\s*[/\\]\s*\d{5,8})\b/,
    /\b(\d{10,12})\b/,
  ];

  for (const pat of licensePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const cleaned = match[1].replace(/\s/g, '').replace(/\\/g, '/');
      if (cleaned.length >= 6 && /\d/.test(cleaned)) {
        // Reject if looks like date
        const parts = cleaned.split('/');
        if (parts.length === 2) {
          const second = parseInt(parts[1]);
          if (second > 1900 && second < 2100) {
            console.log("⚠️ Rejected (looks like date):", cleaned);
            continue;
          }
        }
        
        result.licenseNumber = field(cleaned, 0.95);
        console.log("✅ License Number:", result.licenseNumber.value);
        break;
      }
    }
  }

  // ============================================
  // 2. Full Name
  // ============================================
  
  const namePatterns = [
    /PR[ÉE]NOM[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,})\s*\n\s*NOM[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,})/i,
    /NOM[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,})\s*\n\s*PR[ÉE]NOM[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-']{2,})/i,
    /الإسم\s+(?:الشخصي|العائلي)[:\s]+([\u0600-\u06FF\s]{3,})/i,
  ];
  
  for (const pat of namePatterns) {
    const match = text.match(pat);
    if (match) {
      let fullName = '';
      if (match[2]) {
        fullName = `${match[1]} ${match[2]}`;
      } else {
        fullName = match[1];
      }
      
      if (fullName.trim().length > 3) {
        result.fullName = field(fullName.trim(), 0.93);
        console.log("✅ Name:", result.fullName.value);
        break;
      }
    }
  }

  // ============================================
  // 3. Birth Date
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
  // 4. Issue Date
  // ============================================
  
  const issuePatterns = [
    /(?:D[ée]LIVR[ée]\s+LE|DATE\s+DE\s+D[ée]LIVRANCE)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    /\w+\s+LE\s+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
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
  // 5. Expiry Date
  // ============================================
  
  const expiryPatterns = [
    /(?:DATE\s+DE\s+FIN\s+DE\s+VALIDIT[ÉE]|تاريخ\s+نهاية\s+الصلاحية)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
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

  // Fallback: Calculate from expiry
  if (!result.issueDate && result.expiryDate) {
    const expDate = new Date(result.expiryDate.value);
    expDate.setFullYear(expDate.getFullYear() - 10);
    result.issueDate = field(expDate.toISOString().split('T')[0], 0.70);
    console.log("✅ Issue Date (calculated):", result.issueDate.value);
  }

  // ============================================
  // 6. Categories
  // ============================================
  
  const categories: string[] = [];
  
  for (const line of lines) {
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
    console.log("✅ Categories:", result.categories.value);
  } else {
    const rectoCatMatch = text.match(/\b(?:CAT[ÉE]GORIE|الصنف)[:\s]+([A-E][12]?)/i);
    if (rectoCatMatch) {
      result.categories = field(rectoCatMatch[1].toUpperCase(), 0.90);
      console.log("✅ Category (recto):", result.categories.value);
    } else {
      result.categories = field('B', 0.60);
      console.log("✅ Category (default):", result.categories.value);
    }
  }

  // ============================================
  // 7. Country
  // ============================================
  
  if (text.toUpperCase().includes('MAROC') || text.includes('المملكة المغربية')) {
    result.issuingCountry = field('Maroc', 0.95);
    console.log("✅ Country:", result.issuingCountry.value);
  }

  console.log("📊 Final License Result:", result);
  return result;
}

// ============================================
// Helper
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
