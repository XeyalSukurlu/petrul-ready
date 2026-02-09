import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function TopBar({
  themeName,
  onSwitchDesign,
  memeMode,
  onToggleMeme,
  rightSlot,
  onOpenDMR,
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
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.hash = href;
  };

  const handleNav = (it, { closeMenu } = { closeMenu: false }) => {
    if (it?.isDMR) onOpenDMR?.();
    scrollTo(it.href);
    if (closeMenu) setMenuOpen(false);
  };

  // Portal root
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

  // Scroll lock
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

  // ESC close
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Desktop-a keçəndə bağla
  useEffect(() => {
    if (!menuOpen) return;

    const mq = window.matchMedia("(min-width: 901px)");
    const onChange = (e) => e.matches && setMenuOpen(false);

    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) closeBtnRef.current?.focus?.();
  }, [menuOpen]);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const overlay =
    menuOpen && portalEl
      ? createPortal(
          <>
            {/* Backdrop */}
            <div
              className="mobileMenuBackdrop"
              role="presentation"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeMenu();
              }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483646,
                pointerEvents: "auto",
              }}
            />

            {/* Sheet */}
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
                zIndex: 2147483647,
                pointerEvents: "auto",
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                ref={closeBtnRef}
                className="mobileMenuClose"
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeMenu();
                }}
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
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNav(it, { closeMenu: true });
                    }}
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
        <div className="brandTitleRow">
          <div className="brandTitle">PETRUL</div>
          <span className="mcLogo" aria-label="mC logo">
            <span className="mcInner">mC</span>
          </span>
        </div>
      </div>

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

      {overlay}
    </header>
  );
}