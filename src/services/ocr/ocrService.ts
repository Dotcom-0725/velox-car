/**
 * OCR Service - Service réutilisable pour l'extraction de texte
 * Utilise OCR.Space API (version gratuite: 25,000 requêtes/mois)
 */

const OCR_SPACE_API_KEY = import.meta.env.VITE_OCR_SPACE_API_KEY || 'helloworld';
const OCR_SPACE_BASE_URL = 'https://api.ocr.space/parse/image';

export interface OCRResponse {
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string[];
  ParsedResults?: ParsedResult[];
}

export interface ParsedResult {
  TextOverlay?: {
    Lines: {
      Words: { WordText: string; Left: number; Top: number }[];
    }[];
  };
  ParsedText: string;
  ErrorMessage?: string;
  ErrorDetails?: string;
}

export interface OCRFile {
  file: File;
  preview: string;
  extractedText?: string;
  parsedData?: ExtractedData;
}

export interface ExtractedData {
  fullName?: string;
  cinNumber?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  nationality?: string;
  cinExpiryDate?: string;
  licenseNumber?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  licenseCategories?: string;
  documentType?: 'CIN_RECTO' | 'CIN_VERSO' | 'LICENSE_RECTO' | 'LICENSE_VERSO' | 'UNKNOWN';
}

/**
 * Upload file to OCR.Space and extract text
 */
export async function extractTextFromImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('apikey', OCR_SPACE_API_KEY);
  formData.append('file', file);
  formData.append('language', 'fra'); // French + Arabic support
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');

  const response = await fetch(OCR_SPACE_BASE_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OCR.Space API error: ${response.statusText}`);
  }

  const data: OCRResponse = await response.json();

  if (data.IsErroredOnProcessing) {
    const errorMsg = data.ErrorMessage?.join(', ') || 'Unknown OCR error';
    throw new Error(`OCR processing error: ${errorMsg}`);
  }

  if (!data.ParsedResults || data.ParsedResults.length === 0) {
    throw new Error('No text extracted from image');
  }

  // Combine all parsed results
  return data.ParsedResults.map(r => r.ParsedText).join('\n');
}

/**
 * Parse extracted text and detect document type + extract fields
 */
export function parseExtractedText(text: string): ExtractedData {
  const data: ExtractedData = {};
  const fullText = text.toUpperCase();

  // Detect document type
  if (fullText.includes('ROYAUME DU MAROC') && fullText.includes('CARTE NATIONALE')) {
    // Check if it's recto or verso based on content
    if (fullText.includes('NÉ LE') || fullText.includes('NE LE') || /\d{2}[./\-]\d{2}[./\-]\d{4}/.test(text)) {
      data.documentType = 'CIN_RECTO';
    } else if (fullText.includes('ADRESSE') || fullText.includes('COMPLEXE') || fullText.includes('RUE')) {
      data.documentType = 'CIN_VERSO';
    } else {
      data.documentType = 'CIN_RECTO'; // Default to recto
    }
  } else if (fullText.includes('ROYAUME DU MAROC') && fullText.includes('PERMIS DE CONDUIRE')) {
    if (fullText.includes('CATÉGORIE') || fullText.includes('CATEGORIE') || fullText.includes('DATE DE DÉLIVRANCE')) {
      data.documentType = 'LICENSE_VERSO';
    } else {
      data.documentType = 'LICENSE_RECTO';
    }
  } else {
    data.documentType = 'UNKNOWN';
  }

  // Extract Full Name
  // Pattern 1: After "NOM ET PRENOM" or "NOM PRENOM"
  const nameMatch = text.match(/(?:NOM\s+ET\s+PRENOM|NOM\s+PRENOM)[:\s]+([A-ZÀ-ÿ\s\-']+?)(?:\n|$)/i);
  if (nameMatch) {
    data.fullName = nameMatch[1].trim();
  } else {
    // Pattern 2: After "Prénom" and "Nom"
    const prenomMatch = text.match(/Prénom[:\s]+([A-ZÀ-ÿ\-']+?)(?:\n|$)/i);
    const nomMatch = text.match(/Nom[:\s]+([A-ZÀ-ÿ\-']+?)(?:\n|$)/i);
    if (prenomMatch && nomMatch) {
      data.fullName = `${prenomMatch[1].trim()} ${nomMatch[1].trim()}`;
    } else if (nomMatch) {
      data.fullName = nomMatch[1].trim();
    }
  }

  // Extract CIN Number
  // Pattern: 2 letters + 5-7 digits (e.g., LC33683, BK123456)
  const cinMatch = text.match(/\b([A-Z]{2}\d{5,7})\b/);
  if (cinMatch) {
    data.cinNumber = cinMatch[1];
  }

  // Extract Birth Date
  // Pattern: "Né(e) le DD/MM/YYYY" or "Né le DD.MM.YYYY"
  const birthDateMatch = text.match(/N[ée]e?\s+le[:\s]+(\d{1,2}[./\-]\d{1,2}[./\-]\d{4})/i);
  if (birthDateMatch) {
    data.birthDate = normalizeDate(birthDateMatch[1]);
  }

  // Extract Birth Place
  // Pattern: "à PLACE" or "né à PLACE"
  const birthPlaceMatch = text.match(/(?:né|born)\s+(?:à|to)\s+([A-ZÀ-ÿ\s\-']+?)(?:\n|$)/i);
  if (birthPlaceMatch) {
    data.birthPlace = birthPlaceMatch[1].trim();
  }

  // Extract Address
  // Pattern: "Adresse ..." or "ADRESSE ..."
  const addressMatch = text.match(/Adresse[:\s]+(.+?)(?:\n|$)/i);
  if (addressMatch) {
    data.address = addressMatch[1].trim();
  }

  // Extract Nationality
  if (fullText.includes('MAROCAINE') || fullText.includes('MAROCAIN')) {
    data.nationality = 'Marocaine';
  } else if (fullText.includes('MAROC')) {
    data.nationality = 'Marocaine';
  }

  // Extract CIN Expiry Date
  // Pattern: "Valable jusqu'au DD/MM/YYYY" or "DATE D'EXPIRATION"
  const cinExpiryMatch = text.match(/(?:Valable\s+jusqu['']au|DATE\s+D['']?EXPIRATION)[:\s]*(\d{1,2}[./\-]\d{1,2}[./\-]\d{4})/i);
  if (cinExpiryMatch) {
    data.cinExpiryDate = normalizeDate(cinExpiryMatch[1]);
  }

  // Extract License Number
  // Pattern: "Permis N° XX/XXXXXXX" or just a long number
  const licenseMatch = text.match(/Permis\s+N[°o][:\s]+(\d{2,3}\/?\d{4,7})/i);
  if (licenseMatch) {
    data.licenseNumber = licenseMatch[1].trim();
  } else {
    // Fallback: look for pattern like 52/007657
    const licenseFallback = text.match(/\b(\d{2,3}\/\d{5,7})\b/);
    if (licenseFallback) {
      data.licenseNumber = licenseFallback[1];
    }
  }

  // Extract License Issue Date
  // Pattern: "Délivré le DD/MM/YYYY" or "Date de délivrance"
  const licenseIssueMatch = text.match(/(?:Délivré|Delivre)\s+le[:\s]+(\d{1,2}[./\-]\d{1,2}[./\-]\d{4})/i);
  if (licenseIssueMatch) {
    data.licenseIssueDate = normalizeDate(licenseIssueMatch[1]);
  }

  // Extract License Expiry Date
  // Pattern: "Date de fin de validité DD/MM/YYYY" or "Valable jusqu'au"
  const licenseExpiryMatch = text.match(/(?:Date\s+de\s+fin\s+de\s+validit[ée]|Valable\s+jusqu['']au)[:\s]*(\d{1,2}[./\-]\d{1,2}[./\-]\d{4})/i);
  if (licenseExpiryMatch) {
    data.licenseExpiryDate = normalizeDate(licenseExpiryMatch[1]);
  }

  // Extract License Categories
  // Pattern: Look for categories like "B", "A", "C", etc.
  // On verso, categories are in a table with dates
  const categoryMatches = text.match(/^[A-E]\d?\s+\d{1,2}[./\-]\d{1,2}[./\-]\d{4}/gm);
  if (categoryMatches && categoryMatches.length > 0) {
    // Extract unique categories
    const categories = new Set<string>();
    categoryMatches.forEach(match => {
      const catMatch = match.match(/^([A-E]\d?)/);
      if (catMatch) {
        categories.add(catMatch[1]);
      }
    });
    data.licenseCategories = Array.from(categories).join(', ');
  } else {
    // Fallback: look for standalone category letters
    const standaloneCat = text.match(/\b([A-E]\d?)\b/g);
    if (standaloneCat && standaloneCat.length > 0) {
      const unique = [...new Set(standaloneCat)];
      data.licenseCategories = unique.join(', ');
    }
  }

  return data;
}

/**
 * Normalize date from various formats to YYYY-MM-DD
 */
function normalizeDate(dateStr: string): string {
  // Remove spaces
  dateStr = dateStr.replace(/\s/g, '');
  
  // Try different formats
  const formats = [
    /(\d{1,2})[./\-](\d{1,2})[./\-](\d{4})/, // DD/MM/YYYY
    /(\d{4})[./\-](\d{1,2})[./\-](\d{1,2})/, // YYYY/MM/DD
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let year, month, day;
      
      if (format.source.includes('\\d{4}') && format.source.indexOf('\\d{4}') === 1) {
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

      // Handle 2-digit years
      if (year < 100) {
        year += year > 50 ? 1900 : 2000;
      }

      // Validate
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  return dateStr;
}

/**
 * Validate uploaded file
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10 MB

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Format non supporté. Formats acceptés: JPG, JPEG, PNG, PDF` 
    };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `Fichier trop volumineux. Taille maximum: 10 MB` 
    };
  }

  return { valid: true };
}

/**
 * Create preview URL for image
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
