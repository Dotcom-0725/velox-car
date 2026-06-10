import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Award, CalendarCheck, ShieldCheck, Sparkles, Phone, MapPin, Car as CarIcon, Users, Wrench, BadgeDollarSign, Truck, ChevronRight, Quote } from "lucide-react";
import { HeroSlider } from "../components/HeroSlider";
import { useApp } from "../context/AppContext";
import { HeroSearch } from "../components/HeroSearch";
import { CarCard } from "../components/CarCard";
import { CARS } from "../data/cars";
import { REVIEWS } from "../data/reviews";
import { api } from "../services/api";
import { useSyncRefresh } from "../services/sync";
// BUSINESS info now read via api for live updates
import { LOCATIONS } from "../data/locations";
import { CarIllustration, CarLogo } from "../components/CarIllustration";

type TrustItem = {
  icon: typeof Star;
  key: "trust.google" | "trust.service" | "trust.cancellation" | "trust.insurance";
  color: string;
  text: string;
};

const TRUST: TrustItem[] = [
  { icon: Star, key: "trust.google", color: "from-amber-400 to-amber-500", text: "text-amber-500" },
  { icon: CalendarCheck, key: "trust.service", color: "from-emerald-400 to-emerald-500", text: "text-emerald-500" },
  { icon: Award, key: "trust.cancellation", color: "from-sky-400 to-sky-500", text: "text-sky-500" },
  { icon: ShieldCheck, key: "trust.insurance", color: "from-navy-400 to-navy-500", text: "text-navy-500" },
];

type WhyItem = {
  icon: typeof Sparkles;
  key: "home.why.fleet.title" | "home.why.pricing.title" | "home.why.staff.title" | "home.why.delivery.title";
  desc: "home.why.fleet.desc" | "home.why.pricing.desc" | "home.why.staff.desc" | "home.why.delivery.desc";
  color: string;
};

const WHY: WhyItem[] = [
  { icon: Sparkles, key: "home.why.fleet.title", desc: "home.why.fleet.desc", color: "from-amber-400 to-amber-500" },
  { icon: BadgeDollarSign, key: "home.why.pricing.title", desc: "home.why.pricing.desc", color: "from-emerald-400 to-emerald-500" },
  { icon: Users, key: "home.why.staff.title", desc: "home.why.staff.desc", color: "from-sky-400 to-sky-500" },
  { icon: Truck, key: "home.why.delivery.title", desc: "home.why.delivery.desc", color: "from-violet-400 to-violet-500" },
];

export function Home() {
  const { t, locale } = useApp();
  // Refresh whenever admin approves/changes content
  useSyncRefresh(["review:submitted", "car:status-changed", "settings:updated"]);
  const featured = CARS.filter((c) => ["duster-2025", "peugeot-208-2025", "renault-kardian-2025"].includes(c.id));
  const locations = LOCATIONS.filter((l) => l.type === "office" || l.type === "airport" || l.type === "port" || l.type === "city").slice(0, 6);
  // Blend admin-approved customer reviews with the curated marketing reviews
  const approvedDbReviews = api.getPublicReviews();
  const liveRating = api.getPublicAverageRating();
  const reviewsToShow = [
    ...approvedDbReviews.slice(0, 2).map((r) => ({
      name: r.customerName,
      initials: r.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      rating: r.rating,
      date: r.createdAt,
      text: { fr: r.comment, en: r.comment, ar: r.comment },
      source: r.source,
      verified: true,
    })),
    ...REVIEWS,
  ].slice(0, 3);

  return (
    <div>
      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden text-white">
        {/* Animated slider background */}
        <HeroSlider />
        {/* Decorative elements on top of slider */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="pointer-events-none absolute -top-32 end-1/4 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 start-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-20 sm:pt-20 lg:pb-28">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="text-center lg:col-span-7 lg:text-start">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold backdrop-blur sm:text-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-amber-400">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-amber-400" />
                </span>
                <span className="text-amber-300">{liveRating.rating}/5 ★</span>
                <span className="text-white/60">·</span>
                <span className="text-white/90">{liveRating.count} {locale === "ar" ? "تقييم" : locale === "en" ? "reviews" : "avis Google"}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
              >
                <span className="block">{t("hero.title")}</span>
                <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  {t("hero.titleAccent")}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg lg:mx-0"
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              >
                <Link
                  to="/booking"
                  className="btn-premium group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-amber-500/30 transition-all hover:shadow-2xl hover:shadow-amber-500/40 sm:text-base"
                >
                  {t("hero.cta.primary")}
                  <ChevronRight className="h-4 w-4 rtl-flip" />
                </Link>
                <Link
                  to="/fleet"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition-all hover:bg-white/10 sm:text-base"
                >
                  <CarIcon className="h-4 w-4" />
                  {t("hero.cta.secondary")}
                </Link>
              </motion.div>

              {/* Quick stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-10 grid max-w-xl grid-cols-3 gap-4 sm:gap-6"
              >
                {[
                  { v: "5+", l: locale === "ar" ? "سيارات" : locale === "en" ? "Vehicles" : "Véhicules" },
                  { v: "184", l: locale === "ar" ? "عميل سعيد" : locale === "en" ? "Happy clients" : "Clients satisfaits" },
                  { v: "7j/7", l: locale === "ar" ? "متاح" : locale === "en" ? "Available" : "Disponible" },
                ].map((s) => (
                  <div key={s.l} className="text-center lg:text-start">
                    <div className="text-2xl font-black text-white sm:text-3xl">{s.v}</div>
                    <div className="text-xs font-medium text-white/60 sm:text-sm">{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:col-span-5 lg:block"
            >
              <div className="relative h-[420px] w-full">
                {/* Floating cards */}
                <div className="absolute end-0 top-0 animate-float rounded-2xl bg-white/10 p-4 backdrop-blur-md" style={{ animationDelay: "0s" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
                      <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/80">{locale === "ar" ? "تأمين شامل" : locale === "en" ? "Full insurance" : "Assurance complète"}</p>
                      <p className="text-sm font-bold text-white">{locale === "ar" ? "مشمول" : locale === "en" ? "Included" : "Incluse"}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 start-0 animate-float rounded-2xl bg-white/10 p-4 backdrop-blur-md" style={{ animationDelay: "1.5s" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
                      <Star className="h-5 w-5 fill-white text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/80">Google Rating</p>
                      <p className="text-sm font-bold text-white">4.7/5 ★</p>
                    </div>
                  </div>
                </div>

                <div className="absolute end-10 bottom-0 animate-float rounded-2xl bg-white/10 p-4 backdrop-blur-md" style={{ animationDelay: "0.7s" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/80">WhatsApp 24/7</p>
                      <p className="text-sm font-bold text-white">+212 6 71 61 59 48</p>
                    </div>
                  </div>
                </div>

                {/* Center logo */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute -inset-8 rounded-full bg-amber-500/20 blur-2xl" />
                    <CarLogo size={180} variant="dark" className="relative animate-float" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search widget */}
          <div className="mt-12 sm:mt-16">
            <HeroSearch />
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-12 w-full text-slate-50 sm:h-16">
            <path fill="currentColor" d="M0,40 C240,80 480,0 720,30 C960,60 1200,20 1440,50 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ============== TRUST BADGES ============== */}
      <section className="bg-slate-50 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {TRUST.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 sm:p-5"
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} sm:h-12 sm:w-12`}>
                    <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 sm:text-base">{t(item.key)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== FEATURED CARS ============== */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-12">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
              ⭐ {t("home.featured")}
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {t("home.featuredSub")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {featured.map((car, i) => (
              <CarCard key={car.id} car={car} delay={i * 0.1} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/fleet"
              className="btn-premium inline-flex items-center gap-2 rounded-full bg-navy-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-navy-700/30 transition-all hover:bg-navy-800 hover:shadow-xl"
            >
              {t("nav.fleet")}
              <ChevronRight className="h-4 w-4 rtl-flip" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============== WHY VELOX ============== */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-navy-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-700">
                VELOX CAR
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {t("home.why.title")}
              </h2>
              <p className="mt-3 text-lg text-slate-600">{t("home.why.subtitle")}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {WHY.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-transparent hover:shadow-xl"
                    >
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${item.color} opacity-0 transition-opacity group-hover:opacity-5`} />
                      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">{t(item.key)}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{t(item.desc)}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative hidden lg:block"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-700 to-navy-900 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-grid opacity-20" />
                <div className="relative">
                  <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                    <CarIllustration car={CARS[0]} className="h-40" />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { icon: Wrench, label: locale === "ar" ? "صيانة دورية" : locale === "en" ? "Regular service" : "Maintenance" },
                      { icon: ShieldCheck, label: locale === "ar" ? "تأمين شامل" : locale === "en" ? "Insurance" : "Assurance" },
                      { icon: Phone, label: locale === "ar" ? "دعم 24/7" : locale === "en" ? "24/7 Support" : "Support 24/7" },
                    ].map((b, i) => {
                      const Icon = b.icon;
                      return (
                        <div key={i} className="rounded-xl bg-white/5 p-3 text-center backdrop-blur">
                          <Icon className="mx-auto h-5 w-5 text-amber-400" />
                          <p className="mt-1.5 text-[10px] font-semibold text-white/80">{b.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============== REVIEWS ============== */}
      <section className="bg-gradient-to-br from-slate-50 to-amber-50/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-12">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-current" />
              4.7/5 · Google Reviews
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {t("home.reviews.title")}
            </h2>
            <p className="mt-2 text-slate-600">{t("home.reviews.subtitle")}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {reviewsToShow.map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex flex-col rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200/60"
              >
                <Quote className="absolute end-4 top-4 h-10 w-10 text-amber-100" />
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-700">"{review.text[locale]}"</p>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-sm font-extrabold text-white">
                    {review.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{review.name}</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {review.source === "google" ? "Google" : review.source} · {new Date(review.date).toLocaleDateString(locale === "ar" ? "ar-MA" : locale === "en" ? "en-US" : "fr-FR", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SERVICE AREAS ============== */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-12">
            <span className="inline-block rounded-full bg-navy-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-700">
              {t("home.areas.title")}
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {t("home.areas.subtitle")}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {locations.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/locations"
                  className="group flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
                >
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">{loc.city}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{loc.name[locale]}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 py-16 text-white sm:py-20">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, rgba(245,158,11,0.3) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(58,90,232,0.3) 0%, transparent 30%)",
        }} />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-black tracking-tight sm:text-5xl"
          >
            {t("home.cta.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-white/80"
          >
            {t("home.cta.subtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/booking"
              className="btn-premium inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-7 py-3.5 text-base font-extrabold text-white shadow-xl shadow-amber-500/30"
            >
              {t("nav.book")}
              <ChevronRight className="h-4 w-4 rtl-flip" />
            </Link>
            <a
              href="https://wa.me/212671615948"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-base font-bold text-white backdrop-blur transition-all hover:bg-white/10"
            >
              <Phone className="h-4 w-4" />
              WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
