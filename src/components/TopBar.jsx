import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function TopBar({
  themeName, // (istifadə olunmaya bilər, saxladım)
  onSwitchDesign,
  memeMode,
  onToggleMeme,
  rightSlot,
  onOpenDMR, // optional
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalEl, setPortalEl] = useState(null);
  const closeBtnRef = useRef(null);

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
      window.location.hash = href;
    }
  };

  const handleNav = (it, { closeMenu } = { closeMenu: false }) => {
    if (it?.isDMR) onOpenDMR?.();
    scrollTo(it.href);
    if (closeMenu) setMenuOpen(false);
  };

  // Portal container (overlay-i body-ə çıxarırıq ki hero altında qalmasın)
  useEffect(() => {
    if (typeof document === "undefined") return;

    const el = document.createElement("div");
    el.setAttribute("id", "topbar-mobile-menu-root");
    document.body.appendChild(el);
    setPortalEl(el);

    return () => {
      document.body.removeChild(el);
      setPortalEl(null);
    };
  }, []);

  // Menu open olanda: body scroll lock + class
  useEffect(() => {
    if (typeof document === "undefined") return;

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

  // Desktop-a keçəndə menu açıq qalmasın
  useEffect(() => {
    if (!menuOpen) return;

    const mq = window.matchMedia("(min-width: 901px)");
    const onChange = (e) => {
      if (e.matches) setMenuOpen(false);
    };

    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [menuOpen]);

  // Açılarkən close düyməsinə fokus (mobil UX + klik donma hissini azaldır)
  useEffect(() => {
    if (!menuOpen) return;
    closeBtnRef.current?.focus?.();
  }, [menuOpen]);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const overlay =
    menuOpen && portalEl
      ? createPortal(
          <>
            {/* Backdrop: həmişə üst qat + klik keçir */}
            <div
              className="mobileMenuBackdrop"
              role="presentation"
              onMouseDown={closeMenu}
              onTouchStart={closeMenu}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                background: "rgba(0,0,0,0.72)",
                pointerEvents: "auto",
              }}
            />

            {/* Sheet: həmişə üst qat */}
            <div
              className="mobileMenuSheet"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                height: "100vh",
                width: "min(86vw, 360px)",
                zIndex: 9999,
                pointerEvents: "auto",
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <button
                ref={closeBtnRef}
                className="mobileMenuClose"
                type="button"
                onClick={closeMenu}
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
          </>,
          portalEl
        )
      : null;

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
          onClick={menuOpen ? closeMenu : openMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
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

      {/* Portal overlay */}
      {overlay}
    </header>
  );
}