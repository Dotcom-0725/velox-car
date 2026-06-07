import { useState, useMemo } from "react";
import { Users, Star, Ban, Eye, Phone, Mail, Download, MessageCircle } from "lucide-react";
import { db, Customer } from "../data/mockDb";
import { Button, Card, SearchInput, Select, Badge, PageHeader, EmptyState, Modal, ConfirmDialog } from "../components/AdminUI";
import { useToast } from "../../hooks/useToast";
import { waLink } from "../../utils/format";

export function Customers() {
  const { show } = useToast();
  const [customers, setCustomers] = useState(db.getCustomers());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [confirmBlacklist, setConfirmBlacklist] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.fullName.toLowerCase().includes(q) && !c.phone.includes(q) && !c.email.toLowerCase().includes(q)) return false;
      }
      if (filter === "vip" && !c.vip) return false;
      if (filter === "blacklisted" && !c.blacklisted) return false;
      if (filter === "active" && c.blacklisted) return false;
      if (filter === "highvalue" && c.totalSpent < 3000) return false;
      return true;
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, search, filter]);

  const stats = {
    total: customers.length,
    vip: customers.filter((c) => c.vip).length,
    blacklisted: customers.filter((c) => c.blacklisted).length,
    totalRevenue: customers.reduce((s, c) => s + c.totalSpent, 0),
  };

  const toggleBlacklist = (cust: Customer) => {
    const updated = { ...cust, blacklisted: !cust.blacklisted, blacklistReason: !cust.blacklisted ? "Modifié manuellement" : undefined };
    db.upsertCustomer(updated);
    setCustomers(db.getCustomers());
    setConfirmBlacklist(null);
    show(updated.blacklisted ? "Client blacklisté" : "Client retiré de la blacklist", "success");
  };

  const exportContacts = () => {
    const csv = ["Nom,Email,Téléphone,Permis,Réservations,Total dépensé"]
      .concat(filtered.map((c) => `"${c.fullName}","${c.email}","${c.phone}","${c.licenseNumber}",${c.totalBookings},${c.totalSpent}`))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `velox-customers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    show("Contacts exportés", "success");
  };

  const customerBookings = selectedCustomer ? db.getBookings().filter((b) => b.customerId === selectedCustomer.id) : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        subtitle={`${stats.total} clients · ${stats.vip} VIP · ${stats.blacklisted} blacklisté(s) · ${stats.totalRevenue.toLocaleString()} MAD total`}
        breadcrumb={[{ label: "Admin" }, { label: "Clients" }]}
        action={
          <Button variant="outline" onClick={exportContacts}><Download className="h-4 w-4" />Exporter</Button>
        }
      />

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Nom, téléphone, email…" className="min-w-[240px] flex-1" />
          <Select
            value={filter}
            onChange={setFilter}
            options={[
              { value: "", label: "Tous les clients" },
              { value: "active", label: "Actifs" },
              { value: "vip", label: "VIP uniquement" },
              { value: "blacklisted", label: "Blacklistés" },
              { value: "highvalue", label: "+3000 MAD" },
            ]}
            className="w-48"
          />
        </div>
      </Card>

      {/* Customers table */}
      {filtered.length === 0 ? (
        <Card><div className="p-6"><EmptyState icon={Users} title="Aucun client" /></div></Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Client</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Contact</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Origine</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase text-slate-500">Résa.</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase text-slate-500">Total dépensé</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Dernière résa.</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className={`hover:bg-slate-50 ${c.blacklisted ? "bg-rose-50/30" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${c.vip ? "bg-gradient-to-br from-amber-500 to-amber-600" : c.blacklisted ? "bg-rose-500" : "bg-gradient-to-br from-navy-700 to-navy-900"}`}>
                          {c.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{c.fullName}</p>
                          <p className="text-[10px] text-slate-500">{c.idType}: {c.idNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold text-slate-700">{c.phone}</p>
                      <p className="text-slate-500">{c.email.slice(0, 28)}{c.email.length > 28 ? "…" : ""}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{c.city}<br /><span className="text-slate-400">{c.country}</span></td>
                    <td className="px-4 py-3 text-center text-sm font-extrabold text-slate-900">{c.totalBookings}</td>
                    <td className="px-4 py-3 text-right text-sm font-extrabold text-emerald-700">{c.totalSpent.toLocaleString()}<span className="text-[10px] text-slate-500"> MAD</span></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{c.lastBookingDate || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.vip && <Badge color="amber"><Star className="h-2.5 w-2.5 fill-current" />VIP</Badge>}
                        {c.blacklisted && <Badge color="rose"><Ban className="h-2.5 w-2.5" />Blacklist</Badge>}
                        {!c.vip && !c.blacklisted && <Badge color="emerald">Actif</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => setSelectedCustomer(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-50 hover:text-navy-700"><Eye className="h-3.5 w-3.5" /></button>
                        <a href={`tel:${c.phone}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-700"><Phone className="h-3.5 w-3.5" /></a>
                        <a href={waLink(`Bonjour ${c.fullName.split(" ")[0]},`)} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"><MessageCircle className="h-3.5 w-3.5" /></a>
                        <button onClick={() => setConfirmBlacklist(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700"><Ban className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Customer detail modal */}
      <Modal open={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.fullName} maxWidth="max-w-3xl">
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-navy-700 to-navy-900 p-5 text-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-extrabold">
                {selectedCustomer.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold">{selectedCustomer.fullName}</h3>
                <div className="mt-1 flex flex-wrap gap-3 text-xs">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedCustomer.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{selectedCustomer.email}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-amber-400">{selectedCustomer.totalSpent.toLocaleString()}</p>
                <p className="text-[10px] uppercase text-white/70">MAD total</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card><div className="p-4 text-center"><p className="text-2xl font-black text-slate-900">{selectedCustomer.totalBookings}</p><p className="text-[10px] uppercase text-slate-500">Réservations</p></div></Card>
              <Card><div className="p-4 text-center"><p className="text-2xl font-black text-slate-900">{customerBookings.filter((b) => b.status === "completed").length}</p><p className="text-[10px] uppercase text-slate-500">Terminées</p></div></Card>
              <Card><div className="p-4 text-center"><p className="text-2xl font-black text-slate-900">{customerBookings.filter((b) => b.status === "cancelled").length}</p><p className="text-[10px] uppercase text-slate-500">Annulées</p></div></Card>
            </div>

            <Card title="Documents">
              <div className="grid gap-3 p-4 sm:grid-cols-2 text-sm">
                <div><p className="text-[10px] font-bold uppercase text-slate-500">Permis</p><p className="font-bold">{selectedCustomer.licenseNumber}</p><p className="text-xs text-slate-500">Expire le {selectedCustomer.licenseExpiry}</p></div>
                <div><p className="text-[10px] font-bold uppercase text-slate-500">{selectedCustomer.idType}</p><p className="font-bold">{selectedCustomer.idNumber}</p><p className="text-xs text-slate-500">{selectedCustomer.country} · {selectedCustomer.city}</p></div>
              </div>
            </Card>

            <Card title={`Historique (${customerBookings.length})`}>
              <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
                {customerBookings.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-400">Aucune réservation</p>
                ) : (
                  customerBookings.slice(0, 10).map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs">
                      <div>
                        <p className="font-mono font-bold text-navy-700">{b.reference}</p>
                        <p className="text-slate-500">{b.pickupDate} → {b.returnDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-slate-900">{b.totalPrice.toLocaleString()} MAD</p>
                        <p className="capitalize text-slate-500">{b.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {selectedCustomer.blacklisted && selectedCustomer.blacklistReason && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800">
                <p className="font-bold">⛔ Raison du blacklist :</p>
                <p>{selectedCustomer.blacklistReason}</p>
              </div>
            )}
            {selectedCustomer.notes && (
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                <p className="font-bold">📝 Notes :</p>
                <p>{selectedCustomer.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmBlacklist}
        onCancel={() => setConfirmBlacklist(null)}
        onConfirm={() => confirmBlacklist && toggleBlacklist(confirmBlacklist)}
        title={confirmBlacklist?.blacklisted ? "Retirer de la blacklist ?" : "Blacklister ce client ?"}
        message={confirmBlacklist?.blacklisted ? "Ce client pourra à nouveau réserver." : "Ce client ne pourra plus faire de réservations."}
        confirmLabel={confirmBlacklist?.blacklisted ? "Retirer" : "Blacklister"}
        danger
      />
    </div>
  );
}
