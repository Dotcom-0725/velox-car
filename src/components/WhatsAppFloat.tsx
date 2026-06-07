import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";

// Official WhatsApp logo SVG
function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.003 0C7.171 0 .002 7.169.002 16c0 2.823.74 5.582 2.144 8.012L0 32l8.184-2.144A15.93 15.93 0 0 0 16.003 32C24.834 32 32 24.831 32 16S24.834 0 16.003 0zm0 29.328c-2.523 0-4.99-.68-7.144-1.965l-.512-.305-5.062 1.325 1.352-4.926-.334-.523A13.27 13.27 0 0 1 2.67 16C2.67 8.648 8.652 2.668 16.003 2.668 23.354 2.668 29.33 8.648 29.33 16c0 7.352-5.977 13.328-13.328 13.328zm7.305-9.984c-.398-.2-2.367-1.168-2.734-1.305-.367-.133-.633-.2-.898.2-.266.398-1.031 1.305-1.266 1.57-.234.266-.469.297-.867.1-.398-.2-1.687-.621-3.211-1.98-1.188-1.06-1.988-2.367-2.223-2.766-.234-.398-.024-.613.176-.812.18-.18.398-.469.598-.703.2-.234.266-.398.398-.664.133-.266.067-.5-.034-.7-.1-.199-.898-2.168-1.234-2.965-.324-.777-.652-.672-.898-.683l-.766-.014c-.266 0-.7.1-1.066.5s-1.4 1.367-1.4 3.336c0 1.969 1.434 3.871 1.633 4.137.2.266 2.82 4.305 6.832 6.039 2.388 1.033 3.32 1.121 4.512.945.727-.107 2.367-.969 2.7-1.902.336-.934.336-1.734.234-1.902-.1-.168-.367-.266-.766-.469z"/>
    </svg>
  );
}

export function WhatsAppFloat() {
  const { locale } = useApp();
  const message = locale === "ar"
    ? "مرحباً فيلوكس كار، أود الاستفسار عن خدماتكم."
    : locale === "en"
    ? "Hello VELOX CAR, I would like to inquire about your services."
    : "Bonjour VELOX CAR, je souhaite des informations sur vos services.";

  const tooltip = locale === "ar" ? "تحدث معنا على واتساب" : locale === "en" ? "Chat with us on WhatsApp" : "Discutez avec nous sur WhatsApp";

  return (
    <motion.a
      href={`https://wa.me/212677160264?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, type: "spring", damping: 14, stiffness: 200 }}
      className="group fixed end-4 z-[60] flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] ring-4 ring-white transition-transform hover:scale-110 active:scale-95 sm:end-6"
      style={{
        // Sits above the mobile sticky bottom bar (≈ 72px) on small screens, comfortable corner on desktop
        bottom: "max(96px, calc(env(safe-area-inset-bottom, 0px) + 92px))",
        width: "60px",
        height: "60px",
      }}
      aria-label={tooltip}
    >
      {/* Pulse rings */}
      <span className="pointer-events-none absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40" />
      <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[#25D366]/30" />

      {/* Icon */}
      <WhatsAppIcon className="relative h-8 w-8 drop-shadow-sm sm:h-9 sm:w-9" />

      {/* Online dot */}
      <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>

      {/* Tooltip on desktop */}
      <span className="pointer-events-none absolute end-full me-3 hidden whitespace-nowrap rounded-full bg-slate-900 px-3.5 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block">
        {tooltip}
        <span className="absolute start-full top-1/2 -translate-y-1/2 border-y-4 border-s-4 border-y-transparent border-s-slate-900" />
      </span>
    </motion.a>
  );
}

// Larger desktop variant on bigger screens (optional but enhances clarity)
