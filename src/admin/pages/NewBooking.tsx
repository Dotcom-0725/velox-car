import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, User, Calendar, Car as CarIcon, Sparkles, FileText, Plus, AlertCircle, MessageCircle, X } from "lucide-react";
import { db, Customer, Booking } from "../data/mockDb";
import { CARS, EXTRAS, getCarById } from "../../data/cars";
import { LOCATIONS, getLocationById } from "../../data/locations";
import { Button, Card, PageHeader } from "../components/AdminUI";
import { CarIllustration } from "../../components/CarIllustration";
import { useToast } from "../../hooks/useToast";
import { useAdminAuth } from "../context/AdminAuthContext";
import { generateBookingRef, daysBetween, isHighSeason, waLink, formatBookingMessage } from "../../utils/format";

export function NewBooking() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { user } = useAdminAuth();
  const [step, setStep] = useState(1);
  const [customers] = useState(db.getCustomers());

  const tmrw = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const inFive = new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    // Customer
    customerId: "",
    isNewCustomer: false,
    newCustomer: { fullName: "", email: "", phone: "", licenseNumber: "", licenseExpiry: "", idType: "CIN" as "CIN" | "Passport", idNumber: "" },
    // Dates & location
    pickupDate: tmrw,
    returnDate: inFive,
    pickupTime: "10:00",
    returnTime: "10:00",
    pickupLocationId: "main-office",
    returnLocationId: "main-office",
    // Car
    carId: "",
    // Extras
    extras: { gps: false, childSeat: false, additionalDriver: false, fullInsurance: false },
    // Other
    notes: "",
    internalNotes: "",
    source: "phone" as Booking["source"],
    sendWhatsApp: true,
  });

  const days = daysBetween(form.pickupDate, form.returnDate);

  // Conflict detection
  const conflicts = useMemo(() => {
    if (!form.carId) return [];
    const allBookings = db.getBookings();
    return allBookings.filter((b) => {
      if (b.carId !== form.carId) return false;
      if (b.status === "cancelled" || b.status === "no-show") return false;
      const bStart = new Date(b.pickupDate).getTime();
      const bEnd = new Date(b.returnDate).getTime();
      const fStart = new Date(form.pickupDate).getTime();
      const fEnd = new Date(form.returnDate).getTime();
      return fStart < bEnd && fEnd > bStart;
    });
  }, [form.carId, form.pickupDate, form.returnDate]);

  // Pricing
  const pricing = useMemo(() => {
    const car = getCarById(form.carId);
    if (!car) return { dailyRate: 0, base: 0, extrasTotal: 0, discount: 0, total: 0, deposit: 3000 };
    const dailyRate = isHighSeason(new Date(form.pickupDate)) ? car.priceHigh : car.priceLow;
    const base = dailyRate * days;
    const extrasTotal = EXTRAS.reduce((s, e) => s + (form.extras[e.id as keyof typeof form.extras] ? e.pricePerDay * days : 0), 0);
    const sub = base + extrasTotal;
    const discount = days >= 14 ? sub * 0.15 : days >= 7 ? sub * 0.1 : 0;
    const total = sub - discount;
    const deposit = car.category === "luxury" ? 8000 : car.category === "suv" || car.category === "compact-suv" ? 5000 : 3000;
    return { dailyRate, base, extrasTotal, discount, total: Math.round(total), deposit };
  }, [form.carId, form.pickupDate, form.returnDate, form.extras, days]);

  const selectedCustomer = customers.find((c) => c.id === form.customerId);
  const selectedCar = getCarById(form.carId);
  const selectedLocation = getLocationById(form.pickupLocationId);

  const next = () => {
    if (step === 1) {
      if (!form.customerId && !form.isNewCustomer) { show("Sélectionnez ou créez un client", "error"); return; }
      if (form.isNewCustomer && (!form.newCustomer.fullName || !form.newCustomer.phone || !form.newCustomer.licenseNumber)) {
        show("Remplissez les champs obligatoires du nouveau client", "error"); return;
      }
    }
    if (step === 3 && !form.carId) { show("Sélectionnez un véhicule", "error"); return; }
    if (step === 3 && conflicts.length > 0) { show("Ce véhicule a un conflit de date", "error"); return; }
    setStep(Math.min(6, step + 1));
  };
  const prev = () => setStep(Math.max(1, step - 1));

  const handleCreate = () => {
    let customerId = form.customerId;
    if (form.isNewCustomer) {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        ...form.newCustomer,
        country: "Maroc",
        city: "Tanger",
        totalBookings: 0,
        totalSpent: 0,
        blacklisted: false,
        vip: false,
        notes: "",
        createdAt: new Date().toISOString().split("T")[0],
      };
      db.upsertCustomer(newCust);
      customerId = newCust.id;
    }
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      reference: generateBookingRef(),
      customerId,
      carId: form.carId,
      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,
      returnDate: form.returnDate,
      returnTime: form.returnTime,
      pickupLocationId: form.pickupLocationId,
      returnLocationId: form.returnLocationId,
      basePrice: pricing.base,
      extrasPrice: pricing.extrasTotal,
      discount: Math.round(pricing.discount),
      totalPrice: pricing.total,
      deposit: pricing.deposit,
      status: "confirmed",
      paymentStatus: "unpaid",
      paymentMethod: "",
      paidAmount: 0,
      extras: form.extras,
      notes: form.notes,
      internalNotes: form.internalNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      source: form.source,
    };
    db.upsertBooking(booking);
    if (user) db.addLog({ userId: user.id, userName: user.fullName, action: "BOOKING_CREATED", entity: "Booking", entityId: booking.id, details: `${booking.reference} (manuelle)` });
    show(`Réservation ${booking.reference} créée !`, "success");

    if (form.sendWhatsApp) {
      const cust = db.getCustomers().find((c) => c.id === customerId);
      const msg = formatBookingMessage({
        reference: booking.reference,
        name: cust?.fullName || "",
        phone: cust?.phone || "",
        pickupDate: booking.pickupDate,
        returnDate: booking.returnDate,
        pickupLocation: selectedLocation?.name.fr || "",
        carModel: selectedCar ? `${selectedCar.make} ${selectedCar.model}` : "",
        totalPrice: booking.totalPrice,
      });
      window.open(waLink(msg), "_blank");
    }

    navigate(`/admin/bookings/${booking.id}`);
  };

  const stepMeta = [
    { num: 1, label: "Client", icon: User },
    { num: 2, label: "Dates & Lieu", icon: Calendar },
    { num: 3, label: "Véhicule", icon: CarIcon },
    { num: 4, label: "Options", icon: Sparkles },
    { num: 5, label: "Notes", icon: FileText },
    { num: 6, label: "Récapitulatif", icon: Check },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Nouvelle réservation"
        subtitle="Créer une réservation manuellement (téléphone, WhatsApp, walk-in)"
        breadcrumb={[{ label: "Admin" }, { label: "Réservations" }, { label: "Nouvelle" }]}
        action={<Link to="/admin/bookings"><Button variant="ghost"><X className="h-4 w-4" />Annuler</Button></Link>}
      />

      {/* Progress */}
      <Card>
        <div className="flex items-center gap-1 overflow-x-auto p-4">
          {stepMeta.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.num;
            const active = step === s.num;
            return (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => s.num < step && setStep(s.num)}
                  disabled={s.num > step}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-all ${active ? "bg-navy-700 text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < stepMeta.length - 1 && <div className={`mx-1 h-0.5 w-3 ${done ? "bg-emerald-500" : "bg-slate-200"}`} />}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          {/* STEP 1: Customer */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Sélection du client</h2>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setForm({ ...form, isNewCustomer: false })} className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${!form.isNewCustomer ? "border-navy-700 bg-navy-50 text-navy-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>Client existant</button>
                <button onClick={() => setForm({ ...form, isNewCustomer: true, customerId: "" })} className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${form.isNewCustomer ? "border-navy-700 bg-navy-50 text-navy-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>Nouveau client</button>
              </div>
              {!form.isNewCustomer ? (
                <div className="mt-4">
                  <input
                    type="search"
                    placeholder="Rechercher par nom, téléphone, email…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                    onChange={(e) => {
                      const q = e.target.value.toLowerCase();
                      const match = customers.find((c) =>
                        c.fullName.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q)
                      );
                      if (match) setForm({ ...form, customerId: match.id });
                    }}
                  />
                  <div className="mt-3 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-1.5">
                    {customers.slice(0, 20).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setForm({ ...form, customerId: c.id })}
                        className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${form.customerId === c.id ? "bg-navy-50" : "hover:bg-slate-50"}`}
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-xs font-extrabold text-white">{c.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900">{c.fullName} {c.vip && "⭐"}{c.blacklisted && "⛔"}</p>
                          <p className="text-xs text-slate-500">{c.phone} · {c.totalBookings} réservation(s)</p>
                        </div>
                        {form.customerId === c.id && <Check className="h-5 w-5 text-navy-700" />}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input label="Nom complet *" value={form.newCustomer.fullName} onChange={(v) => setForm({ ...form, newCustomer: { ...form.newCustomer, fullName: v } })} />
                  <Input label="Téléphone *" value={form.newCustomer.phone} onChange={(v) => setForm({ ...form, newCustomer: { ...form.newCustomer, phone: v } })} placeholder="+212 6..." />
                  <Input label="E-mail" value={form.newCustomer.email} onChange={(v) => setForm({ ...form, newCustomer: { ...form.newCustomer, email: v } })} type="email" />
                  <Input label="N° Permis *" value={form.newCustomer.licenseNumber} onChange={(v) => setForm({ ...form, newCustomer: { ...form.newCustomer, licenseNumber: v } })} />
                  <Input label="Permis expire" value={form.newCustomer.licenseExpiry} onChange={(v) => setForm({ ...form, newCustomer: { ...form.newCustomer, licenseExpiry: v } })} type="date" />
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Type ID</label>
                    <select
                      value={form.newCustomer.idType}
                      onChange={(e) => setForm({ ...form, newCustomer: { ...form.newCustomer, idType: e.target.value as any } })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                    >
                      <option value="CIN">CIN</option><option value="Passport">Passeport</option>
                    </select>
                  </div>
                  <Input label={`N° ${form.newCustomer.idType}`} value={form.newCustomer.idNumber} onChange={(v) => setForm({ ...form, newCustomer: { ...form.newCustomer, idNumber: v } })} className="sm:col-span-2" />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Dates & Location */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Dates & Lieu</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input label="Prise en charge" value={form.pickupDate} onChange={(v) => setForm({ ...form, pickupDate: v })} type="date" />
                <Input label="Heure" value={form.pickupTime} onChange={(v) => setForm({ ...form, pickupTime: v })} type="time" />
                <Input label="Retour" value={form.returnDate} onChange={(v) => setForm({ ...form, returnDate: v })} type="date" />
                <Input label="Heure" value={form.returnTime} onChange={(v) => setForm({ ...form, returnTime: v })} type="time" />
              </div>
              <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">
                Durée : {days} jour(s) {days >= 14 ? "· Remise -15%" : days >= 7 ? "· Remise -10%" : ""}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Lieu de prise en charge</label>
                  <select value={form.pickupLocationId} onChange={(e) => setForm({ ...form, pickupLocationId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100">
                    {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name.fr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Lieu de retour</label>
                  <select value={form.returnLocationId} onChange={(e) => setForm({ ...form, returnLocationId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100">
                    {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name.fr}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Car */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Sélection du véhicule</h2>
              <p className="mt-1 text-sm text-slate-500">Vérification automatique des conflits de dates</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {CARS.map((car) => {
                  // Check if has conflict
                  const carConflicts = db.getBookings().filter((b) => {
                    if (b.carId !== car.id || b.status === "cancelled" || b.status === "no-show") return false;
                    const bStart = new Date(b.pickupDate).getTime();
                    const bEnd = new Date(b.returnDate).getTime();
                    const fStart = new Date(form.pickupDate).getTime();
                    const fEnd = new Date(form.returnDate).getTime();
                    return fStart < bEnd && fEnd > bStart;
                  });
                  const hasConflict = carConflicts.length > 0;
                  return (
                    <button
                      key={car.id}
                      onClick={() => !hasConflict && setForm({ ...form, carId: car.id })}
                      disabled={hasConflict}
                      className={`relative flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${form.carId === car.id ? "border-amber-500 bg-amber-50 shadow-md" : hasConflict ? "border-rose-200 bg-rose-50/30 cursor-not-allowed opacity-60" : "border-slate-200 bg-white hover:border-slate-300"}`}
                    >
                      <div className={`flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-xl ${car.cardBg}`}>
                        <CarIllustration car={car} showBadge={false} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-slate-900">{car.make} {car.model}</p>
                        <p className="text-xs text-slate-500">{car.year} · {car.transmission === "automatic" ? "Auto" : "Man."}</p>
                        <p className="mt-1 text-xs font-bold text-navy-700">{car.priceLow} MAD/jour</p>
                        {hasConflict && <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-rose-600"><AlertCircle className="h-3 w-3" />Conflit de dates</p>}
                      </div>
                      {form.carId === car.id && <Check className="h-5 w-5 text-amber-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Extras */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Options</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {EXTRAS.map((e) => {
                  const k = e.id === "gps" ? "gps" : e.id === "child-seat" ? "childSeat" : e.id === "additional-driver" ? "additionalDriver" : "fullInsurance";
                  const labels: Record<string, { l: string; i: string }> = {
                    gps: { l: "GPS intégré", i: "🗺️" },
                    "child-seat": { l: "Siège enfant", i: "👶" },
                    "additional-driver": { l: "Conducteur sup.", i: "👥" },
                    "full-insurance": { l: "Assurance tous risques", i: "🛡️" },
                  };
                  const isOn = form.extras[k as keyof typeof form.extras];
                  return (
                    <button
                      key={e.id}
                      onClick={() => setForm({ ...form, extras: { ...form.extras, [k]: !isOn } })}
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${isOn ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <div className="text-2xl">{labels[e.id].i}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-slate-900">{labels[e.id].l}</p>
                        <p className="text-xs text-navy-700 font-bold">+{e.pricePerDay} MAD/jour</p>
                      </div>
                      {isOn && <Check className="h-5 w-5 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Notes */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Notes & Source</h2>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Source de la réservation</label>
                  <div className="flex flex-wrap gap-2">
                    {(["website", "phone", "whatsapp", "walk-in"] as const).map((s) => (
                      <button key={s} onClick={() => setForm({ ...form, source: s })} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${form.source === s ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Note client (visible sur le contrat)</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Note interne (privée)</label>
                  <textarea value={form.internalNotes} onChange={(e) => setForm({ ...form, internalNotes: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100" />
                </div>
                <label className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                  <input type="checkbox" checked={form.sendWhatsApp} onChange={(e) => setForm({ ...form, sendWhatsApp: e.target.checked })} className="h-4 w-4 rounded text-emerald-600" />
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-bold">Envoyer une confirmation WhatsApp au client après création</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: Summary */}
          {step === 6 && (
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Récapitulatif</h2>
              <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
                <Row label="Client" value={form.isNewCustomer ? form.newCustomer.fullName : selectedCustomer?.fullName || ""} />
                <Row label="Téléphone" value={form.isNewCustomer ? form.newCustomer.phone : selectedCustomer?.phone || ""} />
                <Row label="Véhicule" value={selectedCar ? `${selectedCar.make} ${selectedCar.model} ${selectedCar.trim}` : ""} />
                <Row label="Dates" value={`${form.pickupDate} ${form.pickupTime} → ${form.returnDate} ${form.returnTime}`} />
                <Row label="Lieu" value={selectedLocation?.name.fr || ""} />
                <Row label="Durée" value={`${days} jour(s)`} />
                <Row label="Source" value={form.source} />
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-6 flex justify-between gap-2 border-t border-slate-100 pt-5">
            <Button variant="outline" onClick={prev} disabled={step === 1}><ChevronLeft className="h-4 w-4" />Précédent</Button>
            {step < 6 ? (
              <Button variant="amber" onClick={next}>Suivant<ChevronRight className="h-4 w-4" /></Button>
            ) : (
              <Button variant="success" onClick={handleCreate}><Plus className="h-4 w-4" />Créer la réservation</Button>
            )}
          </div>
        </Card>

        {/* Sticky summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card title="Aperçu prix">
            <div className="p-5">
              {selectedCar ? (
                <>
                  <div className={`mb-3 flex h-20 items-center justify-center rounded-xl ${selectedCar.cardBg}`}>
                    <CarIllustration car={selectedCar} showBadge={false} />
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">{selectedCar.make} {selectedCar.model}</p>
                  <p className="mb-3 text-xs text-slate-500">{days} jour(s) · {pricing.dailyRate} MAD/j</p>
                  <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
                    <Row label="Base" value={`${pricing.base.toLocaleString()} MAD`} small />
                    {pricing.extrasTotal > 0 && <Row label="Options" value={`+${pricing.extrasTotal.toLocaleString()} MAD`} small />}
                    {pricing.discount > 0 && <Row label="Remise" value={`-${Math.round(pricing.discount).toLocaleString()} MAD`} small green />}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between border-t border-slate-200 pt-3">
                    <span className="text-xs font-bold uppercase text-slate-500">Total</span>
                    <span className="text-2xl font-black text-navy-700">{pricing.total.toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">+ caution {pricing.deposit} MAD</p>
                  {conflicts.length > 0 && (
                    <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
                      <AlertCircle className="mb-1 h-4 w-4" />
                      <p className="font-bold">Conflit détecté : {conflicts.length} réservation(s) sur les mêmes dates</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-sm text-slate-400">Sélectionnez un véhicule</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "", className = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100" />
    </div>
  );
}

function Row({ label, value, small, green }: { label: string; value: any; small?: boolean; green?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className={`text-slate-600 ${small ? "text-xs" : ""}`}>{label}</span>
      <span className={`font-bold ${green ? "text-emerald-600" : "text-slate-900"} ${small ? "text-xs" : ""}`}>{value}</span>
    </div>
  );
}
