import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function TopMusicPopover({ theme }) {
  const base = import.meta.env.BASE_URL || "/";

  const tracks = useMemo(
    () => [
      { name: "Petrul Coming", src: `${base}assets/track1.mp3` },
      { name: "Petrul.Disco-Funk", src: `${base}assets/track2.mp3` },
      { name: "Petrul.Music.Tiktok", src: `${base}assets/track3.mp3` },
      { name: "Petrul.MEM-COMEDY", src: `${base}assets/track4.mp3` },
      { name: "Petrul Slow Lane Royalty", src: `${base}assets/track5.mp3` },
      { name: "Petrul No Brake Mode", src: `${base}assets/track6.mp3` },
      { name: "BOUNCE LIKE PETRUL", src: `${base}assets/track7.mp3` },
    ],
    [base]
  );

  const audioRef = useRef(null);
  const rafRef = useRef(0);
  const draggingSeekRef = useRef(false);
  const draggingVolRef = useRef(false);

  // PERF refs
  const lastUiUpdateRef = useRef(0);
  const isPageVisibleRef = useRef(true);
  const openRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.8);
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");
  const [dur, setDur] = useState(0);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const clamp01 = (n) => Math.max(0, Math.min(1, n));

  const formatTime = (s) => {
    const n = Math.max(0, Math.floor(s || 0));
    const m = Math.floor(n / 60);
    const ss = String(n % 60).padStart(2, "0");
    return `${m}:${ss}`;
  };

  const setAudioSrc = (i) => {
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
  };

  useEffect(() => {
    setAudioSrc(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = clamp01(vol);
  }, [vol]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    setAudioSrc(idx);

    // idx dəyişəndə playing true isə əvvəlki davranış saxlanır
    if (playing) {
      a.play().catch(() => {
        setStatus("error");
        setErr("Playback blocked by browser. Click Play again.");
        setPlaying(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // Track tab visibility to stop rAF work while hidden
  useEffect(() => {
    const onVis = () => {
      isPageVisibleRef.current = !document.hidden;
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        // resume only if needed
        const a = audioRef.current;
        if (a && !a.paused && openRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(() => {});
          rafRef.current = requestAnimationFrame(function tick(t) {
            const aa = audioRef.current;
            if (!aa) return;

            // only update if popover open + page visible + playing
            if (!openRef.current || !isPageVisibleRef.current || aa.paused) {
              return;
            }

            // 10fps UI update
            if (!draggingSeekRef.current && t - lastUiUpdateRef.current >= 100) {
              lastUiUpdateRef.current = t;
              setPos(aa.currentTime || 0);
            }

            rafRef.current = requestAnimationFrame(tick);
          });
        }
      }
    };

    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const tick = (t) => {
      const aa = audioRef.current;
      if (!aa) return;

      // gate: only run while popover open + page visible + playing
      if (!openRef.current || !isPageVisibleRef.current || aa.paused) return;

      // 10fps UI update (100ms)
      if (!draggingSeekRef.current && t - lastUiUpdateRef.current >= 100) {
        lastUiUpdateRef.current = t;
        setPos(aa.currentTime || 0);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onCanPlay = () => {
      setStatus("ready");
      setDur(a.duration || 0);
    };

    const onEnded = () => setIdx((v) => (v + 1) % tracks.length);

    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(rafRef.current);

      // start only if open + visible
      if (openRef.current && isPageVisibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(rafRef.current);
    };

    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("ended", onEnded);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);

    return () => {
      cancelAnimationFrame(rafRef.current);
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [tracks.length]);

  // If popover closes, stop UI loop (audio can still play)
  useEffect(() => {
    if (!open) {
      cancelAnimationFrame(rafRef.current);
    } else {
      const a = audioRef.current;
      if (a && !a.paused && isPageVisibleRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(function tick(t) {
          const aa = audioRef.current;
          if (!aa) return;
          if (!openRef.current || !isPageVisibleRef.current || aa.paused) return;

          if (!draggingSeekRef.current && t - lastUiUpdateRef.current >= 100) {
            lastUiUpdateRef.current = t;
            setPos(aa.currentTime || 0);
          }
          rafRef.current = requestAnimationFrame(tick);
        });
      }
    }
  }, [open]);

  const setSeekFromPointer = (e) => {
    const a = audioRef.current;
    if (!a || !dur) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const p = clamp01((e.clientX - rect.left) / rect.width);
    const t = p * dur;

    setPos(t);
    a.currentTime = t;
  };

  const setVolFromPointer = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = clamp01((e.clientX - rect.left) / rect.width);
    setVol(p);
  };

  const progress = dur > 0 ? clamp01(pos / dur) : 0;
  const activeTrack = tracks[idx];

  const togglePlay = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const a = audioRef.current;
    if (!a) return;

    if (!playing) {
      try {
        setErr("");
        setStatus("loading");
        await a.play();
      } catch {
        setStatus("error");
        setErr("Playback blocked. Click Play again.");
        setPlaying(false);
      }
    } else {
      a.pause();
    }
  };

  const next = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIdx((v) => (v + 1) % tracks.length);
  };

  const prev = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIdx((v) => (v - 1 + tracks.length) % tracks.length);
  };

  return (
    <div className="topPlayer" onPointerDown={(e) => e.stopPropagation()}>
      <audio ref={audioRef} preload="auto" />

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

              {/* PROGRESS (ARTIQ ORB YOXDUR) */}
              <div
                className="mpProgress"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  draggingSeekRef.current = true;
                  e.currentTarget.setPointerCapture?.(e.pointerId);

                  setSeekFromPointer(e);
                }}
                onPointerMove={(e) => {
                  if (!draggingSeekRef.current) return;
                  setSeekFromPointer(e);
                }}
                onPointerUp={(e) => {
                  draggingSeekRef.current = false;
                  e.currentTarget.releasePointerCapture?.(e.pointerId);
                }}
                onPointerCancel={(e) => {
                  draggingSeekRef.current = false;
                  e.currentTarget.releasePointerCapture?.(e.pointerId);
                }}
                onPointerLeave={() => {
                  draggingSeekRef.current = false;
                }}
              >
                <div className="mpProgressBg" />
                <motion.div
                  className="mpProgressFill"
                  animate={{ width: `${Math.round(progress * 100)}%` }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  style={{
                    boxShadow: `0 0 18px ${theme?.glow || "rgba(255,255,255,0.2)"}`,
                  }}
                />
              </div>

              <div className="mpControls">
                <button className="mpBtn" onPointerDown={prev}>
                  ◀
                </button>

                <button
                  className={`mpPlay ${playing ? "on" : ""}`}
                  onPointerDown={togglePlay}
                >
                  {playing ? "❚❚" : "▶"}
                </button>

                <button className="mpBtn" onPointerDown={next}>
                  ▶
                </button>
              </div>

              <a
                className="mpDownloadBtn"
                href={activeTrack.src}
                download={`${activeTrack.name.toLowerCase().replace(/\s+/g, "-")}.mp3`}
                target="_blank"
                rel="noreferrer"
                onPointerDown={(e) => e.stopPropagation()}
              >
                ⬇ Download
              </a>

              <div className="mpVol">
                <div className="mpVolLabel">VOLUME</div>

                <div
                  className="mpVolTrack"
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
                  onPointerUp={() => {
                    draggingVolRef.current = false;
                  }}
                  onPointerCancel={() => {
                    draggingVolRef.current = false;
                  }}
                  onPointerLeave={() => {
                    draggingVolRef.current = false;
                  }}
                >
                  <motion.div
                    className="mpVolFill"
                    animate={{
                      width: `${Math.round(clamp01(vol) * 100)}%`,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 22,
                    }}
                    style={{
                      boxShadow: `0 0 18px ${theme?.glow || "rgba(255,255,255,0.2)"}`,
                    }}
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