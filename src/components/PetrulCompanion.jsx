// src/components/PetrulCompanion.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getEggLineForToday,
  getRandomCompanionLine,
  getTodayCompanionLine,
} from "../data/petrulCompanionMessages";

export default function PetrulCompanion({
  src = "/assets/mascot2.png",
  anchor = "bottom", // "bottom" | "middle"
  minDelayMs = 18000,
  maxDelayMs = 45000,
  reappearMinMs = 120000,
  reappearMaxMs = 240000,
  autoHideMs = 16000,
  forceShowNow = false,
  eggCooldownMs = 12000,
}) {
  const dailyLine = useMemo(() => getTodayCompanionLine(), []);
  const [displayLine, setDisplayLine] = useState(dailyLine);

  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  const [sparkle, setSparkle] = useState(false);

  const timerRef = useRef(null);
  const eggTimerRef = useRef(null);

  const DAY_KEY = "petrul_companion_last_seen_day_v1";
  const EGG_LAST_TS = "petrul_companion_egg_last_ts_v1";

  const rand = (a, b) => Math.floor(a + Math.random() * (b - a + 1));

  const schedule = (minMs, maxMs, fn) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, rand(minMs, maxMs));
  };

  // ✅ Preload mascot image early (helps instant render when it appears)
  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }, [src]);

  const show = () => {
    setImgOk(true);
    setVisible(true);
    setDisplayLine(dailyLine);
    requestAnimationFrame(() => setOpen(true));
  };

  const hide = () => {
    setOpen(false);
    setTimeout(() => setVisible(false), 320);
  };

  const getLocalDateKey = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    const today = getLocalDateKey();
    const lastSeenDay = localStorage.getItem(DAY_KEY);

    if (forceShowNow) {
      show();
      localStorage.setItem(DAY_KEY, today);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    const alreadyToday = lastSeenDay === today;

    schedule(
      alreadyToday ? reappearMinMs : minDelayMs,
      alreadyToday ? reappearMaxMs : maxDelayMs,
      () => {
        show();
        localStorage.setItem(DAY_KEY, today);
      }
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceShowNow]);

  useEffect(() => {
    if (!visible) return;
    const auto = setTimeout(() => hide(), autoHideMs);
    return () => clearTimeout(auto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (visible) return;

    const today = getLocalDateKey();
    const lastSeenDay = localStorage.getItem(DAY_KEY);

    if (lastSeenDay === today) {
      schedule(reappearMinMs, reappearMaxMs, () => show());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const posStyle = anchor === "middle" ? { top: "30%" } : { bottom: "110px" };

  const canEgg = () => {
    const last = Number(localStorage.getItem(EGG_LAST_TS) || "0");
    return Date.now() - last >= eggCooldownMs;
  };

  const runEasterEgg = () => {
    if (!canEgg()) return;

    localStorage.setItem(EGG_LAST_TS, String(Date.now()));

    setSparkle(true);
    setTimeout(() => setSparkle(false), 900);

    const bonus =
      Math.random() < 0.22
        ? getEggLineForToday()
        : getRandomCompanionLine(dailyLine);
    setDisplayLine(bonus);

    if (eggTimerRef.current) clearTimeout(eggTimerRef.current);
    eggTimerRef.current = setTimeout(() => {
      setDisplayLine(dailyLine);
    }, 6000);
  };

  useEffect(() => {
    return () => {
      if (eggTimerRef.current) clearTimeout(eggTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        .petrulCompanionWrap{
          position: fixed;
          left: 0;
          z-index: 80;
          pointer-events: none;
        }
        .petrulCompanion{
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding-left: 10px;
          transition: transform 320ms ease, opacity 320ms ease;
          opacity: ${open ? 1 : 0};
          transform: ${open ? "translateX(0)" : "translateX(-70%)"};
          pointer-events: none;
        }

        .petrulMascotBox{
          position: relative;
          pointer-events: auto;
        }

        .petrulMascot{
          width: 112px;
          height: auto;
          filter: drop-shadow(0 18px 28px rgba(0,0,0,.55));
          cursor: pointer;
          user-select: none;
        }

        .sparkleRing{
          position:absolute;
          left: 50%;
          top: 42%;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          pointer-events:none;
          opacity: 0;
        }
        .sparkleOn .sparkleRing{
          animation: sparklePop 900ms ease-out forwards;
        }
        @keyframes sparklePop{
          0%{ opacity: 0; transform: translate(-50%,-50%) scale(.6); box-shadow: none; }
          20%{ opacity: 1; transform: translate(-50%,-50%) scale(1); box-shadow:
              0 -26px 0 0 rgba(255,255,255,.65),
              18px -18px 0 0 rgba(255,255,255,.55),
              26px 0 0 0 rgba(255,255,255,.55),
              18px 18px 0 0 rgba(255,255,255,.50),
              0 26px 0 0 rgba(255,255,255,.50),
              -18px 18px 0 0 rgba(255,255,255,.45),
              -26px 0 0 0 rgba(255,255,255,.45),
              -18px -18px 0 0 rgba(255,255,255,.55);
          }
          100%{ opacity: 0; transform: translate(-50%,-50%) scale(1.35); box-shadow: none; }
        }

        .petrulBubble{
          max-width: 290px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(10,10,12,0.82);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 16px 40px rgba(0,0,0,.45);
          color: var(--text, #fff);
          font-family: var(--font-body);
          pointer-events: auto;
          cursor: pointer;
        }
        .petrulBubbleTitle{
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 12px;
          letter-spacing: .6px;
          opacity: .88;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .petrulBubbleMsg{
          font-size: 13px;
          line-height: 1.3;
          opacity: .95;
        }
        .petrulHint{
          margin-top: 8px;
          font-size: 11px;
          opacity: .65;
        }
      `}</style>

      <div className="petrulCompanionWrap" style={posStyle} aria-live="polite">
        <div
          className="petrulCompanion"
          title="Click bubble to dismiss • Click mascot for a surprise"
          role="button"
          tabIndex={-1}
          aria-label="Petrul Companion"
        >
          {imgOk && (
            <div className={`petrulMascotBox ${sparkle ? "sparkleOn" : ""}`}>
              <span className="sparkleRing" aria-hidden="true" />
              <img
                src={src}
                alt="Petrul mascot"
                className="petrulMascot"
                draggable="false"
                decoding="async"
                fetchpriority="low"
                onError={() => setImgOk(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  runEasterEgg();
                }}
              />
            </div>
          )}

          <div
            className="petrulBubble"
            onClick={(e) => {
              e.stopPropagation();
              hide();
            }}
          >
            <div className="petrulBubbleTitle">Petrul Companion</div>
            <div className="petrulBubbleMsg">{displayLine}</div>
            <div className="petrulHint">Click mascot for a surprise ✨</div>
          </div>
        </div>
      </div>
    </>
  );
}