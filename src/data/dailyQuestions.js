export const dailyQuestions = [
  "Would you rather be right or happy today?",
  "What would you do today if you weren’t afraid?",
  "What are you grateful for today?",
  "Do you say “no” more to yourself or to others?",
  "Which thought could you let go of today?",
  "Are you living life, or are you waiting?",
  "Whom could you show more understanding to today?",
  "Are you living the way you love yourself?",
  "What do you truly need today?",
  "What are you trying to prove today?",
  "What does your peace depend on?",
  "What small thing could make you happy today?",
  "Who do you want to be — or who are you afraid to become?",
  "What would happen if you changed one thing today?",
  "For whom could you be better today?",
  "Are you hard on yourself or compassionate?",
  "What could you say “enough” to today?",
  "Are you living in the present moment or carrying the past?",
  "What could you take more lightly today?",
  "Do you control your fear, or does it control you?",
  "Whose light could you be today?",
  "Do you want to be free or to be right?",
  "What are you truly choosing today?",
  "Can you listen to the silence?",
  "Could you release a burden today?",
  "What do you expect from life — or what do you dare to do?",
  "Who do you want to become more today?",
  "Where are you rushing to?",
  "What is enough for you today?",
  "Do you love life today?",
  "What are you holding onto too tightly?",
  "What can you feel calm about today?",
  "Whose voice are you carrying inside you?",
  "Could you forgive something today?",
  "What are you running from?",
  "Will you do something good for yourself today?",
  "Who were you born to be?",
  "What can make you smile today?",
  "Do you believe in yourself?",
  "Which burden no longer belongs to you today?",
  "Do you truly know yourself?",
  "How could you do something kind for someone today?",
  "Are you controlling your past, or is it controlling you?",
  "What could you let go of to feel lighter today?",
  "What are you searching for in life?",
  "What could you remain silent about today?",
  "Are you speaking your truth?",
  "Which thought is not serving you today?",
  "When do you stand up for yourself?",
  "Could you choose one fear and face it today?",
  "Whose approval are you waiting for?",
  "What promise are you making to yourself today?",
  "What are you ready to change?",
  "What could you accept today?",
  "What have you forgotten to be grateful for?",
  "To whom could you be kinder today?",
  "What do you think about too much?",
  "How do you want to feel today?",
  "For whom are you living your life?",
  "Would you feel free if you gave up something today?",
  "Do you accept the present moment?",
  "What could you be patient about today?",
  "Are you afraid of your own silence?",
  "Which memory is affecting you today?",
  "What do you truly want?",
  "How did you treat yourself today?",
  "What are you hiding?",
  "Which decision could set you free today?",
  "Do you forgive yourself?",
  "What could you lighten today?",
  "What are you holding onto in life?",
  "For whom could you be good today?",
  "What are you trying to control?",
  "What could you feel at ease about today?",
  "Who are you afraid of becoming?",
  "Which moment gave you strength today?",
  "Do you respect yourself?",
  "What would you like to change today?",
  "What are you hurt by?",
  "Whom could you thank today?",
  "Have you chosen your own path?",
  "Which word do you need today?",
  "What are you waiting for?",
  "What can you give thanks for today?",
  "Can you accept the truth?",
  "Which thought is harming you today?",
  "When do you stop?",
  "Which burden no longer belongs to you today?",
  "Do you listen to your inner voice?",
  "Could you let something go today?",
  "What do you overanalyze?",
  "To whom could you be more understanding today?",
  "How honest are you with yourself?",
  "Which choice would bring you peace today?",
  "What are you worried about?",
  "What can you do for yourself today?",
  "Who do you want to be?",
  "Could you give up something today?",
  "What are you grateful for?",
  "Which thought serves you today?",
  "What can you feel calm about today?",
  "What do you feel grateful for?",
  "Whose light could you be today?",
  "What could you forgive?",
  "How are you treating yourself today?",
  "What are you afraid of?",
  "Could you let something go today?",
  "What are you holding onto too much?",
  "What could you feel at ease about today?",
  "Have you chosen your own path?",
  "What is enough for you today?",
  "What do you want to change?",
  "Which moment woke you up today?",
  "Who do you want to be?",
  "Could you release a burden today?",
  "What are you grateful for?",
  "What will you do for yourself today?",
  "How are you living your life?",
  "What can you feel calm about today?",
  "Do you believe in yourself?",
  "What did life teach you today?",
  "What are you ready to let go of?",
  "Whom could you thank today?",
  "Who do you want to be?",
  "How did you greet life today?",
  // → burada sonra 365 sualı davam etdirəcəyik
];

/** ✅ Optional helpers (istəsən başqa yerdə də istifadə edərsən) */
function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

function gcd(a, b) {
  while (b !== 0) {
    const t = a % b;
    a = b;
    b = t;
  }
  return Math.abs(a);
}

function getLocalDayNumber(d = new Date()) {
  const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor(localMidnight.getTime() / 86400000);
}

export function getDailyQuestionIndex(dayNumber, len = dailyQuestions.length) {
  if (!len) return 0;
  const s = hash32("petrul-question-v1");
  let a = (s % (len - 1)) + 1;
  while (gcd(a, len) !== 1) a = (a + 1) % len || 1;
  const b = hash32("petrul-question-v1-offset") % len;
  return (Math.imul(a, dayNumber) + b) % len;
}

export function getTodayQuestion(d = new Date()) {
  const len = dailyQuestions.length;
  if (!len) return "—";
  const dayNumber = getLocalDayNumber(d);
  const idx = getDailyQuestionIndex(dayNumber, len);
  return dailyQuestions[idx] || "—";
}