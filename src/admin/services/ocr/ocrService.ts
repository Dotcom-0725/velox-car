// ============================================
// OCR Service — Main Entry Point
// ============================================
// This service is the central abstraction for OCR.
// Swap the `provider` to use a real API in production:
//
//  • "simulation" : built-in mock (default) — instant, realistic Moroccan data
//  • "ocrspace"   : ⭐ FREE 25k/month, no credit card — RECOMMENDED for small agencies
//  • "tesseract"  : runs Tesseract.js in browser (slow but 100% free + offline)
//  • "mindee"     : Mindee API (premium, needs paid plan for Morocco models)
//  • "google"     : Google Cloud Vision (1000/month free, requires credit card)
//
// To switch to production:
//   1. Add VITE_OCR_PROVIDER=ocrspace and VITE_OCRSPACE_API_KEY in .env
//   2. Get a free key at https://ocr.space/ocrapi/freekey
//   3. No other code changes needed — UI stays the same.
// ============================================

import { OcrResult, DocumentType, ExtractedDocument } from "./types";
import { parseCin } from "./parsers/cinParser";
import { parseLicense } from "./parsers/licenseParser";
import { checkImageQuality } from "./imageQuality";

// استخدام OCR.space مباشرة مع المفتاح
const OCR_PROVIDER: string = "ocrspace";
const OCR_SPACE_API_KEY = "K82835046388957"; // مفتاح مباشر

console.log("🔑 OCR Provider:", OCR_PROVIDER);
console.log("🔑 API Key configured:", !!OCR_SPACE_API_KEY);

export async function extractFromDocument(
  file: File,
  documentType: DocumentType
): Promise<OcrResult> {
  const startTime = Date.now();
  const quality = await checkImageQuality(file);

  // Refuse to process truly bad images
  if (quality.score < 30) {
    return {
      success: false,
      document: { type: documentType, data: {}, raw: "" } as ExtractedDocument,
      quality,
      processingTimeMs: Date.now() - startTime,
      provider: OCR_PROVIDER,
      error: "Qualité d'image insuffisante — veuillez reprendre la photo",
    };
  }

  let rawText = "";
  try {
    switch (OCR_PROVIDER) {
      case "ocrspace":
        rawText = await runOcrSpaceOcr(file);
        break;
      case "tesseract":
        rawText = await runTesseractOcr(file);
        break;
      case "mindee":
        rawText = await runMindeeOcr(file, documentType);
        break;
      case "google":
        rawText = await runGoogleVisionOcr(file);
        break;
      case "simulation":
      default:
        rawText = await runSimulationOcr(file, documentType);
        break;
    }
  } catch (e: any) {
    return {
      success: false,
      document: { type: documentType, data: {}, raw: "" } as ExtractedDocument,
      quality,
      processingTimeMs: Date.now() - startTime,
      provider: OCR_PROVIDER,
      error: e?.message || "Erreur OCR inconnue",
    };
  }

  // Parse based on document type
  let document: ExtractedDocument;
  if (documentType === "cin-recto" || documentType === "cin-verso" || documentType === "passport") {
    document = { type: documentType, data: parseCin(rawText), raw: rawText };
  } else if (documentType === "license" || documentType === "license-verso") {
    document = { type: documentType, data: parseLicense(rawText), raw: rawText };
  } else {
    document = { type: documentType, data: {}, raw: rawText } as ExtractedDocument;
  }

  return {
    success: true,
    document,
    quality,
    processingTimeMs: Date.now() - startTime,
    provider: OCR_PROVIDER,
  };
}

// ============================================
// 1. SIMULATION (current default — for demo)
// ============================================
// Returns realistic Moroccan data after a brief delay,
// so the UI feels real without any external dependency.
// Variations are seeded by file content (so same file → same result).
// ============================================

const MOROCCAN_FIRST_NAMES = ["Youssef", "Mohamed", "Karim", "Hassan", "Omar", "Khalid", "Rachid", "Driss", "Anas", "Tariq", "Mehdi", "Yassine"];
const MOROCCAN_LAST_NAMES = ["El Amrani", "Bennani", "Idrissi", "Alaoui", "Benali", "Tazi", "Berrada", "Cherkaoui", "Fassi", "Hakim", "Naciri", "Sefrioui"];
const MOROCCAN_CITIES = ["Tanger", "Tétouan", "Casablanca", "Rabat", "Fès", "Marrakech", "Agadir", "Meknès"];
const CIN_PREFIXES = ["K", "BE", "TK", "AB", "M", "LA", "JC", "BH"];

async function runSimulationOcr(file: File, type: DocumentType): Promise<string> {
  // Simulate OCR processing time (1.5s)
  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 800));

  // Seed from file size+name so re-uploading same file gives same result
  const seed = (file.size + file.name.length) % 1000;
  const rand = mulberry32(seed);
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const pickInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

  const firstName = pick(MOROCCAN_FIRST_NAMES);
  const lastName = pick(MOROCCAN_LAST_NAMES);
  const fullName = `${firstName.toUpperCase()} ${lastName.toUpperCase()}`;
  const cinNum = `${pick(CIN_PREFIXES)}${pickInt(100000, 999999)}`;

  const birthDay = pickInt(1, 28);
  const birthMonth = pickInt(1, 12);
  const birthYear = pickInt(1970, 2000);
  const birthDate = `${String(birthDay).padStart(2, "0")}.${String(birthMonth).padStart(2, "0")}.${birthYear}`;
  const birthPlace = pick(MOROCCAN_CITIES);

  const expiryYear = new Date().getFullYear() + pickInt(2, 8);
  const expiryDate = `${String(birthDay).padStart(2, "0")}.${String(birthMonth).padStart(2, "0")}.${expiryYear}`;

  if (type === "cin-recto" || type === "cin-verso" || type === "passport") {
    return [
      "ROYAUME DU MAROC",
      "CARTE NATIONALE D'IDENTITE ELECTRONIQUE",
      `NOM ET PRENOM: ${fullName}`,
      `Date de naissance: ${birthDate}`,
      `né à ${birthPlace}`,
      `N° CIN: ${cinNum}`,
      `Adresse: ${pickInt(1, 200)} Rue ${pick(["Al Amal", "Hassan II", "Mohammed V", "Ibn Tachfine", "Al Massira"])}, ${pick(MOROCCAN_CITIES)}`,
      `Valable jusqu'au: ${expiryDate}`,
    ].join("\n");
  }

  // License — Moroccan format is typically 10-12 digits
  const issueYear = pickInt(2005, 2022);
  const issueDate = `${String(pickInt(1,28)).padStart(2,"0")}.${String(pickInt(1,12)).padStart(2,"0")}.${issueYear}`;
  const licExpiryYear = issueYear + 10;
  const licExpiryDate = `${String(pickInt(1,28)).padStart(2,"0")}.${String(pickInt(1,12)).padStart(2,"0")}.${licExpiryYear}`;
  // Long Moroccan license number (10 digits)
  const licNum = `${pickInt(1000000000, 9999999999)}`;

  // VERSO: detailed categories with per-category validity dates
  if (type === "license-verso") {
    const categoriesAvailable = ["A", "A1", "B", "C", "D", "E"];
    const numCats = pickInt(1, 3);
    const selectedCats = [];
    for (let i = 0; i < numCats; i++) {
      if (categoriesAvailable[i]) selectedCats.push(categoriesAvailable[i]);
    }
    if (!selectedCats.includes("B")) selectedCats.unshift("B"); // B always present in Morocco

    return [
      "ROYAUME DU MAROC",
      "PERMIS DE CONDUIRE - VERSO",
      `N° du permis: ${licNum}`,
      `Nom et prénom: ${fullName}`,
      "Catégories autorisées:",
      ...selectedCats.map((cat) => `${cat}: ${issueDate} → ${licExpiryDate}`),
      `Catégories: ${selectedCats.join(",")}`,
      `Délivré le: ${issueDate}`,
      `Valable jusqu'au: ${licExpiryDate}`,
      `Restrictions: Aucune`,
      `Adresse: ${pickInt(1, 200)} Rue ${pick(["Al Amal", "Hassan II", "Mohammed V", "Ibn Tachfine", "Al Massira"])}, ${pick(MOROCCAN_CITIES)}`,
      `Maroc`,
    ].join("\n");
  }

  return [
    "ROYAUME DU MAROC",
    "PERMIS DE CONDUIRE",
    `Nom et prénom: ${fullName}`,
    `Date de naissance: ${birthDate}`,
    `N° du permis: ${licNum}`,
    `Délivré le: ${issueDate}`,
    `Valable jusqu'au: ${licExpiryDate}`,
    `Catégories: B`,
    `Maroc`,
  ].join("\n");
}

// Seeded random for reproducible results
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================
// 2. OCR.SPACE ⭐ (FREE — 25,000 docs/month, no credit card)
// ============================================
// 👉 Sign up: https://ocr.space/ocrapi/freekey
//    (just enter your email, get the key instantly)
//
// Activation in .env.local:
//   VITE_OCR_PROVIDER=ocrspace
//   VITE_OCRSPACE_API_KEY=helloworld   ← or your real key
//
// Note: the public test key "helloworld" works but is rate-limited.
// Use your own key (free signup) for production.
async function runOcrSpaceOcr(file: File): Promise<string> {
  const apiKey = OCR_SPACE_API_KEY;

  console.log("🚀 Sending to OCR.Space with key:", apiKey.substring(0, 10) + "...");

  // OCR.space - use Arabic for Moroccan documents (contains Arabic + French text)
  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", apiKey);
  formData.append("language", "ara");            // Arabic (supports mixed Arabic/French)
  formData.append("isOverlayRequired", "false");
  formData.append("OCREngine", "2");            // Engine 2 = best accuracy
  formData.append("scale", "true");
  formData.append("isTable", "false");
  formData.append("detectOrientation", "true");
  
  console.log("📤 Sending file:", file.name, file.size, "bytes");
  console.log(" Language: ara (Arabic)");

  // Retry logic for transient errors
  let attempts = 0;
  const maxAttempts = 2;
  let res!: Response;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      res = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      if (res.ok) break;

      // 413 = image too large (shouldn't happen after compression)
      if (res.status === 413) {
        throw new Error("L'image est trop volumineuse. Essayez une image plus petite ou recadrez-la.");
      }

      // 429 = rate limit
      if (res.status === 429) {
        throw new Error("Limite d'utilisation dépassée. Réessayez dans quelques minutes.");
      }

      if (attempts < maxAttempts) {
        console.log(`⏳ Retry ${attempts}/${maxAttempts}...`);
        await new Promise((r) => setTimeout(r, 1500 * attempts));
        continue;
      }

      throw new Error(`OCR.space erreur HTTP : ${res.status}`);
    } catch (error) {
      if (attempts >= maxAttempts) throw error;
      console.warn(`⚠️ Attempt ${attempts} failed:`, error);
    }
  }

  const json = await res.json();
  
  console.log("📥 OCR.Space Response:", JSON.stringify(json).substring(0, 200));
  
  // Check for errors
  if (json.IsErroredOnProcessing) {
    const err = Array.isArray(json.ErrorMessage)
      ? json.ErrorMessage.join(" · ")
      : json.ErrorMessage;
    console.error("❌ OCR.Space Error:", err);
    throw new Error(`OCR.space : ${err}`);
  }

  // Extract text from all parsed results
  const parsedResults = json.ParsedResults || [];
  console.log(`📊 ParsedResults count: ${parsedResults.length}`);
  
  if (parsedResults.length === 0) {
    throw new Error("OCR.space : Aucun résultat - vérifiez que l'image contient du texte");
  }

  const parsed: string = parsedResults
    .map((p: any) => {
      if (!p?.ParsedText) {
        console.warn("⚠️ Empty ParsedText in result:", p);
        return "";
      }
      return p.ParsedText;
    })
    .filter((text: string) => text.trim().length > 0)
    .join("\n");

  console.log("📝 Extracted text length:", parsed.length, "characters");
  console.log("📝 First 300 chars:", parsed.substring(0, 300));

  if (!parsed.trim()) {
    throw new Error("Aucun texte détecté — vérifiez la qualité de l'image");
  }

  return parsed;
}

// ============================================
// 3. TESSERACT.JS (browser-side, free, slow)
// ============================================
// To enable: VITE_OCR_PROVIDER=tesseract in .env
// npm install tesseract.js
async function runTesseractOcr(_file: File): Promise<string> {
  // Lazy import so Tesseract.js isn't bundled when not used
  // const Tesseract = await import("tesseract.js");
  // const { data } = await Tesseract.recognize(file, "fra+ara", { logger: () => {} });
  // return data.text;
  throw new Error("Tesseract provider not installed. Run: npm install tesseract.js");
}

// ============================================
// 3. MINDEE API (recommended for production)
// ============================================
// Mindee has a pre-trained CIN Morocco model.
// Free tier: 250 docs/month
// Sign up: https://mindee.com
// To enable:
//   .env → VITE_OCR_PROVIDER=mindee
//          VITE_MINDEE_API_KEY=your_key_here
async function runMindeeOcr(file: File, type: DocumentType): Promise<string> {
  const apiKey = import.meta.env.VITE_MINDEE_API_KEY as string;
  if (!apiKey) throw new Error("VITE_MINDEE_API_KEY missing in .env");

  const endpoint =
    type === "license"
      ? "https://api.mindee.net/v1/products/mindee/driver_license/v1/predict"
      : "https://api.mindee.net/v1/products/mindee/ind_identity_morocco/v1/predict";

  const formData = new FormData();
  formData.append("document", file);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Token ${apiKey}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`Mindee API error: ${res.status}`);
  const json = await res.json();

  // Mindee returns structured fields; we convert them to flat text for our parsers
  const prediction = json?.document?.inference?.prediction || {};
  const lines: string[] = [];
  for (const [key, val] of Object.entries(prediction)) {
    const v: any = val;
    if (v?.value) lines.push(`${key}: ${v.value}`);
  }
  return lines.join("\n");
}

// ============================================
// 4. GOOGLE CLOUD VISION (alternative)
// ============================================
async function runGoogleVisionOcr(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY as string;
  if (!apiKey) throw new Error("VITE_GOOGLE_VISION_API_KEY missing in .env");

  // Convert file to base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
            imageContext: { languageHints: ["fr", "ar"] },
          },
        ],
      }),
    }
  );
  if (!res.ok) throw new Error(`Google Vision error: ${res.status}`);
  const json = await res.json();
  return json?.responses?.[0]?.fullTextAnnotation?.text || "";
}
