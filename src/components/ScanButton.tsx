import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { DocumentScanner } from './DocumentScanner';
import type { ExtractedData } from '../services/ocr/ocrService';

interface ScanButtonProps {
  onScanComplete: (data: ExtractedData, file: File) => void;
  documentType?: 'CIN' | 'LICENSE';
  label?: string;
}

export function ScanButton({ 
  onScanComplete, 
  documentType = 'CIN',
  label 
}: ScanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultLabel = documentType === 'CIN' 
    ? '📷 Scanner CIN' 
    : '📷 Scanner Permis';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg"
        type="button"
      >
        <Camera className="w-4 h-4" />
        {label || defaultLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Scanner un document
                </h2>
                <p className="text-sm text-gray-600">
                  {documentType === 'CIN' 
                    ? 'Carte d\'identité nationale' 
                    : 'Permis de conduire'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <DocumentScanner
                onScanComplete={(data, file) => {
                  onScanComplete(data, file);
                  setTimeout(() => setIsOpen(false), 1000);
                }}
                documentType={documentType}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
