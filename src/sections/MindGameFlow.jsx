import { useEffect, useMemo, useState } from "react";
import Section from "../components/Section.jsx";
import { storage } from "../utils/storage.js";
import { motion, AnimatePresence } from "framer-motion";

const PROFILE_KEY = "mind_profile_v1";
const BOOK_KEY = "mind_book_v1";

const STAGES = 5;
const PER_STAGE = 10;
const TOTAL_Q = STAGES * PER_STAGE;

const QUESTION_POOL = [
  { q: "If you could only fund one thing: clean water or faster internet, which benefits humanity more?", a: ["Clean water", "Faster internet"], correct: 0 },
  { q: "Would you trade 10 years of fame for 10 years of peace?", a: ["Fame", "Peace"], correct: 1 },
  { q: "Is a good reputation more valuable than money?", a: ["Yes", "No"], correct: 0 },
  { q: "When innovation hurts some people, is it still progress?", a: ["Yes", "No"], correct: 0 },
  { q: "Should leaders be chosen by expertise rather than popularity?", a: ["Expertise", "Popularity"], correct: 0 },
  { q: "Is it better to be right or to be kind?", a: ["Right", "Kind"], correct: 1 },
  { q: "Do you think risk is necessary for a meaningful life?", a: ["Yes", "No"], correct: 0 },
  { q: "Should a community prioritize rules or creativity?", a: ["Rules", "Creativity"], correct: 1 },
  { q: "Is scarcity the engine of value?", a: ["Yes", "No"], correct: 0 },
  { q: "Would you sacrifice short-term comfort for long-term stability?", a: ["Yes", "No"], correct: 0 },
  { q: "Is trust earned slowly and lost quickly?", a: ["Yes", "No"], correct: 0 },
  { q: "Is transparency always good for society?", a: ["Yes", "No"], correct: 1 },
  { q: "Should humor be used to handle fear?", a: ["Yes", "No"], correct: 0 },
  { q: "Is obsession a superpower or a trap?", a: ["Superpower", "Trap"], correct: 0 },
  { q: "Is privacy a human right or a luxury?", a: ["Right", "Luxury"], correct: 0 },
  { q: "Do you value freedom more than security?", a: ["Freedom", "Security"], correct: 0 },
  { q: "Is consistency more important than intensity?", a: ["Consistency", "Intensity"], correct: 0 },
  { q: "Is empathy a skill that can be trained?", a: ["Yes", "No"], correct: 0 },
  { q: "Is luck more important than talent?", a: ["Luck", "Talent"], correct: 1 },
  { q: "Should people be rewarded for effort or results?", a: ["Effort", "Results"], correct: 1 },
  { q: "Is fear the strongest motivator?", a: ["Yes", "No"], correct: 1 },
  { q: "Is it possible to be successful and humble?", a: ["Yes", "No"], correct: 0 },
  { q: "Do you think most people want to do good?", a: ["Yes", "No"], correct: 0 },
  { q: "Is boredom a signal to create?", a: ["Yes", "No"], correct: 0 },
  { q: "Should you forgive to heal yourself?", a: ["Yes", "No"], correct: 0 },
  { q: "Is discipline more reliable than motivation?", a: ["Yes", "No"], correct: 0 },
  { q: "Is money a tool or a scoreboard?", a: ["Tool", "Scoreboard"], correct: 0 },
  { q: "Is beauty objective or subjective?", a: ["Objective", "Subjective"], correct: 1 },
  { q: "Is community stronger online or offline?", a: ["Online", "Offline"], correct: 1 },
  { q: "Should speed ever beat correctness?", a: ["Yes", "No"], correct: 1 },
  { q: "Is a small win every day better than a big win once?", a: ["Small daily", "Big once"], correct: 0 },
  { q: "Is simplicity a form of power?", a: ["Yes", "No"], correct: 0 },
  { q: "Is inspiration more important than information?", a: ["Yes", "No"], correct: 0 },
  { q: "Do you believe technology should slow down sometimes?", a: ["Yes", "No"], correct: 0 },
  { q: "Is it better to build alone or with a team?", a: ["Alone", "Team"], correct: 1 },
  { q: "Is curiosity more valuable than confidence?", a: ["Curiosity", "Confidence"], correct: 0 },
  { q: "Is it okay to quit when it stops being healthy?", a: ["Yes", "No"], correct: 0 },
  { q: "Does every joke contain a truth?", a: ["Yes", "No"], correct: 0 },
  { q: "Is there such thing as too much ambition?", a: ["Yes", "No"], correct: 0 },
  { q: "Is loyalty earned or given?", a: ["Earned", "Given"], correct: 0 },
  { q: "Is patience a competitive advantage?", a: ["Yes", "No"], correct: 0 },
  { q: "Is creativity more important than intelligence?", a: ["Yes", "No"], correct: 0 },
  { q: "Should you measure life by moments or achievements?", a: ["Moments", "Achievements"], correct: 0 },
  { q: "Is honesty always the best policy?", a: ["Yes", "No"], correct: 1 },
  { q: "Is love a decision or a feeling?", a: ["Decision", "Feeling"], correct: 0 },
  { q: "Is failure necessary for mastery?", a: ["Yes", "No"], correct: 0 },
  { q: "Is attention the real currency?", a: ["Yes", "No"], correct: 0 },
  { q: "Should you optimize for fun or for impact?", a: ["Fun", "Impact"], correct: 1 },
  { q: "Is courage acting without fear or despite fear?", a: ["Without fear", "Despite fear"], correct: 1 },
  { q: "Is a promise more valuable than a contract?", a: ["Promise", "Contract"], correct: 0 },
  { q: "Is it better to be underestimated?", a: ["Yes", "No"], correct: 0 },
  { q: "Is learning a lifelong obligation?", a: ["Yes", "No"], correct: 0 },
  { q: "Is kindness a strategy or a virtue?", a: ["Strategy", "Virtue"], correct: 1 },
];

function shuffle(arr){
  const copy = [...arr];
  for(let i=copy.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * ✅ UPDATED: smart pagination (no word splitting)
 * - tries paragraph breaks, then sentence ends, then last space
 * - never splits a word across pages
 */
function paginateText(text, charsPerPage = 950){
  const cleaned = ((text || "").replace(/\r/g, "")).trim();
  if(!cleaned) return ["(Book text is empty — paste your text here)"];

  const pages = [];
  let i = 0;

  while(i < cleaned.length){
    const target = Math.min(i + charsPerPage, cleaned.length);

    if(target >= cleaned.length){
      pages.push(cleaned.slice(i).trimEnd());
      break;
    }

    const windowText = cleaned.slice(i, target);

    // page çox qısalmasın deyə minimum cut
    const minCut = Math.max(i + Math.floor(charsPerPage * 0.6), i + 120);

    let cut = -1;

    // 1) Paraqraf sonu (blank line)
    const lastPara = windowText.lastIndexOf("\n\n");
    if(lastPara !== -1 && (i + lastPara + 2) >= minCut){
      cut = i + lastPara + 2;
    }

    // 2) Cümlə sonu (. ! ? + boşluq)
    if(cut === -1){
      const re = /[.!?]["')\]]?\s/g;
      let m;
      let last = -1;
      while((m = re.exec(windowText)) !== null){
        last = m.index + m[0].length;
      }
      if(last !== -1 && (i + last) >= minCut){
        cut = i + last;
      }
    }

    // 3) Söz sərhədi (boşluqdan kəs)
    if(cut === -1){
      const lastSpace = windowText.lastIndexOf(" ");
      if(lastSpace !== -1 && (i + lastSpace + 1) >= minCut){
        cut = i + lastSpace + 1;
      }
    }

    // 4) Yenə tapılmadısa, irəliyə baxıb növbəti boşluqda kəs
    if(cut === -1){
      const forward = cleaned.slice(target, Math.min(cleaned.length, target + 80));
      const nextWs = forward.search(/\s/);
      cut = nextWs !== -1 ? (target + nextWs + 1) : target;
    }

    pages.push(cleaned.slice(i, cut).trimEnd());
    i = cut;
  }

  return pages.length ? pages : ["(Book text is empty — paste your text here)"];
}

async function compressImageToDataUrl(file, maxW = 512, quality = 0.85){
  const img = new Image();
  const url = URL.createObjectURL(file);
  try{
    await new Promise((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Image load failed"));
      img.src = url;
    });

    const scale = Math.min(1, maxW / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    // JPEG background (prevents weird transparent → black artifacts)
    ctx.fillStyle = "#0b0704";
    ctx.fillRect(0, 0, w, h);

    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function titleFromScore(total){
  if(total > 400) return "Superior Intelligence";
  if(total > 300) return "Smart Person";
  if(total > 250) return "Average intelligent person";
  return "Careless";
}

// Canvas round-rect fallback (Safari safe)
function roundRectPath(ctx, x, y, w, h, r){
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export default function MindGameFlow({ theme }) {
  const [step, setStep] = useState("intro");

  const [nickname, setNickname] = useState(() => storage.get(PROFILE_KEY, {})?.nickname || "");
  const [photo, setPhoto] = useState(() => storage.get(PROFILE_KEY, {})?.photo || "");
  const [profileErr, setProfileErr] = useState("");

  const defaultBookText =
`📌Article 1 — Greed and Avarice

Human beings always desire more in order to live a full life. At the same time, they want to obtain everything as quickly as possible, yet they are never satisfied with what they have. They are constantly dissatisfied. They make plans for tomorrow but fail to appreciate today. They do not understand that tomorrow never truly ends. If there is a tomorrow for today, then there will always be another tomorrow for that tomorrow.

If you are going to ignore today, neglect what you have in your hands and around you, and fail to spend meaningful time with them just so that tomorrow may be better, then tomorrow will be no different from today.

Stop and reflect. Who are you today? Who is in your life and in your close circle? Who makes you happy, and with whom do you feel most at peace when you spend time? When you find answers to these questions, tomorrow will no longer be merely a wish but rather a natural curiosity.

Life consists of moments. Think about how many days you have lived until now, and if you have the courage, write down what has truly remained engraved in your memory from those days. Do not categorize them as good or bad — simply recall them as moments. If within a day there is at least one memorable experience, then that day has truly been lived. But if you remember nothing from yesterday, then that day was never truly lived.
------------------------------------------------------------------------

📌Article 2 — Daily Life and Health

When you wake up and open your eyes in the morning, you are reborn. Because sleep is technically a form of death. When you fall asleep, your soul leaves your body and travels. The dreams you see are manifestations of your soul’s journey through the surrounding realm. If your soul does not return to your body, you will never wake up again.

This is where health becomes crucial. There is a saying: “A healthy mind resides in a healthy body.” If you need a healthy soul, you must keep your body healthy. So where does the secret of bodily health lie? Naturally, in nutrition and daily movement.

No one needs to lecture you about this because only you truly know your own body. You must recognize which foods make you uncomfortable and which ones give you energy and a positive mood.

Movement is simple. Even walking during the day or unconsciously moving your limbs in any direction activates your muscles and makes you feel more relaxed. Inactivity is the enemy of the body.
------------------------------------------------------------------------

📌Article 3 — Connection with Living Beings and the Environment

It is often said that “humans are part of society.” In truth, this should be phrased differently: “Humans are part of nature.” You cannot exist as a complete being alone. You must touch, feel, and connect with living or non-living elements in your daily life to truly feel alive.

Human beings live through emotions. If during your day you interact with any living being, it will inevitably make you feel better. This being could be a human, an animal, or even a plant — because energy gains value not when it is stored, but when it is shared.

Observe your daily behaviors carefully and try to understand the true meaning of small interactions that you may have previously taken for granted.

------------------------------------------------------------------------

📌Article 4. Free Thought and Way of Life

Just start thinking and go to the essence. Look around you and at the world. What are people governed by, and who are the ones that govern people?! If you pay attention, you will easily understand that it is only Human. But how do a small number of people control large masses?! Naturally, several factors come into play here. The first is religions. Religions are concepts that exist to control human beings and to keep them within a special cage, monitoring their every behavior. At the foundation of each, there is absolutely a creator. But when it comes to practice, even if submission is verbally to the creator, in reality it is again to a group of people.Because it is they who set the prohibitions, not the creator.The creator would never oppress what He created, nor surround it with evils. If that were the case, He would be unjust. But this is absolutely impossible.

Think about it. If you spend a certain amount of time creating something of your own and infuse it with your own values, would it please you if something bad happened to it, or would it disappoint you?! If you are someone who thinks rationally, you would of course choose the second. The principle between the creator and the human being is exactly the same. He loves you. He gave you intellect and thought. He granted you freedom in this world, but you impose boundaries on yourself.Through religions, He informed you about which things may harm you and which may be more beneficial, yet instead of being content with this, you prioritize the manipulations of a group of people regarding religion and drive yourself into distress. Wake up and take ownership of yourself.

------------------------------------------------------------------------

📌Article 5 — Technology and Crypto

Even though technology appears as an ideal concept meant to make human life easier, it is actually one of the main factors that makes people lazy and negatively affects their health on a large scale. There is no need to elaborate much on this — if you reflect on it yourself, you will understand its true meaning.

So what is crypto? This is where the main misunderstandings arise. Although crypto is presented as something that supposedly values human freedom and privacy, in reality it is nothing more than a set of tools created for a certain group of people to manipulate society.

The very existence of crypto depends on electricity — without it, crypto cannot exist. Yet even without electricity, human beings could still continue their lives and survive. Today, crypto does not add any truly meaningful value to human life; it is simply a world of illusion.

It cannot be denied that from a financial perspective, it carries high potential for both profit and loss. However, from a psychological standpoint, it is equally harmful — because there is no concept of justice within it. No one can prove that crypto is fair. If you think deeply enough, you will agree with this yourself. Graphs, charts, and empty promises — all of these are illusions. If you are lucky, you may win; if not, the outcome is clear.

If you truly want to invest, invest in yourself. Because investment in your own character and growth is never lost. If you seek justice, look for it within yourself — because if you want to change the world, you must first start with yourself.`;

  const [bookText, setBookText] = useState(() => storage.get(BOOK_KEY, defaultBookText));
  const pages = useMemo(() => paginateText(bookText, 950), [bookText]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageDir, setPageDir] = useState(1);

  const sfxWin = useMemo(() => new Audio("/assets/sfx_win.mp3"), []);
  const sfxLose = useMemo(() => new Audio("/assets/sfx_lose.mp3"), []);

  const [questions, setQuestions] = useState(() => shuffle(QUESTION_POOL).slice(0, TOTAL_Q));
  const [stage, setStage] = useState(1);
  const [qInStage, setQInStage] = useState(0);
  const [stageCorrect, setStageCorrect] = useState(0);
  const [stageWrong, setStageWrong] = useState(0);
  const [stageScore, setStageScore] = useState(0);
  const [stageScores, setStageScores] = useState([]);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [flash, setFlash] = useState(null);

  useEffect(() => { storage.set(PROFILE_KEY, { nickname, photo }); }, [nickname, photo]);
  useEffect(() => { storage.set(BOOK_KEY, bookText); }, [bookText]);

  const openProfile = () => setStep("profile");

  const submitProfile = () => {
    setProfileErr("");
    if(!nickname.trim()) return setProfileErr("Please enter a nickname.");
    if(!photo) return setProfileErr("Please upload a photo.");
    setStep("book");
  };

  const startGame = () => {
    setQuestions(shuffle(QUESTION_POOL).slice(0, TOTAL_Q));
    setStage(1);
    setQInStage(0);
    setStageCorrect(0);
    setStageWrong(0);
    setStageScore(0);
    setStageScores([]);
    setTotalCorrect(0);
    setTotalWrong(0);
    setFlash(null);
    setStep("quiz");
  };

  const curIndex = (stage - 1) * PER_STAGE + qInStage;
  const curQ = questions[curIndex];

  const answer = (idx) => {
    if(!curQ) return;

    const correct = curQ.correct === idx;
    if(correct){
      setStageCorrect(v => v + 1);
      setTotalCorrect(v => v + 1);
      setStageScore(v => v + 10);
      setFlash("win");
      try{ sfxWin.currentTime = 0; sfxWin.play(); }catch{}
    } else {
      setStageWrong(v => v + 1);
      setTotalWrong(v => v + 1);
      setStageScore(v => v - 5);
      setFlash("lose");
      try{ sfxLose.currentTime = 0; sfxLose.play(); }catch{}
    }

    setTimeout(() => setFlash(null), 260);

    if(qInStage >= PER_STAGE - 1){
      setStep("stageResult");
    } else {
      setQInStage(v => v + 1);
    }
  };

  const nextStage = () => {
    setStageScores(prev => [...prev, stageScore]);
    if(stage >= STAGES){
      setStep("final");
      return;
    }
    setStage(v => v + 1);
    setQInStage(0);
    setStageCorrect(0);
    setStageWrong(0);
    setStageScore(0);
    setStep("quiz");
  };

  const finalTotal = useMemo(() => {
    const sumPrev = stageScores.reduce((a,b)=>a+b, 0);
    return sumPrev + (step === "final" ? stageScore : 0);
  }, [stageScores, stageScore, step]);

  const finalTitle = titleFromScore(finalTotal);

  const downloadResultImage = async () => {
    if(step !== "final") return;       // ✅ ONLY FINAL
    if(!photo) return;

    const size = 1000;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // === PREMIUM GOLD BACKGROUND ===
    const base = ctx.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, "#140b05");
    base.addColorStop(0.45, "#2b1407");
    base.addColorStop(1, "#0b0704");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    // subtle gold glow layer
    const glow = ctx.createRadialGradient(size*0.55, size*0.25, 80, size*0.55, size*0.25, 560);
    glow.addColorStop(0, "rgba(255,184,90,0.20)");
    glow.addColorStop(1, "rgba(255,184,90,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    // === LOAD USER PHOTO ===
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photo;
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error("image load failed"));
    });

    // === PHOTO BOX ===
    const box = 620;
    const x = (size - box) / 2;
    const y = 110;

    // frame
    const frameGrad = ctx.createLinearGradient(x, y, x + box, y + box);
    frameGrad.addColorStop(0, "#fff2b8");
    frameGrad.addColorStop(0.35, "#ffb24a");
    frameGrad.addColorStop(1, "#c75a00");

    ctx.save();
    roundRectPath(ctx, x - 10, y - 10, box + 20, box + 20, 54);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRectPath(ctx, x - 6, y - 6, box + 12, box + 12, 50);
    ctx.strokeStyle = frameGrad;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // === ASPECT SAFE "cover" crop (no squish) ===
    const imgAspect = img.width / img.height;
    const boxAspect = 1; // square

    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if(imgAspect > boxAspect){
      // wider → crop sides
      sh = img.height;
      sw = img.height * boxAspect;
      sx = (img.width - sw) / 2;
    } else {
      // taller → crop top/bottom
      sw = img.width;
      sh = img.width / boxAspect;
      sy = (img.height - sh) / 2;
    }

    ctx.save();
    roundRectPath(ctx, x, y, box, box, 46);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, x, y, box, box);
    ctx.restore();

    // === TITLE BADGE (ON IMAGE) ===
    const badgeH = 84;
    const badgeY = y + box - badgeH - 18;

    const badgeGrad = ctx.createLinearGradient(x + 26, badgeY, x + box - 26, badgeY + badgeH);
    badgeGrad.addColorStop(0, "#fff2b8");
    badgeGrad.addColorStop(0.45, "#ffb24a");
    badgeGrad.addColorStop(1, "#c75a00");

    ctx.save();
    roundRectPath(ctx, x + 22, badgeY, box - 44, badgeH, 18);
    ctx.fillStyle = badgeGrad;
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#1a0f05";
    ctx.font = "900 44px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(finalTitle, size / 2, badgeY + badgeH/2);

    // === NICKNAME + SCORE ===
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "900 40px system-ui";
    ctx.fillText((nickname || "Anonymous").slice(0, 24), size / 2, y + box + 110);

    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.font = "700 30px system-ui";
    ctx.fillText(`Total Score: ${finalTotal}`, size / 2, y + box + 160);

    // === DOWNLOAD ===
    const link = document.createElement("a");
    link.download = `mind-game-result-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const onPickPhoto = async (file) => {
    setProfileErr("");
    if(!file) return;

    if(file.size > 5 * 1024 * 1024){
      setProfileErr("Image is too large. Please choose a smaller file (< 5MB).");
      return;
    }

    try{
      const dataUrl = await compressImageToDataUrl(file, 768, 0.86);
      setPhoto(dataUrl);
    } catch {
      setProfileErr("Could not process the image. Try another file.");
    }
  };

  const nextPage = () => {
    setPageDir(1);
    setPageIndex(i => Math.min(i + 2, Math.max(0, pages.length - 2)));
  };

  const prevPage = () => {
    setPageDir(-1);
    setPageIndex(i => Math.max(0, i - 2));
  };

  return (
    <Section id="game" title="Mind Game">
      <div className="mindWrap">

        {step === "intro" && (
          <div className="mindIntro">
            <div className="mindTitle">WELCOME TO THE MIND GAME</div>
            <div className="mindSub">Put all your thoughts aside and focus on the game.</div>
            <button className="btn primary" onClick={openProfile}>START</button>
          </div>
        )}

        {step === "profile" && (
          <div className="mindCard">
            <div className="mindH">Before we start…</div>
            <div className="mindP">Enter your nickname and upload a photo.</div>

            <div className="mindForm">
              <label className="mindLabel">Nickname</label>
              <input
                className="input"
                value={nickname}
                onChange={(e)=>setNickname(e.target.value)}
                placeholder="Your nickname"
                maxLength={24}
              />

              <label className="mindLabel">Photo (required)</label>
              <input
                className="input"
                type="file"
                accept="image/*"
                onChange={(e)=>onPickPhoto(e.target.files?.[0])}
              />

              {photo && (
                <div className="mindPreview">
                  <img src={photo} alt="" />
                </div>
              )}

              {profileErr ? <div className="mindErr">{profileErr}</div> : null}

              {/* ✅ DOWNLOAD burada YOXDUR */}
              <div className="mindActions">
                <button className="btn" onClick={()=>setStep("intro")}>Back to Start</button>
                <button className="btn primary" onClick={submitProfile}>Continue</button>
              </div>
            </div>
          </div>
        )}

        {step === "book" && (
          <div className="mindBookWrap">
            <div className="mindBookTop">
              <div className="mindH">Mind Book</div>
              <button className="btn" onClick={()=>setBookText(defaultBookText)} title="Reset book text (temporary)">Reset Text</button>
            </div>

            <div className="mindBookStage">
              <div className="bookSpine" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pageIndex}
                  className="mindBook"
                  initial={{ opacity: 0, x: pageDir > 0 ? 28 : -28, rotateY: pageDir > 0 ? -8 : 8 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: pageDir > 0 ? -28 : 28, rotateY: pageDir > 0 ? 8 : -8 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <div className="mindPage leftPage">
                    <div className="mindPageNum">Page {pageIndex + 1}</div>
                    <div className={`pageCorner cornerLeft ${pageIndex <= 0 ? "cornerDisabled" : ""}`} aria-hidden="true" />
                    <div className="mindPageText">{pages[pageIndex] || ""}</div>
                  </div>

                  <div className="mindPage rightPage">
                    <div className="mindPageNum">Page {pageIndex + 2}</div>
                    <div className={`pageCorner cornerRight ${pageIndex >= pages.length - 2 ? "cornerDisabled" : ""}`} aria-hidden="true" />
                    <div className="mindPageText">{pages[pageIndex + 1] || ""}</div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button className="pageEdge pageEdgeLeft" onClick={prevPage} disabled={pageIndex <= 0} aria-label="Previous pages" />
              <button className="pageEdge pageEdgeRight" onClick={nextPage} disabled={pageIndex >= pages.length - 2} aria-label="Next pages" />
            </div>

            <div className="mindBookNav">
              <button className="btn" onClick={prevPage} disabled={pageIndex <= 0}>◀ Prev</button>
              <button className="btn" onClick={nextPage} disabled={pageIndex >= pages.length - 2}>Next ▶</button>
            </div>

            <div className="mindActions">
              <button className="btn" onClick={()=>setStep("profile")}>Back</button>
              <button className="btn primary" onClick={startGame}>Play Game</button>
            </div>
          </div>
        )}

        {step === "quiz" && curQ && (
          <div className={`mindCard ${flash === "win" ? "flashWin" : ""} ${flash === "lose" ? "flashLose" : ""}`}>
            <div className="mindQuizTop">
              <div className="mindH">Stage {stage} / {STAGES}</div>
              <div className="mindTiny">Q {qInStage + 1} / {PER_STAGE}</div>
            </div>

            <div className="question">{curQ.q}</div>

            <div className="answers">
              <button className="answerBtn" onClick={()=>answer(0)}>{curQ.a[0]}</button>
              <button className="answerBtn" onClick={()=>answer(1)}>{curQ.a[1]}</button>
            </div>

            <div className="mindStats">
              <div>Correct: <b>{stageCorrect}</b></div>
              <div>Wrong: <b>{stageWrong}</b></div>
              <div>Stage Score: <b>{stageScore}</b> / 100</div>
            </div>
          </div>
        )}

        {step === "stageResult" && (
          <div className="mindCard">
            <div className="mindH">Stage {stage} Result</div>
            <div className="mindResultGrid">
              <div className="mindResultItem">Correct: <b>{stageCorrect}</b></div>
              <div className="mindResultItem">Wrong: <b>{stageWrong}</b></div>
              <div className="mindResultItem">Stage Score: <b>{stageScore}</b> / 100</div>
            </div>

            <div className="mindActions">
              <button className="btn" onClick={nextStage}>
                {stage >= STAGES ? "Finish Game" : `Stage ${stage + 1}`}
              </button>
            </div>
          </div>
        )}

        {step === "final" && (
          <div className="mindFinal">
            <div className="mindFinalTitle">FINAL RESULT</div>

            <div className="mindFinalCard">
              <div className="mindFinalImgWrap">
                {photo ? <img src={photo} alt="" /> : null}
                <div className="mindFinalBadge">{finalTitle}</div>
                <div className="mindFinalScoreTag">Score: {finalTotal}</div>
              </div>

              <div className="mindFinalName">{nickname || "Anonymous"}</div>

              <div className="mindFinalStats">
                <div>Total Correct: <b>{totalCorrect}</b></div>
                <div>Total Wrong: <b>{totalWrong}</b></div>
              </div>

              <div className="mindActions">
                <button className="btn" onClick={()=>setStep("intro")}>Back to Start</button>
                <button className="btn btnGold" onClick={downloadResultImage}>DOWNLOAD RESULT</button>
                <button className="btn primary" onClick={startGame}>Play Again</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Section>
  );
}
