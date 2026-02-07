import { useEffect, useState } from "react";

export default function TopBar({
  themeName,
  onSwitchDesign,
  memeMode,
  onToggleMeme,
  rightSlot,
  onOpenDMR, // ✅ NEW (optional)
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 980) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Optional: prevent background scroll when mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const onNav = (e, action) => {
    setMenuOpen(false);
    action?.(e);
  };

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

      {/* Desktop nav */}
      <nav className="nav navDesktop" aria-label="Primary">
        <a href="#home">Home</a>
        <a href="#about">About Us</a>
        <a href="#game">Game</a>

        <a
          href="#dmr"
          onClick={(e) => {
            e.preventDefault();
            onNav(e, () => onOpenDMR?.());
          }}
          title="Daily Micro Ritual"
          aria-label="Daily Micro Ritual"
        >
          DMR
        </a>
      </nav>

      <div className="topbarRight">
        {/* Mobile hamburger */}
        <button
          type="button"
          className={`hamburgerBtn ${menuOpen ? "on" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobileNav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="hamburgerLines" aria-hidden="true" />
        </button>

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

      {/* Mobile menu (overlay) */}
      <div id="mobileNav" className={`mobileMenu ${menuOpen ? "open" : ""}`} role="dialog" aria-modal="true">
        <nav className="mobileNav" aria-label="Mobile Primary">
          <a href="#home" onClick={(e) => onNav(e)} className="mobileNavLink">
            Home
          </a>
          <a href="#about" onClick={(e) => onNav(e)} className="mobileNavLink">
            About Us
          </a>
          <a href="#game" onClick={(e) => onNav(e)} className="mobileNavLink">
            Game
          </a>
          <a
            href="#dmr"
            onClick={(e) => {
              e.preventDefault();
              onNav(e, () => onOpenDMR?.());
            }}
            className="mobileNavLink"
          >
            DMR
          </a>

          <button type="button" className="mobileClose" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            Close
          </button>
        </nav>
      </div>

      {/* Backdrop for mobile menu */}
      <button
        type="button"
        className={`mobileBackdrop ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />
    </header>
  );
}