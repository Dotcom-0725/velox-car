// ============================================
// Remaining admin pages bundled for efficiency:
// Locations, Pricing, Reviews, WhatsApp, Settings, Logs
// ============================================
import { useState } from "react";
import { MapPin, Plus, Phone, Edit, Star, ThumbsUp, ThumbsDown, Reply, Copy, Send, Save, UserPlus, Trash2, Calendar, Activity, Check, X } from "lucide-react";
import { LOCATIONS, Location } from "../../data/locations";
// EXTRAS now sourced via api.getPricingRules() so admin edits persist
import { db, AdminUser } from "../data/mockDb";
import { BUSINESS } from "../../data/info";
import { api } from "../../services/api";
import { Card, PageHeader, Button, SearchInput, Badge, Modal, EmptyState, ConfirmDialog, Select } from "../components/AdminUI";
import { useToast } from "../../hooks/useToast";
import { useAdminAuth } from "../context/AdminAuthContext";
import { waLink } from "../../utils/format";

// ========== LOCATIONS ==========
export function LocationsAdmin() {
  const { show } = useToast();
  const [editLoc, setEditLoc] = useState<Location | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Agences & Points de remise"
        subtitle={`${LOCATIONS.length} points de service actifs`}
        breadcrumb={[{ label: "Admin" }, { label: "Agences" }]}
        action={<Button variant="amber" onClick={() => show("Ajout d'agence (démo)", "info")}><Plus className="h-4 w-4" />Ajouter</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LOCATIONS.map((loc) => (
          <Card key={loc.id}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-900">{loc.name.fr}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{loc.address}, {loc.city}</p>
                </div>
                <Badge color={loc.isMain ? "amber" : loc.isAirport ? "sky" : loc.isPort ? "violet" : loc.type === "seasonal" ? "rose" : "emerald"}>
                  {loc.isMain ? "Principal" : loc.isAirport ? "Aéroport" : loc.isPort ? "Port" : loc.type === "seasonal" ? "Saisonnier" : "Ville"}
                </Badge>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <p className="flex items-center gap-1.5 text-slate-600"><Phone className="h-3 w-3" />{loc.phone || "—"}</p>
                <p className="flex items-center gap-1.5 text-slate-600"><Calendar className="h-3 w-3" />{loc.hours.fr}</p>
                <p className="flex items-center gap-1.5 text-slate-600"><MapPin className="h-3 w-3" />{loc.gps.lat.toFixed(4)}, {loc.gps.lng.toFixed(4)}</p>
              </div>
              <p className="mt-3 line-clamp-2 text-xs text-slate-500">{loc.notes.fr}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setEditLoc(loc)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"><Edit className="h-3 w-3" />Modifier</button>
                <a href={`https://maps.google.com/?q=${loc.gps.lat},${loc.gps.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-800"><MapPin className="h-3 w-3" /></a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!editLoc} onClose={() => setEditLoc(null)} title={editLoc?.name.fr} maxWidth="max-w-lg">
        {editLoc && (
          <div className="space-y-3">
            <Input label="Nom (FR)" defaultValue={editLoc.name.fr} />
            <Input label="Adresse" defaultValue={editLoc.address} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Téléphone" defaultValue={editLoc.phone || ""} />
              <Input label="Ville" defaultValue={editLoc.city} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Latitude" defaultValue={String(editLoc.gps.lat)} />
              <Input label="Longitude" defaultValue={String(editLoc.gps.lng)} />
            </div>
            <Input label="Horaires (FR)" defaultValue={editLoc.hours.fr} />
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Notes</label>
              <textarea defaultValue={editLoc.notes.fr} rows={3} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100" />
            </div>
            <div className="flex gap-2 border-t border-slate-100 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setEditLoc(null)}>Annuler</Button>
              <Button variant="primary" className="flex-1" onClick={() => { show("Agence mise à jour", "success"); setEditLoc(null); }}><Save className="h-4 w-4" />Enregistrer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ========== PRICING ==========
export function PricingAdmin() {
  const { show } = useToast();
  const rules = api.getPricingRules();
  const [highStart, setHighStart] = useState(`2026-${rules.highSeasonStart}`);
  const [highEnd, setHighEnd] = useState(`2026-${rules.highSeasonEnd}`);
  const [highMultiplier, setHighMultiplier] = useState(35);
  const [weeklyDiscount, setWeeklyDiscount] = useState(rules.weeklyDiscountPct);
  const [monthlyDiscount, setMonthlyDiscount] = useState(rules.biweeklyDiscountPct);
  const [extrasState, setExtrasState] = useState(rules.extras.map((e) => ({ ...e })));

  const saveAll = () => {
    api.updatePricingRules({
      highSeasonStart: highStart.slice(5),
      highSeasonEnd: highEnd.slice(5),
      weeklyDiscountPct: weeklyDiscount,
      biweeklyDiscountPct: monthlyDiscount,
      extras: extrasState,
    });
    show("Tarifs enregistrés — appliqués immédiatement sur le site ✓", "success");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Règles de tarification"
        subtitle="Configurez la saison haute, les remises et les options"
        breadcrumb={[{ label: "Admin" }, { label: "Tarification" }]}
        action={<Button variant="amber" onClick={saveAll}><Save className="h-4 w-4" />Enregistrer</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Saison haute">
          <div className="space-y-3 p-5">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Début" type="date" defaultValue={highStart} onChange={setHighStart} />
              <Input label="Fin" type="date" defaultValue={highEnd} onChange={setHighEnd} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Augmentation tarif (%)</label>
              <input type="range" min="0" max="100" step="5" value={highMultiplier} onChange={(e) => setHighMultiplier(parseInt(e.target.value))} className="w-full accent-amber-500" />
              <p className="mt-1 text-center text-2xl font-black text-amber-600">+{highMultiplier}%</p>
            </div>
            <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">💡 Les tarifs sont automatiquement majorés pendant la saison haute (juin-septembre par défaut).</p>
          </div>
        </Card>

        <Card title="Remises durée">
          <div className="space-y-3 p-5">
            <div>
              <div className="mb-1 flex justify-between text-xs"><span className="font-bold text-slate-600">7+ jours</span><span className="font-extrabold text-emerald-600">-{weeklyDiscount}%</span></div>
              <input type="range" min="0" max="30" step="1" value={weeklyDiscount} onChange={(e) => setWeeklyDiscount(parseInt(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs"><span className="font-bold text-slate-600">14+ jours</span><span className="font-extrabold text-emerald-600">-{monthlyDiscount}%</span></div>
              <input type="range" min="0" max="40" step="1" value={monthlyDiscount} onChange={(e) => setMonthlyDiscount(parseInt(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">Les remises sont appliquées automatiquement au montant total.</p>
          </div>
        </Card>

        <Card title="Options & extras" className="lg:col-span-2">
          <div className="divide-y divide-slate-100">
            {extrasState.map((e, i) => {
              const labels: Record<string, string> = { gps: "GPS intégré", "child-seat": "Siège enfant", "additional-driver": "Conducteur supplémentaire", "full-insurance": "Assurance tous risques" };
              return (
                <div key={e.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-slate-900">{labels[e.id]}</p>
                    <p className="text-xs text-slate-500">Par jour de location</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={e.pricePerDay}
                      onChange={(ev) => {
                        const next = [...extrasState];
                        (next[i] as any).pricePerDay = parseInt(ev.target.value) || 0;
                        setExtrasState(next);
                      }}
                      className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-right text-sm font-bold focus:border-navy-700 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-500">MAD/j</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Cautions par catégorie">
          <div className="space-y-3 p-5">
            {[
              { label: "Économique / Compacte", value: 3000 },
              { label: "SUV / Compact SUV", value: 5000 },
              { label: "Luxe / Premium", value: 8000 },
            ].map((c) => (
              <div key={c.label} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-sm font-bold text-slate-700">{c.label}</span>
                <span className="text-lg font-black text-navy-700">{c.value.toLocaleString()} MAD</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Politique générale">
          <div className="space-y-3 p-5 text-sm">
            <Row label="Âge minimum" value="21 ans (25 pour luxe)" />
            <Row label="Permis minimum" value="2 ans d'ancienneté" />
            <Row label="Kilométrage" value="Illimité" />
            <Row label="Carburant" value="Plein-à-plein" />
            <Row label="Annulation gratuite" value="Jusqu'à 24h avant" />
            <Row label="Frais d'annulation tardive" value="30%" />
            <Row label="Grâce retard restitution" value="29 minutes" />
            <Row label="Franchise transfrontalière" value="+200 MAD (Ceuta/Espagne)" />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ========== REVIEWS ==========
export function ReviewsAdmin() {
  const { show } = useToast();
  const [reviews, setReviews] = useState(db.getReviews());
  const [filter, setFilter] = useState("");
  const [replyTo, setReplyTo] = useState<typeof reviews[0] | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = reviews.filter((r) => {
    if (filter === "pending" && r.approved) return false;
    if (filter === "approved" && !r.approved) return false;
    if (filter === "5") return r.rating === 5;
    if (filter === "low" && r.rating > 3) return false;
    return true;
  });

  const toggleApprove = (id: string) => {
    const next = reviews.map((r) => r.id === id ? { ...r, approved: !r.approved } : r);
    db.saveReviews(next);
    setReviews(next);
    show("Avis mis à jour", "success");
  };

  const deleteReview = (id: string) => {
    const next = reviews.filter((r) => r.id !== id);
    db.saveReviews(next);
    setReviews(next);
    show("Avis supprimé", "success");
  };

  const saveReply = () => {
    if (!replyTo) return;
    const next = reviews.map((r) => r.id === replyTo.id ? { ...r, reply: replyText } : r);
    db.saveReviews(next);
    setReviews(next);
    setReplyTo(null);
    setReplyText("");
    show("Réponse enregistrée", "success");
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Avis clients"
        subtitle={`Note moyenne : ${avgRating}/5 · ${reviews.length} avis (${reviews.filter((r) => !r.approved).length} en attente)`}
        breadcrumb={[{ label: "Admin" }, { label: "Avis" }]}
      />

      <Card>
        <div className="flex flex-wrap gap-2 p-4">
          {[
            { v: "", l: "Tous" },
            { v: "pending", l: `En attente (${reviews.filter((r) => !r.approved).length})` },
            { v: "approved", l: "Approuvés" },
            { v: "5", l: "⭐ 5 étoiles" },
            { v: "low", l: "≤ 3 étoiles" },
          ].map((f) => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${filter === f.v ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{f.l}</button>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.map((r) => (
          <Card key={r.id}>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-sm font-extrabold text-white">
                  {r.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-slate-900">{r.customerName}</p>
                    <Badge color={r.source === "google" ? "navy" : r.source === "facebook" ? "sky" : "slate"}>{r.source}</Badge>
                    {r.approved ? <Badge color="emerald">Publié</Badge> : <Badge color="amber">En attente</Badge>}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">"{r.comment}"</p>
                  {r.reply && (
                    <div className="mt-3 ms-4 border-s-2 border-amber-400 bg-amber-50/50 ps-3 py-2">
                      <p className="text-xs font-bold text-amber-700">💬 Réponse VELOX CAR</p>
                      <p className="text-sm text-slate-700">{r.reply}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  {!r.approved && <button onClick={() => toggleApprove(r.id)} className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-600"><ThumbsUp className="h-3 w-3" />Approuver</button>}
                  {r.approved && <button onClick={() => toggleApprove(r.id)} className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"><ThumbsDown className="h-3 w-3" />Dépublier</button>}
                  <button onClick={() => { setReplyTo(r); setReplyText(r.reply || ""); }} className="flex items-center gap-1 rounded-lg bg-navy-700 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-navy-800"><Reply className="h-3 w-3" />Répondre</button>
                  <button onClick={() => deleteReview(r.id)} className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!replyTo} onClose={() => setReplyTo(null)} title="Répondre à l'avis" maxWidth="max-w-lg">
        {replyTo && (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="text-xs font-bold text-slate-500">Avis original :</p>
              <p className="mt-1 italic text-slate-700">"{replyTo.comment}"</p>
            </div>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={5} placeholder="Votre réponse…" className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100" />
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setReplyTo(null)}>Annuler</Button><Button variant="primary" className="flex-1" onClick={saveReply}>Publier</Button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ========== WHATSAPP ==========
export function WhatsAppAdmin() {
  const { show } = useToast();
  const [templates, setTemplates] = useState(db.getTemplates());
  const [edit, setEdit] = useState<typeof templates[0] | null>(null);
  const [customMsg, setCustomMsg] = useState("");
  const [customPhone, setCustomPhone] = useState("");

  const updateTemplate = (id: string, body: string) => {
    const next = templates.map((t) => t.id === id ? { ...t, body } : t);
    db.saveTemplates(next);
    setTemplates(next);
    show("Modèle mis à jour", "success");
  };

  const categoryColors: Record<string, string> = {
    confirmation: "emerald",
    reminder: "amber",
    "thank-you": "sky",
    review: "violet",
    promo: "rose",
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="WhatsApp Business"
        subtitle={`Modèles de messages · ${BUSINESS.whatsapp}`}
        breadcrumb={[{ label: "Admin" }, { label: "WhatsApp" }]}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card title="Modèles de messages">
            <div className="divide-y divide-slate-100">
              {templates.map((t) => (
                <div key={t.id} className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{t.name}</p>
                      <Badge color={categoryColors[t.category] as any}>{t.category}</Badge>
                    </div>
                    <button onClick={() => setEdit(t)} className="rounded-lg bg-slate-100 p-1.5 text-slate-700 hover:bg-slate-200"><Edit className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">{t.body}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-[10px] text-slate-500">Variables : <code className="rounded bg-slate-100 px-1">{"{nom}"}</code> <code className="rounded bg-slate-100 px-1">{"{ref}"}</code> <code className="rounded bg-slate-100 px-1">{"{voiture}"}</code> <code className="rounded bg-slate-100 px-1">{"{pickup}"}</code></p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Envoi rapide">
            <div className="space-y-3 p-5">
              <Input label="Téléphone destinataire" placeholder="+212 6..." value={customPhone} onChange={setCustomPhone} />
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Message</label>
                <textarea value={customMsg} onChange={(e) => setCustomMsg(e.target.value)} rows={5} placeholder="Tapez votre message…" className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100" />
              </div>
              <a
                href={customPhone ? `https://wa.me/${customPhone.replace(/\D/g, "")}?text=${encodeURIComponent(customMsg)}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { if (!customPhone) { e.preventDefault(); show("Saisissez un téléphone", "error"); } }}
                className="btn-premium flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-600"
              >
                <Send className="h-4 w-4" />Ouvrir dans WhatsApp
              </a>
            </div>
          </Card>

          <Card title="Liens utiles">
            <div className="space-y-2 p-5 text-xs">
              <a href={waLink("Bonjour VELOX CAR")} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-emerald-50">
                <span className="font-bold text-slate-700">Lien client générique</span>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
              </a>
              <p className="text-[10px] text-slate-500">Numéro WhatsApp : <span className="font-mono font-bold">{BUSINESS.whatsapp}</span></p>
            </div>
          </Card>

          <Card title="API WhatsApp Business" className="border-dashed border-2 border-amber-200 bg-amber-50/30">
            <div className="p-5 text-xs text-amber-800">
              <p className="font-bold">🚧 Future intégration</p>
              <p className="mt-1">Connectez WhatsApp Business API (Meta) pour envoyer des messages automatiques depuis l'admin (à partir de 0,05€/msg).</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => show("Contactez-nous pour l'intégration", "info")}>En savoir plus</Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.name} maxWidth="max-w-lg">
        {edit && (
          <div className="space-y-3">
            <textarea defaultValue={edit.body} rows={8} id="tpl-body" className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100" />
            <p className="text-[10px] text-slate-500">Variables disponibles : {"{nom}, {ref}, {voiture}, {pickup}, {return}, {lieu}, {heure}, {montant}"}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEdit(null)}>Annuler</Button>
              <Button variant="primary" className="flex-1" onClick={() => { const v = (document.getElementById("tpl-body") as HTMLTextAreaElement).value; updateTemplate(edit.id, v); setEdit(null); }}>Enregistrer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ========== LOGS ==========
export function LogsAdmin() {
  const [logs] = useState(db.getLogs());
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const filtered = logs.filter((l) => {
    if (search && !l.userName.toLowerCase().includes(search.toLowerCase()) && !l.details.toLowerCase().includes(search.toLowerCase())) return false;
    if (actionFilter && !l.action.startsWith(actionFilter)) return false;
    return true;
  });

  const actionColors: Record<string, string> = {
    BOOKING_CREATED: "emerald",
    BOOKING_CONFIRMED: "sky",
    BOOKING_CANCELLED: "rose",
    BOOKING_COMPLETED: "slate",
    BOOKING_ACTIVE: "amber",
    PAYMENT_RECEIVED: "emerald",
    CAR_STATUS_CHANGED: "violet",
    USER_LOGIN: "navy",
    USER_LOGOUT: "slate",
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Journal d'activité"
        subtitle={`${logs.length} entrées enregistrées · Trace toutes les actions de l'équipe`}
        breadcrumb={[{ label: "Admin" }, { label: "Journal" }]}
      />

      <Card>
        <div className="flex flex-wrap gap-3 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher utilisateur, action…" className="min-w-[240px] flex-1" />
          <Select
            value={actionFilter}
            onChange={setActionFilter}
            options={[
              { value: "", label: "Toutes actions" },
              { value: "BOOKING", label: "Réservations" },
              { value: "PAYMENT", label: "Paiements" },
              { value: "CAR", label: "Véhicules" },
              { value: "USER", label: "Auth" },
            ]}
            className="w-48"
          />
        </div>
      </Card>

      <Card>
        <div className="divide-y divide-slate-100">
          {filtered.slice(0, 100).map((log) => (
            <div key={log.id} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-xs font-extrabold text-white">
                {log.userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{log.userName}</p>
                  <Badge color={(actionColors[log.action] || "slate") as any}>{log.action}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-slate-600">{log.details}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString("fr-FR")} · IP: {log.ip}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="p-6"><EmptyState icon={Activity} title="Aucune entrée" /></div>}
        </div>
      </Card>
    </div>
  );
}

// ========== SETTINGS ==========
export function SettingsAdmin() {
  const { show } = useToast();
  const { user, hasRole } = useAdminAuth();
  const [tab, setTab] = useState<"business" | "booking" | "users" | "backup">("business");
  const [users, setUsers] = useState(db.getUsers());
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<AdminUser | null>(null);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", fullName: "", password: "", role: "staff" as AdminUser["role"] });

  const addUser = () => {
    if (!newUser.email || !newUser.fullName || !newUser.password) {
      show("Tous les champs requis", "error"); return;
    }
    const u: AdminUser = {
      id: `u-${Date.now()}`,
      ...newUser,
      active: true,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const next = [...users, u];
    db.saveUsers(next);
    setUsers(next);
    setNewUserOpen(false);
    setNewUser({ email: "", fullName: "", password: "", role: "staff" });
    show("Utilisateur créé", "success");
  };

  const deleteUser = () => {
    if (!confirmDeleteUser) return;
    const next = users.filter((u) => u.id !== confirmDeleteUser.id);
    db.saveUsers(next);
    setUsers(next);
    setConfirmDeleteUser(null);
    show("Utilisateur supprimé", "success");
  };

  const toggleActive = (u: AdminUser) => {
    const next = users.map((x) => x.id === u.id ? { ...x, active: !x.active } : x);
    db.saveUsers(next);
    setUsers(next);
    show(u.active ? "Compte désactivé" : "Compte activé", "success");
  };

  const exportAll = () => {
    const data = {
      bookings: db.getBookings(),
      customers: db.getCustomers(),
      carRecords: db.getCarRecords(),
      reviews: db.getReviews(),
      logs: db.getLogs(),
      users: db.getUsers().map((u) => ({ ...u, password: "***" })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `velox-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    show("Sauvegarde téléchargée", "success");
  };

  const tabs = [
    { id: "business", label: "Entreprise" },
    { id: "booking", label: "Réservations" },
    ...(hasRole("super-admin") ? [{ id: "users" as const, label: "Utilisateurs" }] : []),
    { id: "backup", label: "Sauvegarde" },
  ] as const;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Paramètres"
        subtitle="Configuration globale de l'agence"
        breadcrumb={[{ label: "Admin" }, { label: "Paramètres" }]}
      />

      <Card>
        <div className="flex border-b border-slate-100">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`relative px-5 py-3 text-sm font-bold transition-colors ${tab === t.id ? "text-navy-700" : "text-slate-500 hover:text-slate-700"}`}>
              {t.label}
              {tab === t.id && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-amber-500" />}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "business" && <BusinessSettingsForm />}

          {tab === "booking" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Durée min. (jours)" type="number" defaultValue="1" />
              <Input label="Durée max. (jours)" type="number" defaultValue="90" />
              <Input label="Réservation à l'avance min. (heures)" type="number" defaultValue="2" />
              <Input label="Réservation à l'avance max. (jours)" type="number" defaultValue="365" />
              <Input label="Âge minimum (standard)" type="number" defaultValue="21" />
              <Input label="Âge minimum (luxe)" type="number" defaultValue="25" />
              <div className="sm:col-span-2">
                <Button variant="amber" onClick={() => show("Paramètres enregistrés", "success")}><Save className="h-4 w-4" />Enregistrer</Button>
              </div>
            </div>
          )}

          {tab === "users" && hasRole("super-admin") && (
            <div>
              <div className="mb-4 flex justify-end">
                <Button variant="amber" onClick={() => setNewUserOpen(true)}><UserPlus className="h-4 w-4" />Nouvel utilisateur</Button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Utilisateur</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Email</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Rôle</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Dernière connexion</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">Statut</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-bold text-slate-900">{u.fullName}{u.id === user?.id && <span className="ms-2 text-[10px] text-amber-600">(vous)</span>}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{u.email}</td>
                        <td className="px-4 py-3"><Badge color={u.role === "super-admin" ? "amber" : u.role === "manager" ? "sky" : "slate"}>{u.role}</Badge></td>
                        <td className="px-4 py-3 text-xs text-slate-600">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("fr-FR") : "—"}</td>
                        <td className="px-4 py-3"><Badge color={u.active ? "emerald" : "rose"}>{u.active ? "Actif" : "Désactivé"}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {u.id !== user?.id && <>
                              <button onClick={() => toggleActive(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600" title={u.active ? "Désactiver" : "Activer"}>{u.active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}</button>
                              <button onClick={() => setConfirmDeleteUser(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "backup" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="text-base font-extrabold text-amber-900">💾 Exporter les données</h3>
                <p className="mt-1 text-sm text-amber-800">Téléchargez une sauvegarde complète au format JSON (réservations, clients, véhicules, avis, logs).</p>
                <Button variant="amber" className="mt-3" onClick={exportAll}><Save className="h-4 w-4" />Télécharger la sauvegarde</Button>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <h3 className="text-base font-extrabold text-rose-900">⚠️ Réinitialiser les données démo</h3>
                <p className="mt-1 text-sm text-rose-800">Cette action efface toutes les données et régénère des exemples. Utile pour tester.</p>
                <Button variant="danger" className="mt-3" onClick={() => { if (confirm("Réinitialiser ?")) { db.reset(); window.location.reload(); } }}><Trash2 className="h-4 w-4" />Réinitialiser tout</Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Modal open={newUserOpen} onClose={() => setNewUserOpen(false)} title="Nouvel utilisateur" maxWidth="max-w-md">
        <div className="space-y-3">
          <Input label="Nom complet *" value={newUser.fullName} onChange={(v) => setNewUser({ ...newUser, fullName: v })} />
          <Input label="Email *" value={newUser.email} onChange={(v) => setNewUser({ ...newUser, email: v })} type="email" />
          <Input label="Mot de passe *" value={newUser.password} onChange={(v) => setNewUser({ ...newUser, password: v })} />
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Rôle</label>
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-navy-700 focus:outline-none">
              <option value="staff">Staff (réservations + clients)</option>
              <option value="manager">Manager (tout sauf utilisateurs)</option>
              <option value="super-admin">Super Admin (accès total)</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setNewUserOpen(false)}>Annuler</Button>
            <Button variant="primary" className="flex-1" onClick={addUser}><UserPlus className="h-4 w-4" />Créer</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteUser}
        onCancel={() => setConfirmDeleteUser(null)}
        onConfirm={deleteUser}
        title="Supprimer cet utilisateur ?"
        message={`Le compte de ${confirmDeleteUser?.fullName} sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}

// ========== Shared inputs ==========
function Input({ label, value, defaultValue, onChange, type = "text", placeholder = "", className = "" }: { label: string; value?: string; defaultValue?: string; onChange?: (v: string) => void; type?: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0"><span className="text-slate-600">{label}</span><span className="font-bold text-slate-900">{value}</span></div>;
}

// ============================================
// BusinessSettingsForm — saves to api → public site updates instantly
// ============================================
function BusinessSettingsForm() {
  const { show } = useToast();
  const [settings, setSettings] = useState(api.getBusinessSettings());

  const save = () => {
    api.updateBusinessSettings(settings);
    show("Paramètres enregistrés — site public mis à jour en temps réel ✓", "success");
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Nom commercial" value={settings.name} onChange={(v) => setSettings({ ...settings, name: v })} />
      <Input label="Email" value={settings.email} onChange={(v) => setSettings({ ...settings, email: v })} type="email" />
      <Input label="Téléphone 1" value={settings.phones[0] || ""} onChange={(v) => { const next = [...settings.phones]; next[0] = v; setSettings({ ...settings, phones: next }); }} />
      <Input label="Téléphone 2" value={settings.phones[1] || ""} onChange={(v) => { const next = [...settings.phones]; next[1] = v; setSettings({ ...settings, phones: next }); }} />
      <Input label="WhatsApp" value={settings.whatsapp} onChange={(v) => setSettings({ ...settings, whatsapp: v })} />
      <Input label="Instagram" value={settings.instagram} onChange={(v) => setSettings({ ...settings, instagram: v })} />
      <Input label="Adresse" value={settings.address} onChange={(v) => setSettings({ ...settings, address: v })} className="sm:col-span-2" />
      <Input label="Horaires (FR)" value={settings.hours.fr} onChange={(v) => setSettings({ ...settings, hours: { ...settings.hours, fr: v } })} className="sm:col-span-2" />
      <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 sm:col-span-2">
        ⚡ <span className="font-bold">Sync temps réel :</span> les modifications sont immédiatement visibles sur le site public et le footer.
      </div>
      <div className="sm:col-span-2">
        <Button variant="amber" onClick={save}><Save className="h-4 w-4" />Enregistrer</Button>
      </div>
    </div>
  );
}
