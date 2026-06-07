// Reusable car SVG illustration that adapts by car id (silhouette, color)
import { Car } from "../data/cars";

type Props = {
  car: Car;
  className?: string;
  showBadge?: boolean;
  animated?: boolean;
  preferImage?: boolean;
};

export function CarIllustration({ car, className = "", showBadge = true, animated = false, preferImage = true }: Props) {
  // If a real photo URL is provided, render it instead of the SVG
  if (preferImage && car.imageUrl) {
    return (
      <div className={`relative h-full w-full ${className}`}>
        <img
          src={car.imageUrl}
          alt={`${car.make} ${car.model} ${car.year}`}
          className="h-full w-full object-contain"
          loading="lazy"
          style={{ animation: animated ? "car-drive 6s ease-in-out infinite" : undefined }}
        />
        {showBadge && car.badge && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md shadow-amber-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {car.badge}
            </span>
          </div>
        )}
      </div>
    );
  }
  return <CarIllustrationSVG car={car} className={className} showBadge={showBadge} animated={animated} />;
}

function CarIllustrationSVG({ car, className = "", showBadge = true, animated = false }: Props) {
  const isDark = car.id === "peugeot-3008-2026";
  const isSUV = car.category === "suv" || car.category === "compact-suv" || car.category === "luxury";
  const accent = car.illustAccent;

  return (
    <div className={`relative h-full w-full ${className}`}>
      <svg
        viewBox="0 0 320 160"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ animation: animated ? "car-drive 6s ease-in-out infinite" : undefined }}
      >
        {/* Shadow under car */}
        <ellipse cx="160" cy="135" rx="120" ry="6" fill="rgba(0,0,0,0.18)" />

        {/* Main body */}
        <path
          d={isSUV
            ? "M30 115 L40 80 Q48 70 60 68 L100 65 Q110 55 125 52 L195 52 Q210 55 220 65 L260 68 Q272 70 280 80 L290 115 L290 120 Q290 128 282 128 L278 128 Q274 138 264 138 Q254 138 250 128 L70 128 Q66 138 56 138 Q46 138 42 128 L38 128 Q30 128 30 120 Z"
            : "M40 115 L52 88 Q60 78 72 76 L110 73 Q120 60 138 58 L185 58 Q200 60 210 73 L250 76 Q262 78 270 88 L280 115 L280 120 Q280 128 272 128 L268 128 Q264 138 254 138 Q244 138 240 128 L80 128 Q76 138 66 138 Q56 138 52 128 L48 128 Q40 128 40 120 Z"
          }
          fill={isDark ? "#0f172a" : "#ffffff"}
          stroke={isDark ? "#1E3A8A" : "#cbd5e1"}
          strokeWidth="1.5"
        />

        {/* Roof/window area */}
        <path
          d={isSUV
            ? "M105 65 L130 40 Q140 36 160 36 L200 36 Q220 36 230 40 L255 65 L130 65 Z"
            : "M115 73 L135 50 Q145 46 160 46 L195 46 Q210 46 218 50 L238 73 L130 73 Z"
          }
          fill={accent}
          opacity="0.95"
        />

        {/* Windows divider */}
        <line
          x1={isSUV ? "180" : "180"}
          y1={isSUV ? "38" : "50"}
          x2="180"
          y2="65"
          stroke={isDark ? "#1E3A8A" : "#ffffff"}
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Side stripe / accent */}
        <rect x="50" y="100" width="220" height="3" fill={accent} opacity="0.4" rx="1.5" />

        {/* Headlight */}
        <ellipse cx={isDark ? "285" : "282"} cy={isSUV ? "95" : "100"} rx="6" ry="4" fill="#fef3c7" stroke={accent} strokeWidth="1" />
        {/* Tail light */}
        <ellipse cx="35" cy={isSUV ? "95" : "100"} rx="5" ry="3" fill="#dc2626" opacity="0.85" />

        {/* Front wheel */}
        <circle cx={isSUV ? "240" : "235"} cy="125" r="18" fill="#1e293b" />
        <circle cx={isSUV ? "240" : "235"} cy="125" r="11" fill="#475569" />
        <circle cx={isSUV ? "240" : "235"} cy="125" r="6" fill={accent} />
        <circle cx={isSUV ? "240" : "235"} cy="125" r="2.5" fill="#0f172a" />

        {/* Rear wheel */}
        <circle cx="75" cy="125" r="18" fill="#1e293b" />
        <circle cx="75" cy="125" r="11" fill="#475569" />
        <circle cx="75" cy="125" r="6" fill={accent} />
        <circle cx="75" cy="125" r="2.5" fill="#0f172a" />

        {/* Door line */}
        <line x1="160" y1="78" x2="160" y2="115" stroke={isDark ? "#1E3A8A" : "#cbd5e1"} strokeWidth="1" opacity="0.5" />
        {/* Door handle */}
        <rect x="155" y="92" width="14" height="2" rx="1" fill={isDark ? "#1E3A8A" : "#64748b"} opacity="0.7" />

        {/* Side mirror */}
        <ellipse cx="118" cy="70" rx="5" ry="3" fill={isDark ? "#1E3A8A" : "#94a3b8"} />
      </svg>

      {showBadge && car.badge && (
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md shadow-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {car.badge}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * VELOX CARS official emblem logo.
 * - "icon" : just the circular emblem (best for headers, favicons)
 * - "full" : emblem + "VELOX CARS" text (best for footer, login, contracts)
 * - "variant" : "dark" (white logo for dark backgrounds) or "light" (navy logo for white backgrounds)
 */
export function CarLogo({
  size = 32,
  className = "",
  variant = "auto",
  withText = false,
}: {
  size?: number;
  className?: string;
  variant?: "dark" | "light" | "auto";
  withText?: boolean;
}) {
  // "auto" = navy emblem on white background (default, most common case)
  const isDarkBg = variant === "dark";
  const primary = isDarkBg ? "#ffffff" : "#1E3A8A";
  const accent = "#F59E0B";
  const bgFill = isDarkBg ? "transparent" : "transparent";

  // When showing text, use a horizontal layout
  if (withText) {
    return (
      <svg
        width={size * 2.4}
        height={size}
        viewBox="0 0 240 100"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="VELOX CARS"
      >
        {/* Emblem */}
        <g transform="translate(0, 0)">
          <VeloxEmblemPaths primary={primary} accent={accent} />
        </g>
        {/* Text "VELOX CARS" */}
        <g transform="translate(110, 0)" fontFamily="'Poppins', 'Inter', sans-serif">
          <text
            x="0"
            y="58"
            fontSize="28"
            fontWeight="900"
            fill={primary}
            letterSpacing="1"
          >
            VELOX
          </text>
          <text
            x="0"
            y="80"
            fontSize="14"
            fontWeight="800"
            fill={accent}
            letterSpacing="6"
          >
            CARS
          </text>
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="VELOX CARS"
    >
      {bgFill !== "transparent" && <rect width="100" height="100" rx="22" fill={bgFill} />}
      <VeloxEmblemPaths primary={primary} accent={accent} />
    </svg>
  );
}

/**
 * The emblem paths — used both standalone and combined with text.
 * Designed to match the official VELOX CARS logo:
 *   • Circular emblem with stylized car silhouette
 *   • V-shaped wings/rays on top
 *   • Vertical bars below (grille / speed lines)
 */
function VeloxEmblemPaths({ primary, accent }: { primary: string; accent: string }) {
  return (
    <g>
      {/* Top V-shaped wings (3 lines on each side converging downward) */}
      <g stroke={primary} strokeWidth="2.5" strokeLinecap="round" fill="none">
        <line x1="20" y1="6" x2="48" y2="34" />
        <line x1="30" y1="4" x2="48" y2="34" />
        <line x1="40" y1="4" x2="48" y2="34" />
        <line x1="80" y1="6" x2="52" y2="34" />
        <line x1="70" y1="4" x2="52" y2="34" />
        <line x1="60" y1="4" x2="52" y2="34" />
      </g>

      {/* Circular emblem — outer ring */}
      <circle cx="50" cy="50" r="22" fill="none" stroke={primary} strokeWidth="2.8" />

      {/* Car silhouette inside the circle (front view, low profile) */}
      <g transform="translate(50, 50)">
        {/* Car body */}
        <path
          d="M -14 4 Q -14 -3 -10 -5 L -7 -8 Q -5 -10 -2 -10 L 2 -10 Q 5 -10 7 -8 L 10 -5 Q 14 -3 14 4 L 14 6 Q 14 8 12 8 L -12 8 Q -14 8 -14 6 Z"
          fill={primary}
        />
        {/* Windshield */}
        <path
          d="M -7 -7 L -5 -3 L 5 -3 L 7 -7 Z"
          fill="none"
          stroke={primary}
          strokeWidth="1"
        />
        {/* Headlights */}
        <circle cx="-10" cy="2" r="1.5" fill={accent} />
        <circle cx="10" cy="2" r="1.5" fill={accent} />
      </g>

      {/* Bottom vertical bars (grille / speed lines) — 9 thin bars */}
      <g stroke={primary} strokeWidth="2" strokeLinecap="round">
        {[24, 30, 36, 42, 48, 54, 60, 66, 72].map((x, i) => {
          // Center bars are longer (radiating effect)
          const dist = Math.abs(x - 48);
          const len = 18 - dist * 0.4;
          return <line key={i} x1={x} y1="78" x2={x} y2={78 + len} />;
        })}
      </g>

      {/* Center accent dot under the emblem */}
      <circle cx="50" cy="76" r="1.8" fill={accent} />
    </g>
  );
}
