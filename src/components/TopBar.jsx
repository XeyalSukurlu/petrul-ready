export default function TopBar({
  themeName,
  onSwitchDesign,
  memeMode,
  onToggleMeme,
  rightSlot,
  onOpenDMR, // ✅ NEW (optional)
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brandDot" />
        <div>
          <div className="brandTitle">PETRUL</div>

          <div className="logoSub">
            Mystic Community
            <span className="mcLogo">
              <span className="mcInner">mC</span>
            </span>
          </div>
        </div>
      </div>

      <nav className="nav">
        <a href="#home">Home</a>
        <a href="#about">About Us</a>
        <a href="#game">Game</a>

        {/* ✅ NEW: DMR */}
        <a
          href="#dmr"
          onClick={(e) => {
            e.preventDefault();
            onOpenDMR?.();
          }}
          title="Daily Micro Ritual"
          aria-label="Daily Micro Ritual"
        >
          DMR
        </a>
      </nav>

      <div className="topbarRight">
        <button className="iconBtn" onClick={onSwitchDesign} title="Switch Design" aria-label="Switch Design">
          ✦
        </button>
        <button
          className={`iconBtn ${memeMode ? "iconBtnOn" : ""}`}
          onClick={onToggleMeme}
          title="Meme Mode"
          aria-label="Meme Mode"
        >
          ☄
        </button>
        {rightSlot}
      </div>
    </header>
  );
}