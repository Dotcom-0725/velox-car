import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronDown, Car, MapPin, Info, HelpCircle, Mail, Lock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { CarLogo } from "./CarIllustration";
import { LanguageSwitcher, CurrencySwitcher } from "./LanguageCurrencySwitcher";
import type { Currency } from "../data/info";
import type { LocaleCode } from "../data/i18n";

const NAV = [
  { to: "/", key: "nav.home", icon: Car, end: true },
  { to: "/fleet", key: "nav.fleet", icon: Car },
  { to: "/locations", key: "nav.locations", icon: MapPin },
  { to: "/about", key: "nav.about", icon: Info },
  { to: "/faq", key: "nav.faq", icon: HelpCircle },
  { to: "/contact", key: "nav.contact", icon: Mail },
] as const;

export function Header() {
  const { t, locale, setLocale, currency, setCurrency } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const LOCALES: { code: LocaleCode; flag: string; label: string }[] = [
    { code: "fr", flag: "🇫🇷", label: "FR" },
    { code: "ar", flag: "🇲🇦", label: "AR" },
    { code: "en", flag: "🇬🇧", label: "EN" },
  ];
  const CURRENCIES: Currency[] = ["MAD", "EUR", "USD"];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 shadow-md backdrop-blur-lg ring-1 ring-slate-200/60"
            : "bg-white"
        }`}
      >
        {/* Top strip */}
        <div className="hidden border-b border-slate-200/60 bg-slate-50 lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-5">
              <a href="tel:+212668353949" className="flex items-center gap-1.5 transition-colors hover:text-navy-700">
                <Phone className="h-3.5 w-3.5" />
                <span className="font-medium">+212 6 68 35 39 49</span>
              </a>
              <a href="mailto:contact@veloxcars.ma" className="flex items-center gap-1.5 transition-colors hover:text-navy-700">
                <Mail className="h-3.5 w-3.5" />
                <span>contact@veloxcars.ma</span>
              </a>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t("banner.noPaymentShort")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin/login"
                className="group flex items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-navy-700 hover:text-white"
                title="Espace administrateur"
              >
                <Lock className="h-3 w-3" />
                <span>Admin</span>
              </Link>
              <span className="h-3 w-px bg-slate-300" />
              <CurrencySwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:py-4">
          <Link to="/" className="group flex items-center gap-2.5">
            <CarLogo size={40} className="transition-transform group-hover:scale-105" />
            <div className="leading-tight">
              <div className="text-lg font-extrabold tracking-tight text-navy-700 sm:text-xl">VELOX</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500 sm:text-xs">CARS</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={"end" in item ? item.end : false}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-navy-50 text-navy-700"
                        : "text-slate-700 hover:bg-slate-100 hover:text-navy-700"
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(item.key)}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex lg:items-center lg:gap-2">
              <LanguageSwitcher compact />
              <CurrencySwitcher />
            </div>
            <Link
              to="/booking"
              className="btn-premium group hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40 sm:inline-flex"
            >
              <span>{t("nav.book")}</span>
              <ChevronDown className="h-4 w-4 -rotate-90 transition-transform group-hover:translate-x-0.5 rtl-flip" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed end-0 top-0 z-40 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl lg:hidden"
            >
              {/* Header (fixed) */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <CarLogo size={36} />
                  <div>
                    <div className="text-base font-extrabold text-navy-700">VELOX</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500">CARS</div>
                  </div>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable content with extra bottom padding so nothing is hidden behind sticky bar */}
              <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
                {/* Language pills */}
                <div className="mb-2">
                  <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Langue</p>
                  <div className="flex gap-1.5">
                    {LOCALES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setLocale(l.code)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                          locale === l.code
                            ? "bg-navy-700 text-white shadow-md"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span className="text-base leading-none">{l.flag}</span>
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency pills */}
                <div className="mb-4">
                  <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Devise</p>
                  <div className="flex gap-1.5">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                          currency === c
                            ? "bg-amber-500 text-white shadow-md"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <nav className="space-y-1">
                  {NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={"end" in item ? item.end : false}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all ${
                            isActive
                              ? "bg-navy-50 text-navy-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`
                        }
                      >
                        <Icon className="h-5 w-5" />
                        {t(item.key)}
                      </NavLink>
                    );
                  })}
                </nav>

                <Link
                  to="/booking"
                  className="btn-premium mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-500/30"
                >
                  {t("nav.book")}
                </Link>

                {/* Admin access — moved up and more prominent */}
                <Link
                  to="/admin/login"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-navy-700 to-navy-800 px-5 py-3 text-sm font-bold text-white shadow-md shadow-navy-700/20 transition-all hover:shadow-lg"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Espace Admin</span>
                  <span className="ms-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-navy-900">Staff</span>
                </Link>
                <p className="mt-1 text-center text-[10px] text-slate-400">Réservé au personnel autorisé</p>

                <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
                  <a href="tel:+212668353949" className="flex items-center gap-2 font-semibold text-slate-700">
                    <Phone className="h-4 w-4 text-navy-700" /> +212 6 68 35 39 49
                  </a>
                  <a href="tel:+212632005007" className="flex items-center gap-2 font-semibold text-slate-700">
                    <Phone className="h-4 w-4 text-navy-700" /> +212 6 32 00 50 07
                  </a>
                  <p className="text-xs text-slate-500">{t("contact.hours")}: Sat-Thu 8:00-18:00</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
