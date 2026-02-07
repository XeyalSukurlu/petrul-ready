// src/utils/journey.js

const KEYS = {
  DAYS: "petrul_journey_days_v1",
  STREAK: "petrul_journey_streak_v1",
  LAST_DAY: "petrul_journey_last_day_v1",
};

export function getLocalDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function markToday() {
  const today = getLocalDateKey();
  const lastDay = localStorage.getItem(KEYS.LAST_DAY);
  const streak = Number(localStorage.getItem(KEYS.STREAK) || "0");

  let days = JSON.parse(localStorage.getItem(KEYS.DAYS) || "[]");

  // Add today if not already present
  if (!days.includes(today)) {
    days.push(today);
  }

  // Keep only last 14 days
  days = days.slice(-14);

  localStorage.setItem(KEYS.DAYS, JSON.stringify(days));

  // Update streak
  if (lastDay) {
    const last = new Date(lastDay);
    const now = new Date(today);
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      localStorage.setItem(KEYS.STREAK, String(streak + 1));
    } else if (diffDays > 1) {
      localStorage.setItem(KEYS.STREAK, "1");
    }
  } else {
    localStorage.setItem(KEYS.STREAK, "1");
  }

  localStorage.setItem(KEYS.LAST_DAY, today);
}

export function getJourneyDays() {
  return JSON.parse(localStorage.getItem(KEYS.DAYS) || "[]");
}

export function getStreak() {
  return Number(localStorage.getItem(KEYS.STREAK) || "0");
}