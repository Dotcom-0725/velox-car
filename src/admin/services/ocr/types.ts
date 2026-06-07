// ============================================
// OCR Service — Types
// ============================================

export type DocumentType = "cin-recto" | "cin-verso" | "license" | "license-verso" | "passport";
export type OcrProvider = "simulation" | "ocrspace" | "tesseract" | "mindee" | "google";

export type DocumentUpload = {
  id: string;
  type: DocumentType;
  file: File;
  previewUrl: string;
  fileSize: number;
  uploadedAt: string;
};

export type ExtractedField = {
  value: string;
  confidence: number; // 0..1
  manuallyEdited?: boolean;
  rawMatch?: string;
};

export type CinData = {
  fullName: ExtractedField;
  cinNumber: ExtractedField;
  birthDate: ExtractedField;      // YYYY-MM-DD
  birthPlace: ExtractedField;
  address: ExtractedField;
  nationality: ExtractedField;
  expiryDate: ExtractedField;     // YYYY-MM-DD
  gender?: ExtractedField;
};

export type LicenseData = {
  fullName: ExtractedField;
  licenseNumber: ExtractedField;
  issueDate: ExtractedField;      // YYYY-MM-DD
  expiryDate: ExtractedField;     // YYYY-MM-DD
  categories: ExtractedField;     // "B" or "A,B,C"
  issuingCountry: ExtractedField; // "Maroc"
  birthDate?: ExtractedField;
};

export type ExtractedDocument =
  | { type: "cin-recto" | "cin-verso"; data: Partial<CinData>; raw: string }
  | { type: "license" | "license-verso"; data: Partial<LicenseData>; raw: string }
  | { type: "passport"; data: Partial<CinData>; raw: string };

export type QualityCheck = {
  isGoodQuality: boolean;
  resolution: { width: number; height: number };
  fileSize: number;
  warnings: string[];
  score: number; // 0..100
};

export type OcrResult = {
  success: boolean;
  document: ExtractedDocument;
  quality: QualityCheck;
  processingTimeMs: number;
  provider: string;
  error?: string;
};
