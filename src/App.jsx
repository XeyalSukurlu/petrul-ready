import { useEffect, useMemo, useState } from "react";

import BreathRitualOverlay from "./components/BreathRitualOverlay.jsx";
import QuestionOfDayModal from "./components/QuestionOfDayModal.jsx";

import { themes } from "./data/themes.js";
import { dailyQuestions } from "./data/dailyQuestions";
import { storage } from "./utils/storage.js";

import TopBar from "./components/TopBar.jsx";
import TopMusicPopover from "./components/TopMusicPopover.jsx";
import MemeModeOverlay from "./components/MemeModeOverlay.jsx";
import PetrulCompanion from "./components/PetrulCompanion.jsx";
import MoodPulse from "./components/MoodPulse.jsx";
import MemoryBoard from "./components/MemoryBoard.jsx";
import JourneyMap from "./components/JourneyMap.jsx";
import DailyMicroRitualModal from "./components/DailyMicroRitualModal.jsx";

import Hero from "./sections/Hero.jsx";
import About from "./sections/About.jsx";
import MindGameFlow from "./sections/MindGameFlow.jsx";
import Footer from "./sections/Footer.jsx";

function BackgroundArt({ themeId }) {
  return <div className={`bgArt theme${themeId}`} aria-hidden="true" />;
}

/** Non-repeating QOTD until exhausted (works with ANY number of questions) */
const QOD_KEYS = {
  order: "petrul_qod_order_v1",
  pos: "petrul_qod_pos_v1",
  lastDay: "petrul_qod_last_day_v1",
  exhausted: "petrul_qod_exhausted_v1",
};

function getLocalDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadOrInitOrder(n) {
  const rawOrder = localStorage.getItem(QOD_KEYS.order);
  const rawPos = localStorage.getItem(QOD_KEYS.pos);

  let order = null;
  let pos = Number.isFinite(Number(rawPos)) ? Number(rawPos) : 0;

  if (rawOrder) {
    try {
      const parsed = JSON.parse(rawOrder);
      if (Array.isArray(parsed) && parsed.length === n) {
        const seen = new Set();
        let ok = true;
        for (const v of parsed) {
          if (!Number.isInteger(v) || v < 0 || v >= n || seen.has(v)) {
            ok = false;
            break;
          }
          seen.add(v);
        }
        if (ok) order = parsed;
      }
    } catch {
      // ignore
    }
  }

  // If invalid OR question count changed -> reset
  if (!order) {
    order = shuffleInPlace([...Array(n).keys()]);
    pos = 0;
    localStorage.setItem(QOD_KEYS.order, JSON.stringify(order));
    localStorage.setItem(QOD_KEYS.pos, String(pos));
    localStorage.removeItem(QOD_KEYS.exhausted);
  }

  if (!Number.isInteger(pos) || pos < 0) pos = 0;
  if (pos > n) pos = n;

  return { order, pos };
}

/* ✅ Preload helper (for fast theme switching) */
function preloadImages(urls) {
  for (const url of urls) {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }
}

export default function App() {
  const [themeIdx, setThemeIdx] = useState(storage.get("petrul_theme_idx", 0));
  const [memeMode, setMemeMode] = useState(storage.get("petrul_meme_mode", false));

  // ✅ Daily Micro Ritual modal state + trigger token
  const [dmrOpen, setDmrOpen] = useState(false);
  const [dmrToken, setDmrToken] = useState(0);

  // ✅ Modal open/close
  const [showQuestion, setShowQuestion] = useState(false);

  // ✅ Selected question (App decides, Modal only displays)
  const [currentQuestion, setCurrentQuestion] = useState("");

  const theme = useMemo(() => themes[themeIdx % themes.length], [themeIdx]);
  const themeId = theme.id;

  useEffect(() => storage.set("petrul_theme_idx", themeIdx), [themeIdx]);
  useEffect(() => storage.set("petrul_meme_mode", memeMode), [memeMode]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", theme.accent);
    document.documentElement.style.setProperty("--glow", theme.glow);
    document.documentElement.style.setProperty("--text", theme.text);
    document.documentElement.style.setProperty("--muted", theme.muted);
    document.documentElement.style.setProperty("--font-title", theme.titleFont);
    document.documentElement.style.setProperty("--font-body", theme.bodyFont);
  }, [theme]);

  /* ✅ Preload ALL theme backgrounds once (so switch has zero lag)
     Assumption: your theme backgrounds are /assets/bg1.webp ... bg5.webp
     If you have more, add them here. */
  useEffect(() => {
    const run = () => {
      preloadImages([
        "/assets/bg1.webp",
        "/assets/bg2.webp",
        "/assets/bg3.webp",
        "/assets/bg4.webp",
        "/assets/bg5.webp",
        "/assets/mascot-dance.webm" 
      ]);
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(run, { timeout: 2000 });
    } else {
      setTimeout(run, 800);
    }
  }, []);

  const switchDesign = () => setThemeIdx((i) => (i + 1) % themes.length);

  // ✅ Breath ends -> show 1 new question per day, non-repeating until exhausted
  const handleBreathComplete = () => {
    const n = Array.isArray(dailyQuestions) ? dailyQuestions.length : 0;
    if (n <= 0) return;

    if (localStorage.getItem(QOD_KEYS.exhausted) === "1") return;

    const today = getLocalDateKey();
    const lastDay = localStorage.getItem(QOD_KEYS.lastDay);
    if (lastDay === today) return; // already shown today

    const { order, pos } = loadOrInitOrder(n);

    if (pos >= order.length) {
      localStorage.setItem(QOD_KEYS.exhausted, "1");
      localStorage.setItem(QOD_KEYS.lastDay, today);
      return;
    }

    const qIdx = order[pos];

    localStorage.setItem(QOD_KEYS.pos, String(pos + 1));
    localStorage.setItem(QOD_KEYS.lastDay, today);

    setCurrentQuestion(String(dailyQuestions[qIdx] ?? ""));
    setShowQuestion(true);
  };

  useEffect(() => {
    const onVis = () => {
      document.body.classList.toggle("paused", document.hidden);
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <>
      <div className="app">
        <div className="appRoot">
          <BackgroundArt themeId={themeId} />
          <div className="bgVeil" />

          <TopBar
            themeName={theme.name}
            onSwitchDesign={switchDesign}
            memeMode={memeMode}
            onToggleMeme={() => setMemeMode((v) => !v)}
            rightSlot={<TopMusicPopover theme={theme} />}
            onOpenDMR={() => setDmrOpen(true)}
          />

          <PetrulCompanion
  anchor="middle"
  src="/assets/mascot2.webp"
  minDelayMs={3000}
  maxDelayMs={6000}
/>

          <BreathRitualOverlay onComplete={handleBreathComplete} manualToken={dmrToken} />

          <QuestionOfDayModal
            open={showQuestion}
            onClose={() => setShowQuestion(false)}
            question={currentQuestion}
          />

          <DailyMicroRitualModal
            open={dmrOpen}
            onClose={() => setDmrOpen(false)}
            onStart={() => {
              setDmrOpen(false);
              setTimeout(() => setDmrToken((n) => n + 1), 120);
            }}
          />

          <MemeModeOverlay enabled={memeMode} theme={theme} themeId={themeId} />

          <main className="main">
            <Hero />
            <MoodPulse />
            <MemoryBoard />
            <JourneyMap />
            <MindGameFlow theme={theme} />
            <About />
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}