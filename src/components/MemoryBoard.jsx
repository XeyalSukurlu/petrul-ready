// src/components/MemoryBoard.jsx
import { useEffect, useState } from "react";
import { addMemory, deleteMemory, formatDate, readMemories } from "../utils/memories";

export default function MemoryBoard() {
  const [text, setText] = useState("");
  const [items, setItems] = useState(() => readMemories());

  useEffect(() => {
    const refresh = () => setItems(readMemories());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const onAdd = () => {
    const created = addMemory(text);
    if (!created) return;
    setText("");
    setItems(readMemories());
  };

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") onAdd();
  };

  return (
    <>
      <style>{`
        .memWrap{
          display:flex;
          justify-content:center;
          padding: 10px 14px 0;
          z-index: 4;
          position: relative;
        }
        .memCard{
          width: min(820px, calc(100% - 12px));
          border-radius: 18px;

          /* ✅ Welcome-like glass (less blur, more transparency) */
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(10,10,12,0.22);
          backdrop-filter: blur(6px);
          box-shadow: 0 14px 40px rgba(0,0,0,0.30);

          padding: 12px;
        }
        .memTop{
          display:flex;
          align-items:flex-end;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .memTitle{
          font-family: var(--font-title);
          font-weight: 700;
          letter-spacing: .5px;
          font-size: 12px;
          text-transform: uppercase;
          opacity: .82;
        }
        .memSub{
          font-family: var(--font-body);
          font-size: 12px;
          opacity: .68;
          margin-top: 4px;
        }
        .memInputRow{
          margin-top: 10px;
          display:flex;
          gap: 10px;
          align-items:center;
        }
        .memInput{
          flex: 1;
          min-width: 240px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: var(--text, #fff);
          padding: 10px 12px;
          outline: none;
          font-family: var(--font-body);
          font-size: 13px;
        }
        .memBtn{
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.07);
          color: var(--text, #fff);
          padding: 10px 12px;
          cursor:pointer;
          font-family: var(--font-title);
          font-weight: 700;
          letter-spacing: .4px;
          font-size: 12px;
          text-transform: uppercase;
          transition: transform 120ms ease, background 120ms ease;
          user-select:none;
        }
        .memBtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.10); }

        .memGrid{
          margin-top: 12px;
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        @media (max-width: 680px){
          .memGrid{ grid-template-columns: 1fr; }
        }

        .memItem{
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);

          /* slightly more “glass”, less heavy */
          background: rgba(10,10,12,0.18);

          padding: 10px 10px;
          position: relative;
          overflow: hidden;
        }

        .memDate{
          font-family: var(--font-title);
          font-size: 11px;
          opacity: .70;
          letter-spacing: .4px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .memText{
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.25;
          opacity: .95;
          word-break: break-word;
        }

        .memDel{
          position:absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);

          /* a touch lighter */
          background: rgba(255,255,255,0.05);

          color: var(--text, #fff);
          cursor:pointer;
          opacity: .75;
        }
        .memDel:hover{ opacity: 1; }

        .memFooterHint{
          margin-top: 10px;
          font-family: var(--font-body);
          font-size: 12px;
          opacity: .65;
        }
      `}</style>

      <div className="memWrap">
        <div className="memCard">
          <div className="memTop">
            <div>
              <div className="memTitle">Memory Board</div>
              <div className="memSub">One line that matters. Saved locally on this device.</div>
            </div>
          </div>

          <div className="memInputRow">
            <input
              className="memInput"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder='e.g. "Today I chose calm over chaos."'
              maxLength={140}
            />
            <button className="memBtn" type="button" onClick={onAdd}>
              Save
            </button>
          </div>

          {items.length > 0 && (
            <div className="memGrid">
              {items.map((it) => (
                <div className="memItem" key={it.id}>
                  <button
                    className="memDel"
                    onClick={() => {
                      deleteMemory(it.id);
                      setItems(readMemories());
                    }}
                    title="Delete"
                  >
                    ✕
                  </button>
                  <div className="memDate">{formatDate(it.ts)}</div>
                  <div className="memText">{it.text}</div>
                </div>
              ))}
            </div>
          )}

          <div className="memFooterHint">
            Tip: Press <b>Ctrl/⌘ + Enter</b> to save quickly ✨
          </div>
        </div>
      </div>
    </>
  );
}