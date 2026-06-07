import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, MessageCircle, Phone } from "lucide-react";
import { useApp } from "../context/AppContext";
import { FAQS, FAQ_CATEGORIES } from "../data/faqs";
import { Link } from "react-router-dom";

export function FAQ() {
  const { t, locale } = useApp();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [openId, setOpenId] = useState<number | null>(0);

  const filtered = useMemo(() => {
    return FAQS.filter((f) => {
      const matchesQuery = !query ||
        f.question[locale].toLowerCase().includes(query.toLowerCase()) ||
        f.answer[locale].toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCat === "all" || f.category === activeCat;
      return matchesQuery && matchesCat;
    });
  }, [query, activeCat, locale]);

  return (
    <div className="bg-slate-50">
      <section className="hero-mesh relative overflow-hidden py-12 text-white sm:py-16">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black tracking-tight sm:text-5xl">
            {t("faq.title")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-auto mt-3 text-white/80">
            {t("faq.subtitle")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mx-auto mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t("faq.search")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-full border-0 bg-white py-3 ps-10 pe-4 text-sm text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Categories */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCat("all")}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              activeCat === "all" ? "bg-navy-700 text-white shadow-md" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t("cars.filter.all")}
          </button>
          {Object.entries(FAQ_CATEGORIES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setActiveCat(key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeCat === key ? "bg-navy-700 text-white shadow-md" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {val[locale]}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-bold text-slate-700">{t("faq.empty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((f, i) => {
              const isOpen = openId === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 p-5 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                        {FAQ_CATEGORIES[f.category][locale]}
                      </span>
                      <h3 className="mt-1 text-base font-extrabold text-slate-900">{f.question[locale]}</h3>
                    </div>
                    <ChevronDown className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="border-t border-slate-100 p-5 pt-4 text-sm leading-relaxed text-slate-600">
                          {f.answer[locale]}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-700 to-navy-900 p-6 text-white sm:p-8">
          <div className="grid items-center gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <h3 className="text-xl font-extrabold sm:text-2xl">{t("faq.contact")}</h3>
              <p className="mt-1 text-sm text-white/80">
                {locale === "ar" ? "فريقنا متاح 7 أيام في الأسبوع للإجابة على أسئلتك" : locale === "en" ? "Our team is available 7 days a week to answer your questions" : "Notre équipe est disponible 7j/7 pour répondre à vos questions"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a href="https://wa.me/212677160264" target="_blank" rel="noopener noreferrer" className="btn-premium flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold hover:bg-emerald-600">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <Link to="/contact" className="flex items-center justify-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold backdrop-blur hover:bg-white/20">
                <Phone className="h-4 w-4" /> {t("faq.contactCta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
