import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function TopMusicPopover({ theme }) {
  const base = import.meta.env.BASE_URL || "/";

  const tracks = useMemo(
    () => [
      { name: "Track 1", src: `${base}assets/track1.mp3` },
      { name: "Track 2", src: `${base}assets/track2.mp3` },
      { name: "Track 3", src: `${base}assets/track3.mp3` },
      { name: "Track 4", src: `${base}assets/track4.mp3` },
      { name: "Track 5", src: `${base}assets/track5.mp3` },
      { name: "Track 6", src: `${base}assets/track6.mp3` },
      { name: "Track 7", src: `${base}assets/track7.mp3` },
    ],
    [base]
  );

  const audioRef = useRef(null);
  const rafRef = useRef(0);
  const draggingSeekRef = useRef(false);
  const draggingVolRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.8);

  // idle | loading | ready | error
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");

  const [dur, setDur] = useState(0);
  const [pos, setPos] = useState(0);

  const clamp01 = useCallback(
    (n) => Math.max(0, Math.min(1, n)),
    []
  );

  const formatTime = useCallback((s) => {
    const n = Math.max(0, Math.floor(s || 0));
    const m = Math.floor(n / 60);
    const ss = String(n % 60).padStart(2, "0");
    return `${m}:${ss}`;
  }, []);

  const setAudioSrc = useCallback(
    (i) => {
      const a = audioRef.current;
      if (!a) return;

      setErr("");
      setStatus("loading");
      setDur(0);
      setPos(0);

      try {
        a.pause();
        a.currentTime = 0;
      } catch {}

      a.src = tracks[i]?.src || "";
      a.load();
    },
    [tracks]
  );

  // ---- VOLUME SYNC ----
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = clamp01(vol);
  }, [vol, clamp01]);

  // ---- TRACK CHANGE (DEFERRED LOAD) ----
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const desired = tracks[idx]?.src || "";
    const alreadyLoaded = Boolean(a.currentSrc || a.src);

    if (open || playing || alreadyLoaded) {
      if (a.currentSrc !== desired && a.src !== desired) {
        setAudioSrc(idx);
      }

      if (playing) {
        a.play().catch(() => {
          setStatus("error");
          setErr("Playback blocked by browser. Click Play again.");
          setPlaying(false);
        });
      }
    }
  }, [idx, open, playing, tracks, setAudioSrc]);

  // ---- AUDIO EVENTS + PROGRESS (OPTIMIZED RAF) ----
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const tick = () => {
      if (!draggingSeekRef.current) {
        setPos(a.currentTime || 0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const onLoadStart = () => setStatus("loading");
    const onLoadedMeta = () => setDur(a.duration || 0);

    const onCanPlay = () => {
      setStatus("ready");
      setDur(a.duration || 0);
    };

    const onEnded = () => setIdx((v) => (v + 1) % tracks.length);

    const onError = () => {
      setStatus("error");
      setPlaying(false);
      const src = a.currentSrc || a.src || "";
      setErr(`Audio load failed: ${src}`);
    };

    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(rafRef.current);
    };

    a.addEventListener("loadstart", onLoadStart);
    a.addEventListener("loadedmetadata", onLoadedMeta);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);

    return () => {
      cancelAnimationFrame(rafRef.current);
      a.removeEventListener("loadstart", onLoadStart);
      a.removeEventListener("loadedmetadata", onLoadedMeta);
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [tracks.length]);

  // ---- ESC CLOSE ----
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // ---- GLOBAL POINTERUP (DRAG END) ----
  useEffect(() => {
    const onUp = () => {
      draggingSeekRef.current = false;
      draggingVolRef.current = false;
    };

    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  // ---- SAFE PLAY ----
  const safePlay = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;

    try {
      setErr("");
      setStatus("loading");
      await a.play();
    } catch {
      setStatus("error");
      setErr("Playback blocked by browser policy. Click Play again.");
      setPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(
    async (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();

      const a = audioRef.current;
      if (!a) return;

      if (status === "error") {
        setAudioSrc(idx);
      }

      const desired = tracks[idx]?.src || "";
      if (!a.currentSrc && (!a.src || a.src !== desired)) {
        setAudioSrc(idx);
      }

      if (!playing) {
        await safePlay();
      } else {
        a.pause();
      }
    },
    [idx, playing, safePlay, setAudioSrc, status, tracks]
  );

  const next = useCallback(
    (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      setIdx((v) => (v + 1) % tracks.length);
    },
    [tracks.length]
  );

  const prev = useCallback(
    (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      setIdx((v) => (v - 1 + tracks.length) % tracks.length);
    },
    [tracks.length]
  );

  const progress = dur > 0 ? clamp01(pos / dur) : 0;

  const setSeekFromPointer = useCallback((e) => {
    const a = audioRef.current;
    if (!a || !dur) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const p = clamp01((e.clientX - rect.left) / rect.width);
    const t = p * dur;

    setPos(t);
    a.currentTime = t;
  }, [dur, clamp01]);

  const setVolFromPointer = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = clamp01((e.clientX - rect.left) / rect.width);
    setVol(p);
  }, [clamp01]);

  return (
    <div className="topPlayer" onPointerDown={(e) => e.stopPropagation()}>
      <audio ref={audioRef} preload="none" />

      <button
        type="button"
        className="iconBtn"
        aria-label="Music"
        title="Music"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        ♪
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="topPlayerPopover mysticPlayer mysticPlayerFixed"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              style={{
                borderColor: theme?.glow || "rgba(255,255,255,0.16)",
                boxShadow: `0 0 24px ${theme?.glow || "rgba(0,0,0,0.45)"}`,
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mpHead">
                <div className="mpTitle">PETRUL RADIO</div>
                <button
                  type="button"
                  className="mpClose"
                  aria-label="Close"
                  title="Close"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(false);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="mpTrackLine">
                <div className="mpTrackName">{tracks[idx].name}</div>
                <div className={`mpStatus ${status}`}>
                  {status === "loading" && "Loading…"}
                  {status === "ready" && "Ready"}
                  {status === "idle" && "Idle"}
                  {status === "error" && "Error"}
                </div>
              </div>

              <div
                className="mpTimeRow"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  fontSize: 11,
                  opacity: 0.85,
                }}
              >
                <span>{formatTime(pos)}</span>
                <span>{dur ? formatTime(dur) : "—:—"}</span>
              </div>

              <div
                className="mpProgress"
                role="slider"
                aria-label="Progress"
                aria-valuemin={0}
                aria-valuemax={dur || 0}
                aria-valuenow={pos || 0}
                tabIndex={0}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  draggingSeekRef.current = true;
                  setSeekFromPointer(e);
                }}
                onPointerMove={(e) => {
                  if (!draggingSeekRef.current) return;
                  setSeekFromPointer(e);
                }}
              >
                <div className="mpProgressBg" />
                <motion.div
                  className="mpProgressFill"
                  animate={{ width: `${Math.round(progress * 100)}%` }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  style={{ boxShadow: `0 0 18px ${theme?.glow || "rgba(255,255,255,0.2)"}` }}
                />
                <motion.div
                  className="mpProgressOrb"
                  animate={{ left: `${Math.round(progress * 100)}%`, scale: playing ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  style={{ boxShadow: `0 0 22px ${theme?.glow || "rgba(255,255,255,0.2)"}` }}
                />
              </div>

              <div className="mpControls">
                <button type="button" className="mpBtn" onPointerDown={prev} title="Previous">
                  ◀
                </button>

                <button
                  type="button"
                  className={`mpPlay ${playing ? "on" : ""}`}
                  onPointerDown={togglePlay}
                  title="Play / Pause"
                >
                  <span className="mpPlayGlyph">{playing ? "❚❚" : "▶"}</span>
                  <span className="mpPlayAura" />
                </button>

                <button type="button" className="mpBtn" onPointerDown={next} title="Next">
                  ▶
                </button>
              </div>

              <div className="mpVol">
                <div className="mpVolLabel">VOLUME</div>

                <div
                  className="mpVolTrack"
                  role="slider"
                  aria-label="Volume"
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={vol}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    draggingVolRef.current = true;
                    setVolFromPointer(e);
                  }}
                  onPointerMove={(e) => {
                    if (!draggingVolRef.current) return;
                    setVolFromPointer(e);
                  }}
                >
                  <motion.div
                    className="mpVolFill"
                    animate={{ width: `${Math.round(clamp01(vol) * 100)}%` }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    style={{ boxShadow: `0 0 18px ${theme?.glow || "rgba(255,255,255,0.2)"}` }}
                  />
                </div>

                <input
                  className="mpVolInput"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={vol}
                  onChange={(e) => setVol(Number(e.target.value))}
                />
              </div>

              {status === "error" && <div className="mpErr">{err}</div>}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}