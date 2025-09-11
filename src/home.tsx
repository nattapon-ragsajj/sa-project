import { useEffect, useState } from "react";
import { NavLink, Outlet,useNavigate } from "react-router-dom";
import "./home.css";
import "./picture.css";


function Home() {
  const [storeOpen, setStoreOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const navigate = useNavigate();

  // ปิดแผงเมื่อกด ESC
  useEffect(() => {
    const onKey = (e: { key: string; }) => {
      if (e.key === "Escape") 
        setDashOpen(false);
        setStoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // กันเลื่อนหน้าหลักตอนเปิด dashboard
  useEffect(() => {
    if (dashOpen) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [dashOpen]);

  return (
    <div className="layout">
      <div className="fullscreenHome"></div>
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">Manufacturing System</div>

        {/* เมนูหลัก: แสดงตลอด */}
        <nav className="menu">
          {/* ใช้ NavLink เพื่อ active state และ “อยู่บนแพลตฟอร์มของ Home” ด้วย path แบบ relative */}
          <NavLink to="product-produce" className="nav-link">ผลิตสินค้า</NavLink>
          {/*<NavLink to="raw-material"    className="nav-link">คลังวัตถุดิบ</NavLink>*/}
          {/*<NavLink to="warehouse"       className="nav-link">คลังสินค้า</NavLink>*/}
          {/* ===== ดรอปดาวน์: คลัง ===== */}
          <div
            className={`menu-item ${storeOpen ? "open" : ""}`}
            onMouseEnter={() => setStoreOpen(true)}
            onMouseLeave={() => setStoreOpen(false)}
          >
            <button
              type="button"
              className="nav-link has-caret"
              aria-haspopup="true"
              aria-expanded={storeOpen}
              onClick={() => setStoreOpen(v => !v)} // รองรับคลิก/มือถือ
            >
              คลัง ▾
            </button>

            <div className="dropdown" role="menu">
              <button className="dropdown-link" onClick={() => navigate("warehouse")}>
                คลังสินค้า
              </button>
              <button className="dropdown-link" onClick={() => navigate("raw-material")}>
                คลังวัตถุดิบ
              </button>
            </div>
          </div>
          {/* ===== จบดรอปดาวน์ ===== */}

          <NavLink to="production-order" className="nav-link">รายการสั่งซื้อสินค้า</NavLink>
          <NavLink to="q-control"     className="nav-link">ควบคุมคุณภาพสินค้า</NavLink>
          <NavLink to="sales-list"      className="nav-link">รายการขายสินค้า</NavLink>
          {/*<NavLink to="product-produce" className="nav-link">ผลิตสินค้า</NavLink>*/}

        </nav>

        {/* ปุ่มด้านขวา */}
        <div className="right-menu">
          <span className="bell" aria-hidden="true">🔔</span>

          {/* ปุ่มสามขีด = เปิด Dashboard 
          <button
            type="button"
            className={`hamburger ${dashOpen ? "active" : ""}`}
            aria-label="Toggle dashboard"
            aria-expanded={dashOpen}
            onClick={() => setDashOpen((v) => !v)}
          >
            <span></span><span></span><span></span>
          </button>*/}
        </div>
      </header>

      {/* ที่วางหน้าลูก (จะอยู่ใต้ Navbar ตลอด) */}
      <main className="content-shell">
        <Outlet />
      </main>

      {/* Overlay */}
      {dashOpen && (
        <button
          className="dash-overlay"
          aria-label="Close dashboard"
          onClick={() => setDashOpen(false)}
        />
      )}

      {/* Dashboard Side Panel */}
      <aside className={`dashboard ${dashOpen ? "open" : ""}`} aria-hidden={!dashOpen}>
        <div className="dash-header">
          <h3>Dashboard</h3>
          <button className="dash-close" onClick={() => setDashOpen(false)} aria-label="Close">
            ×
          </button>
        </div>

        <nav className="dash-links">
          <a href="#">รายการคำสั่งซื้อสินค้า (Production Order)</a>
          <a href="#">รายการสินค้า (Inventory)</a>
          <a href="#">คุณภาพสินค้า (Quality Control)</a>
          <a href="#">รายงาน (Reports)</a>
          <a href="#">ตั้งค่า (Setting)</a>
        </nav>
      </aside>
    </div>
  );
}

export default Home;
