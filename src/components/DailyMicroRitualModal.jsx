// src/components/DailyMicroRitualModal.jsx
export default function DailyMicroRitualModal({ open, onClose, onStart }) {
  if (!open) return null;

  return (
    <>
      <style>{`
        .dmrBack{
          position: fixed;
          inset: 0;
          z-index: 120;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 16px;
        }
        .dmrCard{
          width: min(520px, calc(100% - 18px));
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(10,10,12,0.28);
          box-shadow: 0 18px 60px rgba(0,0,0,0.55);
          padding: 14px 14px 12px;
          color: var(--text, #fff);
        }
        .dmrTop{
          display:flex;
          align-items:center;
          justify-content: space-between;
          gap: 10px;
        }
        .dmrTitle{
          font-family: var(--font-title);
          font-weight: 800;
          letter-spacing: .6px;
          font-size: 12px;
          text-transform: uppercase;
          opacity: .92;
        }
        .dmrClose{
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: var(--text, #fff);
          cursor:pointer;
          opacity: .85;
        }
        .dmrClose:hover{ opacity: 1; }
        .dmrBody{
          margin-top: 10px;
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.35;
          opacity: .92;
        }
        .dmrList{
          margin-top: 10px;
          display:grid;
          gap: 8px;
        }
        .dmrItem{
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.05);
          padding: 10px 12px;
        }
        .dmrFooter{
          margin-top: 12px;
          display:flex;
          justify-content:flex-end;
          gap: 10px;
        }
        .dmrBtn{
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.08);
          color: var(--text, #fff);
          padding: 10px 12px;
          cursor:pointer;
          font-family: var(--font-title);
          font-weight: 800;
          letter-spacing: .4px;
          font-size: 12px;
          text-transform: uppercase;
          transition: transform 120ms ease, background 120ms ease;
        }
        .dmrBtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.12); }
        .dmrBtnPrimary{
          border-color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.12);
        }
      `}</style>

      <div className="dmrBack" role="dialog" aria-modal="true" aria-label="Daily Micro Ritual">
        <div className="dmrCard">
          <div className="dmrTop">
            <div className="dmrTitle">Daily Micro Ritual</div>
            <button className="dmrClose" type="button" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="dmrBody">
            A 10-second reset to clear your head and soften your nervous system.
          </div>

          <div className="dmrList">
            <div className="dmrItem">🫁 Take 1 deep breath.</div>
            <div className="dmrItem">🧱 Let go of 1 thing.</div>
            <div className="dmrItem">🙏 Be grateful for 1 thing.</div>
          </div>

          <div className="dmrFooter">
            <button className="dmrBtn" type="button" onClick={onClose}>
              Close
            </button>
            <button className="dmrBtn dmrBtnPrimary" type="button" onClick={onStart}>
              Start
            </button>
          </div>
        </div>
      </div>
    </>
  );
}