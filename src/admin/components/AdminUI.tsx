// ============================================
// Shared Admin UI primitives
// ============================================
import { ReactNode, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Search, Check, AlertTriangle } from "lucide-react";

// ============== StatCard ==============
export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  color = "navy",
  loading = false,
  subtitle,
}: {
  label: string;
  value: string | number;
  delta?: { value: number; positive: boolean };
  icon: any;
  color?: "navy" | "amber" | "emerald" | "rose" | "violet" | "sky";
  loading?: boolean;
  subtitle?: string;
}) {
  const colorMap: Record<string, string> = {
    navy: "from-navy-700 to-navy-900",
    amber: "from-amber-500 to-amber-600",
    emerald: "from-emerald-500 to-emerald-600",
    rose: "from-rose-500 to-rose-600",
    violet: "from-violet-500 to-violet-600",
    sky: "from-sky-500 to-sky-600",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition-shadow hover:shadow-lg"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundImage: `linear-gradient(135deg, ${color === "navy" ? "#1E3A8A" : color === "amber" ? "#F59E0B" : color === "emerald" ? "#10B981" : color === "rose" ? "#EF4444" : color === "violet" ? "#8B5CF6" : "#0EA5E9"}, transparent)` }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{value}</p>
          )}
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          {delta && !loading && (
            <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${delta.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {delta.positive ? "↗" : "↘"} {Math.abs(delta.value)}%
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

// ============== Badge ==============
export function Badge({ children, color = "slate", className = "" }: { children: ReactNode; color?: string; className?: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    amber: "bg-amber-100 text-amber-800 ring-amber-200",
    emerald: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    sky: "bg-sky-100 text-sky-800 ring-sky-200",
    navy: "bg-blue-100 text-blue-800 ring-blue-200",
    rose: "bg-rose-100 text-rose-800 ring-rose-200",
    violet: "bg-violet-100 text-violet-800 ring-violet-200",
    gray: "bg-slate-200 text-slate-600 ring-slate-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

// ============== BookingStatusBadge ==============
export function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; dot: string }> = {
    pending: { label: "En attente", color: "amber", dot: "bg-amber-500" },
    confirmed: { label: "Confirmée", color: "sky", dot: "bg-sky-500" },
    active: { label: "En cours", color: "emerald", dot: "bg-emerald-500" },
    completed: { label: "Terminée", color: "slate", dot: "bg-slate-500" },
    cancelled: { label: "Annulée", color: "rose", dot: "bg-rose-500" },
    "no-show": { label: "No-show", color: "gray", dot: "bg-slate-400" },
  };
  const s = map[status] || map.pending;
  return (
    <Badge color={s.color}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    unpaid: { label: "Non payé", color: "rose" },
    partial: { label: "Partiel", color: "amber" },
    paid: { label: "Payé", color: "emerald" },
    refunded: { label: "Remboursé", color: "violet" },
  };
  const s = map[status] || map.unpaid;
  return <Badge color={s.color}>{s.label}</Badge>;
}

export function CarStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    available: { label: "Disponible", color: "emerald" },
    rented: { label: "Louée", color: "sky" },
    maintenance: { label: "Maintenance", color: "amber" },
    unavailable: { label: "Indisponible", color: "rose" },
  };
  const s = map[status] || map.available;
  return <Badge color={s.color}>{s.label}</Badge>;
}

// ============== Button ==============
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  className = "",
  type = "button",
  ...rest
}: any) {
  const variants: Record<string, string> = {
    primary: "bg-navy-700 text-white hover:bg-navy-800 shadow-sm",
    amber: "bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:shadow-lg shadow-amber-500/30",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  };
  const sizes: Record<string, string> = {
    xs: "px-2.5 py-1 text-[11px]",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button
      type={type}
      disabled={loading || rest.disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}

// ============== Card ==============
export function Card({ children, className = "", title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          {title && <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ============== SearchInput ==============
export function SearchInput({ value, onChange, placeholder = "Rechercher…", className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-9 text-sm placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ============== Select ==============
export function Select({ value, onChange, options, placeholder = "Choisir…", className = "" }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const current = options.find((o) => o.value === value);
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300"
      >
        <span className={current ? "" : "text-slate-400 font-normal"}>{current?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200"
          >
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${value === o.value ? "bg-navy-50 text-navy-700" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <span>{o.label}</span>
                {value === o.value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============== Modal ==============
export function Modal({ open, onClose, title, children, maxWidth = "max-w-2xl" }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; maxWidth?: string }) {
  useEffect(() => {
    if (open) {
      const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", h);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", h);
        document.body.style.overflow = "";
      };
    }
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className={`fixed inset-x-4 top-12 z-50 mx-auto max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 ${maxWidth} sm:w-full`}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
                <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="max-h-[calc(85vh-80px)] overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============== ConfirmDialog ==============
export function ConfirmDialog({ open, onConfirm, onCancel, title, message, confirmLabel = "Confirmer", danger = false }: { open: boolean; onConfirm: () => void; onCancel: () => void; title: string; message: string; confirmLabel?: string; danger?: boolean }) {
  return (
    <Modal open={open} onClose={onCancel} maxWidth="max-w-sm">
      <div className="text-center">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${danger ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
          <Button variant={danger ? "danger" : "primary"} className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ============== EmptyState ==============
export function EmptyState({ icon: Icon, title, description, action }: { icon: any; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <p className="mt-4 text-base font-bold text-slate-900">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============== Page header ==============
export function PageHeader({ title, subtitle, action, breadcrumb }: { title: string; subtitle?: string; action?: ReactNode; breadcrumb?: { label: string; to?: string }[] }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumb && (
          <nav className="mb-1.5 flex items-center gap-1 text-xs text-slate-500">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-slate-300">/</span>}
                <span className={i === breadcrumb.length - 1 ? "font-semibold text-slate-700" : ""}>{b.label}</span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
