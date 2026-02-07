import { useEffect, useMemo, useState } from "react";

export default function TopBar({
  themeName,
  onSwitchDesign,
  memeMode,
  onToggleMeme,
  rightSlot,
  onOpenDMR, // optional
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const items = useMemo(
    () => [
      { label: "Home", href: "#home" },
      { label: "About Us", href: "#about" },
      { label: "Game", href: "#game" },
      { label: "DMR", href: "#dmr", isDMR: true },
    ],
    []
  );

  // Prevent background scroll when menu open (mobile UX)
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Close on ESC
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const goTo = (href) => {
    const id = href?.startsWith("#") ? href.slice(1) : "";
    if (id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.location.hash = href; // fallback
    }
    setMenuOpen(false);
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
      <nav className="nav" aria-label="Primary">
        <a href="#home">Home</a>
        <a href="#about">About Us</a>
        <a href="#game">Game</a>

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
        {/* Mobile hamburger */}
        <button
          className="mobileMenuBtn"
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen ? "true" : "false"}
        >
          ☰
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

      {/* Mobile menu portal-like overlay (simple + reliable) */}
      {menuOpen && (
        <>
          <div
            className="mobileMenuBackdrop"
            onClick={() => setMenuOpen(false)}
            role="presentation"
          />
          <div className="mobileMenuSheet" role="dialog" aria-modal="true" aria-label="Menu">
            <button className="mobileMenuClose" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              ✕
            </button>

            <div className="mobileMenuList">
              {items.map((it) => (
                <button
                  key={it.href}
                  type="button"
                  className="mobileMenuItem"
                  onClick={() => {
                    if (it.isDMR) onOpenDMR?.();
                    goTo(it.href);
                  }}
                >
                  {it.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  );
}