import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, X, FileImage, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { DocumentType, OcrResult } from "../services/ocr/types";
import { extractFromDocument } from "../services/ocr/ocrService";
import { compressImage } from "../services/ocr/imageCompressor";

type Props = {
  type: DocumentType;
  title: string;
  subtitle: string;
  icon: string; // emoji
  onExtracted: (file: File, result: OcrResult) => void;
  onRemove?: () => void;
  initialPreviewUrl?: string;
  initialResult?: OcrResult;
};

export function DocumentUploadCard({
  type,
  title,
  subtitle,
  icon,
  onExtracted,
  onRemove,
  initialPreviewUrl,
  initialResult,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialPreviewUrl);
  const [result, setResult] = useState<OcrResult | undefined>(initialResult);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image (JPG, PNG, WebP)");
        return;
      }

      setProcessing(true);
      setProgress(5);
      setResult(undefined);

      // Compress image if needed (solves HTTP 413 on mobile)
      let fileToSend = file;
      try {
        setProgress(10);
        const compressed = await compressImage(file);
        fileToSend = compressed.file;
        console.log(`📦 Image: ${file.size} → ${compressed.size} bytes (${compressed.compressionRatio}%)`);
      } catch (error) {
        console.warn("⚠️ Compression failed, using original:", error);
      }

      // Show preview
      const url = URL.createObjectURL(fileToSend);
      setPreviewUrl(url);
      setProgress(20);

      // Animate progress bar
      const progressTimer = setInterval(() => {
        setProgress((p) => (p < 85 ? p + Math.random() * 6 : p));
      }, 250);

      try {
        const r = await extractFromDocument(fileToSend, type);
        clearInterval(progressTimer);
        setProgress(100);
        setResult(r);
        if (r.success) {
          onExtracted(fileToSend, r);
        }
      } catch (e) {
        clearInterval(progressTimer);
        console.error(e);
      } finally {
        setTimeout(() => setProcessing(false), 400);
      }
    },
    [type, onExtracted]
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // Allow re-uploading same file
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const remove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(undefined);
    setResult(undefined);
    onRemove?.();
  };

  // ---------- States ----------
  const hasUpload = !!previewUrl;
  const hasResult = !!result;
  const quality = result?.quality;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white transition-all hover:border-slate-300">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-2.5">
        <span className="text-xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-slate-900">{title}</p>
          <p className="text-[10px] text-slate-500">{subtitle}</p>
        </div>
        {hasResult && result?.success && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            {quality && Math.round(quality.score)}/100
          </span>
        )}
        {hasUpload && !processing && (
          <button
            onClick={remove}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Supprimer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {!hasUpload ? (
          // Empty state — drag/drop area
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-6 text-center transition-all ${
              isDragging
                ? "border-amber-500 bg-amber-50"
                : "border-slate-300 hover:border-slate-400"
            }`}
          >
            <FileImage className="mb-2 h-8 w-8 text-slate-400" />
            <p className="text-xs font-bold text-slate-700">
              Glissez votre photo ici
            </p>
            <p className="mt-1 text-[10px] text-slate-500">JPG, PNG (max 10 MB)</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-800"
              >
                <Upload className="h-3 w-3" /> Fichier
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
              >
                <Camera className="h-3 w-3" /> Caméra
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onInputChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onInputChange}
            />
          </div>
        ) : (
          // Preview + status
          <div className="space-y-2">
            <div className="relative aspect-[1.6/1] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
              <img
                src={previewUrl}
                alt={title}
                className="h-full w-full object-cover"
              />
              {processing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm">
                  <Loader2 className="mb-2 h-8 w-8 animate-spin text-amber-400" />
                  <p className="text-xs font-bold text-white">Analyse OCR en cours…</p>
                  <p className="text-[10px] text-white/70">Extraction des données</p>
                  <div className="mt-3 h-1.5 w-32 overflow-hidden rounded-full bg-white/20">
                    <motion.div
                      className="h-full bg-amber-400"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Result info */}
            {hasResult && !processing && (
              <div className="space-y-1.5">
                {result?.success ? (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span className="font-bold">Données extraites avec succès</span>
                    <span className="ms-auto text-[10px] opacity-70">
                      {result.processingTimeMs}ms
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs text-rose-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Échec de l'extraction</p>
                      <p className="text-[10px]">{result?.error}</p>
                    </div>
                  </div>
                )}

                {/* Quality warnings */}
                {quality && quality.warnings.length > 0 && (
                  <div className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-800">
                    {quality.warnings.map((w, i) => (
                      <p key={i} className="flex items-start gap-1">
                        <span>⚠️</span>
                        <span>{w}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Re-upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                >
                  📷 Reprendre la photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onInputChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
