import { useState } from "react";
import Section from "../components/Section.jsx";

const wallets = [
  {
    label: "Bitcoin wallet address",
    value: "bc1q2hxkf4z0x5lk4rzhlu7cn7k5qlfqj7gfjjr00v",
  },
  {
    label: "Solana wallet address",
    value: "DeqXCiaFPF1C3Lvh5j3zy699ToV9SX9p9y4LmGamwGuR",
  },
  {
    label: "Ethereum wallet address",
    value: "0x60097Cb057de7Ac2a83045ae23418fBDCa53A6eE",
  },
];

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

export default function About() {
  const [copyState, setCopyState] = useState({ idx: -1, status: "idle" });

  const handleCopy = async (value, idx) => {
    let copied = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        copied = true;
      } else {
        copied = fallbackCopy(value);
      }
    } catch {
      copied = fallbackCopy(value);
    }

    setCopyState({ idx, status: copied ? "success" : "error" });
    window.setTimeout(() => setCopyState({ idx: -1, status: "idle" }), 1500);
  };

  const getCopyLabel = (idx) => {
    if (copyState.idx !== idx) return "Copy";
    if (copyState.status === "success") return "Copied";
    if (copyState.status === "error") return "Retry";
    return "Copy";
  };

  return (
    <Section id="about" title="About Us">
      <div className="aboutText">
        <p>
          Petrul is a mystic oil-drop mascot with a cinematic aura. It's world is
          dark, neon and playful,community, and interactive fun.
        </p>

        <p>
          <strong>Disclaimer:</strong> This project is for entertainment and
          community culture. Any token-related content is <u>not</u> investment
          advice.
        </p>

        <p>
          This project has not been designed for short-term entertainment. It
          has been created to increase motivation in people’s daily lives, to
          provide daily breathing and other rituals for those facing health
          challenges, and most importantly, to reach people with real products
          in the medium and long term.
        </p>

        <p>
          We are still in the development phase, and it is likely that we will
          experience financial shortages for many products and services. Even a
          small contribution to this project — which has been designed for
          humanity — will return to you in a much greater way. Be certain of
          this.
        </p>

        <p>
          We sincerely believe from the bottom of our hearts that good-hearted,
          just, and compassionate people have always existed in the world and
          will continue to exist, and we love all of you wholeheartedly.
        </p>

        <p>
          Currently, the most convenient financial method for daily money
          transfers worldwide is through the cryptocurrency sector. Therefore,
          addresses on three different blockchain networks are provided below.
          Anyone who wishes can donation the project with any amount they
          choose. We express our gratitude in advance for your understanding.
        </p>

        <p>Trust in Petrul, and stay with Petrul.</p>

        {/* PREMIUM WALLET LIST */}
        <div className="aboutWalletsPremium">
          <div className="aboutWalletList">
            {wallets.map((item, idx) => (
              <div key={item.label} className="walletRowPremium">
                <div className="walletLeft">
                  <div className="walletLabel">{idx + 1}. {item.label}</div>
                  <div className="walletValue">{item.value}</div>
                </div>

                <div className="walletRight">
                  <button
                    type="button"
                    className={`glassCopyBtn ${
                      copyState.idx === idx ? copyState.status : ""
                    }`}
                    onClick={() => handleCopy(item.value, idx)}
                    aria-label={`Copy ${item.label}`}
                  >
                    <span className="glassCopyText">{getCopyLabel(idx)}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}