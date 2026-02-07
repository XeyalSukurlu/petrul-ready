import { motion, AnimatePresence } from "framer-motion";
import { dailyQuestions } from "../data/dailyQuestions"; // ✅ buranı öz yoluna uyğun et

/**
 * Petrul Daily Messages (97)
 */
const PETRUL_MESSAGES = [
  "Patience turns pressure into power.",
  "Still water shapes the stone.",
  "Growth is quiet before it is visible.",
  "Your future is built by small acts today.",
  "Silence holds more wisdom than noise.",
  "Courage begins with one calm breath.",
  "Let time work for you, not against you.",
  "You don’t need to rush to arrive.",
  "Healing happens when you slow down.",
  "Peace is strength in disguise.",
  "The right path feels calm, not chaotic.",
  "You are becoming who you are meant to be.",
  "Even small steps change your destiny.",
  "Breathe first, decide second.",
  "Trust the rhythm of your journey.",
  "What you seek is already within you.",
  "Let today soften your heart.",
  "Progress doesn’t need applause.",
  "Stillness is your secret weapon.",
  "Every ending carries a new beginning.",
  "Clarity grows in quiet moments.",
  "You are not behind — you are unfolding.",
  "Release what no longer serves you.",
  "Strength is gentle, not loud.",
  "Your presence is your power.",
  "Rest is a form of productivity.",
  "You don’t need to prove your worth.",
  "Growth feels uncomfortable before it feels good.",
  "Trust the timing of your life.",
  "Small habits build big futures.",
  "You are learning even when you feel lost.",
  "Let the moment guide you.",
  "Your calm will carry you far.",
  "Choose clarity over chaos today.",
  "You are stronger than yesterday.",
  "Stillness creates clarity.",
  "Trust what you cannot yet see.",
  "Every day is a fresh beginning.",
  "Your path is unique — honor it.",
  "Growth begins with self-kindness.",
  "Let go of what weighs you down.",
  "You don’t have to carry everything alone.",
  "Courage is choosing yourself.",
  "Peace is already within reach.",
  "Let your heart lead today.",
  "Your inner voice knows the way.",
  "Transformation starts in silence.",
  "You are not your mistakes.",
  "Growth happens one breath at a time.",
  "The present moment is your power.",
  "Let patience guide your steps.",
  "Trust your inner compass.",
  "You are worthy of peace.",
  "Simplicity brings clarity.",
  "Healing begins when you listen.",
  "You are enough as you are.",
  "Stillness is strength.",
  "Let today be gentle with you.",
  "Your mind deserves rest.",
  "Growth is not always visible.",
  "You are evolving every day.",
  "Let your breath anchor you.",
  "Peace is found, not forced.",
  "Your journey is meaningful.",
  "You are becoming wiser.",
  "Trust your slow growth.",
  "Let go of the need to rush.",
  "Your heart knows the truth.",
  "Calmness is a superpower.",
  "You are building something beautiful.",
  "Healing takes time — that’s okay.",
  "Your presence is enough.",
  "Stillness opens new doors.",
  "Trust yourself more today.",
  "Growth is often silent.",
  "You are not alone in this journey.",
  "Let today bring clarity.",
  "Peace begins within.",
  "You are stronger than fear.",
  "Trust the unseen process.",
  "Your calm shapes your reality.",
  "Let go of perfection.",
  "You are allowed to rest.",
  "Growth is not a race.",
  "Your path is unfolding perfectly.",
  "Trust the timing of change.",
  "You are worthy of joy.",
  "Let today be your reset.",
  "Stillness brings answers.",
  "You are growing in unseen ways.",
  "Your breath is your anchor.",
  "Peace is already yours.",
  "Trust your inner light.",
  "You are becoming your best self.",
  "Let today move you gently forward.",
  "Growth begins with awareness.",
  "You are exactly where you need to be.",
];

/** ✅ Local date key (YYYY-MM-DD) */
function getLocalDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ✅ “Local midnight” day number (storage-dan asılı deyil) */
function getLocalDayNumber(d = new Date()) {
  const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor(localMidnight.getTime() / 86400000);
}

/** ✅ stable hash -> 32bit */
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

/**
 * ✅ Full-cycle “pseudo-random but no repeats until wrap”
 * index = (a*day + b) mod len
 * where gcd(a, len) = 1 => full cycle
 */
function cycleIndex(dayNumber, len, seed = "petrul") {
  if (len <= 0) return 0;

  const s = hash32(seed);
  let a = (s % (len - 1)) + 1; // 1..len-1
  // adjust a to be coprime with len
  while (gcd(a, len) !== 1) a = (a + 1) % len || 1;

  const b = hash32(seed + "-offset") % len;
  return (Math.imul(a, dayNumber) + b) % len;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 12) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  let line = "";
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const w = ctx.measureText(testLine).width;

    if (w > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lineCount++;
      line = words[i];
      if (lineCount >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }

  if (lineCount < maxLines) ctx.fillText(line, x, y);
  return y + lineHeight;
}

function downloadCanvasPNG(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

/** ✅ theme detector for poster + accents */
function getThemeFromDOM() {
  try {
    const bg = document.querySelector(".bgArt");
    if (!bg) return "theme2";
    const cls = bg.className || "";
    const m = cls.match(/theme[1-5]/);
    return m?.[0] || "theme2";
  } catch {
    return "theme2";
  }
}

/** ✅ tiny grain */
function addFilmGrain(ctx, W, H, amount = 0.06) {
  const step = 2;
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.fillStyle = "rgba(255,255,255,1)";
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (Math.random() > 0.92) ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.restore();
}

export default function QuestionOfDayModal({ open, onClose, question: questionProp }) {
  if (!open) return null;

  /** ✅ DAILY selection (storage-a bağlı deyil, hər gün dəyişir, list bitəndə loop edir) */
  const todayKey = getLocalDateKey();
  const dayNumber = getLocalDayNumber();

  const qLen = Array.isArray(dailyQuestions) ? dailyQuestions.length : 0;
  const mLen = PETRUL_MESSAGES.length;

  const qIdx = cycleIndex(dayNumber, qLen, "petrul-question-v1");
  const mIdx = cycleIndex(dayNumber, mLen, "petrul-message-v1");

  // ✅ We enforce daily question here. If your parent still passes a prop, this wins.
  const question = (qLen > 0 ? dailyQuestions[qIdx] : null) || String(questionProp || "").trim() || "—";
  const message = PETRUL_MESSAGES[mIdx] || "Keep going — quietly and steadily.";

  // ✅ One renderer used by both Download + Share
  const renderPoster = async () => {
    const q = String(question || "").trim();
    const m = String(message || "").trim();

    const W = 1080;
    const H = 1920;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return { canvas: null, blob: null, filename: "" };

    ctx.scale(dpr, dpr);

    const white = "#ffffff";
    const theme = getThemeFromDOM();

    const THEME =
      {
        theme1: { a: "rgba(255,179,71,0.90)", b: "rgba(255,120,60,0.55)", bg: "/assets/bg1.jpg" },
        theme2: { a: "rgba(90,220,255,0.92)", b: "rgba(210,120,255,0.58)", bg: "/assets/bg2.jpg" },
        theme3: { a: "rgba(199,210,254,0.90)", b: "rgba(167,139,250,0.55)", bg: "/assets/bg3.jpg" },
        theme4: { a: "rgba(255,140,80,0.90)", b: "rgba(255,60,60,0.55)", bg: "/assets/bg4.jpg" },
        theme5: { a: "rgba(185,255,176,0.88)", b: "rgba(90,220,255,0.48)", bg: "/assets/bg5.jpg" },
      }[theme] || { a: "rgba(90,220,255,0.92)", b: "rgba(210,120,255,0.58)", bg: "/assets/bg2.jpg" };

    let bgImg = null;
    let mascotImg = null;

    try {
      bgImg = await loadImage(THEME.bg);
    } catch {
      try {
        bgImg = await loadImage("/assets/bg2.jpg");
      } catch {
        bgImg = null;
      }
    }

    try {
      mascotImg = await loadImage("/assets/mascot.png");
    } catch {
      mascotImg = null;
    }

    // --- Background cover ---
    if (bgImg) {
      const iw = bgImg.naturalWidth || bgImg.width || 1;
      const ih = bgImg.naturalHeight || bgImg.height || 1;
      const s = Math.max(W / iw, H / ih);
      const dw = iw * s;
      const dh = ih * s;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;

      ctx.save();
      ctx.filter = "brightness(1.18) contrast(1.12) saturate(1.28)";
      ctx.drawImage(bgImg, dx, dy, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    }

    // neon mist overlay
    const mist = ctx.createRadialGradient(W * 0.2, H * 0.22, 80, W * 0.2, H * 0.22, 900);
    mist.addColorStop(0, THEME.a);
    mist.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.20;
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    const mist2 = ctx.createRadialGradient(W * 0.82, H * 0.26, 90, W * 0.82, H * 0.26, 980);
    mist2.addColorStop(0, THEME.b);
    mist2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = mist2;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    // readability veil
    const overlay = ctx.createLinearGradient(0, 0, 0, H);
    overlay.addColorStop(0, "rgba(0,0,0,0.26)");
    overlay.addColorStop(0.55, "rgba(0,0,0,0.34)");
    overlay.addColorStop(1, "rgba(0,0,0,0.46)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, W, H);

    // vignette
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.55, 420, W * 0.5, H * 0.6, 1300);
    vig.addColorStop(0, "rgba(0,0,0,0.00)");
    vig.addColorStop(1, "rgba(0,0,0,0.26)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // grain
    addFilmGrain(ctx, W, H, 0.065);

    // --- Title ---
    ctx.textAlign = "center";
    ctx.fillStyle = white;
    ctx.font = "900 66px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Petrul — Message of the Day", W / 2, 175);

    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.font = "650 34px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText(todayKey, W / 2, 230);

    // --- Card ---
    const cardX = 90;
    const cardY = 320;
    const cardW = W - 180;
    const cardH = 1120;
    const r = 34;

    // shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.62)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = "rgba(0,0,0,0.50)";
    roundRectPath(ctx, cardX, cardY + 10, cardW, cardH, r);
    ctx.fill();
    ctx.restore();

    // premium neon glass bg
    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    cardGrad.addColorStop(0, "rgba(255,255,255,0.10)");
    cardGrad.addColorStop(0.35, "rgba(90,220,255,0.06)");
    cardGrad.addColorStop(0.70, "rgba(210,120,255,0.06)");
    cardGrad.addColorStop(1, "rgba(255,255,255,0.03)");
    ctx.fillStyle = cardGrad;
    roundRectPath(ctx, cardX, cardY, cardW, cardH, r);
    ctx.fill();

    // gradient border
    ctx.save();
    ctx.lineWidth = 3;
    const stroke = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
    stroke.addColorStop(0, THEME.a);
    stroke.addColorStop(0.55, "rgba(255,255,255,0.18)");
    stroke.addColorStop(1, THEME.b);
    ctx.strokeStyle = stroke;
    roundRectPath(ctx, cardX, cardY, cardW, cardH, r);
    ctx.stroke();
    ctx.restore();

    // inner highlight
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    roundRectPath(ctx, cardX + 8, cardY + 8, cardW - 16, cardH - 16, r - 6);
    ctx.stroke();

    // paddings
    const pad = 56;
    const x = cardX + pad;
    const maxW = cardW - pad * 2;
    let y = cardY + pad;

    // QUESTION header
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.58)";
    ctx.font = "850 26px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("QUESTION OF THE DAY", x, y);
    y += 52;

    // Question text
    ctx.fillStyle = white;
    ctx.font = "950 56px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    y = wrapText(ctx, q || "—", x, y, maxW, 66, 5);

    // Mascot
    if (mascotImg) {
      const centerX = cardX + cardW / 2;
      const centerY = cardY + 680;

      const targetH = 620;
      const scale = targetH / mascotImg.height;
      const drawW = mascotImg.width * scale;
      const drawH = mascotImg.height * scale;

      const mx = centerX - drawW / 2;
      const my = centerY - drawH / 2;

      ctx.save();
      ctx.shadowColor = THEME.a;
      ctx.shadowBlur = 26;
      ctx.drawImage(mascotImg, mx, my, drawW, drawH);
      ctx.restore();
    }

    // Bottom Message bar
    const barW = cardW - 160;
    const barH = 160;
    const barX = cardX + (cardW - barW) / 2;
    const barY = cardY + cardH - 220;

    ctx.save();
    const barBg = ctx.createLinearGradient(barX, barY, barX + barW, barY + barH);
    barBg.addColorStop(0, "rgba(0,0,0,0.42)");
    barBg.addColorStop(0.5, "rgba(255,255,255,0.05)");
    barBg.addColorStop(1, "rgba(0,0,0,0.38)");

    ctx.fillStyle = barBg;
    roundRectPath(ctx, barX, barY, barW, barH, 18);
    ctx.fill();

    ctx.lineWidth = 2.6;
    const barStroke = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    barStroke.addColorStop(0, THEME.a);
    barStroke.addColorStop(1, THEME.b);
    ctx.strokeStyle = barStroke;
    roundRectPath(ctx, barX, barY, barW, barH, 18);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.70)";
    ctx.font = "850 24px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("PETRUL’S MESSAGE", barX + 26, barY + 48);

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "820 36px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    wrapText(ctx, m, barX + 26, barY + 102, barW - 52, 44, 2);

    // neon underglow
    ctx.globalAlpha = 0.18;
    const under = ctx.createRadialGradient(barX + barW * 0.5, barY + barH, 20, barX + barW * 0.5, barY + barH, 420);
    under.addColorStop(0, THEME.a);
    under.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = under;
    ctx.fillRect(barX - 80, barY - 60, barW + 160, barH + 240);
    ctx.globalAlpha = 1;

    ctx.restore();

    // Footer
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.56)";
    ctx.font = "650 30px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Answer this to yourself.", W / 2, cardY + cardH + 140);

    // Brand
    ctx.fillStyle = "rgba(255,255,255,0.44)";
    ctx.font = "750 28px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("petrul.fun", W / 2, H - 80);

    const safeName = todayKey.replaceAll(":", "-");
    const filename = `petrul-poster-${safeName}.png`;

    const blob = await canvasToBlob(canvas, "image/png");
    return { canvas, blob, filename };
  };

  const handleDownloadPoster = async () => {
    const { canvas, filename } = await renderPoster();
    if (!canvas) return;
    downloadCanvasPNG(canvas, filename || "petrul-poster.png");
  };

  const handleSharePoster = async () => {
    const q = String(question || "").trim();
    const m = String(message || "").trim();
    const shareText = `Petrul ✨\n\nQuestion of the Day:\n${q}\n\nPetrul’s Message:\n${m}\n\npetrul.fun`;
    const shareUrl = "https://petrul.fun";

    const { canvas, blob, filename } = await renderPoster();
    if (!canvas) return;

    try {
      if (blob) {
        const file = new File([blob], filename || "petrul-poster.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] }) && navigator.share) {
          await navigator.share({ title: "Petrul", text: shareText, files: [file] });
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({ title: "Petrul", text: shareText, url: shareUrl });
        return;
      }
    } catch {
      // ignore
    }

    downloadCanvasPNG(canvas, filename || "petrul-poster.png");

    try {
      const text = encodeURIComponent("Petrul — Message of the Day ✨");
      const url = encodeURIComponent(shareUrl);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  };

  const handleCopyText = async () => {
    const q = String(question || "").trim();
    const m = String(message || "").trim();
    const text = `Question of the Day:\n${q}\n\nPetrul’s Message:\n${m}\n\npetrul.fun`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore silently
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="questionOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="questionCard" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}>
          <h2>Question of the Day</h2>

          <p className="questionText">{question}</p>

          <p className="selfAnswer">Answer this for yourself.</p>

          <motion.div className="petrulMsgCard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
            <div className="petrulMsgHeader">Petrul’s Message</div>
            <div className="petrulMsgText">{message}</div>
          </motion.div>

          <div className="qodActions">
            <motion.button onClick={handleDownloadPoster} className="primaryBtn" type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              Download Poster
            </motion.button>

            <motion.button onClick={handleSharePoster} className="primaryBtn" type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              Share
            </motion.button>

            <motion.button onClick={handleCopyText} className="primaryBtn" type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              Copy Text
            </motion.button>

            <motion.button onClick={onClose} className="primaryBtn" type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              Continue
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}