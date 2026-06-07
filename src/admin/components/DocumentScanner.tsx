import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, CheckCircle2, AlertCircle, Info, Edit3, Zap } from "lucide-react";
import { DocumentUploadCard } from "./DocumentUploadCard";
import { OcrResult, CinData, LicenseData, ExtractedField } from "../services/ocr/types";
import { useToast } from "../../hooks/useToast";

export type ScannedDocuments = {
  cinRecto?: { file: File; result: OcrResult };
  cinVerso?: { file: File; result: OcrResult };
  license?: { file: File; result: OcrResult };
  licenseVerso?: { file: File; result: OcrResult };
};

export type ExtractedClientData = {
  // From CIN
  fullName: string;
  cinNumber: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  nationality: string;
  cinExpiryDate: string;
  // From license
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseCategories: string;
  licenseCountry: string;
  // Meta
  confidenceScore: number; // average 0..100
};

type Props = {
  onApply: (data: ExtractedClientData, docs: ScannedDocuments) => void;
  onCancel?: () => void;
};

export function DocumentScanner({ onApply, onCancel }: Props) {
  const { show } = useToast();
  const [docs, setDocs] = useState<ScannedDocuments>({});
  const [reviewMode, setReviewMode] = useState(false);
  const [editableData, setEditableData] = useState<ExtractedClientData | null>(null);

  // Aggregate extracted data from all documents
  const aggregated = useMemo<ExtractedClientData | null>(() => {
    if (!docs.cinRecto?.result.success && !docs.license?.result.success && !docs.licenseVerso?.result.success) return null;

    const cin = (docs.cinRecto?.result.document.data || {}) as Partial<CinData>;
    const cinVerso = (docs.cinVerso?.result.document.data || {}) as Partial<CinData>;
    const lic = (docs.license?.result.document.data || {}) as Partial<LicenseData>;
    const licVerso = (docs.licenseVerso?.result.document.data || {}) as Partial<LicenseData>;

    // Use CIN name first, fallback to license recto, then verso
    const fullName =
      pickBest([cin.fullName, lic.fullName, licVerso.fullName, cinVerso.fullName])?.value || "";

    // Best license number from recto or verso (higher confidence wins)
    const bestLicenseNumber = pickBest([lic.licenseNumber, licVerso.licenseNumber]);
    // Best categories — verso usually has more details
    const bestCategories = pickBest([licVerso.categories, lic.categories]);
    // Best issue/expiry dates
    const bestIssueDate = pickBest([lic.issueDate, licVerso.issueDate]);
    const bestExpiryDate = pickBest([lic.expiryDate, licVerso.expiryDate]);
    // Address may also appear on license verso
    const bestAddress = pickBest([cinVerso.address, cin.address, (licVerso as any).address]);

    const confidences: number[] = [];
    const addConf = (f?: ExtractedField) => f && confidences.push(f.confidence * 100);
    [cin.fullName, cin.cinNumber, cin.birthDate, cin.birthPlace, cin.address, cin.expiryDate,
      bestLicenseNumber, bestIssueDate, bestExpiryDate, bestCategories].forEach(addConf);
    const confidenceScore = confidences.length > 0
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : 0;

    return {
      fullName,
      cinNumber: cin.cinNumber?.value || "",
      birthDate: cin.birthDate?.value || lic.birthDate?.value || "",
      birthPlace: cin.birthPlace?.value || "",
      address: bestAddress?.value || "",
      nationality: cin.nationality?.value || "Marocaine",
      cinExpiryDate: cin.expiryDate?.value || "",
      licenseNumber: bestLicenseNumber?.value || "",
      licenseIssueDate: bestIssueDate?.value || "",
      licenseExpiryDate: bestExpiryDate?.value || "",
      licenseCategories: bestCategories?.value || "B",
      licenseCountry: lic.issuingCountry?.value || licVerso.issuingCountry?.value || "Maroc",
      confidenceScore,
    };
  }, [docs]);

  const hasAnyExtraction = !!aggregated;
  const hasCinAndLicense = !!docs.cinRecto && !!docs.license;

  // Initialize editable data when entering review mode
  const enterReview = () => {
    if (!aggregated) return;
    setEditableData({ ...aggregated });
    setReviewMode(true);
  };

  const handleApply = () => {
    if (!editableData) return;
    onApply(editableData, docs);
    show("✓ Données appliquées au formulaire", "success");
  };

  return (
    <div className="space-y-4">
      {/* Top banner */}
      <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/40 p-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 text-white shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-amber-900">
            🤖 Scan intelligent OCR
          </p>
          <p className="mt-0.5 text-xs text-amber-800">
            Téléversez la CIN et le permis du client → les données seront extraites
            automatiquement et le formulaire sera pré-rempli.
          </p>
        </div>
        {onCancel && !reviewMode && (
          <button
            onClick={onCancel}
            className="rounded-lg px-2 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100"
          >
            Saisir manuellement
          </button>
        )}
      </div>

      {/* Phase 1: Upload */}
      {!reviewMode && (
        <>
          {/* CIN section */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              🪪 Carte d'identité nationale (CIN)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <DocumentUploadCard
                type="cin-recto"
                icon="🪪"
                title="CIN — Recto"
                subtitle="Face avant (photo + numéro)"
                onExtracted={(file, result) => setDocs((d) => ({ ...d, cinRecto: { file, result } }))}
                onRemove={() => setDocs((d) => ({ ...d, cinRecto: undefined }))}
              />
              <DocumentUploadCard
                type="cin-verso"
                icon="📄"
                title="CIN — Verso"
                subtitle="Face arrière (adresse) — optionnel"
                onExtracted={(file, result) => setDocs((d) => ({ ...d, cinVerso: { file, result } }))}
                onRemove={() => setDocs((d) => ({ ...d, cinVerso: undefined }))}
              />
            </div>
          </div>

          {/* License section */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              🚗 Permis de conduire
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <DocumentUploadCard
                type="license"
                icon="🚗"
                title="Permis — Recto"
                subtitle="Face avant (photo + N° permis)"
                onExtracted={(file, result) => setDocs((d) => ({ ...d, license: { file, result } }))}
                onRemove={() => setDocs((d) => ({ ...d, license: undefined }))}
              />
              <DocumentUploadCard
                type="license-verso"
                icon="📋"
                title="Permis — Verso"
                subtitle="Face arrière (catégories) — optionnel"
                onExtracted={(file, result) => setDocs((d) => ({ ...d, licenseVerso: { file, result } }))}
                onRemove={() => setDocs((d) => ({ ...d, licenseVerso: undefined }))}
              />
            </div>
          </div>

          {/* Action bar */}
          {hasAnyExtraction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4 ring-2 ring-emerald-200"
            >
              <div className="flex items-center gap-2 text-sm text-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-extrabold">
                    {aggregated && Object.values(aggregated).filter((v) => typeof v === "string" && v).length} champ(s) extrait(s)
                  </p>
                  <p className="text-xs">
                    Confiance moyenne : <span className="font-bold">{aggregated?.confidenceScore}%</span>
                    {!hasCinAndLicense && (
                      <span className="ms-2 text-amber-700">· ⚠️ {!docs.cinRecto ? "CIN" : "Permis"} manquant</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={enterReview}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-emerald-500/30 hover:shadow-lg"
              >
                <Wand2 className="h-4 w-4" />
                Vérifier & appliquer →
              </button>
            </motion.div>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <p>
              <strong>💡 Conseils pour une meilleure extraction :</strong> bonne lumière,
              cadrage net, document à plat, pas de reflets. Formats supportés : JPG, PNG, WebP.
            </p>
          </div>
        </>
      )}

      {/* Phase 2: Review */}
      <AnimatePresence>
        {reviewMode && editableData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 rounded-2xl border-2 border-sky-300 bg-sky-50 p-3 text-sm">
              <Edit3 className="h-4 w-4 text-sky-600" />
              <p className="text-sky-900">
                <strong>Vérifiez et corrigez les données extraites</strong>{" "}
                avant de les appliquer au formulaire.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* CIN section */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  🪪 Carte d'identité (CIN)
                </h3>
                <div className="space-y-2.5">
                  <ReviewField
                    label="Nom complet"
                    value={editableData.fullName}
                    onChange={(v) => setEditableData({ ...editableData, fullName: v })}
                    field={getField(docs.cinRecto?.result, "fullName") || getField(docs.license?.result, "fullName")}
                  />
                  <ReviewField
                    label="N° CIN"
                    value={editableData.cinNumber}
                    onChange={(v) => setEditableData({ ...editableData, cinNumber: v })}
                    field={getField(docs.cinRecto?.result, "cinNumber")}
                  />
                  <ReviewField
                    label="Date de naissance"
                    value={editableData.birthDate}
                    type="date"
                    onChange={(v) => setEditableData({ ...editableData, birthDate: v })}
                    field={getField(docs.cinRecto?.result, "birthDate")}
                  />
                  <ReviewField
                    label="Lieu de naissance"
                    value={editableData.birthPlace}
                    onChange={(v) => setEditableData({ ...editableData, birthPlace: v })}
                    field={getField(docs.cinRecto?.result, "birthPlace")}
                  />
                  <ReviewField
                    label="Adresse"
                    value={editableData.address}
                    onChange={(v) => setEditableData({ ...editableData, address: v })}
                    field={getField(docs.cinVerso?.result, "address") || getField(docs.cinRecto?.result, "address")}
                  />
                  <ReviewField
                    label="Nationalité"
                    value={editableData.nationality}
                    onChange={(v) => setEditableData({ ...editableData, nationality: v })}
                  />
                  <ReviewField
                    label="CIN expire le"
                    value={editableData.cinExpiryDate}
                    type="date"
                    onChange={(v) => setEditableData({ ...editableData, cinExpiryDate: v })}
                    field={getField(docs.cinRecto?.result, "expiryDate")}
                  />
                </div>
              </div>

              {/* License section */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  🚗 Permis de conduire
                </h3>
                <div className="space-y-2.5">
                  <ReviewField
                    label="N° du permis"
                    value={editableData.licenseNumber}
                    onChange={(v) => setEditableData({ ...editableData, licenseNumber: v })}
                    field={getField(docs.license?.result, "licenseNumber")}
                  />
                  <ReviewField
                    label="Délivré le"
                    value={editableData.licenseIssueDate}
                    type="date"
                    onChange={(v) => setEditableData({ ...editableData, licenseIssueDate: v })}
                    field={getField(docs.license?.result, "issueDate")}
                  />
                  <ReviewField
                    label="Expire le"
                    value={editableData.licenseExpiryDate}
                    type="date"
                    onChange={(v) => setEditableData({ ...editableData, licenseExpiryDate: v })}
                    field={getField(docs.license?.result, "expiryDate")}
                  />
                  <ReviewField
                    label="Catégories"
                    value={editableData.licenseCategories}
                    onChange={(v) => setEditableData({ ...editableData, licenseCategories: v })}
                    field={getField(docs.license?.result, "categories")}
                  />
                  <ReviewField
                    label="Pays émetteur"
                    value={editableData.licenseCountry}
                    onChange={(v) => setEditableData({ ...editableData, licenseCountry: v })}
                    field={getField(docs.license?.result, "issuingCountry")}
                  />

                  {/* Expiry warning */}
                  {editableData.licenseExpiryDate && (
                    <LicenseExpiryWarning expiryDate={editableData.licenseExpiryDate} />
                  )}
                </div>
              </div>
            </div>

            {/* Apply / cancel */}
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <button
                onClick={() => setReviewMode(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                ← Modifier les images
              </button>
              <button
                onClick={handleApply}
                className="btn-premium flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/30"
              >
                <Zap className="h-4 w-4" />
                Appliquer au formulaire
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============== Helpers ==============

function ReviewField({
  label, value, onChange, type = "text", field,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  field?: ExtractedField;
}) {
  const confidence = field?.confidence;
  const confColor =
    !confidence ? "bg-slate-100 text-slate-500" :
    confidence >= 0.85 ? "bg-emerald-100 text-emerald-700" :
    confidence >= 0.7 ? "bg-amber-100 text-amber-700" :
    "bg-rose-100 text-rose-700";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {label}
        </label>
        {confidence !== undefined && (
          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${confColor}`}>
            {Math.round(confidence * 100)}%
          </span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 ${
          field
            ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100"
            : "border-slate-200 focus:border-navy-700 focus:ring-navy-100"
        }`}
      />
    </div>
  );
}

function LicenseExpiryWarning({ expiryDate }: { expiryDate: string }) {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / 86400000);

  if (daysLeft < 0) {
    return (
      <div className="rounded-lg bg-rose-50 p-2 text-xs text-rose-800">
        <AlertCircle className="me-1 inline h-3.5 w-3.5" />
        <strong>Permis expiré !</strong> Refus de location recommandé.
      </div>
    );
  }
  if (daysLeft < 30) {
    return (
      <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
        ⚠️ Permis expire dans <strong>{daysLeft} jour(s)</strong>
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
      ✓ Permis valide ({Math.floor(daysLeft / 365)} an(s) restant(s))
    </div>
  );
}

function pickBest<T extends ExtractedField | undefined>(fields: T[]): T | undefined {
  return fields
    .filter((f): f is NonNullable<T> => !!f && !!f.value)
    .sort((a, b) => b.confidence - a.confidence)[0] as T | undefined;
}

function getField(result: OcrResult | undefined, key: string): ExtractedField | undefined {
  if (!result?.success) return undefined;
  return (result.document.data as any)[key];
}

/**
 * Convert a File to base64 data URL for persistence in localStorage / DB.
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
