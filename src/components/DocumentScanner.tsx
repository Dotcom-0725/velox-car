import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { extractTextFromImage, parseExtractedText, validateFile, createPreviewUrl, type ExtractedData } from '../services/ocr/ocrService';

interface DocumentScannerProps {
  onScanComplete: (data: ExtractedData, file: File) => void;
  documentType?: 'CIN' | 'LICENSE';
}

export function DocumentScanner({ onScanComplete, documentType: _documentType = 'CIN' }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Fichier invalide');
      return;
    }

    // Reset state
    setError(null);
    setExtractedData(null);
    setScanning(true);
    setProgress(0);

    // Create preview
    const previewUrl = createPreviewUrl(file);
    setPreview(previewUrl);

    try {
      // Simulate progress (OCR.Space doesn't provide progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Extract text from image
      const extractedText = await extractTextFromImage(file);

      clearInterval(progressInterval);
      setProgress(100);

      // Parse extracted text
      const parsedData = parseExtractedText(extractedText);

      setExtractedData(parsedData);
      
      // Auto-fill form after a short delay
      setTimeout(() => {
        onScanComplete(parsedData, file);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du scan');
      setPreview(null);
    } finally {
      setScanning(false);
      setProgress(0);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const clearScan = () => {
    setPreview(null);
    setExtractedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!preview && !scanning && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={triggerFileInput}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Upload className="w-5 h-5" />
                Télécharger
              </button>
              <button
                onClick={triggerCamera}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold md:hidden"
              >
                <Camera className="w-5 h-5" />
                Prendre une photo
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Glissez-déposez ou sélectionnez une image
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG ou PDF (max 10 MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Scanning Progress */}
      {scanning && (
        <div className="border-2 border-blue-200 rounded-xl p-8 bg-blue-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-sm font-semibold text-blue-900 mb-2">
                <span>Scan en cours...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-blue-700">
              Extraction du texte en cours...
            </p>
          </div>
        </div>
      )}

      {/* Preview and Results */}
      {preview && !scanning && (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative border-2 border-gray-200 rounded-xl overflow-hidden">
            {preview.startsWith('data:application/pdf') ? (
              <div className="bg-gray-100 p-8 text-center">
                <p className="text-gray-600">📄 Document PDF</p>
              </div>
            ) : (
              <img
                src={preview}
                alt="Aperçu du document"
                className="w-full h-auto max-h-96 object-contain"
              />
            )}
            <button
              onClick={clearScan}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Supprimer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Erreur</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={clearScan}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Extracted Data Preview */}
          {extractedData && !error && (
            <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">
                  Données extraites avec succès
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {extractedData.fullName && (
                  <div>
                    <span className="font-semibold text-gray-700">Nom complet:</span>
                    <p className="text-gray-900">{extractedData.fullName}</p>
                  </div>
                )}
                {extractedData.cinNumber && (
                  <div>
                    <span className="font-semibold text-gray-700">N° CIN:</span>
                    <p className="text-gray-900">{extractedData.cinNumber}</p>
                  </div>
                )}
                {extractedData.birthDate && (
                  <div>
                    <span className="font-semibold text-gray-700">Date de naissance:</span>
                    <p className="text-gray-900">{extractedData.birthDate}</p>
                  </div>
                )}
                {extractedData.address && (
                  <div className="md:col-span-2">
                    <span className="font-semibold text-gray-700">Adresse:</span>
                    <p className="text-gray-900">{extractedData.address}</p>
                  </div>
                )}
                {extractedData.licenseNumber && (
                  <div>
                    <span className="font-semibold text-gray-700">N° Permis:</span>
                    <p className="text-gray-900">{extractedData.licenseNumber}</p>
                  </div>
                )}
                {extractedData.licenseExpiryDate && (
                  <div>
                    <span className="font-semibold text-gray-700">Expiration Permis:</span>
                    <p className="text-gray-900">{extractedData.licenseExpiryDate}</p>
                  </div>
                )}
                {extractedData.documentType && (
                  <div className="md:col-span-2">
                    <span className="font-semibold text-gray-700">Type de document:</span>
                    <p className="text-gray-900">{extractedData.documentType.replace('_', ' ')}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-green-700 mt-3">
                ✅ Les données ont été appliquées au formulaire. Vérifiez et corrigez si nécessaire.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
