import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../home.css";
import { useEffect, useState } from "react";

export default function ProductionLayout() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (!localStorage.getItem("user")) {
      console.log("Unauthorized access to", path);
    }
  }, []);

  return (
    <div className="layout">
      <div className="fullscreenHome" />

      <header className="navbar">
        <div className="logo">ฝ่ายผลิต</div>
        <nav className="menu">
          <NavLink to="/production" end className="nav-link">
            สินค้า
          </NavLink>
          <NavLink to="/production/product" className="nav-link">
            ผลิตสินค้า
          </NavLink>
          <NavLink to="/production/build-product" className="nav-link">
            สร้างสูตร
          </NavLink>
        </nav>

        {/* 🔹 ปุ่ม Logout */}
        <div className="right-menu">
          <button
            onClick={() => setShowPopup(true)}
            className="logout-btn"
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      <main className="content-shell">
        <Outlet />
      </main>

      {/* ===== Pop-up Logout ===== */}
      {showPopup && (
        <>
          <div
            className="logout-overlay"
            onClick={() => setShowPopup(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 999,
            }}
          ></div>

          <div
            className="logout-modal"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "24px 32px",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              zIndex: 1000,
              textAlign: "center",
              width: "300px",
            }}
          >
            <h3 style={{ marginBottom: "12px", color: "#1b1440" }}>ออกจากระบบ</h3>
            <p style={{ marginBottom: "20px", color: "#333" }}>
              คุณต้องการออกจากระบบฝ่ายผลิตหรือไม่?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  background: "#ccc",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: "#2b0c6b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
