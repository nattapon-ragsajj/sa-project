import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const [storeOpen, setStoreOpen] = useState(false);
  const [qcOpen, setQcOpen] = useState(false);

  const storeBtnRef = useRef<HTMLButtonElement>(null);
  const qcBtnRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();

  // ปิดทุก dropdown เมื่อกด back/forward
  useEffect(() => {
    const closeAll = () => { setStoreOpen(false); setQcOpen(false); };
    window.addEventListener("popstate", closeAll);
    return () => window.removeEventListener("popstate", closeAll);
  }, []);

  // helper: เปิดอันหนึ่งต้องปิดอีกอัน
  const toggleStore = () => { setStoreOpen(v => !v); setQcOpen(false); };
  const toggleQc    = () => { setQcOpen(v => !v);   setStoreOpen(false); };

  return (
    <div className="layout">
      <div className="fullscreenHome" />

      <header className="navbar">
        <div className="logo">Manufacturing System</div>

        <nav className="menu">
          <NavLink to="product-page" className="nav-link">สินค้า</NavLink>
          <NavLink to="product" className="nav-link">ผลิตสินค้า</NavLink>

          {/* ===== ดรอปดาวน์: คลัง ===== */}
          <div className="menu-item">
            <button
              ref={storeBtnRef}
              type="button"
              className={`nav-link has-caret ${storeOpen ? "active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={storeOpen}
              onClick={toggleStore}
            >
              คลัง
            </button>
          </div>

          <NavLink to="production-order" className="nav-link">รายการสั่งซื้อสินค้า</NavLink>

          {/* ===== ดรอปดาวน์: คุณภาพ ===== */}
          <div className="menu-item">
            <button
              ref={qcBtnRef}
              type="button"
              className={`nav-link has-caret ${qcOpen ? "active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={qcOpen}
              onClick={toggleQc}
            >
              ควบคุมคุณภาพ
            </button>
          </div>

          <NavLink to="sales-list" className="nav-link">รายการขายสินค้า</NavLink>
        </nav>

        <div className="right-menu">
          <span className="bell" aria-hidden="true">🔔</span>
        </div>
      </header>

      <main className="content-shell">
        <Outlet />
      </main>

      {/* ===== Dropdown ของ "คลัง" ===== */}
      <PortalDropdown
        open={storeOpen}
        onClose={() => setStoreOpen(false)}
        anchorRef={storeBtnRef}
      >
        <button className="dropdown-link" onClick={() => { setStoreOpen(false); navigate("warehouse"); }}>
          คลังสินค้า
        </button>
        <button className="dropdown-link" onClick={() => { setStoreOpen(false); navigate("raw-material"); }}>
          คลังวัตถุดิบ
        </button>
      </PortalDropdown>

      {/* ===== Dropdown ของ "ควบคุมคุณภาพ" ===== */}
      <PortalDropdown
        open={qcOpen}
        onClose={() => setQcOpen(false)}
        anchorRef={qcBtnRef}
      >
        {/* ปรับเส้นทางตาม route ที่มีในโปรเจ็กต์จริงของคุณได้เลย */}
        <button className="dropdown-link" onClick={() => { setQcOpen(false); navigate("qa-product"); }}>
          ควบคุมคุณภาพสินค้า
        </button>
        <button className="dropdown-link" onClick={() => { setQcOpen(false); navigate("qa-material"); }}>
          ควบคุมคุณภาพวัตถุดิบ
        </button>
      </PortalDropdown>
    </div>
  );
}

/* ===== Component: PortalDropdown (เหมือนเดิม) ===== */
function PortalDropdown({
  open,
  onClose,
  anchorRef,
  children,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{top: number; left: number; width: number}>({top: 0, left: 0, width: 0});

  const place = () => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.bottom + window.scrollY + 8,
      left: r.left + window.scrollX,
      width: r.width,
    });
  };

  useLayoutEffect(() => { if (open) place(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onWin = () => place();
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("scroll", onWin, true);
    window.addEventListener("resize", onWin);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("scroll", onWin, true);
      window.removeEventListener("resize", onWin);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={boxRef}
      role="menu"
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        minWidth: Math.max(220, pos.width),
        background: "#2f2f2f",
        color: "#fff",
        borderRadius: 10,
        padding: 8,
        boxShadow: "0 12px 24px rgba(0,0,0,.28)",
        zIndex: 99999,
      }}
    >
      {children}
    </div>,
    document.body
  );
}
