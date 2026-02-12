import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// public/assets/mascot.png
const mascotImg = "/assets/mascot.webp";

export default function BreathRitualOverlay({ onComplete, manualToken }) {
  const [visible, setVisible] = useState(false);

  // prevents reopening for same token even if component remounts
  const lastHandledTokenRef = useRef(0);

  // keep timer under control
  const timerRef = useRef(null);

  useEffect(() => {
    if (!manualToken) return;

    if (manualToken <= lastHandledTokenRef.current) return;
    lastHandledTokenRef.current = manualToken;

    if (timerRef.current) clearTimeout(timerRef.current);

    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 10000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [manualToken, onComplete]);

  // Optional: allow ESC to close (still calls onComplete to keep your flow consistent)
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setVisible(false);
        onComplete?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="breathOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Premium glass card */}
          <motion.div
            className="breathCard"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Daily Micro Ritual"
          >
            <div className="breathTop">
              <div className="breathTitle">Daily Micro Ritual</div>
              <div className="breathSub">10 seconds to reset your system.</div>
            </div>

            <div className="breathMain">
              <motion.img
                className="petrulBreathImg"
                src={mascotImg}
                alt="Petrul"
                animate={{ scale: [1, 1.07, 1], y: [0, -6, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                draggable="false"
              />

              <motion.div
                className="breathText"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="breathLead">
                  Soft focus. Slow breath. Small release.
                </div>

                <div className="breathSteps">
                  <div className="breathStep">
                    <div className="breathStepNum">1</div>
                    <div>
                      <div className="breathStepLabel">Breathe</div>
                      <div className="breathStepText">In for 4… out for 6.</div>
                    </div>
                  </div>

                  <div className="breathStep">
                    <div className="breathStepNum">2</div>
                    <div>
                      <div className="breathStepLabel">Release</div>
                      <div className="breathStepText">Let go of one tight thought.</div>
                    </div>
                  </div>

                  <div className="breathStep">
                    <div className="breathStepNum">3</div>
                    <div>
                      <div className="breathStepLabel">Gratitude</div>
                      <div className="breathStepText">Name one good thing—small counts.</div>
                    </div>
                  </div>
                </div>

                <div className="breathHint">
                  You can press <b>Esc</b> to finish early.
                </div>
              </motion.div>
            </div>

            {/* 10s progress bar (pure CSS animation) */}
            <div className="breathProgress" aria-hidden="true">
              <div className="breathProgressFill" />
            </div>
          </motion.div>

          {/* Inline styles to keep it self-contained */}
          <style>{`
            .breathOverlay{
              position: fixed;
              inset: 0;
              z-index: 140;
              display:flex;
              align-items:center;
              justify-content:center;
              padding: 18px;
              background: rgba(0,0,0,0.58);
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
            }

            .breathCard{
              width: min(720px, calc(100% - 18px));
              border-radius: 22px;
              border: 1px solid rgba(255,255,255,0.14);
              background: rgba(10,10,12,0.22);
              box-shadow: 0 22px 80px rgba(0,0,0,0.55);
              overflow: hidden;
              padding: 14px 14px 12px;
              color: var(--text, #fff);
            }

            .breathTop{
              display:flex;
              align-items:flex-end;
              justify-content: space-between;
              gap: 12px;
              flex-wrap: wrap;
              padding: 2px 4px 10px;
            }
            .breathTitle{
              font-family: var(--font-title);
              font-weight: 900;
              letter-spacing: .7px;
              font-size: 12px;
              text-transform: uppercase;
              opacity: .92;
            }
            .breathSub{
              font-family: var(--font-body);
              font-size: 12px;
              opacity: .72;
            }

            .breathMain{
              display:flex;
              gap: 14px;
              align-items:center;
              padding: 6px 4px 10px;
              flex-wrap: wrap;
            }

            .petrulBreathImg{
              width: 128px;
              height: auto;
              filter: drop-shadow(0 18px 28px rgba(0,0,0,.55));
              user-select: none;
            }

            .breathText{
              flex: 1;
              min-width: 260px;
              font-family: var(--font-body);
            }

            .breathLead{
              font-size: 14px;
              line-height: 1.25;
              opacity: .95;
              margin-bottom: 10px;
              font-weight: 650;
            }

            .breathSteps{
              display:grid;
              gap: 10px;
            }

            .breathStep{
              display:flex;
              gap: 10px;
              align-items:flex-start;
              border-radius: 16px;
              border: 1px solid rgba(255,255,255,0.10);
              background: rgba(255,255,255,0.05);
              padding: 10px 12px;
            }

            .breathStepNum{
              width: 26px;
              height: 26px;
              border-radius: 999px;
              display:flex;
              align-items:center;
              justify-content:center;
              font-family: var(--font-title);
              font-weight: 900;
              font-size: 12px;
              border: 1px solid rgba(255,255,255,0.14);
              background: rgba(0,0,0,0.20);
              opacity: .95;
              flex: 0 0 auto;
            }

            .breathStepLabel{
              font-family: var(--font-title);
              font-weight: 900;
              font-size: 12px;
              letter-spacing: .4px;
              text-transform: uppercase;
              opacity: .9;
              margin-bottom: 3px;
            }

            .breathStepText{
              font-size: 13px;
              opacity: .86;
              line-height: 1.25;
            }

            .breathHint{
              margin-top: 10px;
              font-size: 12px;
              opacity: .68;
            }
            .breathHint b{ opacity: .92; }

            .breathProgress{
              margin-top: 8px;
              height: 7px;
              width: 100%;
              border-radius: 999px;
              background: rgba(255,255,255,0.08);
              overflow:hidden;
            }

            .breathProgressFill{
              height: 100%;
              width: 100%;
              transform-origin: left;
              animation: dmrFill 10s linear forwards;
              background: var(--accent);
              opacity: .85;
            }

            @keyframes dmrFill{
              from { transform: scaleX(0); }
              to { transform: scaleX(1); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}