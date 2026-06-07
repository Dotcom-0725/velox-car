import { useState } from 'react';
import { ScanButton } from './ScanButton';
import { useDocumentScan } from '../hooks/useDocumentScan';
import type { ExtractedData } from '../services/ocr/ocrService';

interface CustomerFormWithScanProps {
  onSubmit: (data: CustomerFormData) => void;
  initialData?: Partial<CustomerFormData>;
}

export interface CustomerFormData {
  fullName: string;
  cinNumber: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  nationality: string;
  cinExpiryDate: string;
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseCategories: string;
  phone: string;
  email: string;
}

const INITIAL_FORM_DATA: CustomerFormData = {
  fullName: '',
  cinNumber: '',
  birthDate: '',
  birthPlace: '',
  address: '',
  nationality: 'Marocaine',
  cinExpiryDate: '',
  licenseNumber: '',
  licenseIssueDate: '',
  licenseExpiryDate: '',
  licenseCategories: 'B',
  phone: '',
  email: '',
};

export function CustomerFormWithScan({ onSubmit, initialData }: CustomerFormWithScanProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    ...INITIAL_FORM_DATA,
    ...initialData,
  });
  const [cinScanned, setCinScanned] = useState(false);
  const [licenseScanned, setLicenseScanned] = useState(false);

  const { mergeScannedData } = useDocumentScan();

  const handleChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCinScan = (_data: ExtractedData, _file: File) => {
    const merged = mergeScannedData(formData);
    setFormData(merged);
    setCinScanned(true);
  };

  const handleLicenseScan = (_data: ExtractedData, _file: File) => {
    const merged = mergeScannedData(formData);
    setFormData(merged);
    setLicenseScanned(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Document Scan Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          📷 Scan de Documents
          <span className="text-xs font-normal text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
            Optionnel
          </span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CIN Scan */}
          <div className={`bg-white rounded-xl p-4 border-2 ${cinScanned ? 'border-green-400' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">Carte d'Identité</h4>
                <p className="text-xs text-gray-600">Recto ou Verso</p>
              </div>
              {cinScanned && (
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ✓ Scanné
                </span>
              )}
            </div>
            <ScanButton
              onScanComplete={handleCinScan}
              documentType="CIN"
              label="📷 Scanner CIN"
            />
          </div>

          {/* License Scan */}
          <div className={`bg-white rounded-xl p-4 border-2 ${licenseScanned ? 'border-green-400' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">Permis de Conduire</h4>
                <p className="text-xs text-gray-600">Recto ou Verso</p>
              </div>
              {licenseScanned && (
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ✓ Scanné
                </span>
              )}
            </div>
            <ScanButton
              onScanComplete={handleLicenseScan}
              documentType="LICENSE"
              label="📷 Scanner Permis"
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-900">
            💡 <strong>Astuce:</strong> Scannez les documents pour remplir automatiquement le formulaire. Vous pourrez corriger les informations si nécessaire.
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          👤 Informations Personnelles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nom Complet *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              N° CIN *
            </label>
            <input
              type="text"
              value={formData.cinNumber}
              onChange={e => handleChange('cinNumber', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Date de Naissance *
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={e => handleChange('birthDate', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Lieu de Naissance
            </label>
            <input
              type="text"
              value={formData.birthPlace}
              onChange={e => handleChange('birthPlace', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nationalité
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={e => handleChange('nationality', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Adresse
            </label>
            <textarea
              value={formData.address}
              onChange={e => handleChange('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="+212 6XX XXX XXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Driving License */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🚗 Permis de Conduire
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              N° Permis *
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={e => handleChange('licenseNumber', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Catégories
            </label>
            <input
              type="text"
              value={formData.licenseCategories}
              onChange={e => handleChange('licenseCategories', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="A, B, C..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Date de Délivrance
            </label>
            <input
              type="date"
              value={formData.licenseIssueDate}
              onChange={e => handleChange('licenseIssueDate', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Date d'Expiration *
            </label>
            <input
              type="date"
              value={formData.licenseExpiryDate}
              onChange={e => handleChange('licenseExpiryDate', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
        >
          ✓ Enregistrer le Client
        </button>
      </div>
    </form>
  );
}
