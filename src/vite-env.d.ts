/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OCR_PROVIDER?: "simulation" | "ocrspace" | "tesseract" | "mindee" | "google";
  readonly VITE_OCRSPACE_API_KEY?: string;
  readonly VITE_MINDEE_API_KEY?: string;
  readonly VITE_GOOGLE_VISION_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
