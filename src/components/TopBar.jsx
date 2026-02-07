import { useEffect, useMemo, useState } from "react";

export default function TopBar({
  themeName, // (istifadə olunmaya bilər, saxladım)
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

  const scrollTo = (href) => {
    const id = href?.startsWith("#") ? href.slice(1) : "";
    if (!id) return;

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // fallback (əgər id yoxdur)
      window.location.hash = href;
    }
  };

  const handleNav = (it, { closeMenu } = { closeMenu: false }) => {
    if (it?.isDMR) {
      onOpenDMR?.();
    }
    scrollTo(it.href);
    if (closeMenu) setMenuOpen(false);
  };

  // ✅ Menu open olanda:
  // - body scroll lock
  // - body.menu-open class əlavə et (sənin CSS fix-in işləsin)
  useEffect(() => {
    const body = document.body;

    if (!menuOpen) {
      body.style.overflow = "";
      body.classList.remove("menu-open");
      return;
    }

    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    body.classList.add("menu-open");

    return () => {
      body.style.overflow = prevOverflow;
      body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  // ESC ilə bağla
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Ekran böyüyəndə (desktop-a keçəndə) menu açıq qalmasın
  useEffect(() => {
    if (!menuOpen) return;

    const mq = window.matchMedia("(min-width: 901px)");
    const onChange = (e) => {
      if (e.matches) setMenuOpen(false);
    };

    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [menuOpen]);

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

      {/* Desktop nav (mövcud dizaynı pozmamaq üçün <a> saxlanıldı) */}
      <nav className="nav" aria-label="Primary">
        {items.map((it) => (
          <a
            key={it.href}
            href={it.href}
            onClick={(e) => {
              e.preventDefault();
              handleNav(it, { closeMenu: false });
            }}
            title={it.isDMR ? "Daily Micro Ritual" : undefined}
            aria-label={it.isDMR ? "Daily Micro Ritual" : undefined}
          >
            {it.label}
          </a>
        ))}
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

        <button
          className="iconBtn"
          onClick={onSwitchDesign}
          title="Switch Design"
          aria-label="Switch Design"
          type="button"
        >
          ✦
        </button>

        <button
          className={`iconBtn ${memeMode ? "iconBtnOn" : ""}`}
          onClick={onToggleMeme}
          title="Meme Mode"
          aria-label="Meme Mode"
          type="button"
        >
          ☄
        </button>

        {rightSlot}
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <>
          <div
            className="mobileMenuBackdrop"
            onClick={() => setMenuOpen(false)}
            role="presentation"
          />
          <div
            className="mobileMenuSheet"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <button
              className="mobileMenuClose"
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>

            <div className="mobileMenuList">
              {items.map((it) => (
                <button
                  key={it.href}
                  type="button"
                  className="mobileMenuItem"
                  onClick={() => handleNav(it, { closeMenu: true })}
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