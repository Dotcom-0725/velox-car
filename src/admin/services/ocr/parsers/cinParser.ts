// ============================================
// Moroccan CIN parser - Professional Version
// ============================================
import { CinData, ExtractedField } from "../types";

function field(value: string, confidence = 0.9, rawMatch?: string): ExtractedField {
  return { value: value.trim(), confidence, rawMatch };
}

export function parseCin(rawText: string): Partial<CinData> {
  const text = rawText;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const result: Partial<CinData> = {};

  console.log("🔍 CIN Parser - Raw text:", text);
  console.log("🔍 CIN Parser - Lines:", lines);

  // ============================================
  // STRATEGY 1: MRZ (Machine Readable Zone)
  // ============================================
  const mrzLines = lines.filter(l => l.includes('<<<<') || l.includes('IDMAR'));
  
  if (mrzLines.length >= 2) {
    console.log("✅ MRZ detected!");
    
    // CIN Number from MRZ Line 1
    const mrzLine1 = mrzLines[0];
    const cinMatch = mrzLine1.match(/IDMAR\w+<\d+<([A-Z]{2}\d{5,7})/);
    if (cinMatch) {
      result.cinNumber = field(cinMatch[1], 0.98);
      console.log("✅ CIN Number from MRZ:", result.cinNumber.value);
    }
    
    // Dates from MRZ Line 2
    if (mrzLines.length >= 2) {
      const mrzLine2 = mrzLines[1];
      const dateMatch = mrzLine2.match(/(\d{6})\d(\d{6})/);
      if (dateMatch) {
        const birthDate = parseMRZDate(dateMatch[1]);
        const expiryDate = parseMRZDate(dateMatch[2]);
        
        if (birthDate) {
          result.birthDate = field(birthDate, 0.98);
          console.log("✅ Birth date from MRZ:", result.birthDate.value);
        }
        if (expiryDate) {
          result.expiryDate = field(expiryDate, 0.98);
          console.log("✅ Expiry date from MRZ:", result.expiryDate.value);
        }
      }
    }
    
    // Name from MRZ Line 3
    if (mrzLines.length >= 3) {
      const mrzLine3 = mrzLines[2];
      const nameMatch = mrzLine3.match(/^([A-Z<]+)<<([A-Z<]+)/);
      if (nameMatch) {
        const surname = nameMatch[1].replace(/</g, ' ').trim();
        const firstName = nameMatch[2].replace(/</g, ' ').trim();
        const fullName = `${firstName} ${surname}`.replace(/\s+/g, ' ').trim();
        
        if (fullName.length > 3) {
          result.fullName = field(fullName, 0.97);
          console.log("✅ Name from MRZ:", result.fullName.value);
        }
      }
    }
  }

  // ============================================
  // STRATEGY 2: Regular text extraction
  // ============================================
  
  // CIN Number (fallback)
  if (!result.cinNumber) {
    const cinPatterns = [
      /N[°o]\s*(?:CIN|C\.N\.I)[\s:]*([A-Z]{2}\s*\d{5,7})/i,
      /\b([A-Z]{2}\d{5,7})\b/,
    ];
    
    for (const pat of cinPatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        result.cinNumber = field(match[1].replace(/\s/g, '').toUpperCase(), 0.90);
        console.log("✅ CIN Number from text:", result.cinNumber.value);
        break;
      }
    }
  }

  // Full Name (fallback)
  if (!result.fullName) {
    const namePatterns = [
      /Prénom[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,})\s*\n\s*Nom[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,})/i,
      /Nom[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,})\s*\n\s*Prénom[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,})/i,
      /NOM\s+ET\s+PRENOM[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{5,})/i,
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
          result.fullName = field(fullName.trim(), 0.88);
          console.log("✅ Name from text:", result.fullName.value);
          break;
        }
      }
    }
  }

  // Birth Date (fallback)
  if (!result.birthDate) {
    const birthPatterns = [
      /N[ée]E?\s+(?:LE|le)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
      /(?:DATE\s+DE\s+NAISSANCE|تاريخ\s+الولادة)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    ];
    
    for (const pat of birthPatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        const normalized = normalizeDate(match[1]);
        if (normalized) {
          result.birthDate = field(normalized, 0.90);
          console.log("✅ Birth date from text:", result.birthDate.value);
          break;
        }
      }
    }
  }

  // Expiry Date (fallback)
  if (!result.expiryDate) {
    const expiryPatterns = [
      /(?:VALABLE\s+JUSQU['']AU|DATE\s+D['']?EXPIRATION)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
    ];
    
    for (const pat of expiryPatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        const normalized = normalizeDate(match[1]);
        if (normalized) {
          result.expiryDate = field(normalized, 0.88);
          console.log("✅ Expiry date from text:", result.expiryDate.value);
          break;
        }
      }
    }
  }

  // Birth Place
  const birthPlacePatterns = [
    /(?:N[ée]E?\s+(?:LE|le)[^,]*,?\s*(?:à|au)\s+)([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{3,})/i,
    /(?:LIEU\s+DE\s+NAISSANCE)[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{3,})/i,
  ];
  
  for (const pat of birthPlacePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const cleaned = match[1].trim();
      if (cleaned.length > 2 && cleaned.length < 50) {
        result.birthPlace = field(cleaned, 0.87);
        console.log("✅ Birth place:", result.birthPlace.value);
        break;
      }
    }
  }

  // Address
  const addressPatterns = [
    /(?:ADRESSE|العنوان)[:\s]+([^\n]{5,100})/i,
  ];
  
  for (const pat of addressPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const cleaned = match[1].trim();
      if (cleaned.length > 5) {
        result.address = field(cleaned, 0.85);
        console.log("✅ Address:", result.address.value);
        break;
      }
    }
  }

  // Nationality
  if (text.toUpperCase().includes('MAROCAINE') || text.toUpperCase().includes('MAROC')) {
    result.nationality = field('Marocaine', 0.95);
    console.log("✅ Nationality:", result.nationality.value);
  }

  console.log("📊 Final CIN Result:", result);
  return result;
}

// ============================================
// Helper Functions
// ============================================

function parseMRZDate(dateStr: string): string {
  if (dateStr.length !== 6) return '';
  
  let year = parseInt(dateStr.substr(0, 2));
  const month = parseInt(dateStr.substr(2, 2));
  const day = parseInt(dateStr.substr(4, 2));
  
  year += year < 50 ? 2000 : 1900;
  
  if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  return '';
}

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
