import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, LayoutGrid, List, Edit, AlertCircle, Eye } from "lucide-react";
import { CARS } from "../../data/cars";
import { db } from "../data/mockDb";
import { CarIllustration } from "../../components/CarIllustration";
import { Button, Card, CarStatusBadge, SearchInput, Select, PageHeader, Modal } from "../components/AdminUI";
import { useToast } from "../../hooks/useToast";

export function Cars() {
  const { show } = useToast();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [records, setRecords] = useState(db.getCarRecords());
  const [editCarId, setEditCarId] = useState<string | null>(null);

  const filtered = CARS.filter((c) => {
    if (search && !`${c.make} ${c.model}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter) {
      const rec = records.find((r) => r.id === c.id);
      if (rec?.status !== statusFilter) return false;
    }
    return true;
  });

  const changeStatus = (carId: string, status: "available" | "rented" | "maintenance" | "unavailable") => {
    const updated = records.map((r) => r.id === carId ? { ...r, status } : r);
    db.saveCarRecords(updated);
    setRecords(updated);
    show("Statut mis à jour", "success");
  };

  const stats = {
    total: records.length,
    available: records.filter((r) => r.status === "available").length,
    rented: db.getBookings().filter((b) => b.status === "active").length,
    maintenance: records.filter((r) => r.status === "maintenance").length,
  };

  const editingCar = editCarId ? CARS.find((c) => c.id === editCarId) : null;
  const editingRec = editCarId ? records.find((r) => r.id === editCarId) : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gestion de la flotte"
        subtitle={`${CARS.length} véhicules · ${stats.available} disponibles · ${stats.rented} louées · ${stats.maintenance} en maintenance`}
        breadcrumb={[{ label: "Admin" }, { label: "Flotte" }]}
        action={
          <Button variant="amber" onClick={() => show("Ajout de nouveau véhicule (démo)", "info")}><Plus className="h-4 w-4" />Ajouter un véhicule</Button>
        }
      />

      {/* Filters & view toggle */}
      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par marque ou modèle…" className="min-w-[240px] flex-1" />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "", label: "Tous statuts" },
              { value: "available", label: "Disponibles" },
              { value: "rented", label: "Louées" },
              { value: "maintenance", label: "Maintenance" },
              { value: "unavailable", label: "Indisponibles" },
            ]}
            className="w-44"
          />
          <div className="flex rounded-xl bg-slate-100 p-0.5">
            <button onClick={() => setView("grid")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${view === "grid" ? "bg-white text-navy-700 shadow-sm" : "text-slate-500"}`}>
              <LayoutGrid className="h-3.5 w-3.5" /> Grille
            </button>
            <button onClick={() => setView("list")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${view === "list" ? "bg-white text-navy-700 shadow-sm" : "text-slate-500"}`}>
              <List className="h-3.5 w-3.5" /> Liste
            </button>
          </div>
        </div>
      </Card>

      {/* Grid view */}
      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((car) => {
            const rec = records.find((r) => r.id === car.id);
            const activeBooking = db.getBookings().find((b) => b.carId === car.id && b.status === "active");
            const customer = activeBooking ? db.getCustomers().find((c) => c.id === activeBooking.customerId) : null;
            return (
              <Card key={car.id} className="overflow-hidden">
                <div className={`relative h-40 ${car.cardBg}`}>
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div className="relative h-full">
                    <CarIllustration car={car} showBadge={false} />
                  </div>
                  <div className="absolute left-2 top-2">
                    {rec && <CarStatusBadge status={rec.status} />}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{car.make} {car.model}</p>
                      <p className="text-xs text-slate-500">{car.year} · {car.trim}</p>
                    </div>
                    <p className="text-right text-sm font-extrabold text-navy-700">{car.priceLow}<span className="text-[10px] text-slate-500"> MAD/j</span></p>
                  </div>
                  {activeBooking && customer && (
                    <div className="mt-2 rounded-lg bg-sky-50 p-2 text-[10px] text-sky-900">
                      <p className="font-bold">🏃 En location</p>
                      <p className="truncate">{customer.fullName} — retour {activeBooking.returnDate}</p>
                    </div>
                  )}
                  {rec && rec.mileage && (
                    <p className="mt-2 text-[10px] text-slate-500">📊 {rec.mileage.toLocaleString()} km</p>
                  )}
                  <div className="mt-3 flex gap-1.5">
                    <button onClick={() => setEditCarId(car.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200"><Edit className="h-3 w-3" />Gérer</button>
                    <Link to={`/fleet/${car.id}`} target="_blank" className="flex items-center justify-center rounded-lg bg-slate-100 px-2 py-1.5 text-slate-700 hover:bg-slate-200"><Eye className="h-3 w-3" /></Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List view */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Véhicule</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Catégorie</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Specs</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase text-slate-500">Prix</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Statut</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Km</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((car) => {
                  const rec = records.find((r) => r.id === car.id);
                  return (
                    <tr key={car.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-lg ${car.cardBg}`}>
                            <CarIllustration car={car} showBadge={false} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{car.make} {car.model}</p>
                            <p className="text-xs text-slate-500">{car.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs capitalize text-slate-600">{car.category}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{car.transmission === "automatic" ? "Auto" : "Man."} · {car.fuel} · {car.seats}p</td>
                      <td className="px-4 py-3 text-right text-sm font-extrabold text-navy-700">{car.priceLow}<span className="text-[10px] text-slate-500"> MAD</span></td>
                      <td className="px-4 py-3">{rec && <CarStatusBadge status={rec.status} />}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{rec?.mileage.toLocaleString()} km</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditCarId(car.id)} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"><Edit className="h-3 w-3" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit modal */}
      <Modal open={!!editCarId} onClose={() => setEditCarId(null)} title={editingCar ? `${editingCar.make} ${editingCar.model}` : ""} maxWidth="max-w-2xl">
        {editingCar && editingRec && (
          <div className="space-y-4">
            <div className={`flex h-32 items-center justify-center rounded-2xl ${editingCar.cardBg}`}>
              <CarIllustration car={editingCar} showBadge={false} />
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Statut</p>
              <div className="grid grid-cols-4 gap-2">
                {(["available", "rented", "maintenance", "unavailable"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(editingCar.id, s)}
                    className={`rounded-xl border-2 py-2.5 text-xs font-bold capitalize transition-all ${editingRec.status === s ? "border-navy-700 bg-navy-50 text-navy-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    {s === "available" ? "Disponible" : s === "rented" ? "Louée" : s === "maintenance" ? "Maintenance" : "Indisponible"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card title="Tarification">
                <div className="space-y-2 p-4 text-sm">
                  <Row label="Basse saison" value={`${editingCar.priceLow} MAD/j`} />
                  <Row label="Haute saison" value={`${editingCar.priceHigh} MAD/j`} />
                  <Row label="Caution" value={`${editingCar.category === "luxury" ? 8000 : editingCar.category === "suv" ? 5000 : 3000} MAD`} />
                </div>
              </Card>
              <Card title="Maintenance">
                <div className="space-y-2 p-4 text-sm">
                  <Row label="Kilométrage" value={`${editingRec.mileage.toLocaleString()} km`} />
                  <Row label="Dernière révision" value={editingRec.lastServiceDate} />
                  <Row label="Prochaine révision" value={`${editingRec.nextServiceMileage.toLocaleString()} km`} />
                </div>
              </Card>
            </div>

            {editingRec.internalNotes && (
              <div className="rounded-xl bg-amber-50 p-3 text-xs">
                <p className="flex items-center gap-1 font-bold text-amber-800"><AlertCircle className="h-3.5 w-3.5" />Note interne</p>
                <p className="mt-1 text-amber-900">{editingRec.internalNotes}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Équipements</p>
              <div className="flex flex-wrap gap-1.5">
                {editingCar.features.map((f) => (
                  <span key={f} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{f}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-100 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setEditCarId(null)}>Fermer</Button>
              <Button variant="primary" className="flex-1" onClick={() => { show("Modifications sauvegardées", "success"); setEditCarId(null); }}>Sauvegarder</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span className="font-bold text-slate-900">{value}</span></div>;
}
