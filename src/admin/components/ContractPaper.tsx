import { forwardRef } from "react";
import { Contract } from "../data/mockDb";
import { getCarById } from "../../data/cars";
import { api } from "../../services/api";

type Props = { contract: Contract };

/**
 * ContractPaper — Réplique fidèle du contrat papier VELOX CARS
 * OPTIMISÉ POUR UNE SEULE PAGE A4 (210 × 297 mm)
 */
export const ContractPaper = forwardRef<HTMLDivElement, Props>(({ contract: c }, ref) => {
  const car = getCarById(c.carId);
  const settings = api.getBusinessSettings();
  const damageMarkers = c.commentaires.filter((cm) => cm.description.trim()).map((cm) => cm.num);

  return (
    <div
      ref={ref}
      id="contract-paper"
      className="contract-paper mx-auto bg-white text-black"
      dir="ltr"
      lang="fr"
      style={{
        width: "210mm",
        height: "297mm",
        padding: "6mm 8mm",
        fontFamily: "'Arial', 'Helvetica', 'Cairo', sans-serif",
        fontSize: "8pt",
        lineHeight: "1.15",
        color: "#000",
        boxSizing: "border-box",
        overflow: "hidden",
        // Force LTR layout always — independent of site language
        direction: "ltr",
        textAlign: "left",
        unicodeBidi: "isolate",
      }}
    >
      {/* ============================================
          HEADER — Logo + Phones + RC
          ============================================ */}
      <div className="border-2 border-black">
        <div className="flex items-stretch">
          {/* LEFT: Logo + name */}
          <div className="flex flex-1 items-center gap-2 border-e-2 border-black px-3 py-1">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border-2 border-black bg-white">
              <svg viewBox="0 0 100 100" className="h-8 w-8">
                <rect width="100" height="100" rx="12" fill="#1E3A8A" />
                {/* V-shaped wings on top */}
                <g stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <line x1="20" y1="10" x2="48" y2="34" />
                  <line x1="30" y1="8" x2="48" y2="34" />
                  <line x1="40" y1="8" x2="48" y2="34" />
                  <line x1="80" y1="10" x2="52" y2="34" />
                  <line x1="70" y1="8" x2="52" y2="34" />
                  <line x1="60" y1="8" x2="52" y2="34" />
                </g>
                {/* Circular emblem */}
                <circle cx="50" cy="50" r="22" fill="none" stroke="white" strokeWidth="3" />
                {/* Car silhouette */}
                <path
                  d="M36 54 Q36 47 40 45 L43 42 Q45 40 48 40 L52 40 Q55 40 57 42 L60 45 Q64 47 64 54 L64 56 Q64 58 62 58 L38 58 Q36 58 36 56 Z"
                  fill="white"
                />
                <circle cx="40" cy="52" r="1.5" fill="#F59E0B" />
                <circle cx="60" cy="52" r="1.5" fill="#F59E0B" />
                {/* Bottom bars */}
                <g stroke="white" strokeWidth="2" strokeLinecap="round">
                  <line x1="24" y1="78" x2="24" y2="86" />
                  <line x1="30" y1="78" x2="30" y2="88" />
                  <line x1="36" y1="78" x2="36" y2="90" />
                  <line x1="42" y1="78" x2="42" y2="92" />
                  <line x1="48" y1="78" x2="48" y2="93" />
                  <line x1="54" y1="78" x2="54" y2="92" />
                  <line x1="60" y1="78" x2="60" y2="90" />
                  <line x1="66" y1="78" x2="66" y2="88" />
                  <line x1="72" y1="78" x2="72" y2="86" />
                </g>
                <circle cx="50" cy="76" r="2" fill="#F59E0B" />
              </svg>
            </div>
            <div className="leading-none">
              <h1 className="text-[18pt] font-black tracking-tight" style={{ letterSpacing: "0.02em" }}>VELOX CARS</h1>
              <div className="mt-0.5 text-center text-[7pt] tracking-[0.05em] text-black">★ ★ ★</div>
              <div className="mt-0.5 border-t border-black pt-0.5 text-center text-[8pt] font-bold tracking-[0.18em]">LOCATION DE VOITURE</div>
            </div>
          </div>
          {/* RIGHT: Phones + RC */}
          <div className="flex flex-col justify-center gap-0.5 px-3 py-1" style={{ minWidth: "150px" }}>
            <div className="flex items-center gap-1.5 text-[9pt] font-bold">
              <PhoneIcon /> {settings.phones[0] || "06 71 61 59 48"}
            </div>
            <div className="flex items-center gap-1.5 text-[9pt] font-bold">
              <PhoneIcon /> {settings.phones[1] || "06 68 35 39 49"}
            </div>
            <div className="text-[9pt] font-bold">RC : 186927</div>
          </div>
        </div>
      </div>

      {/* ============================================
          TITLE BAR
          ============================================ */}
      <div className="mt-1 flex items-center justify-between border-2 border-black bg-white px-2 py-0.5">
        <h2 className="text-[13pt] font-black tracking-[0.04em] text-black">CONTRAT DE LOCATION</h2>
        <div className="flex items-baseline gap-2">
          <h2 className="text-[11pt] font-bold" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>عقد كراء السيارات</h2>
          <span className="font-bold text-[10pt]">N°</span>
          <span className="font-mono text-[12pt] font-black underline">{c.contractNumber}</span>
        </div>
      </div>

      {/* ============================================
          ROW 1: Vehicle + Kilometrage
          ============================================ */}
      <div className="mt-1.5 grid grid-cols-[1.5fr_1fr] gap-2">
        <div className="space-y-1 py-0.5">
          <DottedField labelFr="Marque" labelAr="النوع" value={car ? `${car.make} ${car.model}` : ""} />
          <DottedField labelFr="N° Immatriculation" labelAr="رقم التسجيل" value={c.immatriculation} />
          <DottedField labelFr="Lieu de livraison" labelAr="مكان التسليم" value={c.lieuLivraison} />
          <DottedField labelFr="Lieu de Reprise" labelAr="مكان الإسترجاع" value={c.lieuReprise} />
        </div>

        <div className="border border-black">
          <KmRow labelFr="KILOMETRAGE DEPART" labelAr="عدد الكيلومترات عند الذهاب" value={c.kmDepart} />
          <KmRow labelFr="KILOMETRAGE RETOUR" labelAr="عدد الكيلومترات عند الرجوع" value={c.kmRetour} />
          <KmRow labelFr="KILOMETRAGE PARCOURUE" labelAr="عدد الكيلومترات المقطوعة" value={c.kmDepart && c.kmRetour ? c.kmRetour - c.kmDepart : 0} bold last />
        </div>
      </div>

      {/* ============================================
          DATE TABLE
          ============================================ */}
      <table className="mt-1.5 w-full border-collapse border border-black text-[8pt]" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "21%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "33%" }} />
        </colgroup>
        <thead>
          <tr>
            <th className="border border-black p-0"></th>
            <th className="border border-black p-0 text-[9pt] font-bold">J</th>
            <th className="border border-black p-0 text-[9pt] font-bold">M</th>
            <th className="border border-black p-0 text-[9pt] font-bold">A</th>
            <th className="border border-black p-0 text-[9pt] font-bold">H</th>
            <th className="border border-black p-0 text-[9pt] font-bold">mn</th>
            <th className="border border-black p-0"></th>
          </tr>
        </thead>
        <tbody className="font-bold">
          <DateRow labelFr="Départ" labelAr="الإنطلاق" j={c.departJour} m={c.departMois} a={c.departAnnee} h={c.departHeure} mn={c.departMinute} />
          <DateRow labelFr="Retour" labelAr="الرجوع" j={c.retourJour} m={c.retourMois} a={c.retourAnnee} h={c.retourHeure} mn={c.retourMinute} />
          <DateRow labelFr="Retour définitif" labelAr="الرجوع النهائي" j={c.retourDefJour} m={c.retourDefMois} a={c.retourDefAnnee} h={c.retourDefHeure} mn={c.retourDefMinute} />
          <tr>
            <td className="border border-black px-1.5 py-0.5 text-[9pt] font-bold">Durée</td>
            <td colSpan={5} className="border border-black p-0.5 text-center text-[10pt] font-extrabold tabular-nums">
              {c.dureeJours > 0 ? `${c.dureeJours}` : ""}
            </td>
            <td className="border border-black px-1.5 py-0.5 text-end text-[9pt] font-bold" dir="rtl">المدة</td>
          </tr>
        </tbody>
      </table>

      {/* ============================================
          MAIN GRID: LOCATAIRE | Car diagram + Commentaires
          ============================================ */}
      <div className="mt-1.5 grid grid-cols-[1.4fr_1fr] gap-2">
        {/* LEFT: LOCATAIRE */}
        <div>
          <div className="bg-black px-2 py-0.5 text-center">
            <span className="text-[10pt] font-bold tracking-[0.08em] text-white">LOCATAIRE</span>
            <span className="ms-4 text-[10pt] font-bold text-white" dir="rtl">المكتري</span>
          </div>
          <div className="space-y-1 px-0.5 py-1">
            <DottedField labelFr="NOM ET PRENOM" labelAr="الإسم العائلي والشخصي" value={c.locataireNom} bold />
            <DottedField labelFr="Date de naissance" labelAr="تاريخ الإزدياد" value={c.locataireDateNaissance} />
            <DottedField labelFr="ADRESSE AU MAROC" labelAr="العنوان بالمغرب" value={c.locataireAdresseMaroc} bold />
            <DottedField labelFr="Adresse à L'étranger" labelAr="العنوان بالخارج" value={c.locataireAdresseEtranger} />
            <DottedField labelFr="Profession" labelAr="المهنة" value={c.locataireProfession} />
            <DottedField labelFr="PERMIS DE CONDUIRE N°" labelAr="رخصة السياقة رقم" value={c.locatairePermisNum} bold />
            <DottedField labelFr="DÉLIVRÉ LE" labelAr="أصدرت" value={c.locatairePermisDelivreLe} />
            <DottedField labelFr="C.I.N & PASSEPORT N°" labelAr="رقم البطاقة الوطنية وجواز السفر" value={c.locataireCinPassport} bold />
            <DottedField labelFr="DÉLIVRÉ LE" labelAr="أصدرت" value={c.locataireCinPassportDelivreLe} />
            <DottedField labelFr="TÉL" labelAr="الهاتف" value={c.locataireTel} bold />
          </div>
        </div>

        {/* RIGHT: État + diagram + commentaires */}
        <div className="space-y-1">
          <p className="text-center text-[9pt] font-bold">Départ Avant de prendre la voiture</p>

          <div className="flex justify-around text-[8pt]">
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold">Dommage</span>
                <Checkbox checked={c.etatDommage} />
              </div>
              <p className="text-[7pt]">Damage · Daño</p>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold">Non Dommage</span>
                <Checkbox checked={!c.etatDommage} />
              </div>
              <p className="text-[7pt]">No Damage · Sin Daño</p>
            </div>
          </div>

          {/* Car diagram — compact */}
          <div className="relative mx-auto" style={{ width: "100%", height: "130px" }}>
            <svg viewBox="0 0 220 280" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
              <text x="110" y="14" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000">AV</text>
              <text x="110" y="275" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000">AR</text>
              <path
                d="M70 28 Q70 22 78 22 L142 22 Q150 22 150 28 L150 50 Q166 55 170 80 L172 130 Q172 175 170 220 Q166 245 150 248 L150 252 Q150 258 142 258 L78 258 Q70 258 70 252 L70 248 Q54 245 50 220 Q48 175 48 130 L50 80 Q54 55 70 50 Z"
                fill="none" stroke="#000" strokeWidth="1.5"
              />
              <path d="M65 60 L78 80 L142 80 L155 60" fill="none" stroke="#000" strokeWidth="1" />
              <line x1="70" y1="50" x2="150" y2="50" stroke="#000" strokeWidth="0.8" />
              <path d="M65 230 L78 210 L142 210 L155 230" fill="none" stroke="#000" strokeWidth="1" />
              <line x1="70" y1="245" x2="150" y2="245" stroke="#000" strokeWidth="0.8" />
              <line x1="78" y1="80" x2="78" y2="210" stroke="#000" strokeWidth="0.6" strokeDasharray="2 2" />
              <line x1="142" y1="80" x2="142" y2="210" stroke="#000" strokeWidth="0.6" strokeDasharray="2 2" />
              <ellipse cx="56" cy="68" rx="4" ry="6" fill="none" stroke="#000" strokeWidth="0.8" />
              <ellipse cx="164" cy="68" rx="4" ry="6" fill="none" stroke="#000" strokeWidth="0.8" />
              <rect x="44" y="78" width="8" height="22" fill="#000" rx="1" />
              <rect x="168" y="78" width="8" height="22" fill="#000" rx="1" />
              <rect x="44" y="200" width="8" height="22" fill="#000" rx="1" />
              <rect x="168" y="200" width="8" height="22" fill="#000" rx="1" />
              <ellipse cx="85" cy="40" rx="5" ry="3" fill="none" stroke="#000" strokeWidth="0.8" />
              <ellipse cx="135" cy="40" rx="5" ry="3" fill="none" stroke="#000" strokeWidth="0.8" />
              <ellipse cx="85" cy="252" rx="5" ry="3" fill="none" stroke="#000" strokeWidth="0.8" />
              <ellipse cx="135" cy="252" rx="5" ry="3" fill="none" stroke="#000" strokeWidth="0.8" />
              <line x1="110" y1="80" x2="110" y2="210" stroke="#000" strokeWidth="0.4" strokeDasharray="1 2" />

              {damageMarkers.map((num, idx) => {
                const positions = [
                  { x: 90, y: 95 }, { x: 130, y: 95 },
                  { x: 110, y: 145 },
                  { x: 90, y: 195 }, { x: 130, y: 195 },
                ];
                const pos = positions[idx % positions.length];
                return (
                  <g key={num}>
                    <circle cx={pos.x} cy={pos.y} r="8" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
                    <text x={pos.x} y={pos.y + 3} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">{num}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Commentaires — compact */}
          <div>
            <p className="text-[9pt] font-bold">Commentaires</p>
            <p className="text-[6.5pt] italic leading-tight text-black">
              Positionner Les Numéros à l'endroit précis du Dommage sur la matrice à droite
            </p>
            <ol className="mt-0.5 space-y-0.5 text-[8pt]">
              {[1, 2, 3, 4, 5].map((n) => {
                const cm = c.commentaires.find((x) => x.num === n);
                return (
                  <li key={n} className="flex items-baseline gap-1">
                    <span className="w-3 font-bold">{n}.</span>
                    <span className="flex-1 border-b border-dotted border-black" style={{ minHeight: "10px" }}>
                      {cm?.description || "\u00A0"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      {/* ============================================
          CONDUCTEUR SUPPLEMENTAIRE — compact 2-col
          ============================================ */}
      <div className="mt-1.5">
        <div className="bg-black px-2 py-0.5 text-center">
          <span className="text-[10pt] font-bold tracking-[0.05em] text-white">Le Conducteur Supplémentaire</span>
          <span className="ms-4 text-[10pt] font-bold text-white" dir="rtl">السائق المرخص</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-0.5 py-1">
          <DottedField labelFr="NOM ET PRÉNOM" labelAr="الإسم العائلي والشخصي" value={c.conducteurNom} bold />
          <DottedField labelFr="PERMIS DE CONDUIRE N°" labelAr="رخصة السياقة رقم" value={c.conducteurPermisNum} bold />
          <DottedField labelFr="Délivré le" labelAr="إصدارها في" value={c.conducteurPermisDelivreLe} />
          <DottedField labelFr="Passeport N°" labelAr="رقم جواز السفر" value={c.conducteurPassportNum} bold />
        </div>
      </div>

      {/* ============================================
          PAYMENT
          ============================================ */}
      <div className="mt-1.5 grid grid-cols-[1.3fr_1fr] gap-2">
        <div className="space-y-1">
          <div className="flex items-center bg-black px-2 py-1 text-white">
            <div className="flex-1">
              <div className="text-[9pt] font-bold">Pré-paiement</div>
              <div className="text-[7pt] italic">Prepayment</div>
            </div>
            <div className="rounded-sm bg-white px-2 py-0.5 text-end font-mono text-[10pt] font-black text-black tabular-nums" style={{ minWidth: "90px" }}>
              {c.prepaiement ? `${c.prepaiement.toLocaleString()} MAD` : "\u00A0"}
            </div>
          </div>
          <div className="flex items-center bg-black px-2 py-1 text-white">
            <div className="flex-shrink-0">
              <div className="text-[9pt] font-bold">Mode de paiement</div>
              <div className="text-[7pt] italic">Payment method</div>
            </div>
            <div className="ms-auto flex items-center gap-3 text-[8pt]">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Checkbox checked={c.modePaiement === "especes"} light />
                  <span className="font-bold">En espèces</span>
                </div>
                <span className="text-[6.5pt] italic">Cash</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Checkbox checked={c.modePaiement === "cheque"} light />
                  <span className="font-bold">Chèque</span>
                </div>
                <span className="text-[6.5pt] italic">Check</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 border border-black">
          <div className="border-e border-black p-0.5 text-center">
            <div className="text-[8pt] font-bold">Total</div>
            <div className="text-[7pt] italic">Total</div>
            <div className="mt-0.5 text-[11pt] font-black tabular-nums" style={{ minHeight: "14pt" }}>
              {c.total ? c.total.toLocaleString() : "\u00A0"}
            </div>
          </div>
          <div className="border-e border-black p-0.5 text-center">
            <div className="text-[8pt] font-bold">Avance</div>
            <div className="text-[7pt] italic">Advanced</div>
            <div className="mt-0.5 text-[11pt] font-black tabular-nums" style={{ minHeight: "14pt" }}>
              {c.avance ? c.avance.toLocaleString() : "\u00A0"}
            </div>
          </div>
          <div className="p-0.5 text-center">
            <div className="text-[8pt] font-bold">Reste</div>
            <div className="text-[7pt] italic">Rest</div>
            <div className="mt-0.5 text-[11pt] font-black tabular-nums" style={{ minHeight: "14pt" }}>
              {c.reste || c.reste === 0 ? c.reste.toLocaleString() : "\u00A0"}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          OBSERVATION
          ============================================ */}
      <div className="mt-1.5 text-center text-[8pt]">
        <p>
          <span className="font-bold">Observation :</span>{" "}
          <span className="italic">En cas d'accident ou de vol, je m'engage à régler la valeur de la franchise, avec présentation du P.V</span>
        </p>
        {c.observation && (
          <p className="mt-0.5 border border-black bg-amber-50 p-1 text-start text-[7.5pt]">{c.observation}</p>
        )}
      </div>

      {/* ============================================
          SIGNATURE — compact
          ============================================ */}
      <div className="mt-2 grid grid-cols-2 gap-6 text-[9pt]">
        <div>
          <p className="font-bold">Signature client</p>
          <div className="mt-5 border-b border-black" />
        </div>
        <div className="text-end">
          <p className="font-bold">
            Fait à tanger le : <span className="font-mono font-extrabold tabular-nums">{c.faitLe}</span>
          </p>
          <div className="mt-5 border-b border-black" />
          <p className="mt-0.5 text-[7pt] italic text-black">Cachet & Signature VELOX CARS</p>
        </div>
      </div>
    </div>
  );
});

ContractPaper.displayName = "ContractPaper";

// ============================================
// Sub-components
// ============================================

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="3" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

function Checkbox({ checked, light }: { checked: boolean; light?: boolean }) {
  return (
    <span
      className="inline-flex h-[10px] w-[10px] items-center justify-center"
      style={{
        border: `1.5px solid ${light ? "#fff" : "#000"}`,
        backgroundColor: checked ? (light ? "#fff" : "#000") : "transparent",
      }}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="h-[8px] w-[8px]">
          <path d="M2 6 L5 9 L10 3" fill="none" stroke={light ? "#000" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function DottedField({ labelFr, labelAr, value, bold }: { labelFr: string; labelAr: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className={`whitespace-nowrap ${bold ? "text-[8.5pt] font-bold" : "text-[8pt]"}`}>{labelFr} :</span>
      <span
        className="flex-1 px-1 text-[9pt] font-bold tabular-nums"
        style={{
          borderBottom: "1.5px dotted #000",
          minHeight: "12px",
          lineHeight: "1.15",
        }}
      >
        {value || "\u00A0"}
      </span>
      <span className="whitespace-nowrap text-[7.5pt]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
        {labelAr}
      </span>
    </div>
  );
}

function KmRow({ labelFr, labelAr, value, bold, last }: { labelFr: string; labelAr: string; value: number; bold?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-1.5 py-0.5 ${!last ? "border-b border-black" : ""}`}>
      <div className="flex flex-col leading-tight">
        <span className={`text-[7.5pt] ${bold ? "font-extrabold" : "font-bold"}`}>{labelFr}</span>
        <span className="text-[6.5pt]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>{labelAr}</span>
      </div>
      <div
        className={`ms-2 rounded-sm border border-black bg-white px-1.5 py-0 text-end font-mono ${bold ? "text-[10pt] font-extrabold" : "text-[9pt] font-bold"} tabular-nums`}
        style={{ minWidth: "65px" }}
      >
        {value ? value.toLocaleString() : "\u00A0"}
      </div>
    </div>
  );
}

function DateRow({ labelFr, labelAr, j, m, a, h, mn }: { labelFr: string; labelAr: string; j: string; m: string; a: string; h: string; mn: string }) {
  return (
    <tr>
      <td className="border border-black px-1.5 py-0.5 text-[9pt] font-bold">{labelFr}</td>
      <td className="border border-black p-0 text-center text-[9pt] tabular-nums">{j || "\u00A0"}</td>
      <td className="border border-black p-0 text-center text-[9pt] tabular-nums">{m || "\u00A0"}</td>
      <td className="border border-black p-0 text-center text-[9pt] tabular-nums">{a || "\u00A0"}</td>
      <td className="border border-black p-0 text-center text-[9pt] tabular-nums">{h || "\u00A0"}</td>
      <td className="border border-black p-0 text-center text-[9pt] tabular-nums">{mn || "\u00A0"}</td>
      <td className="border border-black px-1.5 py-0.5 text-end text-[9pt] font-bold" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>{labelAr}</td>
    </tr>
  );
}
