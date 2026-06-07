import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Download, Filter, Eye, MessageCircle, X, FileText, Check, Trash2 } from "lucide-react";
import { db } from "../data/mockDb";
import { getCarById } from "../../data/cars";
import { getLocationById } from "../../data/locations";
import { Button, Card, SearchInput, Select, BookingStatusBadge, PaymentStatusBadge, EmptyState, PageHeader, ConfirmDialog } from "../components/AdminUI";
import { useToast } from "../../hooks/useToast";
import { formatBookingMessage, waLink } from "../../utils/format";

export function Bookings() {
  const { show } = useToast();
  const [bookings, setBookings] = useState(db.getBookings());
  const customers = db.getCustomers();
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [carFilter, setCarFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (status && b.status !== status) return false;
      if (payment && b.paymentStatus !== payment) return false;
      if (carFilter && b.carId !== carFilter) return false;
      if (search) {
        const c = customers.find((x) => x.id === b.customerId);
        const q = search.toLowerCase();
        if (!b.reference.toLowerCase().includes(q) &&
            !c?.fullName.toLowerCase().includes(q) &&
            !c?.phone.includes(q) &&
            !c?.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [bookings, status, payment, carFilter, search, customers]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id: string) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };
  const toggleAll = () => {
    if (selected.length === paginated.length) setSelected([]);
    else setSelected(paginated.map((b) => b.id));
  };

  const exportCSV = () => {
    const headers = ["Référence", "Client", "Téléphone", "Voiture", "Prise en charge", "Retour", "Lieu", "Montant", "Statut", "Paiement", "Créée le"];
    const rows = filtered.map((b) => {
      const c = customers.find((x) => x.id === b.customerId);
      const car = getCarById(b.carId);
      const loc = getLocationById(b.pickupLocationId);
      return [b.reference, c?.fullName || "", c?.phone || "", `${car?.make} ${car?.model}`, b.pickupDate, b.returnDate, loc?.name.fr || "", b.totalPrice, b.status, b.paymentStatus, b.createdAt];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velox-bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    show(`${filtered.length} réservations exportées`, "success");
  };

  const bulkAction = (action: "confirm" | "cancel" | "paid" | "delete") => {
    const all = db.getBookings();
    selected.forEach((id) => {
      const idx = all.findIndex((b) => b.id === id);
      if (idx >= 0) {
        if (action === "confirm") all[idx].status = "confirmed";
        if (action === "cancel") all[idx].status = "cancelled";
        if (action === "paid") { all[idx].paymentStatus = "paid"; all[idx].paidAmount = all[idx].totalPrice; }
      }
    });
    let finalAll = all;
    if (action === "delete") finalAll = all.filter((b) => !selected.includes(b.id));
    db.saveBookings(finalAll);
    setBookings(db.getBookings());
    setSelected([]);
    show(`${selected.length} réservations mises à jour`, "success");
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    db.deleteBooking(confirmDelete);
    setBookings(db.getBookings());
    setConfirmDelete(null);
    show("Réservation supprimée", "success");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Réservations"
        subtitle={`${filtered.length} résultat(s) sur ${bookings.length} réservations totales`}
        breadcrumb={[{ label: "Admin" }, { label: "Réservations" }]}
        action={
          <>
            <Button variant="outline" size="md" onClick={exportCSV}><Download className="h-4 w-4" />Exporter CSV</Button>
            <Link to="/admin/bookings/new"><Button variant="amber"><Plus className="h-4 w-4" />Nouvelle</Button></Link>
          </>
        }
      />

      {/* Filters */}
      <Card>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Réf, nom, tél, email…" className="lg:col-span-2" />
          <Select
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={[
              { value: "", label: "Tous les statuts" },
              { value: "pending", label: "En attente" },
              { value: "confirmed", label: "Confirmées" },
              { value: "active", label: "En cours" },
              { value: "completed", label: "Terminées" },
              { value: "cancelled", label: "Annulées" },
              { value: "no-show", label: "No-show" },
            ]}
          />
          <Select
            value={payment}
            onChange={(v) => { setPayment(v); setPage(1); }}
            options={[
              { value: "", label: "Tous paiements" },
              { value: "unpaid", label: "Non payé" },
              { value: "partial", label: "Partiel" },
              { value: "paid", label: "Payé" },
              { value: "refunded", label: "Remboursé" },
            ]}
          />
          <Select
            value={carFilter}
            onChange={(v) => { setCarFilter(v); setPage(1); }}
            options={[
              { value: "", label: "Tous véhicules" },
              ...db.getCarRecords().map((r) => { const c = getCarById(r.id); return { value: r.id, label: c ? `${c.make} ${c.model}` : r.id }; }),
            ]}
          />
        </div>
        {(status || payment || carFilter || search) && (
          <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500">Filtres actifs</span>
            <button onClick={() => { setStatus(""); setPayment(""); setCarFilter(""); setSearch(""); setPage(1); }} className="ms-auto inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline">
              <X className="h-3 w-3" />Réinitialiser
            </button>
          </div>
        )}
      </Card>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-navy-700 px-4 py-3 text-white shadow-lg shadow-navy-700/20">
          <p className="text-sm font-bold">{selected.length} sélectionnée(s)</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => bulkAction("confirm")} className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25"><Check className="h-3 w-3" />Confirmer</button>
            <button onClick={() => bulkAction("paid")} className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25">Marquer payé</button>
            <button onClick={() => bulkAction("cancel")} className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25">Annuler</button>
            <button onClick={() => bulkAction("delete")} className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold hover:bg-rose-600"><Trash2 className="h-3 w-3" />Supprimer</button>
            <button onClick={() => setSelected([])} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">Annuler</button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        {paginated.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={FileText} title="Aucune réservation" description="Aucune réservation ne correspond à vos critères." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-100 bg-slate-50/70">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input type="checkbox" checked={selected.length === paginated.length} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-700" />
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Référence</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Client</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Véhicule</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Dates</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Lieu</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Montant</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Statut</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Paiement</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((b) => {
                    const c = customers.find((x) => x.id === b.customerId);
                    const car = getCarById(b.carId);
                    const loc = getLocationById(b.pickupLocationId);
                    const msg = formatBookingMessage({
                      reference: b.reference, name: c?.fullName || "", phone: c?.phone || "",
                      pickupDate: b.pickupDate, returnDate: b.returnDate,
                      pickupLocation: loc?.name.fr || "",
                      carModel: car ? `${car.make} ${car.model}` : "", totalPrice: b.totalPrice,
                    });
                    return (
                      <tr key={b.id} className={`transition-colors hover:bg-slate-50 ${selected.includes(b.id) ? "bg-navy-50/40" : ""}`}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggleSelect(b.id)} className="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-700" />
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/admin/bookings/${b.id}`} className="font-mono text-xs font-bold text-navy-700 hover:underline">
                            {b.reference}
                          </Link>
                          <p className="mt-0.5 text-[10px] text-slate-400">{new Date(b.createdAt).toLocaleDateString("fr-FR")} · {b.source}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-slate-900">{c?.fullName}</p>
                          <p className="text-xs text-slate-500">{c?.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          <p className="font-semibold">{car?.make} {car?.model}</p>
                          <p className="text-xs text-slate-500">{car?.year}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          <p>{b.pickupDate} {b.pickupTime}</p>
                          <p className="text-slate-400">→ {b.returnDate} {b.returnTime}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{loc?.name.fr.slice(0, 22)}</td>
                        <td className="px-4 py-3 text-right text-sm font-extrabold text-slate-900">{b.totalPrice.toLocaleString()}<span className="ms-1 text-[10px] font-medium text-slate-500">MAD</span></td>
                        <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                        <td className="px-4 py-3"><PaymentStatusBadge status={b.paymentStatus} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <Link to={`/admin/bookings/${b.id}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-50 hover:text-navy-700" title="Détails"><Eye className="h-3.5 w-3.5" /></Link>
                            <a href={waLink(msg)} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" title="WhatsApp"><MessageCircle className="h-3.5 w-3.5" /></a>
                            <button onClick={() => setConfirmDelete(b.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Supprimer"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Afficher</span>
                <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold">
                  <option>20</option><option>50</option><option>100</option>
                </select>
                <span>par page · {filtered.length} résultats</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40 hover:bg-slate-50">←</button>
                <span className="px-3 text-xs font-bold text-slate-700">{page} / {totalPages || 1}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || totalPages === 0} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40 hover:bg-slate-50">→</button>
              </div>
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer cette réservation ?"
        message="Cette action est irréversible. La réservation sera définitivement supprimée."
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}
