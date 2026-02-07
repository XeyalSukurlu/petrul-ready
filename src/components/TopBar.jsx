import React, { useEffect, useMemo, useState } from "react";

/**
 * TopBar
 * - Desktop: inline nav links
 * - Mobile: hamburger opens a modal menu with backdrop
 * - Fixes: click not working (z-index / pointer events), adds backdrop, locks body scroll
 */
export default function TopBar() {
  const navLinks = useMemo(
    () => [
      { label: "Home", id: "home" },
      { label: "About Us", id: "about" },
      { label: "Game", id: "game" },
      { label: "DMR", id: "dmr" },
    ],
    []
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onNavClick = (id) => {
    setMobileOpen(false);
    window.requestAnimationFrame(() => scrollToSection(id));
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prevOverflow || "";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow || "";
    };
  }, [mobileOpen]);

  return (
    <header className="topbar">
      <div className="topbarInner">
        <div className="brand">
          <div className="brandTitle">PETRUL</div>
          <div className="brandSub">Mystic Community</div>
        </div>

        <nav className="nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <button
              key={link.id}
              className="navLink"
              type="button"
              onClick={() => onNavClick(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button
          className="hamburgerBtn"
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileOpen ? "true" : "false"}
          onClick={() => setMobileOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>

        {mobileOpen && (
          <div className="mobileMenuLayer" role="dialog" aria-modal="true">
            <button
              className="mobileMenuBackdrop"
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />

            <div className="mobileMenuPanel" role="document">
              <button
                className="mobileMenuClose"
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                ×
              </button>

              <div className="mobileMenuList">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    className="mobileMenuItem"
                    type="button"
                    onClick={() => onNavClick(link.id)}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="topbarRight">
          <button className="iconBtn" type="button" aria-label="Star">
            ✨
          </button>
          <button className="iconBtn" type="button" aria-label="Wand">
            🪄
          </button>
          <button className="iconBtn" type="button" aria-label="Music">
            🎵
          </button>
        </div>
      </div>
    </header>
  );
}