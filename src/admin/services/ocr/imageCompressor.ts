/**
 * Image Compressor - ضغط الصور قبل إرسالها إلى OCR.space
 * يحل مشكلة HTTP 413 (Payload Too Large) على الهواتف
 */

export interface CompressResult {
  file: File;
  size: number;
  originalSize: number;
  compressionRatio: number;
  dataUrl: string;
}

const MAX_FILE_SIZE = 800 * 1024; // 800 KB (أقل من حد OCR.space 1MB)
const MAX_DIMENSION = 1600; // بكسل - كافٍ للـ OCR
const JPEG_QUALITY = 0.82; // جودة جيدة للـ OCR

/**
 * ضغط الصورة لتصبح أقل من 800 KB
 */
export async function compressImage(file: File): Promise<CompressResult> {
  const originalSize = file.size;

  // إذا كانت الصورة صغيرة بما يكفي، لا حاجة للضغط
  if (originalSize <= MAX_FILE_SIZE && file.type !== "image/heic") {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      size: originalSize,
      originalSize,
      compressionRatio: 100,
      dataUrl,
    };
  }

  try {
    const img = await loadImage(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Cannot get canvas context");
    }

    // حساب الأبعاد الجديدة
    const { width, height } = calculateDimensions(img.width, img.height);

    canvas.width = width;
    canvas.height = height;

    // خلفية بيضاء (لتجنب الشفافية في PNG)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // رسم الصورة
    ctx.drawImage(img, 0, 0, width, height);

    // تحويل إلى JPEG (أصغر من PNG)
    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

    // تحويل dataUrl إلى File
    const blob = await dataUrlToBlob(dataUrl);
    const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
    });

    const compressionRatio = Math.round((compressedFile.size / originalSize) * 100);

    console.log(`📦 Image compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedFile.size)} (${compressionRatio}%)`);

    return {
      file: compressedFile,
      size: compressedFile.size,
      originalSize,
      compressionRatio,
      dataUrl,
    };
  } catch (error) {
    console.error("❌ Compression failed:", error);
    // Fallback: إرجاع الصورة الأصلية
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      size: originalSize,
      originalSize,
      compressionRatio: 100,
      dataUrl,
    };
  }
}

/**
 * حساب الأبعاد الجديدة مع الحفاظ على النسبة
 */
function calculateDimensions(originalWidth: number, originalHeight: number): { width: number; height: number } {
  if (originalWidth <= MAX_DIMENSION && originalHeight <= MAX_DIMENSION) {
    return { width: originalWidth, height: originalHeight };
  }

  const ratio = Math.min(MAX_DIMENSION / originalWidth, MAX_DIMENSION / originalHeight);
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const arr = dataUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      resolve(new Blob([u8arr], { type: mime }));
    } catch (error) {
      reject(error);
    }
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
