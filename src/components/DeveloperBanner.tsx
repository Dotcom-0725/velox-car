import { } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Zap, Globe, Smartphone, ShieldCheck, ArrowRight, ShieldCheck as Shield, Heart } from "lucide-react";
import { useApp } from "../context/AppContext";

const WHATSAPP_NUMBER = "212628537649";

const COPY = {
  fr: {
    eyebrow: "✨ Conçu & développé par",
    name: "Rachid DevWorks",
    title: "Vous avez un commerce, un métier ou un projet ?",
    titleAccent: "Vos clients vous cherchent en ligne — soyez visible !",
    description:
      "J'aide les artisans, restaurants, agences et professionnels à attirer plus de clients grâce à des sites web modernes, rapides et qui convertissent. Comme celui que vous consultez actuellement.",
    cta: "Discutons de votre projet sur WhatsApp",
    ctaShort: "Contactez-moi sur WhatsApp",
    waMessage: "Bonjour Rachid, j'ai vu votre travail sur le site VELOX CARS et je souhaite créer/améliorer mon site web.",
    badges: ["10+ ans d'expérience", "Sites livrés clés en main", "SEO & Mobile-First", "Support après livraison"],
    services: [
      { icon: Globe, label: "Sites Web", desc: "Vitrine, e-commerce, sur-mesure" },
      { icon: Smartphone, label: "Mobile-First", desc: "Parfait sur smartphone" },
      { icon: TrendingUp, label: "SEO Google", desc: "Visible sur Google" },
      { icon: ShieldCheck, label: "Sécurisé", desc: "HTTPS, RGPD, backups" },
    ],
    tagline: "Votre succès en ligne commence ici",
    examples: "Ce site VELOX CARS est un exemple de mon travail",
    available: "Disponible",
    response: "Réponse rapide",
    // 🛡️ Guarantee section
    guaranteeTitle: "Zéro risque pour vous",
    guaranteeMain: "Vous ne payez RIEN tant que votre projet n'est pas livré et que vous n'êtes pas 100% satisfait.",
    guaranteeSub: "Aucun acompte demandé · Modifications illimitées avant validation",
    guaranteePoints: [
      "💯 Satisfaction garantie ou aucun paiement",
      "🚫 Pas d'acompte à l'avance",
      "🔄 Révisions illimitées jusqu'à votre approbation",
      "🤝 Confiance avant tout",
    ],
  },
  en: {
    eyebrow: "✨ Designed & developed by",
    name: "Rachid DevWorks",
    title: "Got a business, craft or project?",
    titleAccent: "Your customers are searching online — be visible!",
    description:
      "I help craftsmen, restaurants, agencies and professionals attract more customers with modern, fast websites that convert. Just like the one you're browsing right now.",
    cta: "Let's talk about your project on WhatsApp",
    ctaShort: "Contact me on WhatsApp",
    waMessage: "Hello Rachid, I saw your work on the VELOX CARS website and I would like to create/improve my website.",
    badges: ["10+ years of experience", "Turnkey delivery", "SEO & Mobile-First", "After-delivery support"],
    services: [
      { icon: Globe, label: "Websites", desc: "Showcase, e-commerce, custom" },
      { icon: Smartphone, label: "Mobile-First", desc: "Perfect on smartphone" },
      { icon: TrendingUp, label: "Google SEO", desc: "Visible on Google" },
      { icon: ShieldCheck, label: "Secure", desc: "HTTPS, GDPR, backups" },
    ],
    tagline: "Your online success starts here",
    examples: "This VELOX CARS website is an example of my work",
    available: "Available",
    response: "Quick response",
    // 🛡️ Guarantee section
    guaranteeTitle: "Zero risk for you",
    guaranteeMain: "You pay NOTHING until your project is delivered and you're 100% satisfied.",
    guaranteeSub: "No deposit required · Unlimited revisions before approval",
    guaranteePoints: [
      "💯 Satisfaction guaranteed or no payment",
      "🚫 No upfront deposit",
      "🔄 Unlimited revisions until you approve",
      "🤝 Trust first, payment after",
    ],
  },
  ar: {
    eyebrow: "✨ تم تصميم وتطوير هذا الموقع من طرف",
    name: "Rachid DevWorks",
    title: "هل لديك حرفة أو متجر أو مشروع؟",
    titleAccent: "زبناؤك يبحثون عنك على الإنترنت — كن مرئياً !",
    description:
      "أساعد الحرفيين والمطاعم والوكالات والمهنيين على جذب المزيد من الزبناء بمواقع إلكترونية حديثة وسريعة وفعّالة. تماماً كهذا الموقع الذي تتصفحه الآن.",
    cta: "تواصل معي على واتساب لمناقشة مشروعك",
    ctaShort: "تواصل معي على واتساب",
    waMessage: "السلام عليكم رشيد، رأيت عملك على موقع VELOX CARS وأود إنشاء أو تحسين موقعي الإلكتروني.",
    badges: ["خبرة +10 سنوات", "تسليم جاهز للاستخدام", "SEO وتصميم متجاوب", "دعم بعد التسليم"],
    services: [
      { icon: Globe, label: "مواقع إلكترونية", desc: "عرض، تجارة إلكترونية، حسب الطلب" },
      { icon: Smartphone, label: "متوافق مع الهاتف", desc: "مثالي على الهاتف الذكي" },
      { icon: TrendingUp, label: "تحسين Google", desc: "ظهور أفضل في جوجل" },
      { icon: ShieldCheck, label: "آمن", desc: "HTTPS، حماية البيانات، نسخ احتياطية" },
    ],
    tagline: "نجاحك على الإنترنت يبدأ من هنا",
    examples: "هذا الموقع مثال على عملي",
    available: "متاح",
    response: "رد سريع",
    // 🛡️ Guarantee section
    guaranteeTitle: "صفر مخاطرة، ضمان كامل",
    guaranteeMain: "لن تدفع أي درهم حتى يتم تسليم مشروعك وتكون راضياً عنه 100%.",
    guaranteeSub: "بدون عربون مسبق · تعديلات غير محدودة قبل الموافقة النهائية",
    guaranteePoints: [
      "💯 رضاك مضمون أو لا دفع",
      "🚫 بدون عربون مسبق",
      "🔄 تعديلات غير محدودة حتى موافقتك",
      "🤝 الثقة أولاً، الدفع بعد التسليم",
    ],
  },
};

export function DeveloperBanner() {
  const { locale } = useApp();
  const t = COPY[locale] || COPY.fr;

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.waMessage)}`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-navy-900 to-navy-950 py-14 sm:py-16">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{
        backgroundImage:
          "radial-gradient(circle at 15% 30%, rgba(245,158,11,0.25) 0%, transparent 35%), radial-gradient(circle at 85% 70%, rgba(58,90,232,0.30) 0%, transparent 35%)",
      }} />
      <div className="absolute inset-0 bg-grid opacity-[0.04]" />

      {/* Top wave divider */}
      <div className="absolute inset-x-0 top-0 -translate-y-px">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="h-8 w-full text-slate-50 sm:h-12">
          <path fill="currentColor" d="M0,0 L1440,0 L1440,30 C1200,55 960,15 720,35 C480,55 240,15 0,40 Z" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Developer Credit Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <div className="inline-flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-bold uppercase tracking-wider text-amber-200">
                {locale === "ar" ? "تم تصميم وتطوير هذا الموقع من طرف" : locale === "en" ? "Designed & Developed by" : "Conçu & Développé par"}
              </span>
              <Sparkles className="h-4 w-4 text-amber-300" />
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
            <h3 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Rachid <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">DevWorks</span>
            </h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
            {/* Hook */}
            <h2 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              {t.title}
            </h2>
            <p className="mt-2 text-lg font-bold leading-snug sm:text-xl">
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                {t.titleAccent}
              </span>
            </p>

            {/* Description */}
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {t.description}
            </p>

            {/* Social proof note */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Zap className="h-3 w-3" />
              {t.examples}
            </div>

            {/* 🛡️ GUARANTEE — Risk reversal section (most powerful conversion element) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-5 overflow-hidden rounded-2xl border-2 border-emerald-400/50 bg-gradient-to-br from-emerald-500/15 via-emerald-400/10 to-teal-500/15 p-4 shadow-lg shadow-emerald-500/10 backdrop-blur"
            >
              <div className="flex items-start gap-3">
                {/* Animated shield icon */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1 animate-pulse rounded-full bg-emerald-400/40 blur-md" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/40">
                    <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  {/* Title with badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-emerald-300 sm:text-lg">
                      🛡️ {t.guaranteeTitle}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-950 shadow-sm">
                      <Heart className="h-2.5 w-2.5 fill-current" />
                      100% Risk-Free
                    </span>
                  </div>

                  {/* Main guarantee message */}
                  <p className="mt-1.5 text-sm font-bold leading-snug text-white sm:text-base">
                    {t.guaranteeMain}
                  </p>
                  <p className="mt-1 text-xs text-emerald-200/90">{t.guaranteeSub}</p>

                  {/* Trust points grid */}
                  <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {t.guaranteePoints.map((point, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        className="flex items-center gap-2 text-xs font-semibold text-emerald-100"
                      >
                        <span className="text-sm">{point.slice(0, 2)}</span>
                        <span>{point.slice(2).trim()}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Services grid */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {t.services.map((service, i) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className="group rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur transition-all hover:border-amber-400/40 hover:bg-white/10"
                  >
                    <Icon className="h-5 w-5 text-amber-400 transition-transform group-hover:scale-110" />
                    <p className="mt-1.5 text-xs font-extrabold text-white">{service.label}</p>
                    <p className="mt-0.5 text-[10px] leading-tight text-slate-400">{service.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA + badges */}
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <motion.a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-extrabold text-white shadow-2xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 sm:text-base"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <svg viewBox="0 0 32 32" fill="currentColor" className="relative h-5 w-5">
                  <path d="M16.003 0C7.171 0 .002 7.169.002 16c0 2.823.74 5.582 2.144 8.012L0 32l8.184-2.144A15.93 15.93 0 0 0 16.003 32C24.834 32 32 24.831 32 16S24.834 0 16.003 0zm7.305 19.344c-.398-.2-2.367-1.168-2.734-1.305-.367-.133-.633-.2-.898.2-.266.398-1.031 1.305-1.266 1.57-.234.266-.469.297-.867.1-.398-.2-1.687-.621-3.211-1.98-1.188-1.06-1.988-2.367-2.223-2.766-.234-.398-.024-.613.176-.812.18-.18.398-.469.598-.703.2-.234.266-.398.398-.664.133-.266.067-.5-.034-.7-.1-.199-.898-2.168-1.234-2.965-.324-.777-.652-.672-.898-.683l-.766-.014c-.266 0-.7.1-1.066.5s-1.4 1.367-1.4 3.336c0 1.969 1.434 3.871 1.633 4.137.2.266 2.82 4.305 6.832 6.039 2.388 1.033 3.32 1.121 4.512.945.727-.107 2.367-.969 2.7-1.902.336-.934.336-1.734.234-1.902-.1-.168-.367-.266-.766-.469z" />
                </svg>
                <span className="relative">{t.cta}</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1 rtl-flip" />
              </motion.a>

              {/* Phone number visible */}
              <a
                href={`tel:+${WHATSAPP_NUMBER}`}
                className="font-mono text-base font-extrabold text-amber-300 hover:text-amber-200"
                dir="ltr"
              >
                +212 6 28 53 76 49
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {t.badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300 ring-1 ring-white/10"
                >
                  <span className="text-emerald-400">✓</span>
                  {badge}
                </span>
              ))}
            </div>

            {/* Tagline */}
            <p className="mt-5 border-t border-white/10 pt-4 text-xs italic text-slate-400">
              💡 {t.tagline} · {t.response} 🚀
            </p>
          </motion.div>
      </div>
    </section>
  );
}
