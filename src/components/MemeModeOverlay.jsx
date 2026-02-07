import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function rand(min, max) { return Math.random() * (max - min) + min; }

export default function MemeModeOverlay({ enabled, theme, themeId }) {
  // ✅ Auto throttle: mobile daha yüngül
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  }, []);

  const count = isMobile ? 9 : 14;

  // ⚠️ Yolunu düzgün saxla: public/assets -> /assets
  // public/asset -> /asset
  const memeGifUrl = useMemo(() => "/assets/mascot-dance.gif", []);

  const wrapRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [items, setItems] = useState([]);

  // Measure overlay box once enabled (ResizeObserver = light)
  useEffect(() => {
    if (!enabled) return;

    const el = wrapRef.current;
    if (!el) return;

    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // movement paths (% based, converted to px via box)
    const its = Array.from({ length: count }).map((_, i) => {
      const x0 = rand(5, 95), y0 = rand(10, 90);
      const x1 = rand(5, 95), y1 = rand(10, 90);
      const x2 = rand(5, 95), y2 = rand(10, 90);
      return {
        id: i,
        s: rand(0.80, 1.12),
        d: rand(12, 22),
        r: rand(-8, 8),
        x: [x0, x1, x2, x0],
        y: [y0, y1, y2, y0],
      };
    });

    setItems(its);
  }, [enabled, themeId, count]);

  const px = (pct, max) => (max ? (pct / 100) * max : 0);

  return (
    <AnimatePresence>
      {enabled && (
        <motion.div
          ref={wrapRef}
          className="memeOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          aria-hidden="true"
        >
          {items.map((it) => (
            <motion.div
              key={it.id}
              className="memeBubble"
              style={{
                boxShadow: `0 0 18px ${theme.glow}`,
              }}
              initial={{
                scale: it.s,
                rotate: it.r,
                x: px(it.x[0], box.w),
                y: px(it.y[0], box.h),
              }}
              animate={{
                x: it.x.map((v) => px(v, box.w)),
                y: it.y.map((v) => px(v, box.h)),
                rotate: [it.r, it.r + 6, it.r - 6, it.r],
              }}
              transition={{ duration: it.d, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="memeBubbleInner" />
              <img
                src={memeGifUrl}
                alt=""
                className="memeGif"
                draggable="false"
                aria-hidden="true"
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
