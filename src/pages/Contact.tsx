import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Send, Clock, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../hooks/useToast";
import { BUSINESS } from "../data/info";
import { googleMapsEmbedUrl, googleMapsDirectionsUrl } from "../utils/format";
import { api } from "../services/api";
import { useSyncRefresh } from "../services/sync";

export function Contact() {
  const { t, locale } = useApp();
  const { show } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Re-render on settings updates so admin changes appear instantly
  useSyncRefresh(["settings:updated"]);
  const settings = api.getBusinessSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      // Submit through shared api → creates contact message + admin notification in real-time
      api.submitContactMessage({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      });
      setSubmitting(false);
      setSent(true);
      show(t("contact.sent"), "success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 600);
  };

  return (
    <div className="bg-slate-50">
      <section className="hero-mesh relative overflow-hidden py-12 text-white sm:py-16">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black tracking-tight sm:text-5xl">{t("contact.title")}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-auto mt-3 text-white/80">{t("contact.subtitle")}</motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200/60 sm:p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">{t("contact.title")}</h2>
            {sent ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-emerald-800">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                <p className="mt-2 font-bold">{t("contact.sent")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">{t("contact.name")}</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">{t("contact.email")}</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">{t("contact.phone")}</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">{t("contact.subject")}</label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">{t("contact.message")}</label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-premium flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-amber-500/30 disabled:opacity-60"
                  >
                    {submitting ? t("common.loading") : (<><Send className="h-4 w-4" /> {t("contact.send")}</>)}
                  </button>
                  <a
                    href={`https://wa.me/212677160264?text=${encodeURIComponent("Bonjour VELOX CAR, " + (form.message || "je souhaite des informations."))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-6 py-3.5 text-sm font-extrabold text-emerald-700 hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-4 w-4" /> {t("contact.whatsappCta")}
                  </a>
                </div>
              </form>
            )}
          </motion.div>

          {/* Direct info */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200/60 sm:p-8">
              <h2 className="text-2xl font-extrabold text-slate-900">{t("contact.directInfo")}</h2>
              <ul className="mt-5 space-y-3">
                <li>
                  <a href="tel:+212668353949" className="group flex items-start gap-3 rounded-2xl bg-slate-50 p-3 transition-colors hover:bg-navy-50">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-navy-700 text-white">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">{t("contact.phones")}</p>
                      {settings.phones.map((p) => (
                        <p key={p} className="text-sm font-extrabold text-slate-900 group-hover:text-navy-700">{p}</p>
                      ))}
                    </div>
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/212677160264" target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-2xl bg-slate-50 p-3 transition-colors hover:bg-emerald-50">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">{t("contact.whatsapp")}</p>
                      <p className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700">+212 6 77 16 02 64</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${settings.email}`} className="group flex items-start gap-3 rounded-2xl bg-slate-50 p-3 transition-colors hover:bg-amber-50">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">Email</p>
                      <p className="text-sm font-extrabold text-slate-900 group-hover:text-amber-700">{settings.email}</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href={googleMapsDirectionsUrl(BUSINESS.gps.lat, BUSINESS.gps.lng)} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-2xl bg-slate-50 p-3 transition-colors hover:bg-sky-50">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">{t("contact.address")}</p>
                      <p className="text-sm font-extrabold text-slate-900 group-hover:text-sky-700">{settings.address}</p>
                    </div>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">{t("contact.hours")}</p>
                      <p className="text-sm font-extrabold text-slate-900">Sat-Thu · 8:00 – 18:00</p>
                      <p className="text-xs text-slate-500">{locale === "ar" ? "7 أيام في الأسبوع" : locale === "en" ? "7 days a week" : "7 jours sur 7"}</p>
                    </div>
                  </div>
                </li>
              </ul>

              <div className="mt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{t("contact.followUs")}</p>
                <div className="flex gap-2">
                  <a
                    href={`https://instagram.com/${BUSINESS.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-amber-500 text-white"
                    aria-label="Instagram"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <rect width="20" height="20" x="2" y="2" rx="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                  <a
                    href="https://wa.me/212677160264"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                  <a
                    href="tel:+212668353949"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 text-white"
                    aria-label="Phone"
                  >
                    <Phone className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200/60">
              <iframe
                title="VELOX CAR Map"
                src={googleMapsEmbedUrl(BUSINESS.gps.lat, BUSINESS.gps.lng, BUSINESS.address)}
                className="h-56 w-full"
                loading="lazy"
              />
              <div className="p-3 text-center">
                <a
                  href={googleMapsDirectionsUrl(BUSINESS.gps.lat, BUSINESS.gps.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-navy-700 hover:underline"
                >
                  {t("locations.openInMaps")} →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
