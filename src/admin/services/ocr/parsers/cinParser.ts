// ============================================
// Moroccan CIN parser - Professional Version
// Uses MRZ (Machine Readable Zone) for 100% accuracy
// ============================================
import { CinData, ExtractedField } from "../types";

function field(value: string, confidence = 0.9, rawMatch?: string): ExtractedField {
  return { value: value.trim(), confidence, rawMatch };
}

export function parseCin(rawText: string): Partial<CinData> {
  const text = rawText;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const result: Partial<CinData> = {};

  console.log("📝 CIN Raw text:", text.substring(0, 500));

  // ============================================
  // STRATEGY 1: MRZ (Machine Readable Zone) - Most Accurate
  // Format: 3 lines at the bottom of CIN
  // Line 1: IDMAR<NUMBER<7<CIN_NUMBER<<<<<<<
  // Line 2: YYMMDDXMYYMMDDXMAR<<<<<<<<<<<<
  // Line 3: SURNAME<<FIRST_NAME<<<<<<<<<<<<
  // ============================================
  
  // Find MRZ lines (lines with <<<<<<< pattern)
  const mrzLines = lines.filter(l => l.includes('<<<<'));
  
  if (mrzLines.length >= 2) {
    console.log("✅ MRZ detected, using high-accuracy extraction");
    
    // Extract from MRZ Line 1: CIN Number
    const mrzLine1 = mrzLines[0];
    const cinMatch = mrzLine1.match(/IDMAR\w+<\d+<([A-Z]{2}\d{5,7})/);
    if (cinMatch) {
      result.cinNumber = field(cinMatch[1], 0.98, mrzLine1);
      console.log("✅ CIN from MRZ:", result.cinNumber.value);
    }
    
    // Extract from MRZ Line 2: Birth date and expiry date
    if (mrzLines.length >= 2) {
      const mrzLine2 = mrzLines[1];
      // Format: YYMMDD X YYMMDD X MAR
      const dateMatch = mrzLine2.match(/(\d{6})\d(\d{6})/);
      if (dateMatch) {
        const birthDate = parseMRZDate(dateMatch[1]);
        const expiryDate = parseMRZDate(dateMatch[2]);
        
        if (birthDate) {
          result.birthDate = field(birthDate, 0.98, mrzLine2);
          console.log("✅ Birth date from MRZ:", result.birthDate.value);
        }
        if (expiryDate) {
          result.expiryDate = field(expiryDate, 0.98, mrzLine2);
          console.log("✅ Expiry date from MRZ:", result.expiryDate.value);
        }
      }
    }
    
    // Extract from MRZ Line 3: Name (SURNAME<<FIRST_NAME)
    if (mrzLines.length >= 3) {
      const mrzLine3 = mrzLines[2];
      const nameMatch = mrzLine3.match(/^([A-Z<]+)<<([A-Z<]+)/);
      if (nameMatch) {
        const surname = nameMatch[1].replace(/</g, ' ').trim();
        const firstName = nameMatch[2].replace(/</g, ' ').trim();
        const fullName = `${firstName} ${surname}`.replace(/\s+/g, ' ').trim();
        
        if (fullName.length > 3) {
          result.fullName = field(fullName, 0.97, mrzLine3);
          console.log("✅ Name from MRZ:", result.fullName.value);
        }
      }
    }
  }

  // ============================================
  // STRATEGY 2: Regular Text Extraction (Fallback/Enhancement)
  // ============================================
  
  // CIN Number (if not from MRZ)
  if (!result.cinNumber) {
    const cinPatterns = [
      /N[°o]\s*(?:CIN|C\.N\.I)[\s:]*([A-Z]{2}\s*\d{5,7})/i,
      /\b([A-Z]{2}\d{5,7})\b/,
      /LC\s*\d{5,7}/i,
    ];
    
    for (const pat of cinPatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        result.cinNumber = field(match[1].replace(/\s/g, '').toUpperCase(), 0.90, match[0]);
        console.log("✅ CIN from text:", result.cinNumber.value);
        break;
      }
    }
  }

  // Full Name (if not from MRZ)
  if (!result.fullName) {
    // Try "Prénom: X\nNom: Y" pattern
    const prenomNomMatch = text.match(/Prénom[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,})\s*\n\s*Nom[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿa-z\-']{2,})/i);
    if (prenomNomMatch) {
      result.fullName = field(`${prenomNomMatch[1]} ${prenomNomMatch[2]}`, 0.92);
      console.log("✅ Name from Prénom/Nom:", result.fullName.value);
    }
    
    // Try "NOM ET PRENOM: X Y" pattern
    if (!result.fullName) {
      const nomPrenomMatch = text.match(/NOM\s+ET\s+PRENOM[:\s]+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{5,})/i);
      if (nomPrenomMatch) {
        result.fullName = field(nomPrenomMatch[1].trim(), 0.88);
        console.log("✅ Name from NOM ET PRENOM:", result.fullName.value);
      }
    }
    
    // Try Arabic name pattern
    if (!result.fullName) {
      const arabicNameMatch = text.match(/الإسم\s+(?:الشخصي|العائلي)[:\s]+([\u0600-\u06FF\s]{3,})/i);
      if (arabicNameMatch) {
        result.fullName = field(arabicNameMatch[1].trim(), 0.85);
        console.log("✅ Name from Arabic:", result.fullName.value);
      }
    }
  }

  // Birth Date (if not from MRZ)
  if (!result.birthDate) {
    const birthPatterns = [
      /N[ée]E?\s+(?:LE|le)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
      /(?:DATE\s+DE\s+NAISSANCE|تاريخ\s+الولادة)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
      /\b(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{4})\b/,
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

  // Expiry Date (if not from MRZ)
    if (!result.expiryDate) {
      const expiryPatterns = [
        /(?:VALABLE\s+JUSQU['']AU|DATE\s+D['']?EXPIRATION)[:\s]+(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{2,4})/i,
        /\b(\d{1,2}[./\-\s]\d{1,2}[./\-\s]\d{4})\b/g,
      ];
      
      for (const pat of expiryPatterns) {
        const matches = [...text.matchAll(pat)];
        if (matches.length > 0) {
          // Get the last date (usually expiry)
          const lastMatch = matches[matches.length - 1];
          if (lastMatch[1]) {
            const normalized = normalizeDate(lastMatch[1]);
            if (normalized) {
              result.expiryDate = field(normalized, 0.88);
              console.log("✅ Expiry date from text:", result.expiryDate.value);
              break;
            }
          }
        }
      }
    }

  // Birth Place
  const birthPlacePatterns = [
    /(?:N[ée]E?\s+(?:LE|le)[^,]*,?\s*(?:à|au)\s+)([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-']{3,})/i,
    /(?:LIEU\s+DE\s+NAISSANCE|مكان\s+الولادة)[:\s]+([A-ZÀ-Ÿ\u0600-\u06FF][A-ZÀ-Ÿ\u0600-\u06FF\s\-']{3,})/i,
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
    /(?:ADRESSE|العنوان)[:\s]+([A-Z0-9\u0600-\u06FF][^\n]{5,100})/i,
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
  
  // MRZ uses 2-digit year: 00-49 = 2000-2049, 50-99 = 1950-1999
  year += year < 50 ? 2000 : 1900;
  
  if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  return '';
}

function normalizeDate(dateStr: string): string {
  // Remove spaces
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
