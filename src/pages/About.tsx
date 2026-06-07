import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Users, Award, MapPin, BadgeCheck, Heart } from "lucide-react";
import { useApp } from "../context/AppContext";
import { CARS } from "../data/cars";

const COMMITMENTS = [
  { icon: Sparkles, fr: "Flotte 100% récente (2024-2026)", en: "100% recent fleet (2024-2026)", ar: "أسطول حديث 100% (2024-2026)" },
  { icon: BadgeCheck, fr: "Véhicules révisés à chaque location", en: "Vehicles serviced every rental", ar: "سيارات مصانة عند كل إيجار" },
  { icon: ShieldCheck, fr: "Assurance tous risques incluse", en: "Comprehensive insurance included", ar: "تأمين شامل مشمول" },
  { icon: Award, fr: "Prix transparents, sans frais cachés", en: "Transparent pricing, no hidden fees", ar: "أسعار شفافة بدون رسوم خفية" },
  { icon: Users, fr: "Équipe multilingue (AR/FR/EN)", en: "Multilingual team (AR/FR/EN)", ar: "فريق متعدد اللغات" },
  { icon: Heart, fr: "Service client 7j/7", en: "7-day customer service", ar: "خدمة عملاء 7 أيام" },
];

const COVERAGE = [
  "Tanger (centre, médina, Malabata, Cap Spartel)",
  "Aéroport Ibn Battouta (TNG)",
  "Port Tanger Med",
  "Tétouan (centre, Martil, M'diq)",
  "Fnideq & frontière Ceuta",
  "Asilah, Larache, Chefchaouen (sur demande)",
];

const PARTNERS = [
  "Hôtels 4 & 5★ Tanger",
  "Agences de voyage locales",
  "Tour-opérateurs internationaux",
  "Compagnies aériennes (TNG)",
  "Compagnies de ferry (Tanger Med)",
  "Agences immobilières",
];

export function About() {
  const { t, locale } = useApp();

  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <section className="hero-mesh relative overflow-hidden py-14 text-white sm:py-20">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
            🇲🇦 Tanger · Maroc
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            {t("about.title")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mx-auto mt-3 max-w-2xl text-white/80">
            {t("about.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
                {t("about.story")}
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                {locale === "ar" ? "منذ 2019 في خدمة تنقلكم" : locale === "en" ? "Since 2019, at your service" : "Depuis 2019 à votre service"}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {t("about.storyText")}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { v: "5+", l: locale === "ar" ? "سنوات" : locale === "en" ? "Years" : "Ans" },
                  { v: "184+", l: locale === "ar" ? "عميل" : locale === "en" ? "Clients" : "Clients" },
                  { v: "4.7★", l: "Google" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-navy-50 p-4 text-center">
                    <p className="text-2xl font-black text-navy-700">{s.v}</p>
                    <p className="text-xs text-slate-600">{s.l}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
              <div className="grid grid-cols-2 gap-3">
                {CARS.slice(0, 4).map((car, i) => (
                  <div key={car.id} className={`${i % 2 === 0 ? "translate-y-6" : ""} overflow-hidden rounded-3xl ${car.cardBg} p-3 shadow-lg`}>
                    <div className="aspect-[4/3]">
                      {/* @ts-ignore */}
                      <Car3DPreview car={car} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-navy-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-700">
              {t("about.commitment")}
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              {locale === "ar" ? "ما نقدمه لك" : locale === "en" ? "What we offer" : "Ce que nous vous offrons"}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {COMMITMENTS.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.fr}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 text-white transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{c[locale]}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coverage + Partners */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-amber-50/30 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                <MapPin className="h-6 w-6 text-amber-500" /> {t("about.coverage")}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {locale === "ar" ? "نخدم جميع المناطق الرئيسية في شمال المغرب" : locale === "en" ? "We serve all major areas in northern Morocco" : "Nous desservons toutes les zones principales du nord du Maroc"}
              </p>
              <ul className="mt-5 space-y-2">
                {COVERAGE.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-sky-50/30 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                <Users className="h-6 w-6 text-sky-500" /> {t("about.partners")}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {locale === "ar" ? "نتعاون مع أفضل الشركاء في المنطقة" : locale === "en" ? "We work with the best partners in the region" : "Nous travaillons avec les meilleurs partenaires de la région"}
              </p>
              <ul className="mt-5 space-y-2">
                {PARTNERS.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance */}
      <section className="bg-gradient-to-br from-navy-700 to-navy-900 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-amber-400" />
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">{t("about.insurance")}</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { v: "5 000", l: locale === "ar" ? "درهم (اقتصادي)" : locale === "en" ? "MAD (Economy)" : "MAD (Économique)" },
              { v: "8 000", l: locale === "ar" ? "درهم (SUV)" : locale === "en" ? "MAD (SUV)" : "MAD (SUV)" },
              { v: "15 000", l: locale === "ar" ? "درهم (فاخر)" : locale === "en" ? "MAD (Premium)" : "MAD (Premium)" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
                <p className="text-3xl font-black text-amber-400">{s.v}</p>
                <p className="mt-1 text-sm font-bold text-white/80">{s.l}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-white/80">
            {locale === "ar" ? "قم بترقية تأمينك إلى شامل للحصول على خصم 0 درهم" : locale === "en" ? "Upgrade to full coverage for 0 MAD deductible" : "Passez à l'assurance tous risques pour 0 MAD de franchise"}
          </p>
        </div>
      </section>
    </div>
  );
}

import { Car as CarType } from "../data/cars";
import { CarIllustration } from "../components/CarIllustration";
function Car3DPreview({ car }: { car: CarType }) {
  return <CarIllustration car={car} showBadge={false} />;
}
