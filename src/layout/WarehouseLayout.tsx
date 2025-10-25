import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../home.css";

export default function WarehouseLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ ตรวจแต่ละหมวด
  const isRawMaterial = location.pathname.startsWith("/warehouse/raw-material");
  const isWarehouseManage = location.pathname.startsWith("/warehouse/warehouse-manage");
  const isWarehouse =
    location.pathname.startsWith("/warehouse") &&
    !isRawMaterial &&
    !isWarehouseManage;

  // ✅ State สำหรับ pop-up
  const [showPopup, setShowPopup] = useState(false);

  // ✅ ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="layout">
      <div className="fullscreenHome" />

      {/* ===== Navbar ===== */}
      <header className="navbar">
        <div className="logo">ฝ่ายคลัง</div>

        <nav className="menu">
          <NavLink
            to="/warehouse"
            className={() => (isWarehouse ? "nav-link active" : "nav-link")}
          >
            จัดการสินค้า
          </NavLink>

          <NavLink
            to="/warehouse/raw-material"
            className={() => (isRawMaterial ? "nav-link active" : "nav-link")}
          >
            จัดการวัตถุดิบ
          </NavLink>

          <NavLink
            to="/warehouse/warehouse-manage-mat"
            className={() => (isWarehouseManage ? "nav-link active" : "nav-link")}
          >
            การทำรายการคลัง
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

      {/* ===== เนื้อหาหลัก ===== */}
      <main className="content-shell">
        <Outlet />
      </main>

      {/* ===== Pop-up ยืนยันการออกจากระบบ ===== */}
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
            <h3 style={{ marginBottom: "12px", color: "#1b1440" }}>
              ออกจากระบบ
            </h3>
            <p style={{ marginBottom: "20px", color: "#333" }}>
              คุณต้องการออกจากระบบหรือไม่?
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
