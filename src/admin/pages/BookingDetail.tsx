import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Printer, Check, X as XIcon, Car as CarIcon, MapPin, Calendar, User, Phone, Mail, FileText, DollarSign, CheckCircle2, FileSignature } from "lucide-react";
import { db, BookingStatus } from "../data/mockDb";
import { getCarById } from "../../data/cars";
import { getLocationById } from "../../data/locations";
import { Button, Card, BookingStatusBadge, PaymentStatusBadge, PageHeader, Modal } from "../components/AdminUI";
import { CarIllustration } from "../../components/CarIllustration";
import { useToast } from "../../hooks/useToast";
import { useAdminAuth } from "../context/AdminAuthContext";
import { formatBookingMessage, waLink, googleMapsEmbedUrl } from "../../utils/format";

export function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const { user } = useAdminAuth();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [printPreview, setPrintPreview] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const booking = db.getBookings().find((b) => b.id === id);
  const customer = booking ? db.getCustomers().find((c) => c.id === booking.customerId) : null;
  const car = booking ? getCarById(booking.carId) : null;
  const pickupLoc = booking ? getLocationById(booking.pickupLocationId) : null;
  const returnLoc = booking ? getLocationById(booking.returnLocationId) : null;

  if (!booking || !customer || !car) {
    return (
      <div>
        <PageHeader title="Réservation introuvable" />
        <Link to="/admin/bookings" className="text-sm font-bold text-navy-700">← Retour à la liste</Link>
      </div>
    );
  }

  const changeStatus = (status: BookingStatus, extra?: Partial<typeof booking>) => {
    const updated = { ...booking, status, updatedAt: new Date().toISOString(), ...extra };
    if (status === "confirmed") updated.confirmedAt = new Date().toISOString();
    if (status === "active") updated.pickedUpAt = new Date().toISOString();
    if (status === "completed") updated.returnedAt = new Date().toISOString();
    if (status === "cancelled") { updated.cancelledAt = new Date().toISOString(); updated.cancelReason = cancelReason; }
    db.upsertBooking(updated);
    if (user) db.addLog({ userId: user.id, userName: user.fullName, action: `BOOKING_${status.toUpperCase()}`, entity: "Booking", entityId: booking.id, details: `${booking.reference}` });
    show(`Statut changé : ${status}`, "success");
    navigate(0); // refresh
  };

  const markPaid = () => {
    const updated = { ...booking, paymentStatus: "paid" as const, paidAmount: booking.totalPrice, paymentMethod: booking.paymentMethod || "cash" as const, updatedAt: new Date().toISOString() };
    db.upsertBooking(updated);
    if (user) db.addLog({ userId: user.id, userName: user.fullName, action: "PAYMENT_RECEIVED", entity: "Booking", entityId: booking.id, details: `${booking.totalPrice} MAD - ${booking.reference}` });
    show("Marqué comme payé", "success");
    navigate(0);
  };

  const wamsg = formatBookingMessage({
    reference: booking.reference,
    name: customer.fullName,
    phone: customer.phone,
    pickupDate: booking.pickupDate,
    returnDate: booking.returnDate,
    pickupLocation: pickupLoc?.name.fr || "",
    carModel: `${car.make} ${car.model}`,
    totalPrice: booking.totalPrice,
  });

  const timeline = [
    { date: booking.createdAt, label: "Réservation créée", icon: FileText, done: true, color: "text-slate-500" },
    { date: booking.confirmedAt, label: "Confirmée", icon: Check, done: !!booking.confirmedAt, color: "text-sky-600" },
    { date: booking.pickedUpAt, label: "Prise en charge", icon: CarIcon, done: !!booking.pickedUpAt, color: "text-emerald-600" },
    { date: booking.returnedAt, label: "Retournée", icon: Check, done: !!booking.returnedAt, color: "text-slate-600" },
    { date: booking.cancelledAt, label: `Annulée${booking.cancelReason ? ` (${booking.cancelReason})` : ""}`, icon: XIcon, done: !!booking.cancelledAt, color: "text-rose-600" },
  ].filter((t) => t.done || (!booking.cancelledAt && t.label !== "Annulée"));

  return (
    <div className="space-y-5">
      <PageHeader
        title={booking.reference}
        breadcrumb={[{ label: "Admin" }, { label: "Réservations" }, { label: booking.reference }]}
        subtitle={`Créée le ${new Date(booking.createdAt).toLocaleDateString("fr-FR")} via ${booking.source}`}
        action={
          <>
            <Link to="/admin/bookings"><Button variant="ghost"><ArrowLeft className="h-4 w-4" />Retour</Button></Link>
            <Link to={`/admin/contracts/new?bookingId=${booking.id}`}>
              <Button variant="amber"><FileSignature className="h-4 w-4" />Générer le contrat</Button>
            </Link>
            <Button variant="outline" onClick={() => setPrintPreview(true)}><Printer className="h-4 w-4" />Imprimer</Button>
            <a href={waLink(wamsg)} target="_blank" rel="noopener noreferrer">
              <Button variant="success"><MessageCircle className="h-4 w-4" />WhatsApp</Button>
            </a>
          </>
        }
      />

      {/* Status & quick actions */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.paymentStatus} />
            <span className="text-xs text-slate-500">Total : <span className="font-extrabold text-slate-900">{booking.totalPrice.toLocaleString()} MAD</span></span>
          </div>
          <div className="flex flex-wrap gap-2">
            {booking.status === "pending" && (
              <Button variant="primary" size="sm" onClick={() => changeStatus("confirmed")}><Check className="h-3.5 w-3.5" />Confirmer</Button>
            )}
            {booking.status === "confirmed" && (
              <Button variant="success" size="sm" onClick={() => changeStatus("active")}><CarIcon className="h-3.5 w-3.5" />Marquer prise en charge</Button>
            )}
            {booking.status === "active" && (
              <Button variant="primary" size="sm" onClick={() => changeStatus("completed")}><CheckCircle2 className="h-3.5 w-3.5" />Marquer retournée</Button>
            )}
            {booking.paymentStatus !== "paid" && booking.status !== "cancelled" && (
              <Button variant="amber" size="sm" onClick={markPaid}><DollarSign className="h-3.5 w-3.5" />Marquer payé</Button>
            )}
            {booking.status !== "cancelled" && booking.status !== "completed" && (
              <Button variant="outline" size="sm" onClick={() => setConfirmCancel(true)}><XIcon className="h-3.5 w-3.5" />Annuler</Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 lg:col-span-2">
          {/* Car */}
          <Card title="Véhicule">
            <div className="flex items-start gap-4 p-5">
              <div className={`flex h-24 w-36 flex-shrink-0 items-center justify-center rounded-2xl ${car.cardBg}`}>
                <CarIllustration car={car} showBadge={false} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-extrabold text-slate-900">{car.make} {car.model}</h3>
                <p className="text-sm text-slate-500">{car.trim} · {car.year} · {car.colors.join(" / ")}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span>🚗 {car.category}</span>
                  <span>⚙️ {car.transmission === "automatic" ? "Auto" : "Manuelle"}</span>
                  <span>⛽ {car.fuel}</span>
                  <span>👥 {car.seats} places</span>
                </div>
              </div>
              <Link to={`/admin/cars/${car.id}/edit`} className="text-xs font-bold text-navy-700 hover:underline">Détails du véhicule →</Link>
            </div>
          </Card>

          {/* Customer */}
          <Card title="Client">
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <InfoRow icon={User} label="Nom complet" value={customer.fullName} />
              <InfoRow icon={Phone} label="Téléphone" value={<a href={`tel:${customer.phone}`} className="text-navy-700 hover:underline">{customer.phone}</a>} />
              <InfoRow icon={Mail} label="E-mail" value={<a href={`mailto:${customer.email}`} className="text-navy-700 hover:underline break-all">{customer.email}</a>} />
              <InfoRow icon={FileText} label={`${customer.idType} N°`} value={customer.idNumber} />
              <InfoRow icon={FileText} label="Permis N°" value={customer.licenseNumber} />
              <InfoRow icon={Calendar} label="Permis expire" value={customer.licenseExpiry} />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <span>📊 <span className="font-bold">{customer.totalBookings}</span> réservations</span>
                <span>💰 <span className="font-bold">{customer.totalSpent.toLocaleString()} MAD</span> dépensés</span>
                {customer.vip && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-700">⭐ VIP</span>}
                {customer.blacklisted && <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-700">⛔ Blacklist</span>}
              </div>
              <Link to={`/admin/customers`} className="font-bold text-navy-700 hover:underline">Voir le profil →</Link>
            </div>
          </Card>

          {/* Dates & Location */}
          <Card title="Dates & Lieux">
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Prise en charge</p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">{new Date(booking.pickupDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
                <p className="text-sm text-slate-500">à {booking.pickupTime}</p>
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold text-slate-900">{pickupLoc?.name.fr}</p>
                    <p className="text-slate-500">{pickupLoc?.address}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Retour</p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">{new Date(booking.returnDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
                <p className="text-sm text-slate-500">à {booking.returnTime}</p>
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-rose-600" />
                  <div>
                    <p className="font-bold text-slate-900">{returnLoc?.name.fr}</p>
                    <p className="text-slate-500">{returnLoc?.address}</p>
                  </div>
                </div>
              </div>
            </div>
            {pickupLoc && (
              <div className="border-t border-slate-100">
                <iframe
                  title="map"
                  src={googleMapsEmbedUrl(pickupLoc.gps.lat, pickupLoc.gps.lng)}
                  className="h-48 w-full"
                  loading="lazy"
                />
              </div>
            )}
          </Card>

          {/* Notes */}
          {(booking.notes || booking.internalNotes) && (
            <Card title="Notes">
              <div className="space-y-3 p-5">
                {booking.notes && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Note client</p>
                    <p className="mt-1 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{booking.notes}</p>
                  </div>
                )}
                {booking.internalNotes && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Note interne</p>
                    <p className="mt-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{booking.internalNotes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Side */}
        <div className="space-y-5">
          {/* Price breakdown */}
          <Card title="Détail du prix">
            <div className="p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Tarif de base</span><span className="font-bold">{booking.basePrice.toLocaleString()} MAD</span></div>
                {booking.extrasPrice > 0 && <div className="flex justify-between"><span className="text-slate-600">Options</span><span className="font-bold">+{booking.extrasPrice.toLocaleString()} MAD</span></div>}
                {booking.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Remise</span><span className="font-bold">-{booking.discount.toLocaleString()} MAD</span></div>}
              </div>
              <div className="mt-3 border-t border-slate-200 pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total</span>
                  <span className="text-2xl font-black text-navy-700">{booking.totalPrice.toLocaleString()}<span className="ms-1 text-xs font-medium text-slate-500">MAD</span></span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">+ caution : {booking.deposit.toLocaleString()} MAD</p>
              </div>

              {booking.paymentStatus === "paid" && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs">
                  <p className="font-bold text-emerald-900">✓ Paiement reçu</p>
                  <p className="mt-0.5 text-emerald-700">{booking.paidAmount.toLocaleString()} MAD via {booking.paymentMethod || "cash"}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Extras */}
          {Object.values(booking.extras).some(Boolean) && (
            <Card title="Options sélectionnées">
              <ul className="divide-y divide-slate-100">
                {booking.extras.gps && <li className="flex items-center gap-2 px-5 py-2.5 text-sm text-slate-700"><Check className="h-3.5 w-3.5 text-emerald-500" />GPS intégré</li>}
                {booking.extras.childSeat && <li className="flex items-center gap-2 px-5 py-2.5 text-sm text-slate-700"><Check className="h-3.5 w-3.5 text-emerald-500" />Siège enfant</li>}
                {booking.extras.additionalDriver && <li className="flex items-center gap-2 px-5 py-2.5 text-sm text-slate-700"><Check className="h-3.5 w-3.5 text-emerald-500" />Conducteur supp.</li>}
                {booking.extras.fullInsurance && <li className="flex items-center gap-2 px-5 py-2.5 text-sm text-slate-700"><Check className="h-3.5 w-3.5 text-emerald-500" />Assurance tous risques</li>}
              </ul>
            </Card>
          )}

          {/* Timeline */}
          <Card title="Historique">
            <div className="p-5">
              <ol className="space-y-3">
                {timeline.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${t.done ? "bg-emerald-100" : "bg-slate-100"}`}>
                        <Icon className={`h-3.5 w-3.5 ${t.done ? t.color : "text-slate-400"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold ${t.done ? "text-slate-900" : "text-slate-400"}`}>{t.label}</p>
                        {t.date && <p className="text-[10px] text-slate-500">{new Date(t.date).toLocaleString("fr-FR")}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel dialog */}
      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Annuler la réservation" maxWidth="max-w-md">
        <div>
          <p className="text-sm text-slate-600">Raison de l'annulation (optionnel) :</p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Ex: Annulation client, paiement non confirmé…"
            className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
          />
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmCancel(false)}>Garder</Button>
            <Button variant="danger" className="flex-1" onClick={() => { changeStatus("cancelled"); setConfirmCancel(false); }}>Confirmer l'annulation</Button>
          </div>
        </div>
      </Modal>

      {/* Print preview */}
      <Modal open={printPreview} onClose={() => setPrintPreview(false)} title="Aperçu - Contrat de location" maxWidth="max-w-3xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm leading-relaxed text-slate-800">
          <div className="flex items-center justify-between border-b-2 border-navy-700 pb-4">
            <div>
              <h2 className="text-2xl font-black text-navy-700">VELOX CAR</h2>
              <p className="text-xs text-slate-500">Rue Al Amal, Tanger 90060 · +212 6 68 35 39 49</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase text-slate-500">Contrat de location</p>
              <p className="font-mono text-lg font-black text-amber-600">{booking.reference}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Locataire</p>
              <p className="mt-1 font-bold">{customer.fullName}</p>
              <p className="text-xs">{customer.phone} · {customer.email}</p>
              <p className="text-xs">Permis: {customer.licenseNumber} (exp. {customer.licenseExpiry})</p>
              <p className="text-xs">{customer.idType}: {customer.idNumber}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Véhicule</p>
              <p className="mt-1 font-bold">{car.make} {car.model} {car.trim}</p>
              <p className="text-xs">{car.year} · {car.colors.join("/")} · {car.transmission} · {car.fuel}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Prise en charge</p>
              <p className="mt-1 font-bold">{booking.pickupDate} à {booking.pickupTime}</p>
              <p className="text-xs">{pickupLoc?.name.fr}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Retour</p>
              <p className="mt-1 font-bold">{booking.returnDate} à {booking.returnTime}</p>
              <p className="text-xs">{returnLoc?.name.fr}</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <div className="flex justify-between text-xs"><span>Tarif de base</span><span className="font-bold">{booking.basePrice} MAD</span></div>
            {booking.extrasPrice > 0 && <div className="flex justify-between text-xs"><span>Options</span><span className="font-bold">+{booking.extrasPrice} MAD</span></div>}
            {booking.discount > 0 && <div className="flex justify-between text-xs text-emerald-600"><span>Remise</span><span className="font-bold">-{booking.discount} MAD</span></div>}
            <div className="mt-2 flex justify-between border-t border-slate-300 pt-2 text-base"><span className="font-bold">TOTAL</span><span className="font-black">{booking.totalPrice} MAD</span></div>
            <div className="mt-1 flex justify-between text-xs text-slate-500"><span>Caution (à restituer)</span><span>{booking.deposit} MAD</span></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 text-xs">
            <div>
              <p className="font-bold">Signature du locataire</p>
              <div className="mt-8 border-b border-slate-300" />
            </div>
            <div>
              <p className="font-bold">Signature VELOX CAR</p>
              <div className="mt-8 border-b border-slate-300" />
            </div>
          </div>
          <p className="mt-6 text-center text-[10px] text-slate-400">VELOX CAR SARL · ICE: 002345678000089 · RC: 12345/2024</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPrintPreview(false)}>Fermer</Button>
          <Button variant="primary" onClick={() => window.print()}><Printer className="h-4 w-4" />Imprimer</Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
