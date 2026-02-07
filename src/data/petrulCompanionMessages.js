// src/data/petrulCompanionMessages.js

/**
 * Petrul Companion — Daily lines
 * - English only
 * - Rotates once per local day
 * - Non-repeating until exhausted (then reshuffles)
 */

export const PETRUL_COMPANION_LINES = [
  "Hey—breathe. You’ve been going hard.",
  "Did you drink a glass of water today?",
  "Did you eat something real today?",
  "Stand up and roll your shoulders once.",
  "Unclench your jaw. Yes, right now.",
  "What’s one tiny win you can claim today?",
  "Send one kind message to someone.",
  "Have you looked outside for 10 seconds?",
  "Your pace doesn’t define your worth.",
  "If it’s heavy, make it smaller. One step.",
  "Name one thing you’re grateful for.",
  "Did you take a real breath today?",
  "Let your next action be gentle.",
  "Are you thirsty or just scrolling?",
  "Check in: tense or calm?",
  "You don’t have to earn rest.",
  "Text someone: “Thinking of you.”",
  "Have you stretched your neck today?",
  "What would “good enough” look like?",
  "Pause. Exhale longer than you inhale.",
  "Did you speak kindly to yourself today?",
  "Try this: inhale 4, exhale 6.",
  "What’s one thing you can let go of?",
  "Eat, hydrate, then decide.",
  "Your future is built on tiny repeats.",
  "Did you take a short walk today?",
  "Close your eyes for 5 seconds.",
  "What’s one task you can finish in 2 minutes?",
  "You’re allowed to slow down.",
  "Have you smiled at anything today?",
  "One deep breath. I’ll wait.",
  "Did you say “thank you” today?",
  "Your nervous system deserves kindness.",
  "What’s one boundary you can protect today?",
  "Drink water. Then come back.",
  "Did you eat protein today?",
  "Move your hands. Shake out the stress.",
  "If you’re overwhelmed, write the next step only.",
  "Would you talk to a friend the way you talk to you?",
  "Sit up straight—just for 10 seconds.",
  "What’s one thing you did right today?",
  "You can rest without quitting.",
  "Did you check your posture?",
  "Put your phone down for one breath.",
  "Tiny progress is still progress.",
  "Have you had sunlight today?",
  "What’s your energy level: 1 to 10?",
  "If it can wait, let it wait.",
  "Say it out loud: “I’m doing my best.”",
  "Did you drink water today?",
  "Did you compliment someone today?",
  "What’s one thing you can simplify?",
  "Inhale calm. Exhale pressure.",
  "Choose one priority. Ignore the rest.",
  "Are you resting, or just avoiding?",
  "Do one small tidy-up. It helps.",
  "What do you need—food, water, or sleep?",
  "Relax your forehead.",
  "Did you take breaks, or just push through?",
  "You’re not behind. You’re human.",
  "Send love to your future self: do the easy part now.",
  "What’s one kind thing you can do for your body?",
  "Put a hand on your chest. Breathe.",
  "Did you eat slowly today?",
  "Would a 3-minute reset help?",
  "Pick one: stretch, sip, or step outside.",
  "You can restart the day at any moment.",
  "What’s one thought you can soften?",
  "You don’t need permission to rest.",
  "Did you learn something small today?",
  "Your attention is expensive—spend it wisely.",
  "If it’s not a “yes,” it’s a “no.”",
  "What’s one thing you can forgive yourself for?",
  "Drink water—your brain will thank you.",
  "Try box breathing: 4 in, hold 4, out 4, hold 4.",
  "Are you tense? Drop your shoulders.",
  "What’s one thing you can do in under 5 minutes?",
  "You’ve survived every hard day so far.",
  "Did you say something kind today?",
  "Close one tab. Clear one thought.",
  "Your mind needs pauses to stay sharp.",
  "Did you celebrate any progress today?",
  "One slow inhale. One slower exhale.",
  "What’s one thing you can postpone safely?",
  "Eat something warm if you can.",
  "You’re doing more than you notice.",
  "Are you chasing perfection or peace?",
  "Hydrate. Then reassess.",
  "Give your eyes a break: look far away.",
  "What’s one thing you’re proud of this week?",
  "If it’s heavy, share it.",
  "Did you ask for help when you needed it?",
  "Be on your own side today.",
  "What’s one thing you can stop doing?",
  "Check in: hungry, angry, lonely, tired?",
  "Do one gentle stretch right now.",
  "Small kindnesses change your mood.",
  "You’re allowed to be a work in progress.",
  "One step. Then another. That’s the game.",
  "Hey—thank you for showing up today.",
];

const PETRUL_COMPANION_KEYS = {
  order: "petrul_companion_order_v1",
  pos: "petrul_companion_pos_v1",
  lastDay: "petrul_companion_last_day_v1",
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
  const rawOrder = localStorage.getItem(PETRUL_COMPANION_KEYS.order);
  const rawPos = localStorage.getItem(PETRUL_COMPANION_KEYS.pos);

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

  if (!order) {
    order = shuffleInPlace([...Array(n).keys()]);
    pos = 0;
    localStorage.setItem(PETRUL_COMPANION_KEYS.order, JSON.stringify(order));
    localStorage.setItem(PETRUL_COMPANION_KEYS.pos, String(pos));
  }

  if (!Number.isInteger(pos) || pos < 0) pos = 0;
  if (pos >= n) pos = 0;

  return { order, pos };
}

/**
 * Returns today's line (changes once per local day, non-repeating until cycle completes).
 */
export function getTodayCompanionLine() {
  const n = PETRUL_COMPANION_LINES.length;
  if (n <= 0) return "";

  const today = getLocalDateKey();
  const lastDay = localStorage.getItem(PETRUL_COMPANION_KEYS.lastDay);

  const todayKey = `petrul_companion_today_${today}`;
  const cached = localStorage.getItem(todayKey);
  if (cached) {
    const idx = Number(cached);
    if (Number.isInteger(idx) && idx >= 0 && idx < n) return PETRUL_COMPANION_LINES[idx];
  }

  const { order, pos } = loadOrInitOrder(n);

  if (lastDay !== today) {
    const idx = order[pos];

    localStorage.setItem(PETRUL_COMPANION_KEYS.pos, String((pos + 1) % n));
    localStorage.setItem(PETRUL_COMPANION_KEYS.lastDay, today);
    localStorage.setItem(todayKey, String(idx));

    return PETRUL_COMPANION_LINES[idx] ?? "";
  }

  const prevPos = (pos - 1 + n) % n;
  const idx = order[prevPos];
  localStorage.setItem(todayKey, String(idx));
  return PETRUL_COMPANION_LINES[idx] ?? "";
}

/* ✅ NEW: random bonus line (for easter eggs) */
export function getRandomCompanionLine(exclude = "") {
  const n = PETRUL_COMPANION_LINES.length;
  if (n <= 0) return "";
  const ex = String(exclude || "").trim();
  // try a few times to avoid repeating the same line
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * n);
    const s = PETRUL_COMPANION_LINES[idx] ?? "";
    if (s && s !== ex) return s;
  }
  // fallback
  return PETRUL_COMPANION_LINES[Math.floor(Math.random() * n)] ?? "";
}

/* ✅ NEW: stable "egg of the day" (same for today, changes tomorrow) */
export function getEggLineForToday() {
  const n = PETRUL_COMPANION_LINES.length;
  if (n <= 0) return "";
  const today = getLocalDateKey();
  const key = `petrul_companion_egg_${today}`;
  const cached = localStorage.getItem(key);
  if (cached) return cached;

  const line = getRandomCompanionLine(getTodayCompanionLine());
  localStorage.setItem(key, line);
  return line;
}