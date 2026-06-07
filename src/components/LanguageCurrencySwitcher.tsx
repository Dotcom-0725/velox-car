import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Currency } from "../data/info";

const LOCALES = [
  { code: "fr" as const, label: "Français", flag: "🇫🇷" },
  { code: "ar" as const, label: "العربية", flag: "🇲🇦" },
  { code: "en" as const, label: "English", flag: "🇬🇧" },
];

const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: "MAD", label: "MAD", symbol: "DH" },
  { code: "EUR", label: "EUR", symbol: "€" },
  { code: "USD", label: "USD", symbol: "$" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-white/20 sm:gap-2 sm:text-sm"
        aria-label="Change language"
      >
        <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        {!compact && <span className="uppercase">{locale}</span>}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-slate-200"
          >
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  locale === l.code ? "bg-navy-50 text-navy-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {locale === l.code && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CurrencySwitcher() {
  const { currency, setCurrency } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-white/20 sm:text-sm"
        aria-label="Change currency"
      >
        <span className="font-bold">{currency}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute end-0 z-50 mt-2 w-36 overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-slate-200"
          >
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  currency === c.code ? "bg-navy-50 text-navy-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{c.label}</span>
                {currency === c.code && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
