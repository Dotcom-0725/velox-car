import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Save, Printer, FileDown, MessageCircle, Search, X, FileText, ChevronRight, Clock, Edit3, History, CalendarPlus, Sparkles, CheckCircle2 } from "lucide-react";
import { DocumentScanner, fileToDataUrl } from "../components/DocumentScanner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { db, Contract, Customer, ContractExtension, ContractHistoryEntry, AttachedDocument } from "../data/mockDb";
import { CARS } from "../../data/cars";
import { LOCATIONS } from "../../data/locations";
import { Card, PageHeader, Button, Modal, Badge } from "../components/AdminUI";
import { useToast } from "../../hooks/useToast";
import { useAdminAuth } from "../context/AdminAuthContext";
import { CarIllustration } from "../../components/CarIllustration";
import { ContractPaper } from "../components/ContractPaper";
import { daysBetween } from "../../utils/format";

function pad(n: string | number, w = 2): string {
  return String(n).padStart(w, "0");
}

function splitDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return { j: "", m: "", a: "", h: "", mn: "" };
  const d = new Date(dateStr);
  const [hh, mm] = (timeStr || "10:00").split(":");
  return {
    j: pad(d.getDate()),
    m: pad(d.getMonth() + 1),
    a: String(d.getFullYear()).slice(-2),
    h: pad(hh || "10"),
    mn: pad(mm || "00"),
  };
}

export function NewContract() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { user } = useAdminAuth();
  const [searchParams] = useSearchParams();
  const { id: editId } = useParams<{ id: string }>(); // /admin/contracts/:id/edit
  const isEdit = !!editId;
  const contractRef = useRef<HTMLDivElement>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedContractId, setSavedContractId] = useState<string | null>(editId || null);
  // OCR document scanner state
  const [showScanner, setShowScanner] = useState(true);
  const [attachedDocuments, setAttachedDocuments] = useState<AttachedDocument[]>([]);

  // Customer pick / create
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const customers = db.getCustomers();

  // Load existing contract on edit mode
  const existingContract = useMemo(() => editId ? db.getContract(editId) : null, [editId]);

  // Auto-open extend modal if ?extend=1
  useEffect(() => {
    if (existingContract && searchParams.get("extend") === "1") {
      setTimeout(() => setShowExtendModal(true), 400);
    }
  }, [existingContract, searchParams]);

  // Init form
  const today = new Date().toISOString().split("T")[0];
  const inThree = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    // Numéro
    contractNumber: db.getNextContractNumber(),
    // Véhicule
    carId: "",
    immatriculation: "",
    lieuLivraison: "Rue Al Amal, Tanger",
    lieuReprise: "Rue Al Amal, Tanger",
    kmDepart: 0,
    kmRetour: 0,
    // Dates
    pickupDate: today,
    pickupTime: "10:00",
    returnDate: inThree,
    returnTime: "10:00",
    // Locataire
    customerId: "",
    locataireNom: "",
    locataireDateNaissance: "",
    locataireAdresseMaroc: "",
    locataireAdresseEtranger: "",
    locataireProfession: "",
    locatairePermisNum: "",
    locatairePermisDelivreLe: "",
    locataireCinPassport: "",
    locataireCinPassportDelivreLe: "",
    locataireTel: "",
    // Conducteur supp
    hasConducteur: false,
    conducteurNom: "",
    conducteurPermisNum: "",
    conducteurPermisDelivreLe: "",
    conducteurPassportNum: "",
    // État
    etatDommage: false,
    commentaires: [
      { num: 1, description: "" }, { num: 2, description: "" }, { num: 3, description: "" },
      { num: 4, description: "" }, { num: 5, description: "" },
    ],
    // Paiement
    prepaiement: 0,
    modePaiement: "especes" as "especes" | "cheque" | "virement",
    total: 0,
    avance: 0,
    observation: "",
    faitA: "Tanger",
    faitLe: today,
  });

  // ============ Load existing contract for editing ============
  useEffect(() => {
    if (!existingContract) return;
    const c = existingContract;
    // Reconstruct ISO dates from JJ/MM/AA fragments
    const buildIsoFromFrag = (j: string, m: string, a: string) => {
      if (!j || !m || !a) return "";
      const year = parseInt(a, 10) < 50 ? `20${a.padStart(2, "0")}` : `19${a.padStart(2, "0")}`;
      return `${year}-${m.padStart(2, "0")}-${j.padStart(2, "0")}`;
    };
    const pickupDateIso = buildIsoFromFrag(c.departJour, c.departMois, c.departAnnee);
    const returnDateIso = buildIsoFromFrag(c.retourJour, c.retourMois, c.retourAnnee);
    setForm({
      contractNumber: c.contractNumber,
      carId: c.carId,
      immatriculation: c.immatriculation,
      lieuLivraison: c.lieuLivraison,
      lieuReprise: c.lieuReprise,
      kmDepart: c.kmDepart,
      kmRetour: c.kmRetour,
      pickupDate: pickupDateIso,
      pickupTime: `${c.departHeure || "10"}:${c.departMinute || "00"}`,
      returnDate: returnDateIso,
      returnTime: `${c.retourHeure || "10"}:${c.retourMinute || "00"}`,
      customerId: "",
      locataireNom: c.locataireNom,
      locataireDateNaissance: c.locataireDateNaissance,
      locataireAdresseMaroc: c.locataireAdresseMaroc,
      locataireAdresseEtranger: c.locataireAdresseEtranger,
      locataireProfession: c.locataireProfession,
      locatairePermisNum: c.locatairePermisNum,
      locatairePermisDelivreLe: c.locatairePermisDelivreLe,
      locataireCinPassport: c.locataireCinPassport,
      locataireCinPassportDelivreLe: c.locataireCinPassportDelivreLe,
      locataireTel: c.locataireTel,
      hasConducteur: !!c.conducteurNom,
      conducteurNom: c.conducteurNom,
      conducteurPermisNum: c.conducteurPermisNum,
      conducteurPermisDelivreLe: c.conducteurPermisDelivreLe,
      conducteurPassportNum: c.conducteurPassportNum,
      etatDommage: c.etatDommage,
      commentaires: c.commentaires.length === 5 ? c.commentaires : [
        ...c.commentaires,
        ...Array.from({ length: 5 - c.commentaires.length }, (_, i) => ({ num: c.commentaires.length + i + 1, description: "" })),
      ],
      prepaiement: c.prepaiement,
      modePaiement: c.modePaiement || "especes",
      total: c.total,
      avance: c.avance,
      observation: c.observation,
      faitA: c.faitA,
      faitLe: c.faitLe,
    });
    setSavedContractId(c.id);
    // Load attached documents from previously saved contract
    if (c.attachedDocuments && c.attachedDocuments.length > 0) {
      setAttachedDocuments(c.attachedDocuments);
      setShowScanner(false); // hide scanner if already has docs
    }
  }, [existingContract]);

  // Auto-fill from existing booking if ?bookingId given
  useEffect(() => {
    if (isEdit) return; // Skip if editing
    const bookingId = searchParams.get("bookingId");
    if (!bookingId) return;
    const booking = db.getBookings().find((b) => b.id === bookingId);
    if (!booking) return;
    const cust = db.getCustomers().find((c) => c.id === booking.customerId);
    const rec = db.getCarRecords().find((r) => r.id === booking.carId);
    const pickupLoc = LOCATIONS.find((l) => l.id === booking.pickupLocationId);
    const returnLoc = LOCATIONS.find((l) => l.id === booking.returnLocationId);
    setForm((f) => ({
      ...f,
      carId: booking.carId,
      immatriculation: rec?.immatriculation || "",
      kmDepart: rec?.mileage || 0,
      lieuLivraison: pickupLoc?.address || f.lieuLivraison,
      lieuReprise: returnLoc?.address || f.lieuReprise,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      returnDate: booking.returnDate,
      returnTime: booking.returnTime,
      customerId: cust?.id || "",
      locataireNom: cust?.fullName || "",
      locatairePermisNum: cust?.licenseNumber || "",
      locatairePermisDelivreLe: cust?.licenseExpiry || "",
      locataireCinPassport: cust?.idNumber || "",
      locataireTel: cust?.phone || "",
      total: booking.totalPrice,
      avance: booking.paidAmount || 0,
      prepaiement: booking.deposit || 0,
    }));
    show("Données pré-remplies depuis la réservation", "info");
  }, [searchParams]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 12);
    const q = customerSearch.toLowerCase();
    return customers.filter((c) =>
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.idNumber.toLowerCase().includes(q) ||
      c.licenseNumber.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [customers, customerSearch]);

  // Available cars (not in maintenance/unavailable)
  const availableCars = useMemo(() => {
    const records = db.getCarRecords();
    return CARS.map((c) => {
      const rec = records.find((r) => r.id === c.id);
      return { ...c, immatriculation: rec?.immatriculation || "", mileage: rec?.mileage || 0, status: rec?.status || "available" };
    }).filter((c) => c.status !== "unavailable");
  }, []);

  const selectedCar = form.carId ? availableCars.find((c) => c.id === form.carId) : null;

  // Auto compute duration + reste
  const dureeJours = daysBetween(form.pickupDate, form.returnDate);
  const reste = form.total - form.avance;

  // Track whether the user manually edited the total — if so, don't override it
  const [totalManuallyEdited, setTotalManuallyEdited] = useState(false);

  // Auto-recompute the total when duration or car changes (unless user touched it)
  useEffect(() => {
    if (totalManuallyEdited || isEdit) return;
    if (!form.carId || dureeJours <= 0) return;
    const car = availableCars.find((c) => c.id === form.carId);
    if (!car) return;
    const suggested = car.priceLow * dureeJours;
    if (form.total !== suggested) {
      setForm((f) => ({ ...f, total: suggested }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.carId, dureeJours, totalManuallyEdited]);

  // Auto-fill car when selected
  const onSelectCar = (carId: string) => {
    const car = availableCars.find((c) => c.id === carId);
    if (!car) return;
    setForm((f) => ({
      ...f,
      carId,
      immatriculation: car.immatriculation,
      kmDepart: car.mileage,
      total: f.total || (car.priceLow * dureeJours),
    }));
  };

  // Auto-fill customer
  const onSelectCustomer = (cust: Customer) => {
    setForm((f) => ({
      ...f,
      customerId: cust.id,
      locataireNom: cust.fullName,
      locatairePermisNum: cust.licenseNumber,
      locatairePermisDelivreLe: cust.licenseExpiry,
      locataireCinPassport: cust.idNumber,
      locataireTel: cust.phone,
      locataireAdresseMaroc: f.locataireAdresseMaroc || `${cust.city}, ${cust.country}`,
    }));
    setShowCustomerPicker(false);
    show(`Client ${cust.fullName} sélectionné`, "success");
  };

  // Build Contract object — preserves history & extensions from previous version
  const buildContract = (): Contract => {
    const departDT = splitDateTime(form.pickupDate, form.pickupTime);
    const retourDT = splitDateTime(form.returnDate, form.returnTime);
    const prev = existingContract;
    return {
      id: savedContractId || `ct-${Date.now()}`,
      contractNumber: form.contractNumber,
      carId: form.carId,
      immatriculation: form.immatriculation,
      lieuLivraison: form.lieuLivraison,
      lieuReprise: form.lieuReprise,
      kmDepart: form.kmDepart,
      kmRetour: form.kmRetour,
      departJour: departDT.j, departMois: departDT.m, departAnnee: departDT.a, departHeure: departDT.h, departMinute: departDT.mn,
      retourJour: retourDT.j, retourMois: retourDT.m, retourAnnee: retourDT.a, retourHeure: retourDT.h, retourMinute: retourDT.mn,
      retourDefJour: retourDT.j, retourDefMois: retourDT.m, retourDefAnnee: retourDT.a, retourDefHeure: retourDT.h, retourDefMinute: retourDT.mn,
      dureeJours,
      locataireNom: form.locataireNom,
      locataireDateNaissance: form.locataireDateNaissance,
      locataireAdresseMaroc: form.locataireAdresseMaroc,
      locataireAdresseEtranger: form.locataireAdresseEtranger,
      locataireProfession: form.locataireProfession,
      locatairePermisNum: form.locatairePermisNum,
      locatairePermisDelivreLe: form.locatairePermisDelivreLe,
      locataireCinPassport: form.locataireCinPassport,
      locataireCinPassportDelivreLe: form.locataireCinPassportDelivreLe,
      locataireTel: form.locataireTel,
      conducteurNom: form.conducteurNom,
      conducteurPermisNum: form.conducteurPermisNum,
      conducteurPermisDelivreLe: form.conducteurPermisDelivreLe,
      conducteurPassportNum: form.conducteurPassportNum,
      etatDommage: form.etatDommage,
      commentaires: form.commentaires,
      prepaiement: form.prepaiement,
      modePaiement: form.modePaiement,
      total: form.total,
      avance: form.avance,
      reste,
      observation: form.observation,
      faitA: form.faitA,
      faitLe: form.faitLe,
      signatureClient: prev?.signatureClient || false,
      createdAt: prev?.createdAt || new Date().toISOString(),
      createdBy: prev?.createdBy || user?.id || "unknown",
      updatedAt: new Date().toISOString(),
      updatedBy: user?.id || "unknown",
      status: prev?.status || "active",
      history: prev?.history || [],
      originalReturnDate: prev?.originalReturnDate,
      extensions: prev?.extensions || [],
      attachedDocuments: attachedDocuments.length > 0 ? attachedDocuments : prev?.attachedDocuments || [],
    };
  };

  // Save contract — adds a history entry
  const saveContract = (note?: string): Contract => {
    if (!form.carId) { show("Sélectionnez un véhicule", "error"); throw new Error("no-car"); }
    if (!form.locataireNom) { show("Saisissez les informations du locataire", "error"); throw new Error("no-customer"); }
    const c = buildContract();
    const historyEntry: ContractHistoryEntry = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user?.id || "unknown",
      userName: user?.fullName || "Système",
      action: isEdit ? "modified" : "created",
      note: note || (isEdit ? "Contrat modifié" : "Contrat créé"),
    };
    c.history = [historyEntry, ...(c.history || [])];
    db.upsertContract(c);
    setSavedContractId(c.id);
    if (user) db.addLog({
      userId: user.id, userName: user.fullName,
      action: isEdit ? "CONTRACT_MODIFIED" : "CONTRACT_CREATED",
      entity: "Contract", entityId: c.id,
      details: `N° ${c.contractNumber} · ${c.locataireNom}`
    });
    show(`Contrat N° ${c.contractNumber} ${isEdit ? "mis à jour" : "enregistré"} ✓`, "success");
    return c;
  };

  // ============ EXTEND CONTRACT ============
  const [extendForm, setExtendForm] = useState({
    newReturnDate: "",
    newReturnTime: "10:00",
    additionalAmount: 0,
    reason: "",
  });

  // Init extend form when modal opens
  useEffect(() => {
    if (!showExtendModal) return;
    const currentReturn = form.returnDate;
    if (currentReturn) {
      const d = new Date(currentReturn);
      d.setDate(d.getDate() + 3); // default +3 days
      const car = availableCars.find((c) => c.id === form.carId);
      const additionalDays = 3;
      setExtendForm({
        newReturnDate: d.toISOString().split("T")[0],
        newReturnTime: form.returnTime,
        additionalAmount: car ? car.priceLow * additionalDays : 0,
        reason: "",
      });
    }
  }, [showExtendModal]);

  const applyExtension = () => {
    if (!savedContractId) {
      show("Enregistrez d'abord le contrat", "error");
      return;
    }
    if (!extendForm.newReturnDate) {
      show("Saisissez la nouvelle date de retour", "error");
      return;
    }
    if (extendForm.newReturnDate <= form.returnDate) {
      show("La nouvelle date doit être après la date actuelle", "error");
      return;
    }
    const additionalDays = daysBetween(form.returnDate, extendForm.newReturnDate);

    const c = db.getContract(savedContractId);
    if (!c) return;

    const extension: ContractExtension = {
      id: `ext-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user?.id || "unknown",
      userName: user?.fullName || "Système",
      previousReturnDate: form.returnDate,
      previousReturnTime: form.returnTime,
      newReturnDate: extendForm.newReturnDate,
      newReturnTime: extendForm.newReturnTime,
      additionalDays,
      additionalAmount: extendForm.additionalAmount,
      reason: extendForm.reason || `Prolongation de ${additionalDays} jour(s)`,
    };

    // Update form to reflect new dates
    setForm((f) => ({
      ...f,
      returnDate: extendForm.newReturnDate,
      returnTime: extendForm.newReturnTime,
      total: f.total + extendForm.additionalAmount,
    }));

    // Persist
    const updated: Contract = {
      ...c,
      originalReturnDate: c.originalReturnDate || form.returnDate,
      extensions: [...(c.extensions || []), extension],
      status: "extended",
      updatedAt: new Date().toISOString(),
      updatedBy: user?.id || "unknown",
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: user?.id || "unknown",
          userName: user?.fullName || "Système",
          action: "extended",
          note: `Prolongé de ${additionalDays} jour(s) — ${extendForm.reason || "Sans raison"}`,
          changes: [
            { field: "returnDate", oldValue: form.returnDate, newValue: extendForm.newReturnDate },
            { field: "total", oldValue: c.total, newValue: c.total + extendForm.additionalAmount },
          ],
        },
        ...(c.history || []),
      ],
      // Update dates fragments
      retourJour: splitDateTime(extendForm.newReturnDate, extendForm.newReturnTime).j,
      retourMois: splitDateTime(extendForm.newReturnDate, extendForm.newReturnTime).m,
      retourAnnee: splitDateTime(extendForm.newReturnDate, extendForm.newReturnTime).a,
      retourHeure: splitDateTime(extendForm.newReturnDate, extendForm.newReturnTime).h,
      retourMinute: splitDateTime(extendForm.newReturnDate, extendForm.newReturnTime).mn,
      retourDefJour: splitDateTime(extendForm.newReturnDate, extendForm.newReturnTime).j,
      retourDefMois: splitDateTime(extendForm.newReturnDate, extendForm.newReturnTime).m,
      retourDefAnnee: splitDateTime(extendForm.newReturnDate, extendForm.newReturnTime).a,
      retourDefHeure: splitDateTime(extendForm.newReturnDate, extendForm.newReturnTime).h,
      retourDefMinute: splitDateTime(extendForm.newReturnDate, extendForm.newReturnTime).mn,
      total: c.total + extendForm.additionalAmount,
      reste: (c.total + extendForm.additionalAmount) - c.avance,
      dureeJours: c.dureeJours + additionalDays,
    };
    db.upsertContract(updated);
    if (user) db.addLog({
      userId: user.id, userName: user.fullName,
      action: "CONTRACT_EXTENDED", entity: "Contract", entityId: updated.id,
      details: `N° ${updated.contractNumber} prolongé de ${additionalDays}j (+${extendForm.additionalAmount} MAD)`,
    });
    show(`✓ Contrat prolongé de ${additionalDays} jour(s)`, "success");
    setShowExtendModal(false);
  };

  // Preview the contract
  const handlePreview = () => {
    if (!form.carId || !form.locataireNom) { show("Remplissez le véhicule et le locataire au minimum", "error"); return; }
    setShowPreview(true);
  };

  // Generate PDF — single A4 page, fitted exactly
  const generatePDF = async (action: "download" | "whatsapp" | "open" = "download"): Promise<jsPDF | null> => {
    if (!contractRef.current) return null;
    show("Génération du PDF en cours...", "info");
    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        // Force capture exactly A4 dimensions
        width: contractRef.current.offsetWidth,
        height: contractRef.current.offsetHeight,
        windowWidth: contractRef.current.offsetWidth,
        windowHeight: contractRef.current.offsetHeight,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210 mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

      // Force the image to fit exactly on a single A4 page (no overflow)
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const filename = `VELOX-Contrat-${form.contractNumber}-${form.locataireNom.replace(/\s/g, "_") || "client"}.pdf`;

      if (action === "download") {
        pdf.save(filename);
        show("PDF (1 page A4) téléchargé ✓", "success");
      } else if (action === "open") {
        window.open(pdf.output("bloburl"), "_blank");
      }
      return pdf;
    } catch (e) {
      console.error(e);
      show("Erreur lors de la génération du PDF", "error");
      return null;
    }
  };

  // Send via WhatsApp
  const sendWhatsApp = async () => {
    if (!form.locataireTel) { show("Saisissez le téléphone du locataire", "error"); return; }
    try { saveContract(); } catch { return; }
    // 1. Generate and download PDF (admin will attach it in WhatsApp Web)
    await generatePDF("download");
    // 2. Open WhatsApp with pre-filled message
    const phone = form.locataireTel.replace(/\D/g, "");
    const msg = `Bonjour ${form.locataireNom.split(" ")[0]},

Voici votre contrat de location VELOX CARS :

📋 N° du contrat : ${form.contractNumber}
🚗 Véhicule : ${selectedCar ? `${selectedCar.make} ${selectedCar.model}` : ""} (${form.immatriculation})
📅 Période : ${form.pickupDate} → ${form.returnDate} (${dureeJours} jours)
📍 Lieu : ${form.lieuLivraison}
💰 Total : ${form.total.toLocaleString()} MAD
✅ Avance payée : ${form.avance.toLocaleString()} MAD
💵 Reste à payer : ${reste.toLocaleString()} MAD

📎 Le contrat PDF a été téléchargé. Veuillez le retrouver en pièce jointe.

Bonne route ! 🚗
VELOX CARS · ${api.getBusinessSettings().phones[0]}`;
    setTimeout(() => {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
      show("✓ PDF téléchargé · WhatsApp ouvert — glissez le PDF dans la conversation", "success");
    }, 800);
  };

  // Print
  const printContract = () => {
    try { saveContract(); } catch { return; }
    // Trigger print after a short delay so React finishes rendering
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${isEdit ? "Modifier le contrat" : "Nouveau contrat"} N° ${form.contractNumber}`}
        subtitle={
          isEdit
            ? `Édition du contrat — ${existingContract?.extensions && existingContract.extensions.length > 0 ? `${existingContract.extensions.length} prolongation(s)` : "Aucune prolongation"}`
            : "Création d'un contrat officiel de location de véhicule"
        }
        breadcrumb={[{ label: "Admin" }, { label: "Contrats", to: "/admin/contracts" }, { label: isEdit ? `N° ${form.contractNumber}` : "Nouveau" }]}
        action={
          <>
            <Button variant="ghost" onClick={() => navigate("/admin/contracts")}><X className="h-4 w-4" />Fermer</Button>
            {isEdit && (
              <Button variant="primary" onClick={() => setShowExtendModal(true)}>
                <CalendarPlus className="h-4 w-4" />Prolonger
              </Button>
            )}
            <Button variant="amber" onClick={() => { try { saveContract(); } catch {} }}>
              <Save className="h-4 w-4" />{isEdit ? "Enregistrer les modifications" : "Enregistrer"}
            </Button>
          </>
        }
      />

      {/* Edit-mode banner */}
      {isEdit && existingContract && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm">
          <Edit3 className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600" />
          <div className="flex-1">
            <p className="font-bold text-sky-900">Mode édition</p>
            <p className="mt-0.5 text-xs text-sky-800">
              Vous modifiez un contrat existant. Toutes les modifications sont enregistrées dans l'historique.
              {existingContract.originalReturnDate && (
                <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                  <Clock className="h-2.5 w-2.5" />Date initiale : {existingContract.originalReturnDate}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* MAIN FORM */}
        <div className="space-y-5">
          {/* ============ Section 0: Scan OCR ============ */}
          {!isEdit && (
            <Card title="🤖 Scan automatique des documents (OCR)" action={
              <button
                onClick={() => setShowScanner((s) => !s)}
                className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-200"
              >
                {showScanner ? "Masquer" : "Afficher"}
              </button>
            }>
              {showScanner && (
                <div className="p-5">
                  <DocumentScanner
                    onCancel={() => setShowScanner(false)}
                    onApply={async (data, scannedDocs) => {
                      // Auto-fill form fields with extracted data
                      setForm((f) => ({
                        ...f,
                        locataireNom: data.fullName || f.locataireNom,
                        locataireDateNaissance: data.birthDate || f.locataireDateNaissance,
                        locataireAdresseMaroc: data.address || f.locataireAdresseMaroc,
                        locatairePermisNum: data.licenseNumber || f.locatairePermisNum,
                        locatairePermisDelivreLe: data.licenseIssueDate || f.locatairePermisDelivreLe,
                        locataireCinPassport: data.cinNumber || f.locataireCinPassport,
                        locataireCinPassportDelivreLe: data.cinExpiryDate || f.locataireCinPassportDelivreLe,
                      }));
                      // Convert files to data URLs for persistence
                      const attachments: AttachedDocument[] = [];
                      const now = new Date().toISOString();
                      const userId = user?.id || "unknown";
                      for (const [key, doc] of Object.entries(scannedDocs)) {
                        if (!doc) continue;
                        const dataUrl = await fileToDataUrl(doc.file);
                        attachments.push({
                          id: `att-${Date.now()}-${key}`,
                          type: key === "cinRecto" ? "cin-recto" : key === "cinVerso" ? "cin-verso" : key === "licenseVerso" ? "license-verso" : "license",
                          filename: doc.file.name,
                          mimeType: doc.file.type,
                          dataUrl,
                          sizeBytes: doc.file.size,
                          uploadedAt: now,
                          uploadedBy: userId,
                          ocrExtracted: doc.result.success,
                          ocrConfidence: doc.result.quality.score / 100,
                        });
                      }
                      setAttachedDocuments(attachments);
                      setShowScanner(false);
                      show(`✓ ${attachments.length} document(s) attaché(s) au contrat`, "success");
                    }}
                  />
                </div>
              )}
              {!showScanner && (
                <div className="flex items-center gap-3 px-5 py-4 text-xs text-slate-600">
                  <Sparkles className="h-4 w-4 flex-shrink-0 text-amber-500" />
                  <p>
                    💡 <strong>Astuce :</strong> Scannez la CIN + le permis du client pour pré-remplir
                    automatiquement le formulaire en quelques secondes.
                    {attachedDocuments.length > 0 && (
                      <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> {attachedDocuments.length} doc(s) attaché(s)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* ============ Section 1: Véhicule ============ */}
          <Card title="① Véhicule">
            <div className="p-5">
              {!selectedCar ? (
                <div>
                  <p className="mb-3 text-xs text-slate-500">Sélectionnez un véhicule dans la liste — l'immatriculation et le kilométrage se rempliront automatiquement.</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {availableCars.map((car) => {
                      const isMaintenance = car.status === "maintenance";
                      return (
                        <button
                          key={car.id}
                          onClick={() => !isMaintenance && onSelectCar(car.id)}
                          disabled={isMaintenance}
                          className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${isMaintenance ? "cursor-not-allowed border-rose-200 bg-rose-50/30 opacity-60" : "border-slate-200 bg-white hover:border-amber-400 hover:shadow-md"}`}
                        >
                          <div className={`flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-lg ${car.cardBg}`}>
                            <CarIllustration car={car} showBadge={false} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold text-slate-900">{car.make} {car.model}</p>
                            <p className="text-xs text-slate-500">{car.year} · <span className="font-mono font-bold text-navy-700">{car.immatriculation}</span></p>
                            <p className="text-[10px] text-slate-500">{car.mileage.toLocaleString()} km</p>
                            {isMaintenance && <Badge color="amber" className="mt-1">En maintenance</Badge>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-navy-50 to-amber-50 p-4">
                    <div className={`flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-xl ${selectedCar.cardBg}`}>
                      <CarIllustration car={selectedCar} showBadge={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-extrabold text-slate-900">{selectedCar.make} {selectedCar.model}</p>
                      <p className="text-sm text-slate-600">{selectedCar.trim} · {selectedCar.year} · {selectedCar.colors.join(" / ")}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-navy-700 px-2.5 py-0.5 font-mono text-xs font-bold text-white">{form.immatriculation}</span>
                        <span className="text-xs text-slate-500">📊 {form.kmDepart.toLocaleString()} km</span>
                      </div>
                    </div>
                    <button onClick={() => setForm({ ...form, carId: "", immatriculation: "", kmDepart: 0 })} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200">Changer</button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Input label="N° Immatriculation" value={form.immatriculation} onChange={(v) => setForm({ ...form, immatriculation: v })} placeholder="ex: 12345-A-1" />
                    <Input label="Kilométrage de départ" type="number" value={String(form.kmDepart)} onChange={(v) => setForm({ ...form, kmDepart: parseInt(v) || 0 })} />
                    <Input label="Lieu de livraison" value={form.lieuLivraison} onChange={(v) => setForm({ ...form, lieuLivraison: v })} />
                    <Input label="Lieu de reprise" value={form.lieuReprise} onChange={(v) => setForm({ ...form, lieuReprise: v })} />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ============ Section 2: Dates ============ */}
          <Card title="② Dates et durée">
            <div className="p-5">
              {/* ⚡ Saisie rapide : nombre de jours */}
              <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/40 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  ⚡ <span>Saisie rapide</span>
                </div>
                <div className="grid items-end gap-3 sm:grid-cols-[1fr_2fr]">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-amber-900">
                      Date de départ
                    </label>
                    <input
                      type="date"
                      value={form.pickupDate}
                      onChange={(e) => {
                        const newPickup = e.target.value;
                        // Recalculate return date based on existing days count
                        const currentDays = dureeJours || 1;
                        const ret = new Date(newPickup);
                        ret.setDate(ret.getDate() + currentDays);
                        setForm({ ...form, pickupDate: newPickup, returnDate: ret.toISOString().split("T")[0] });
                      }}
                      className="w-full rounded-xl border-2 border-amber-300 bg-white px-4 py-3 text-base font-bold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-amber-900">
                      Nombre de jours souhaités
                    </label>
                    <div className="flex items-stretch gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newDays = Math.max(1, dureeJours - 1);
                          if (!form.pickupDate) return;
                          const ret = new Date(form.pickupDate);
                          ret.setDate(ret.getDate() + newDays);
                          setForm({ ...form, returnDate: ret.toISOString().split("T")[0] });
                        }}
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-2xl font-extrabold text-amber-700 shadow-sm ring-2 ring-amber-300 transition-all hover:bg-amber-100 active:scale-95"
                        aria-label="Diminuer"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={dureeJours || ""}
                        onChange={(e) => {
                          const days = Math.max(1, parseInt(e.target.value) || 1);
                          if (!form.pickupDate) return;
                          const ret = new Date(form.pickupDate);
                          ret.setDate(ret.getDate() + days);
                          setForm({ ...form, returnDate: ret.toISOString().split("T")[0] });
                        }}
                        placeholder="ex: 7"
                        className="flex-1 rounded-xl border-2 border-amber-300 bg-white px-4 text-center text-3xl font-black text-amber-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newDays = dureeJours + 1;
                          if (!form.pickupDate) return;
                          const ret = new Date(form.pickupDate);
                          ret.setDate(ret.getDate() + newDays);
                          setForm({ ...form, returnDate: ret.toISOString().split("T")[0] });
                        }}
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-2xl font-extrabold text-amber-700 shadow-sm ring-2 ring-amber-300 transition-all hover:bg-amber-100 active:scale-95"
                        aria-label="Augmenter"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-amber-800">Raccourcis :</span>
                  {[1, 2, 3, 5, 7, 10, 14, 21, 30].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (!form.pickupDate) return;
                        const ret = new Date(form.pickupDate);
                        ret.setDate(ret.getDate() + preset);
                        setForm({ ...form, returnDate: ret.toISOString().split("T")[0] });
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                        dureeJours === preset
                          ? "bg-amber-500 text-white shadow-md"
                          : "bg-white text-amber-700 ring-1 ring-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      {preset}j
                      {preset === 7 && <span className="ms-0.5 text-[9px] opacity-80">·1sem</span>}
                      {preset === 14 && <span className="ms-0.5 text-[9px] opacity-80">·2sem</span>}
                      {preset === 30 && <span className="ms-0.5 text-[9px] opacity-80">·1mois</span>}
                    </button>
                  ))}
                </div>

                {/* Live preview */}
                {form.pickupDate && form.returnDate && dureeJours > 0 && (
                  <div className="mt-3 rounded-xl bg-white p-3 ring-2 ring-amber-400">
                    <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                      <span className="font-bold text-emerald-700">
                        📅 {new Date(form.pickupDate).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-amber-600">→</span>
                      <span className="font-bold text-rose-700">
                        📅 {new Date(form.returnDate).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="mt-1 text-center text-xs text-slate-600">
                      ⏱️ Durée : <span className="font-extrabold text-amber-700">{dureeJours} jour{dureeJours > 1 ? "s" : ""}</span>
                      {selectedCar && (
                        <> · Tarif estimé : <span className="font-extrabold text-emerald-700">{(selectedCar.priceLow * dureeJours).toLocaleString()} MAD</span></>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Détails (manual override) */}
              <details className="rounded-2xl border border-slate-200 bg-slate-50/50">
                <summary className="cursor-pointer px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl">
                  ⚙️ Modifier manuellement les dates / heures
                </summary>
                <div className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-2">
                  <Input label="Date de départ" type="date" value={form.pickupDate} onChange={(v) => setForm({ ...form, pickupDate: v })} />
                  <Input label="Heure de départ" type="time" value={form.pickupTime} onChange={(v) => setForm({ ...form, pickupTime: v })} />
                  <Input label="Date de retour" type="date" value={form.returnDate} onChange={(v) => setForm({ ...form, returnDate: v })} />
                  <Input label="Heure de retour" type="time" value={form.returnTime} onChange={(v) => setForm({ ...form, returnTime: v })} />
                </div>
              </details>
            </div>
          </Card>

          {/* ============ Section 3: Locataire ============ */}
          <Card title="③ Locataire (المكتري)" action={
            <Button size="sm" variant="primary" onClick={() => setShowCustomerPicker(true)}><Search className="h-3.5 w-3.5" />Choisir un client</Button>
          }>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <Input label="Nom et prénom *" value={form.locataireNom} onChange={(v) => setForm({ ...form, locataireNom: v })} className="sm:col-span-2" big />
              <Input label="Date de naissance" type="date" value={form.locataireDateNaissance} onChange={(v) => setForm({ ...form, locataireDateNaissance: v })} />
              <Input label="Profession" value={form.locataireProfession} onChange={(v) => setForm({ ...form, locataireProfession: v })} />
              <Input label="Adresse au Maroc" value={form.locataireAdresseMaroc} onChange={(v) => setForm({ ...form, locataireAdresseMaroc: v })} className="sm:col-span-2" />
              <Input label="Adresse à l'étranger" value={form.locataireAdresseEtranger} onChange={(v) => setForm({ ...form, locataireAdresseEtranger: v })} className="sm:col-span-2" />
              <Input label="N° Permis de conduire *" value={form.locatairePermisNum} onChange={(v) => setForm({ ...form, locatairePermisNum: v })} />
              <Input label="Permis délivré le" type="date" value={form.locatairePermisDelivreLe} onChange={(v) => setForm({ ...form, locatairePermisDelivreLe: v })} />
              <Input label="N° CIN / Passeport *" value={form.locataireCinPassport} onChange={(v) => setForm({ ...form, locataireCinPassport: v })} />
              <Input label="CIN/Passeport délivré le" type="date" value={form.locataireCinPassportDelivreLe} onChange={(v) => setForm({ ...form, locataireCinPassportDelivreLe: v })} />
              <Input label="Téléphone *" type="tel" value={form.locataireTel} onChange={(v) => setForm({ ...form, locataireTel: v })} placeholder="+212 6..." className="sm:col-span-2" big />
            </div>
          </Card>

          {/* ============ Section 4: Conducteur supplémentaire ============ */}
          <Card title="④ Conducteur supplémentaire (optionnel)">
            <div className="p-5">
              <label className="mb-3 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                <input type="checkbox" checked={form.hasConducteur} onChange={(e) => setForm({ ...form, hasConducteur: e.target.checked })} className="h-4 w-4 rounded text-navy-700" />
                Ajouter un conducteur supplémentaire
              </label>
              {form.hasConducteur && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Nom et prénom" value={form.conducteurNom} onChange={(v) => setForm({ ...form, conducteurNom: v })} className="sm:col-span-2" />
                  <Input label="N° Permis" value={form.conducteurPermisNum} onChange={(v) => setForm({ ...form, conducteurPermisNum: v })} />
                  <Input label="Délivré le" type="date" value={form.conducteurPermisDelivreLe} onChange={(v) => setForm({ ...form, conducteurPermisDelivreLe: v })} />
                  <Input label="N° Passeport" value={form.conducteurPassportNum} onChange={(v) => setForm({ ...form, conducteurPassportNum: v })} className="sm:col-span-2" />
                </div>
              )}
            </div>
          </Card>

          {/* ============ Section 5: État du véhicule ============ */}
          <Card title="⑤ État du véhicule">
            <div className="space-y-3 p-5">
              <div className="flex gap-3">
                <button onClick={() => setForm({ ...form, etatDommage: false })} className={`flex-1 rounded-xl border-2 p-3 text-sm font-bold transition-all ${!form.etatDommage ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  ✓ Aucun dommage (Non Dommage)
                </button>
                <button onClick={() => setForm({ ...form, etatDommage: true })} className={`flex-1 rounded-xl border-2 p-3 text-sm font-bold transition-all ${form.etatDommage ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  ⚠️ Dommages constatés (Dommage)
                </button>
              </div>
              {form.etatDommage && (
                <div>
                  <p className="mb-2 text-xs text-slate-500">Décrire jusqu'à 5 dommages (numérotés sur la voiture du contrat)</p>
                  <div className="space-y-2">
                    {form.commentaires.map((cm, i) => (
                      <div key={cm.num} className="flex items-center gap-2">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-extrabold text-white">{cm.num}</span>
                        <input
                          value={cm.description}
                          onChange={(e) => {
                            const next = [...form.commentaires];
                            next[i] = { ...next[i], description: e.target.value };
                            setForm({ ...form, commentaires: next });
                          }}
                          placeholder={`Description du dommage ${cm.num} (ex: rayure aile avant droite)`}
                          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ============ Section 6: Paiement ============ */}
          <Card title="⑥ Paiement">
            <div className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <Input label="Total (MAD) *" type="number" value={String(form.total)} onChange={(v) => { setTotalManuallyEdited(true); setForm({ ...form, total: parseInt(v) || 0 }); }} big />
                <Input label="Avance / Acompte (MAD)" type="number" value={String(form.avance)} onChange={(v) => setForm({ ...form, avance: parseInt(v) || 0 })} big />
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Reste à payer (auto)</label>
                  <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-right text-xl font-black text-amber-700 tabular-nums">{reste.toLocaleString()} MAD</div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Pré-paiement / Caution (MAD)" type="number" value={String(form.prepaiement)} onChange={(v) => setForm({ ...form, prepaiement: parseInt(v) || 0 })} />
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Mode de paiement</label>
                  <div className="flex gap-2">
                    {(["especes", "cheque", "virement"] as const).map((mode) => (
                      <button key={mode} onClick={() => setForm({ ...form, modePaiement: mode })} className={`flex-1 rounded-xl border-2 px-3 py-2 text-xs font-bold capitalize transition-all ${form.modePaiement === mode ? "border-navy-700 bg-navy-50 text-navy-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                        {mode === "especes" ? "💵 Espèces" : mode === "cheque" ? "🧾 Chèque" : "🏦 Virement"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Observation</label>
                <textarea
                  value={form.observation}
                  onChange={(e) => setForm({ ...form, observation: e.target.value })}
                  rows={2}
                  placeholder="Observations particulières..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Fait à" value={form.faitA} onChange={(v) => setForm({ ...form, faitA: v })} />
                <Input label="Fait le" type="date" value={form.faitLe} onChange={(v) => setForm({ ...form, faitLe: v })} />
              </div>
            </div>
          </Card>

          {/* Bottom actions */}
          <div className="flex flex-wrap justify-end gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <Button variant="outline" onClick={() => navigate("/admin/bookings")}>Annuler</Button>
            <Button variant="primary" onClick={handlePreview}><FileText className="h-4 w-4" />Aperçu</Button>
            <Button variant="amber" onClick={() => { try { saveContract(); } catch {} }}><Save className="h-4 w-4" />Enregistrer</Button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card title="Récapitulatif">
            <div className="space-y-2 p-5 text-sm">
              <SidebarRow label="N° Contrat" value={form.contractNumber} mono />
              <SidebarRow label="Véhicule" value={selectedCar ? `${selectedCar.make} ${selectedCar.model}` : "—"} />
              <SidebarRow label="Immatriculation" value={form.immatriculation || "—"} mono />
              <SidebarRow label="Locataire" value={form.locataireNom || "—"} />
              <SidebarRow label="Téléphone" value={form.locataireTel || "—"} />
              <SidebarRow label="Période" value={`${form.pickupDate} → ${form.returnDate}`} />
              <SidebarRow label="Durée" value={`${dureeJours} jour(s)`} />
              <div className="my-2 border-t border-slate-200" />
              <SidebarRow label="Total" value={`${form.total.toLocaleString()} MAD`} bold />
              <SidebarRow label="Avance" value={`${form.avance.toLocaleString()} MAD`} green />
              <SidebarRow label="Reste" value={`${reste.toLocaleString()} MAD`} amber bold />
            </div>
          </Card>

          <Card title="Actions du contrat">
            <div className="space-y-2 p-5">
              <Button variant="primary" className="w-full" onClick={handlePreview}>
                <FileText className="h-4 w-4" /> Aperçu du contrat
              </Button>
              <Button variant="amber" className="w-full" onClick={() => { try { saveContract(); } catch {} }}>
                <Save className="h-4 w-4" /> Enregistrer
              </Button>
              <Button variant="success" className="w-full" onClick={sendWhatsApp}>
                <MessageCircle className="h-4 w-4" /> PDF + WhatsApp
              </Button>
              <Button variant="outline" className="w-full" onClick={printContract}>
                <Printer className="h-4 w-4" /> Imprimer
              </Button>
              {savedContractId && (
                <>
                  <div className="my-2 border-t border-slate-200" />
                  <Button variant="primary" className="w-full" onClick={() => setShowExtendModal(true)}>
                    <CalendarPlus className="h-4 w-4" /> Prolonger la durée
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setShowHistoryModal(true)}>
                    <History className="h-4 w-4" /> Historique
                    {existingContract?.history && existingContract.history.length > 0 && (
                      <span className="ms-1 rounded-full bg-navy-100 px-1.5 py-0.5 text-[10px] font-extrabold text-navy-700">
                        {existingContract.history.length}
                      </span>
                    )}
                  </Button>
                </>
              )}
              <p className="mt-2 rounded-xl bg-slate-50 p-2 text-[10px] leading-snug text-slate-500">
                💡 Le contrat est modifiable à tout moment. Toutes les modifications sont enregistrées dans l'historique.
              </p>
            </div>
          </Card>

          {/* Attached documents */}
          {attachedDocuments.length > 0 && (
            <Card title={`📎 Documents (${attachedDocuments.length})`}>
              <div className="space-y-2 p-3">
                {attachedDocuments.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.dataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 transition-all hover:border-amber-300 hover:bg-amber-50"
                  >
                    <img
                      src={doc.dataUrl}
                      alt={doc.filename}
                      className="h-12 w-16 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {doc.type === "cin-recto" ? "🪪 CIN Recto" :
                         doc.type === "cin-verso" ? "📄 CIN Verso" :
                         doc.type === "license" ? "🚗 Permis Recto" :
                         doc.type === "license-verso" ? "📋 Permis Verso" : "📎 Document"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {(doc.sizeBytes / 1024).toFixed(0)} KB
                        {doc.ocrExtracted && (
                          <span className="ms-1 text-emerald-600">· ✓ OCR</span>
                        )}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Extension info */}
          {existingContract && existingContract.extensions && existingContract.extensions.length > 0 && (
            <Card title={`${existingContract.extensions.length} prolongation(s)`}>
              <div className="divide-y divide-slate-100">
                {existingContract.extensions.map((ext) => (
                  <div key={ext.id} className="p-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">+{ext.additionalDays} jour(s)</span>
                      <span className="font-extrabold text-emerald-600">+{ext.additionalAmount.toLocaleString()} MAD</span>
                    </div>
                    <p className="mt-0.5 text-slate-500">{ext.previousReturnDate} → <span className="font-bold text-slate-900">{ext.newReturnDate}</span></p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{new Date(ext.timestamp).toLocaleString("fr-FR")} · {ext.userName}</p>
                    {ext.reason && <p className="mt-1 italic text-slate-600">"{ext.reason}"</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Customer picker modal */}
      <Modal open={showCustomerPicker} onClose={() => setShowCustomerPicker(false)} title="Sélectionner un client existant" maxWidth="max-w-2xl">
        <div>
          <div className="relative mb-3">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone, email, CIN, permis…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-4 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
            />
          </div>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Aucun client trouvé</p>
            ) : filteredCustomers.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCustomer(c)}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-navy-700 hover:bg-navy-50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-xs font-extrabold text-white">
                  {c.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{c.fullName}</p>
                    {c.vip && <Badge color="amber">VIP</Badge>}
                    {c.blacklisted && <Badge color="rose">⛔ Blacklist</Badge>}
                  </div>
                  <p className="text-xs text-slate-600">📞 {c.phone} · ✉️ {c.email}</p>
                  <p className="text-[10px] text-slate-500">{c.idType}: {c.idNumber} · Permis: {c.licenseNumber}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Preview modal */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)} title="Aperçu du contrat" maxWidth="max-w-5xl">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="success" onClick={sendWhatsApp}><MessageCircle className="h-4 w-4" />Envoyer WhatsApp + PDF</Button>
            <Button variant="amber" onClick={() => generatePDF("download")}><FileDown className="h-4 w-4" />Télécharger PDF</Button>
            <Button variant="primary" onClick={printContract}><Printer className="h-4 w-4" />Imprimer</Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-4">
            <div style={{ transform: "scale(0.7)", transformOrigin: "top center", marginBottom: "-30%" }}>
              <ContractPaper contract={buildContract()} ref={contractRef} />
            </div>
          </div>
        </div>
      </Modal>

      {/* ===== EXTEND MODAL ===== */}
      <Modal open={showExtendModal} onClose={() => setShowExtendModal(false)} title="Prolonger le contrat" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-bold">📅 Date de retour actuelle : <span className="font-mono">{form.returnDate}</span> à {form.returnTime}</p>
            <p className="mt-1 text-xs">Indiquez la nouvelle date de retour et le supplément à facturer.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Nouvelle date de retour *"
              type="date"
              value={extendForm.newReturnDate}
              onChange={(v) => setExtendForm({ ...extendForm, newReturnDate: v })}
            />
            <Input
              label="Heure"
              type="time"
              value={extendForm.newReturnTime}
              onChange={(v) => setExtendForm({ ...extendForm, newReturnTime: v })}
            />
          </div>
          {extendForm.newReturnDate && extendForm.newReturnDate > form.returnDate && (
            <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
              <p className="font-bold">⏱️ +{daysBetween(form.returnDate, extendForm.newReturnDate)} jour(s) supplémentaire(s)</p>
            </div>
          )}
          <Input
            label="Supplément à facturer (MAD) *"
            type="number"
            value={String(extendForm.additionalAmount)}
            onChange={(v) => setExtendForm({ ...extendForm, additionalAmount: parseInt(v) || 0 })}
          />
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Raison de la prolongation</label>
            <textarea
              value={extendForm.reason}
              onChange={(e) => setExtendForm({ ...extendForm, reason: e.target.value })}
              rows={2}
              placeholder="ex: Demande du client, voyage prolongé..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
            />
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-xs">
            <p className="flex justify-between"><span className="text-slate-600">Total actuel :</span><span className="font-bold">{form.total.toLocaleString()} MAD</span></p>
            <p className="flex justify-between"><span className="text-slate-600">Supplément :</span><span className="font-bold text-emerald-600">+{extendForm.additionalAmount.toLocaleString()} MAD</span></p>
            <p className="mt-1 flex justify-between border-t border-slate-200 pt-1 text-sm"><span className="font-bold text-slate-700">Nouveau total :</span><span className="font-extrabold text-navy-700">{(form.total + extendForm.additionalAmount).toLocaleString()} MAD</span></p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowExtendModal(false)}>Annuler</Button>
            <Button variant="success" className="flex-1" onClick={applyExtension}>
              <CalendarPlus className="h-4 w-4" />Confirmer la prolongation
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===== HISTORY MODAL ===== */}
      <Modal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="Historique des modifications" maxWidth="max-w-xl">
        <div className="space-y-3">
          {(!existingContract?.history || existingContract.history.length === 0) ? (
            <p className="py-8 text-center text-sm text-slate-400">Aucun historique disponible</p>
          ) : (
            <ol className="space-y-2">
              {existingContract.history.map((h) => {
                const actionColors: Record<string, string> = {
                  created: "emerald", modified: "sky", extended: "amber", completed: "slate", cancelled: "rose", printed: "violet", sent: "violet",
                };
                const actionLabels: Record<string, string> = {
                  created: "Créé", modified: "Modifié", extended: "Prolongé", completed: "Terminé", cancelled: "Annulé", printed: "Imprimé", sent: "Envoyé",
                };
                return (
                  <li key={h.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-xs font-extrabold text-white">
                        {h.userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge color={actionColors[h.action] as any}>{actionLabels[h.action]}</Badge>
                          <span className="text-sm font-bold text-slate-900">{h.userName}</span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleString("fr-FR")}</p>
                        {h.note && <p className="mt-1 text-xs text-slate-700">{h.note}</p>}
                        {h.changes && h.changes.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5 text-[10px]">
                            {h.changes.map((ch, i) => (
                              <li key={i} className="font-mono">
                                <span className="font-bold text-slate-600">{ch.field}:</span>{" "}
                                <span className="text-rose-600 line-through">{String(ch.oldValue)}</span>{" → "}
                                <span className="text-emerald-600 font-bold">{String(ch.newValue)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </Modal>

      {/* Hidden printable contract (always rendered for window.print()) */}
      <div
        className="contract-print-only"
        dir="ltr"
        style={{ position: "fixed", top: "-10000px", left: 0, direction: "ltr" }}
      >
        <ContractPaper contract={buildContract()} ref={contractRef} />
      </div>
    </div>
  );
}

// Helpers
function Input({ label, value, onChange, type = "text", placeholder = "", className = "", big = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string; big?: boolean }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 ${big ? "py-3 text-base font-bold" : "py-2.5 text-sm"} focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100`}
      />
    </div>
  );
}

function SidebarRow({ label, value, mono, bold, green, amber }: { label: string; value: any; mono?: boolean; bold?: boolean; green?: boolean; amber?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`${mono ? "font-mono" : ""} ${bold ? "text-lg font-extrabold" : "font-semibold"} ${green ? "text-emerald-600" : amber ? "text-amber-600" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}

// Import api at the top — moved here to avoid cyclic at parse time
import { api } from "../../services/api";
