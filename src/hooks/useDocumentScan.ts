import { useState, useCallback } from 'react';
import type { ExtractedData } from '../services/ocr/ocrService';

export interface ScanResult {
  data: ExtractedData;
  file: File;
  timestamp: Date;
}

export function useDocumentScan() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanComplete = useCallback((data: ExtractedData, file: File) => {
    const scan: ScanResult = {
      data,
      file,
      timestamp: new Date(),
    };

    setScans(prev => [...prev, scan]);
    setIsScanning(false);

    return scan;
  }, []);

  const clearScans = useCallback(() => {
    setScans([]);
  }, []);

  const getLatestScan = useCallback(() => {
    return scans[scans.length - 1] || null;
  }, [scans]);

  const mergeScannedData = useCallback(<T extends Record<string, any>>(formData: T): T => {
    const latestScan = getLatestScan();
    if (!latestScan) return formData;

    const { data } = latestScan;
    const merged = { ...formData };

    // Map extracted data to form fields (only if they exist in the form)
    const fieldMapping: Array<[keyof typeof data, string]> = [
      ['fullName', 'fullName'],
      ['cinNumber', 'cinNumber'],
      ['birthDate', 'birthDate'],
      ['birthPlace', 'birthPlace'],
      ['address', 'address'],
      ['nationality', 'nationality'],
      ['cinExpiryDate', 'cinExpiryDate'],
      ['licenseNumber', 'licenseNumber'],
      ['licenseIssueDate', 'licenseIssueDate'],
      ['licenseExpiryDate', 'licenseExpiryDate'],
      ['licenseCategories', 'licenseCategories'],
    ];

    fieldMapping.forEach(([dataKey, formKey]) => {
      const value = data[dataKey];
      if (value && formKey in merged) {
        (merged as any)[formKey] = value;
      }
    });

    return merged as T;
  }, [getLatestScan]);

  return {
    scans,
    isScanning,
    setIsScanning,
    handleScanComplete,
    clearScans,
    getLatestScan,
    mergeScannedData,
  };
}
