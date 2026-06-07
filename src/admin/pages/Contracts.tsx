import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, MessageCircle, Trash2, FileSignature, CalendarPlus, Eye } from "lucide-react";
import { db } from "../data/mockDb";
import { getCarById } from "../../data/cars";
import { Card, PageHeader, Button, SearchInput, Select, Badge, EmptyState, ConfirmDialog } from "../components/AdminUI";
import { useToast } from "../../hooks/useToast";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useSyncRefresh } from "../../services/sync";

export function Contracts() {
  const { show } = useToast();
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  useSyncRefresh();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const allContracts = db.getContracts();

  const filtered = useMemo(() => {
    return allContracts.filter((c) => {
      if (statusFilter && (c.status || "active") !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const car = getCarById(c.carId);
        return (
          c.contractNumber.toLowerCase().includes(q) ||
          c.locataireNom.toLowerCase().includes(q) ||
          c.locataireTel.toLowerCase().includes(q) ||
          c.immatriculation.toLowerCase().includes(q) ||
          (car ? `${car.make} ${car.model}`.toLowerCase().includes(q) : false)
        );
      }
      return true;
    }).sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  }, [allContracts, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = allContracts.reduce((s, c) => s + c.total, 0);
    const totalCollected = allContracts.reduce((s, c) => s + c.avance, 0);
    return {
      total: allContracts.length,
      active: allContracts.filter((c) => (c.status || "active") === "active").length,
      extended: allContracts.filter((c) => c.status === "extended").length,
      completed: allContracts.filter((c) => c.status === "completed").length,
      totalRevenue,
      totalCollected,
      pendingPayment: totalRevenue - totalCollected,
    };
  }, [allContracts]);

  const handleDelete = () => {
    if (!confirmDelete) return;
    const c = db.getContract(confirmDelete);
    db.deleteContract(confirmDelete);
    if (user && c) db.addLog({
      userId: user.id, userName: user.fullName,
      action: "CONTRACT_DELETED", entity: "Contract",
      entityId: confirmDelete, details: `N° ${c.contractNumber}`,
    });
    setConfirmDelete(null);
    show("Contrat supprimé", "success");
  };

  const statusBadge = (status: string | undefined) => {
    const map: Record<string, { color: string; label: string }> = {
      draft: { color: "slate", label: "Brouillon" },
      active: { color: "emerald", label: "Actif" },
      extended: { color: "amber", label: "Prolongé" },
      completed: { color: "navy", label: "Terminé" },
      cancelled: { color: "rose", label: "Annulé" },
    };
    const s = map[status || "active"] || map.active;
    return <Badge color={s.color as any}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contrats de location"
        subtitle={`${allContracts.length} contrat(s) enregistré(s)`}
        breadcrumb={[{ label: "Admin" }, { label: "Contrats" }]}
        action={
          <Link to="/admin/contracts/new">
            <Button variant="amber"><Plus className="h-4 w-4" />Nouveau contrat</Button>
          </Link>
        }
      />

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <StatMini label="Total" value={stats.total} icon="📋" />
        <StatMini label="Actifs" value={stats.active} icon="🟢" color="emerald" />
        <StatMini label="Prolongés" value={stats.extended} icon="⏳" color="amber" />
        <StatMini label="Terminés" value={stats.completed} icon="✅" color="navy" />
        <StatMini label="CA Total" value={`${stats.totalRevenue.toLocaleString()} MAD`} icon="💰" color="emerald" wide />
        <StatMini label="Restant à payer" value={`${stats.pendingPayment.toLocaleString()} MAD`} icon="💵" color={stats.pendingPayment > 0 ? "rose" : "slate"} wide />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="N° contrat, nom, téléphone, immatriculation…" className="min-w-[240px] flex-1" />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "", label: "Tous statuts" },
              { value: "active", label: "Actifs" },
              { value: "extended", label: "Prolongés" },
              { value: "completed", label: "Terminés" },
              { value: "cancelled", label: "Annulés" },
            ]}
            className="w-44"
          />
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <div className="p-6">
            <EmptyState
              icon={FileSignature}
              title="Aucun contrat"
              description={search || statusFilter ? "Aucun contrat ne correspond aux filtres." : "Créez votre premier contrat de location."}
              action={
                <Link to="/admin/contracts/new">
                  <Button variant="amber"><Plus className="h-4 w-4" />Nouveau contrat</Button>
                </Link>
              }
            />
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">N° Contrat</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Locataire</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Véhicule</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Période</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Total / Reste</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const car = getCarById(c.carId);
                  const extensions = c.extensions?.length || 0;
                  const isToday = (date: string) => date === new Date().toISOString().split("T")[0];
                  const buildIso = (j: string, m: string, a: string) => {
                    if (!j || !m || !a) return "";
                    const yr = parseInt(a) < 50 ? `20${a.padStart(2, "0")}` : `19${a.padStart(2, "0")}`;
                    return `${yr}-${m.padStart(2, "0")}-${j.padStart(2, "0")}`;
                  };
                  const pickup = buildIso(c.departJour, c.departMois, c.departAnnee);
                  const ret = buildIso(c.retourJour, c.retourMois, c.retourAnnee);
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link to={`/admin/contracts/${c.id}/edit`} className="font-mono text-sm font-extrabold text-navy-700 hover:underline">
                          {c.contractNumber}
                        </Link>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                          {c.updatedAt && c.updatedAt !== c.createdAt && (
                            <span className="ms-1 text-amber-600">• modifié</span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-900">{c.locataireNom}</p>
                        <p className="text-xs text-slate-500">{c.locataireTel}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-700">{car ? `${car.make} ${car.model}` : "—"}</p>
                        <p className="font-mono text-[10px] font-bold text-slate-500">{c.immatriculation}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <p>{pickup}</p>
                        <p className="text-slate-400">→ {ret} {isToday(ret) && <span className="ms-1 rounded-full bg-amber-100 px-1.5 py-0 text-[9px] font-bold text-amber-700">Aujourd'hui</span>}</p>
                        <p className="mt-0.5 font-bold text-slate-700">{c.dureeJours} j{extensions > 0 && <span className="ms-1 text-amber-600">(+{extensions} prolongation{extensions > 1 ? "s" : ""})</span>}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-extrabold text-slate-900">{c.total.toLocaleString()}<span className="text-[10px] font-medium text-slate-500"> MAD</span></p>
                        {c.reste > 0 ? (
                          <p className="text-[10px] font-bold text-rose-600">Reste : {c.reste.toLocaleString()} MAD</p>
                        ) : (
                          <p className="text-[10px] font-bold text-emerald-600">✓ Payé</p>
                        )}
                      </td>
                      <td className="px-4 py-3">{statusBadge(c.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() => navigate(`/admin/contracts/${c.id}/edit`)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-50 hover:text-navy-700"
                            title="Voir / Modifier"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/contracts/${c.id}/edit?extend=1`)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                            title="Prolonger"
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                          </button>
                          {c.locataireTel && (
                            <a
                              href={`https://wa.me/${c.locataireTel.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour ${c.locataireNom.split(" ")[0]}, concernant votre contrat N° ${c.contractNumber}`)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => setConfirmDelete(c.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer ce contrat ?"
        message="Cette action est irréversible. Le contrat et son historique seront définitivement supprimés."
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}

function StatMini({ label, value, icon, color = "slate", wide }: { label: string; value: any; icon: string; color?: string; wide?: boolean }) {
  const colorMap: Record<string, string> = {
    slate: "text-slate-900",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
    navy: "text-navy-700",
  };
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 ${wide ? "sm:col-span-2 lg:col-span-2" : ""}`}>
      <div className="text-2xl">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className={`text-lg font-black ${colorMap[color]} ${wide ? "sm:text-xl" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
