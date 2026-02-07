import { useEffect, useMemo, useState } from "react";
import Section from "../components/Section.jsx";
import { storage } from "../utils/storage.js";

const DEFAULT_BANK = 100_000_000;

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
  // 40 more quick thought prompts (kept concise)
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

function pickQuestions(n){
  const copy = [...QUESTION_POOL];
  for(let i=copy.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0,n);
}

export default function BarronSimulator({ theme }) {
  const [player, setPlayer] = useState(storage.get("petrul_player", ""));
  const [bank, setBank] = useState(storage.get("petrul_bank", DEFAULT_BANK));
  const [round, setRound] = useState(0);
  const [qs, setQs] = useState(() => pickQuestions(8));
  const [flash, setFlash] = useState(null); // "win" | "lose" | null
  const [done, setDone] = useState(false);

  const leaderboard = useMemo(() => storage.get("petrul_lb", []), []);

  useEffect(() => storage.set("petrul_player", player), [player]);
  useEffect(() => storage.set("petrul_bank", bank), [bank]);

  const sfxWin = useMemo(() => new Audio("/assets/sfx_win.mp3"), []);
  const sfxLose = useMemo(() => new Audio("/assets/sfx_lose.mp3"), []);

  const answer = (idx) => {
    if(done) return;
    const cur = qs[round];
    const correct = cur.correct === idx;

    if(correct){
      const inc = 7_500_000;
      setBank((v) => v + inc);
      setFlash("win");
      try{ sfxWin.currentTime=0; sfxWin.play(); }catch{}
    } else {
      const dec = 5_000_000;
      setBank((v) => Math.max(0, v - dec));
      setFlash("lose");
      try{ sfxLose.currentTime=0; sfxLose.play(); }catch{}
    }

    setTimeout(() => setFlash(null), 320);

    if(round >= 7){
      setDone(true);
      const name = (player || "Anonymous").slice(0, 24);
      const score = bank;
      const lb = storage.get("petrul_lb", []);
      const next = [{ name, score, ts: Date.now() }, ...lb].sort((a,b)=>b.score-a.score).slice(0,10);
      storage.set("petrul_lb", next);
    } else {
      setRound((r) => r + 1);
    }
  };

  const newGame = () => {
    setQs(pickQuestions(8));
    setRound(0);
    setDone(false);
    setFlash(null);
  };

  const lb = storage.get("petrul_lb", []);
  const curQ = qs[round];

  return (
    <Section id="game" title="Barron Simulator">
      <div className="gameGrid">
        <div className={`gamePanel ${flash === "win" ? "flashWin" : ""} ${flash === "lose" ? "flashLose" : ""}`}>
          <div className="gameTop">
            <div>
              <div className="smallLabel">Balance</div>
              <div className="money">${(bank/1_000_000).toFixed(1)}M</div>
            </div>
            <div className="qIndex">Q {round+1} / 8</div>
          </div>

          <div className="nameRow">
            <input className="input" placeholder="Player name (for leaderboard)" value={player} onChange={(e)=>setPlayer(e.target.value)} />
            <button className="btn" onClick={newGame} title="Start new random game">New Game</button>
          </div>

          {!done ? (
            <>
              <div className="question">{curQ.q}</div>
              <div className="answers">
                <button className="answerBtn" onClick={()=>answer(0)}>{curQ.a[0]}</button>
                <button className="answerBtn" onClick={()=>answer(1)}>{curQ.a[1]}</button>
              </div>
              <div className="gameNote">Correct: green glow + win sound. Wrong: red glow + lose sound.</div>
            </>
          ) : (
            <div className="gameOver">
              <div className="gameOverTitle">Game Finished</div>
              <div className="gameOverText">Your final balance is recorded in the leaderboard (top 10).</div>
              <button className="btn primary" onClick={newGame}>Play Again (Random Questions)</button>
            </div>
          )}
        </div>

        <div className="lbPanel">
          <div className="lbTitle">Leaderboard</div>
          {lb.length === 0 ? <div className="muted">No scores yet.</div> : lb.map((r, i)=>(
            <div className="lbRow" key={r.ts + "_" + i}>
              <div className="lbRank">#{i+1}</div>
              <div className="lbName">{r.name}</div>
              <div className="lbScore">${(r.score/1_000_000).toFixed(1)}M</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
