import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";

const Instagram = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const Facebook = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import { useApp } from "../context/AppContext";
import { CarLogo } from "./CarIllustration";
import { BUSINESS } from "../data/info";
import { api } from "../services/api";
import { useSyncRefresh } from "../services/sync";

export function Footer() {
  const { t } = useApp();
  useSyncRefresh(["settings:updated"]);
  const settings = api.getBusinessSettings();

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-slate-300">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(circle at 10% 20%, rgba(245,158,11,0.15) 0%, transparent 30%), radial-gradient(circle at 90% 80%, rgba(58,90,232,0.25) 0%, transparent 30%)",
      }} />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <CarLogo size={44} variant="dark" />
              <div>
                <div className="text-xl font-extrabold text-white">VELOX</div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">CARS</div>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {t("brand.tagline")} · Tanger, Maroc
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={`https://instagram.com/${settings.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-amber-500 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-amber-500 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/212677160264"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-emerald-500 hover:text-white"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: "/", label: t("nav.home") },
                { to: "/fleet", label: t("nav.fleet") },
                { to: "/locations", label: t("nav.locations") },
                { to: "/about", label: t("nav.about") },
                { to: "/faq", label: t("nav.faq") },
                { to: "/contact", label: t("nav.contact") },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="inline-flex items-center gap-1 transition-colors hover:text-amber-400">
                    {l.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service areas */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{t("home.areas.title")}</h3>
            <ul className="space-y-2.5 text-sm">
              {BUSINESS.serviceAreas.map((a) => (
                <li key={a} className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{t("contact.directInfo")}</h3>
            <ul className="space-y-3 text-sm">
              {settings.phones.map((p) => (
                <li key={p}>
                  <a href={`tel:${p.replace(/\s/g, "")}`} className="flex items-start gap-2 transition-colors hover:text-amber-400">
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                    <span className="font-medium">{p}</span>
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-start gap-2 transition-colors hover:text-amber-400">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                  <span>{settings.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center text-amber-400">⏰</span>
                <span>Sat-Thu · 8:00 – 18:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} VELOX CAR SARL — {t("common.copyright")}.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/terms" className="transition-colors hover:text-amber-400">{t("common.terms")}</Link>
            <Link to="/privacy" className="transition-colors hover:text-amber-400">{t("common.privacy")}</Link>
            <Link to="/admin/login" className="inline-flex items-center gap-1 opacity-60 transition-all hover:text-amber-400 hover:opacity-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Admin
            </Link>
            <span className="opacity-60">GPS: 35.7427, -5.8415</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
