import { useState } from "react";
import { Inbox, Mail, Phone, MessageCircle, Trash2, Archive, Check } from "lucide-react";
import { api, ContactMessage } from "../../services/api";
import { Card, PageHeader, Badge, EmptyState, ConfirmDialog, SearchInput, Select, Button, Modal } from "../components/AdminUI";
import { useToast } from "../../hooks/useToast";
import { useSyncRefresh } from "../../services/sync";
import { waLink } from "../../utils/format";

export function MessagesAdmin() {
  const { show } = useToast();
  useSyncRefresh(["contact:received"]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const [openMsg, setOpenMsg] = useState<ContactMessage | null>(null);

  const messages = api.getContactMessages();
  const filtered = messages.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q) && !m.subject.toLowerCase().includes(q) && !m.message.toLowerCase().includes(q)) return false;
    }
    if (filter && m.status !== filter) return false;
    return true;
  });

  const statusColor: Record<string, string> = { new: "amber", read: "sky", replied: "emerald", archived: "slate" };
  const statusLabel: Record<string, string> = { new: "Nouveau", read: "Lu", replied: "Répondu", archived: "Archivé" };

  const updateStatus = (id: string, status: ContactMessage["status"]) => {
    api.updateContactMessage(id, { status });
    refresh();
    show("Message mis à jour", "success");
  };

  const deleteMsg = () => {
    if (!confirmDelete) return;
    api.deleteContactMessage(confirmDelete);
    setConfirmDelete(null);
    refresh();
    show("Message supprimé", "success");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Messages de contact"
        subtitle={`${messages.length} message(s) reçu(s) · ${messages.filter((m) => m.status === "new").length} non lu(s)`}
        breadcrumb={[{ label: "Admin" }, { label: "Messages" }]}
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Nom, email, sujet…" className="min-w-[240px] flex-1" />
          <Select
            value={filter}
            onChange={setFilter}
            options={[
              { value: "", label: "Tous statuts" },
              { value: "new", label: "Nouveaux" },
              { value: "read", label: "Lus" },
              { value: "replied", label: "Répondus" },
              { value: "archived", label: "Archivés" },
            ]}
            className="w-44"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><div className="p-6"><EmptyState icon={Inbox} title="Aucun message" description="Les demandes du formulaire de contact apparaîtront ici." /></div></Card>
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => { setOpenMsg(m); if (m.status === "new") updateStatus(m.id, "read"); }}
                className={`flex cursor-pointer items-start gap-3 px-5 py-4 transition-colors hover:bg-slate-50 ${m.status === "new" ? "bg-amber-50/40" : ""}`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-xs font-extrabold text-white">
                  {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-slate-900">{m.name}</p>
                    <Badge color={statusColor[m.status] as any}>{statusLabel[m.status]}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{m.email} · {m.phone}</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{m.subject}</p>
                  <p className="line-clamp-1 text-xs text-slate-600">{m.message}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleString("fr-FR")}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={!!openMsg} onClose={() => setOpenMsg(null)} title={openMsg?.subject} maxWidth="max-w-xl">
        {openMsg && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-sm font-extrabold text-white">
                {openMsg.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900">{openMsg.name}</p>
                <p className="text-xs text-slate-600">{openMsg.email} · {openMsg.phone || "—"}</p>
                <p className="text-[10px] text-slate-400">{new Date(openMsg.createdAt).toLocaleString("fr-FR")}</p>
              </div>
              <Badge color={statusColor[openMsg.status] as any}>{statusLabel[openMsg.status]}</Badge>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{openMsg.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <a href={`mailto:${openMsg.email}?subject=Re: ${openMsg.subject}`} className="flex items-center justify-center gap-1 rounded-xl bg-sky-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-sky-600">
                <Mail className="h-3.5 w-3.5" />Email
              </a>
              {openMsg.phone && (
                <>
                  <a href={`tel:${openMsg.phone.replace(/\s/g, "")}`} className="flex items-center justify-center gap-1 rounded-xl bg-navy-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-navy-800">
                    <Phone className="h-3.5 w-3.5" />Appeler
                  </a>
                  <a
                    href={waLink(`Bonjour ${openMsg.name.split(" ")[0]}, suite à votre message concernant "${openMsg.subject}",`)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-600"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />WhatsApp
                  </a>
                </>
              )}
              <button onClick={() => { updateStatus(openMsg.id, "replied"); setOpenMsg(null); }} className="flex items-center justify-center gap-1 rounded-xl bg-emerald-100 px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-200">
                <Check className="h-3.5 w-3.5" />Marquer répondu
              </button>
            </div>

            <div className="flex gap-2 border-t border-slate-100 pt-3">
              <Button variant="ghost" size="sm" onClick={() => { updateStatus(openMsg.id, "archived"); setOpenMsg(null); }}><Archive className="h-3.5 w-3.5" />Archiver</Button>
              <Button variant="ghost" size="sm" onClick={() => { setConfirmDelete(openMsg.id); setOpenMsg(null); }} className="text-rose-600"><Trash2 className="h-3.5 w-3.5" />Supprimer</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={deleteMsg}
        title="Supprimer ce message ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}
