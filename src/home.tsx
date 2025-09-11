import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const [storeOpen, setStoreOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();

  return (
    <div className="layout">
      <div className="fullscreenHome" />

      <header className="navbar">
        <div className="logo">Manufacturing System</div>

        <nav className="menu">
          <NavLink to="product-produce" className="nav-link">ผลิตสินค้า</NavLink>

          {/* ===== ปุ่ม "คลัง" + PortalDropdown ===== */}
          <div className="menu-item">
            <button
              ref={triggerRef}
              type="button"
              className={`nav-link has-caret ${storeOpen ? "active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={storeOpen}
              onClick={() => setStoreOpen(v => !v)}
            >
              คลัง
            </button>
          </div>

          <NavLink to="production-order" className="nav-link">รายการสั่งซื้อสินค้า</NavLink>
          <NavLink to="q-control" className="nav-link">ควบคุมคุณภาพสินค้า</NavLink>
          <NavLink to="sales-list" className="nav-link">รายการขายสินค้า</NavLink>
        </nav>

        <div className="right-menu">
          <span className="bell" aria-hidden="true">🔔</span>
        </div>
      </header>

      <main className="content-shell">
        <Outlet />
      </main>

      {/* กล่องดรอปดาวน์แบบ Portal (ลอยบนสุด ตำแหน่งตามปุ่ม) */}
      <PortalDropdown
        open={storeOpen}
        onClose={() => setStoreOpen(false)}
        anchorRef={triggerRef}
      >
        <button className="dropdown-link" onClick={() => { setStoreOpen(false); navigate("warehouse"); }}>
          คลังสินค้า
        </button>
        <button className="dropdown-link" onClick={() => { setStoreOpen(false); navigate("raw-material"); }}>
          คลังวัตถุดิบ
        </button>
      </PortalDropdown>
    </div>
  );
}

/* ===== Component: PortalDropdown ===== */
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

  // คำนวณพิกัดใต้ปุ่ม
  const place = () => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.bottom + window.scrollY + 8,       // 8px ระยะห่าง
      left: r.left + window.scrollX,
      width: r.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onWin = () => place();
    const onDown = (e: MouseEvent) => {
      // ปิดเมื่อคลิกนอก
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

  // กล่องจริงถูกวางบน body (ไม่โดนตัด)
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
        zIndex: 99999,  // สูงพอแน่นอน
      }}
    >
      {children}
    </div>,
    document.body
  );
}
