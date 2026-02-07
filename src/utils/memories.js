// src/utils/memories.js

const KEY = "petrul_memories_v1";
const MAX = 20;

function safeParse(raw) {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function readMemories() {
  const raw = localStorage.getItem(KEY);
  const items = safeParse(raw);

  return items
    .filter((x) => x && typeof x.id === "string" && typeof x.text === "string" && typeof x.ts === "number")
    .sort((a, b) => b.ts - a.ts)
    .slice(0, MAX);
}

export function addMemory(text) {
  const t = String(text || "").trim();
  if (!t) return;

  const now = Date.now();
  const item = {
    id: `${now}_${Math.random().toString(16).slice(2)}`,
    text: t.slice(0, 140),
    ts: now,
  };

  const cur = readMemories();
  const next = [item, ...cur].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
  return item;
}

export function deleteMemory(id) {
  const cur = readMemories();
  const next = cur.filter((x) => x.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function formatDate(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}