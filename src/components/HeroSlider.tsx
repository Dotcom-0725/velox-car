import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SLIDES = [
  {
    src: "/hero/tanger-corniche-sunset.jpg",
    alt: "Tanger corniche au coucher du soleil",
    focus: "center 60%",
  },
  {
    src: "/hero/tanger-medina-day.jpg",
    alt: "Médina de Tanger",
    focus: "center 45%",
  },
  {
    src: "/hero/tanger-coastal-road.jpg",
    alt: "Route côtière de Tanger",
    focus: "center 50%",
  },
];

const INTERVAL = 6500; // 6.5s per slide

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // Preload next image
  useEffect(() => {
    const next = (current + 1) % SLIDES.length;
    const img = new Image();
    img.src = SLIDES[next].src;
  }, [current]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-900">
      {/* Slides with Ken Burns effect */}
      <AnimatePresence mode="sync">
        {SLIDES.map((slide, i) =>
          i === current ? (
            <motion.div
              key={slide.src}
              initial={{ opacity: 0, scale: 1.0 }}
              animate={{
                opacity: 1,
                scale: 1.15,
                transition: {
                  opacity: { duration: 1.4, ease: "easeInOut" },
                  scale: { duration: INTERVAL / 1000 + 2, ease: "linear" },
                },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 1.4, ease: "easeInOut" },
              }}
              className="absolute inset-0"
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-cover"
                style={{ objectPosition: slide.focus }}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(13,24,64,0.55) 0%, rgba(13,24,64,0.30) 35%, rgba(13,24,64,0.55) 75%, rgba(13,24,64,0.85) 100%)",
        }}
      />

      {/* Slide indicators (dots) */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Voir slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current
                ? "w-10 bg-amber-400 shadow-lg shadow-amber-400/50"
                : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-white/10">
        <motion.div
          key={current}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: INTERVAL / 1000, ease: "linear" }}
          className="h-full bg-gradient-to-r from-amber-400 to-amber-300"
        />
      </div>
    </div>
  );
}
