import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";


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
            <div className="mt-5 flex items-center gap-3">
              {/* Google Maps */}
              <a
                href="https://maps.app.goo.gl/3tJq4QU3cdYAHjgv9?g_st=aw"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 transition-transform hover:scale-110"
                aria-label="Google Maps"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
                  <circle cx="12" cy="9" r="2.5" fill="#fff"/>
                </svg>
              </a>
              {/* Instagram */}
              <a
                href={`https://instagram.com/${settings.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 transition-transform hover:scale-110"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7">
                  <defs>
                    <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFD600"/>
                      <stop offset="50%" stopColor="#FF0069"/>
                      <stop offset="100%" stopColor="#833AB4"/>
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="url(#ig-grad)" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="5" fill="none" stroke="url(#ig-grad)" strokeWidth="2"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)"/>
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1Coba4Mwn5/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 transition-transform hover:scale-110"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7">
                  <circle cx="12" cy="12" r="10" fill="#1877F2"/>
                  <path d="M13.5 12.5h2l.5-2.5h-2.5V8.5c0-.7.35-1.4 1.5-1.4H16V5c0 0-1-.2-2-.2-2 0-3.5 1.2-3.5 3.5V10H8.5v2.5h2v6h3v-6z" fill="#fff"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/212671615948"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 transition-transform hover:scale-110"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="#25D366"/>
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
