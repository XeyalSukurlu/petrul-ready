// src/components/MoodPulse.jsx
import { useEffect, useMemo, useState } from "react";
import { MOODS, getLast7Days, getLocalDateKey, getMoodForDay, setMoodToday } from "../utils/moodHistory";

function describeDay(dayKey) {
  const today = new Date();
  const target = new Date(dayKey);

  const diffDays = Math.floor((today - target) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function MoodPulse() {
  const todayKey = useMemo(() => getLocalDateKey(), []);
  const [todayMood, setTodayMood] = useState(() => getMoodForDay(todayKey));
  const [days, setDays] = useState(() => getLast7Days());

  // visible hover label for timeline dots
  const [hoverLabel, setHoverLabel] = useState("");

  useEffect(() => {
    const refresh = () => {
      setTodayMood(getMoodForDay(getLocalDateKey()));
      setDays(getLast7Days());
    };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const pick = (id) => {
    setMoodToday(id);
    setTodayMood(id);
    setDays(getLast7Days());
  };

  const moodLabel = (moodId) => MOODS.find((m) => m.id === moodId)?.label || "No mood";

  return (
    <>
      <style>{`
        .moodPulseWrap{
          position: relative;
          display: flex;
          justify-content: center;
          padding: 8px 14px 0;
          z-index: 5;
        }
        .moodPulseCard{
          width: min(820px, calc(100% - 12px));
          border-radius: 18px;

          /* ✅ Welcome-like glass (less blur, more transparency) */
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(10,10,12,0.22);
          backdrop-filter: blur(6px);
          box-shadow: 0 14px 40px rgba(0,0,0,0.30);

          padding: 10px 12px;
        }
        .moodPulseTop{
          display:flex;
          align-items:center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .moodPulseTitle{
          font-family: var(--font-title);
          font-weight: 700;
          letter-spacing: .5px;
          font-size: 12px;
          text-transform: uppercase;
          opacity: .82;
        }

        .moodRow{
          display:flex;
          gap: 10px;
          align-items:center;
        }

        /* ✅ THESE are the 4 template emojis (top row) */
        .moodBtn{
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          transition: transform 140ms ease, background 140ms ease, border 140ms ease, box-shadow 140ms ease;
          user-select:none;
          transform: scale(1);
        }

        /* ✅ hover -> BIGGER (this is what you wanted) */
        .moodBtn:hover{
          transform: scale(1.18);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 16px rgba(0,0,0,0.28), 0 0 18px var(--glow);
        }

        .moodBtnActive{
          border: 1px solid rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.10);
        }

        .timeline{
          margin-top: 10px;
          display:flex;
          align-items:center;
          gap: 8px;
          overflow: hidden;
          justify-content: flex-end; /* today on the right */
        }

        /* Timeline dots should NOT scale on hover anymore */
        .dayDot{
          width: 34px;
          height: 26px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size: 15px;
          opacity: .92;
          position: relative;
        }

        .dayDotToday{
          border: 1px solid rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.10);
          box-shadow: 0 0 14px var(--glow);
        }

        .dayDotToday::after{
          content: "TODAY";
          position: absolute;
          top: -10px;
          right: -8px;
          font-size: 9px;
          letter-spacing: .6px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18);

          /* ✅ slightly more transparent like Welcome */
          background: rgba(10,10,12,0.62);

          color: var(--text, #fff);
          opacity: .9;
          transform: scale(.92);
        }

        .dayDotEmpty{
          opacity: .35;
        }

        .hint{
          margin-top: 8px;
          font-family: var(--font-body);
          font-size: 12px;
          opacity: .70;
          display:flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .hoverReadout{
          font-family: var(--font-body);
          font-size: 12px;
          opacity: .82;
        }
        .hoverReadout b{ opacity: .95; }
      `}</style>

      <div className="moodPulseWrap">
        <div className="moodPulseCard">
          <div className="moodPulseTop">
            <div className="moodPulseTitle">Quick Mood • last 7 days</div>

            <div className="moodRow" aria-label="Choose your mood">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`moodBtn ${todayMood === m.id ? "moodBtnActive" : ""}`}
                  onClick={() => pick(m.id)}
                  title={m.label}
                  aria-label={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="timeline" aria-label="Mood timeline last 7 days">
            {days.map((d, idx) => {
              const mood = MOODS.find((m) => m.id === d.mood);

              // today is the LAST element (today on the right)
              const isToday = idx === days.length - 1;

              const label = `${describeDay(d.day)} • ${moodLabel(d.mood)}`;

              return (
                <div
                  key={d.day}
                  className={`dayDot ${d.mood ? "" : "dayDotEmpty"}`}
                  title={label}
                  onMouseEnter={() => setHoverLabel(label)}
                  onMouseLeave={() => setHoverLabel("")}
                >
                  {mood?.emoji || "·"}
                </div>
              );
            })}
          </div>

          <div className="hint">
            <span>Pick a mood in one tap. Petrul will remember it for today ✨</span>
            <span className="hoverReadout">
              {hoverLabel ? (
                <>
                  Hover: <b>{hoverLabel}</b>
                </>
              ) : (
                <>
                  Hover a day to see <b>Today / Yesterday / X days ago</b>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}