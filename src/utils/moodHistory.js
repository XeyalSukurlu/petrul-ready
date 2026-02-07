// src/utils/moodHistory.js

const KEY = "petrul_mood_history_v1"; // [{ day: "YYYY-MM-DD", mood: "happy" }]

export const MOODS = [
  { id: "happy", emoji: "🙂", label: "Happy" },
  { id: "normal", emoji: "😐", label: "Neutral" },
  { id: "tired", emoji: "😔", label: "Tired" },
  { id: "stressed", emoji: "😡", label: "Stressed" },
];

export function getLocalDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function safeParse(raw) {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function readMoodHistory() {
  const raw = localStorage.getItem(KEY);
  const items = safeParse(raw);

  // sanitize
  const okMood = new Set(MOODS.map((m) => m.id));
  return items
    .filter((x) => x && typeof x.day === "string" && okMood.has(x.mood))
    .slice(-60); // keep last 60 days max
}

export function getMoodForDay(dayKey) {
  const items = readMoodHistory();
  const found = items.find((x) => x.day === dayKey);
  return found?.mood || "";
}

export function setMoodToday(moodId) {
  const okMood = new Set(MOODS.map((m) => m.id));
  if (!okMood.has(moodId)) return;

  const today = getLocalDateKey();
  const items = readMoodHistory();

  const next = items.filter((x) => x.day !== today);
  next.push({ day: today, mood: moodId });

  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getLast7Days() {
  const items = readMoodHistory();
  const map = new Map(items.map((x) => [x.day, x.mood]));

  const out = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = getLocalDateKey(d);
    out.push({ day: key, mood: map.get(key) || "" });
  }
  return out;
}