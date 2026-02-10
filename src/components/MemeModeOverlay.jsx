import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function MemeModeOverlay({ enabled, theme, themeId }) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
  }, []);

  if (prefersReducedMotion) return null;

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  }, []);

  // ✅ PERF: reduce count hard (biggest win)
  const count = isMobile ? 2 : 6;

  // ✅ Media sources
  const memeWebmUrl = useMemo(() => "/assets/mascot-dance.webm", []);
  const memeMp4Url = useMemo(() => "/assets/mascot-dance.mp4", []);
  const memeGifUrl = useMemo(() => "/assets/mascot-dance.gif", []);

  const wrapRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [items, setItems] = useState([]);
  const [videoFailed, setVideoFailed] = useState(false);

  // ✅ Preload video when enabled (so first appearance is instant)
  useEffect(() => {
    if (!enabled) return;

    // lightweight warm-up
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    v.playsInline = true;
    v.src = memeWebmUrl;
    // don't attach to DOM; just hint browser to fetch/decode headers
  }, [enabled, memeWebmUrl]);

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

    const its = Array.from({ length: count }).map((_, i) => {
      const x0 = rand(5, 95), y0 = rand(10, 90);
      const x1 = rand(5, 95), y1 = rand(10, 90);
      const x2 = rand(5, 95), y2 = rand(10, 90);
      return {
        id: i,
        s: rand(0.85, 1.1),
        d: rand(14, 24),
        r: rand(-8, 8),
        x: [x0, x1, x2, x0],
        y: [y0, y1, y2, y0],
      };
    });

    setItems(its);
  }, [enabled, themeId, count]);

  useEffect(() => {
    if (!enabled) return;
    setVideoFailed(false);
  }, [enabled, themeId]);

  const px = (pct, max) => (max ? (pct / 100) * max : 0);
  const glow = theme?.glow || "rgba(255,255,255,0.18)";

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
              style={{ boxShadow: `0 0 18px ${glow}` }}
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
              transition={{
                duration: it.d,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="memeBubbleInner" />

              {!videoFailed ? (
                <video
                  className="memeGif"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  aria-hidden="true"
                  onError={() => setVideoFailed(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                    pointerEvents: "none",
                  }}
                >
                  <source src={memeWebmUrl} type="video/webm" />
                  <source src={memeMp4Url} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={memeGifUrl}
                  alt=""
                  className="memeGif"
                  draggable="false"
                  aria-hidden="true"
                  loading="eager"
                  decoding="async"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                    pointerEvents: "none",
                  }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}