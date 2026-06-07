import { ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

export function NoPaymentBanner() {
  const { t } = useApp();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white">
      <div className="absolute inset-0 -z-10 opacity-20" style={{
        backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 30%), radial-gradient(circle at 80% 50%, white 0%, transparent 30%)",
      }} />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6 sm:text-sm">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur sm:h-8 sm:w-8">
            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <p className="truncate font-medium sm:whitespace-normal">
            <span className="hidden sm:inline">{t("banner.noPayment")}</span>
            <span className="sm:hidden">{t("banner.noPaymentShort")}</span>
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-white/20"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
