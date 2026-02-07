// src/components/JourneyMap.jsx
import { useEffect, useMemo, useState } from "react";
import { getJourneyDays, getStreak, markToday, getLocalDateKey } from "../utils/journey";
import { awardDailyXP, getXP, getLevel } from "../utils/mindXP";

export default function JourneyMap() {
  const [days, setDays] = useState(getJourneyDays());
  const [streak, setStreak] = useState(getStreak());

  // ✅ merged mini evolution stats
  const [xp, setXP] = useState(getXP());
  const [level, setLevel] = useState(getLevel());

  useEffect(() => {
    // Journey check-in
    markToday();
    setDays(getJourneyDays());
    setStreak(getStreak());

    // Mini XP (no extra card anymore)
    awardDailyXP();
    setXP(getXP());
    setLevel(getLevel());
  }, []);

  const last14 = useMemo(() => {
    return [...Array(14)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return getLocalDateKey(d);
    });
  }, []);

  const progress = Math.min(100, xp % 100); // 0..99

  return (
    <>
      <style>{`
        .journeyWrap{
          display:flex;
          justify-content:center;
          padding: 10px 14px 0;
          z-index: 4;
          position: relative;
        }
        .journeyCard{
          width: min(820px, calc(100% - 12px));
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(10,10,12,0.22);
          backdrop-filter: blur(6px);
          padding: 12px;
          box-shadow: 0 14px 40px rgba(0,0,0,0.30);
        }
        .journeyTop{
          display:flex;
          justify-content: space-between;
          align-items:center;
          gap: 10px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .journeyTitle{
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 12px;
          letter-spacing: .5px;
          text-transform: uppercase;
          opacity: .82;
        }
        .rightStats{
          display:flex;
          align-items:center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .streak{
          font-family: var(--font-title);
          font-size: 13px;
          font-weight: 800;
          color: var(--accent);
          opacity: .95;
        }
        .miniEvo{
          font-family: var(--font-title);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .3px;
          opacity: .9;
          color: var(--text, #fff);
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          padding: 6px 10px;
          border-radius: 999px;
        }

        .grid{
          display:flex;
          gap: 6px;
          justify-content:center;
        }
        .dot{
          width: 28px;
          height: 22px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size: 12px;
        }
        .dotActive{
          border: 1px solid rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.10);
          box-shadow: 0 0 10px var(--glow);
        }

        .miniBarWrap{
          margin-top: 10px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          overflow:hidden;
        }
        .miniBar{
          height: 100%;
          width: ${progress}%;
          background: var(--accent);
          transition: width 400ms ease;
        }

        .hint{
          margin-top: 8px;
          font-size: 12px;
          opacity: .70;
          text-align:center;
        }
      `}</style>

      <div className="journeyWrap">
        <div className="journeyCard">
          <div className="journeyTop">
            <div className="journeyTitle">Petrul Journey • Last 14 days</div>

            <div className="rightStats">
              <div className="miniEvo">Level {level} • {xp} XP</div>
              <div className="streak">🔥 {streak}-day streak</div>
            </div>
          </div>

          <div className="grid">
            {last14.map((d) => (
              <div
                key={d}
                className={`dot ${days.includes(d) ? "dotActive" : ""}`}
                title={d}
              >
                {days.includes(d) ? "✓" : "·"}
              </div>
            ))}
          </div>

          <div className="miniBarWrap" aria-hidden="true">
            <div className="miniBar" />
          </div>

          <div className="hint">
            Return tomorrow to keep your streak alive ✨
          </div>
        </div>
      </div>
    </>
  );
}