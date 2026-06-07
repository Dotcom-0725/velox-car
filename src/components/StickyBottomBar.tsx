import { Link } from "react-router-dom";
import { Phone, MessageCircle, Calendar } from "lucide-react";
import { useApp } from "../context/AppContext";

export function StickyBottomBar() {
  const { t } = useApp();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.15)] backdrop-blur-lg lg:hidden">
      <div className="grid grid-cols-3 gap-1 p-2">
        <a
          href="tel:+212668353949"
          className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-slate-700 active:bg-slate-100"
        >
          <Phone className="h-5 w-5 text-navy-700" />
          <span className="text-[10px] font-bold uppercase tracking-wide">{t("contact.phones").slice(0, 4)}</span>
        </a>
        <a
          href="https://wa.me/212677160264"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 rounded-xl bg-emerald-500 py-1.5 text-white active:bg-emerald-600"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wide">WhatsApp</span>
        </a>
        <Link
          to="/booking"
          className="btn-premium flex flex-col items-center gap-0.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-1.5 text-white shadow-md shadow-amber-500/30 active:from-amber-600 active:to-amber-500"
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wide">{t("nav.book")}</span>
        </Link>
      </div>
    </div>
  );
}
