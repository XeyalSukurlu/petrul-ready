// src/utils/mindXP.js

const KEYS = {
  XP: "petrul_mind_xp_v1",
  LEVEL: "petrul_mind_level_v1",
  LAST_DAY: "petrul_mind_last_day_v1",
};

export function getLocalDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function awardDailyXP() {
  const today = getLocalDateKey();
  const lastDay = localStorage.getItem(KEYS.LAST_DAY);

  let xp = Number(localStorage.getItem(KEYS.XP) || "0");
  let level = Number(localStorage.getItem(KEYS.LEVEL) || "1");

  if (lastDay !== today) {
    xp += 10; // daily bonus
    localStorage.setItem(KEYS.XP, String(xp));

    // every 100 XP = new level
    if (xp >= level * 100) {
      level += 1;
      localStorage.setItem(KEYS.LEVEL, String(level));
    }

    localStorage.setItem(KEYS.LAST_DAY, today);
  }
}

export function getXP() {
  return Number(localStorage.getItem(KEYS.XP) || "0");
}

export function getLevel() {
  return Number(localStorage.getItem(KEYS.LEVEL) || "1");
}