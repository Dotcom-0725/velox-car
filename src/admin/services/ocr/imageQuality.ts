// ============================================
// Image Quality Checks
// Validates uploaded documents before OCR
// ============================================
import { QualityCheck } from "./types";

const MIN_FILE_SIZE = 30 * 1024;          // 30 KB
const MAX_FILE_SIZE = 10 * 1024 * 1024;   // 10 MB
const MIN_RESOLUTION = 600;               // px minimum dimension

export async function checkImageQuality(file: File): Promise<QualityCheck> {
  const warnings: string[] = [];
  let score = 100;

  // File size
  if (file.size < MIN_FILE_SIZE) {
    warnings.push("Image trop petite ou compressée (résolution insuffisante)");
    score -= 30;
  }
  if (file.size > MAX_FILE_SIZE) {
    warnings.push("Fichier trop volumineux (max 10 MB)");
    score -= 10;
  }

  // Resolution
  const resolution = await getImageDimensions(file);
  if (resolution.width < MIN_RESOLUTION || resolution.height < MIN_RESOLUTION) {
    warnings.push(
      `Résolution faible (${resolution.width}×${resolution.height}). Recommandé : 1000×700+`
    );
    score -= 25;
  }

  // Aspect ratio sanity (ID cards are roughly 1.5:1)
  const ratio = resolution.width / resolution.height;
  if (ratio < 0.5 || ratio > 2.5) {
    warnings.push("Format inhabituel — assurez-vous d'avoir bien cadré le document");
    score -= 10;
  }

  // Estimate sharpness via canvas (basic Laplacian-style variance check)
  try {
    const sharpness = await estimateSharpness(file);
    if (sharpness < 15) {
      warnings.push("Image possiblement floue — recadrez et reprenez la photo");
      score -= 20;
    }
  } catch {
    // ignore — sharpness check is best-effort
  }

  score = Math.max(0, Math.min(100, score));
  return {
    isGoodQuality: score >= 60,
    resolution,
    fileSize: file.size,
    warnings,
    score,
  };
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

/**
 * Quick & dirty sharpness estimator using grayscale variance.
 * Real sharpness uses Laplacian variance — this is a fast approximation.
 */
async function estimateSharpness(file: File): Promise<number> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const w = (canvas.width = Math.min(200, img.width));
  const h = (canvas.height = Math.min(200, img.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) return 50;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  // Convert to grayscale + compute variance of gradient
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const grayRight = 0.299 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6];
      const grayDown = 0.299 * data[i + w * 4] + 0.587 * data[i + w * 4 + 1] + 0.114 * data[i + w * 4 + 2];
      const grad = Math.abs(grayRight - gray) + Math.abs(grayDown - gray);
      sum += grad;
      sumSq += grad * grad;
      count++;
    }
  }
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return Math.sqrt(Math.max(0, variance));
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
  });
}
