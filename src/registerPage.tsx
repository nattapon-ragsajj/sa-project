import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./picture.css";
import "./keyword.css";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    if (!username || !password || !confirm || !role) {
      setError("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (password !== confirm) {
      setError("❌ รหัสผ่านไม่ตรงกัน");
      return;
    }

    const newUser = { username, password, role };
    localStorage.setItem("user", JSON.stringify(newUser));
    alert("✅ สมัครสมาชิกสำเร็จ!");
    navigate("/");
  };

  return (
    <div
      className="fullscreen"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100vh", // ✅ ให้เต็มจอถ้าเนื้อหาน้อย
        padding: "40px 0", // ✅ เผื่อระยะขอบด้านบนล่าง
        overflow: "hidden",
      }}
    >
      {/* ❄️ หิมะตก */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: Math.random() * window.innerWidth + "px",
            animationDuration: 3 + Math.random() * 6 + "s",
            fontSize: 10 + Math.random() * 30 + "px",
          }}
        >
          .
        </div>
      ))}

      {/* 🔹 กล่องหลัก (โปร่งใสกล่องเดียว) */}
      <div
        className="card"
        style={{
          width: "380px",
          background: "rgba(255, 255, 255, 0.15)", // ✅ โปร่งใส
          borderRadius: "20px",
          padding: "40px 30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
          height: "auto", // ✅ ยืดตามเนื้อหา
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "2rem",
            marginBottom: "25px",
            textShadow: "0 0 6px rgba(0,0,0,0.4)",
          }}
        >
          สมัครสมาชิกใหม่
        </h1>

        {/* ฟอร์มสมัคร */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "10px",
          }}
        >
          <label
            style={{
              fontSize: "13px",
              color: "white",
              textAlign: "left",
            }}
          >
            ชื่อผู้ใช้
          </label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
            }}
          />

          <label style={{ fontSize: "13px", color: "white", textAlign: "left" }}>
            รหัสผ่าน
          </label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
            }}
          />

          <label style={{ fontSize: "13px", color: "white", textAlign: "left" }}>
            ยืนยันรหัสผ่าน
          </label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
            }}
          />

          <label style={{ fontSize: "13px", color: "white", textAlign: "left" }}>
            ตำแหน่ง / ฝ่าย
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.9)", // ✅ พื้นขาว
              color: "black", // ✅ ตัวอักษรดำ
            }}
          >
            <option value="">-- กรุณาเลือกฝ่าย --</option>
            <option value="warehouse">ฝ่ายการคลัง</option>
            <option value="production">ฝ่ายการผลิต</option>
            <option value="qa">ฝ่ายควบคุมคุณภาพ</option>
          </select>

          {/* ❗ Error */}
          {error && (
            <p
              style={{
                color: "#ff6666",
                fontSize: "13px",
                marginTop: "5px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            style={{
              marginTop: "20px",
              fontSize: "0.9rem",
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "rgba(0, 102, 255, 0.9)",
              color: "white",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0, 60, 200, 1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0, 102, 255, 0.9)")
            }
          >
            สมัครสมาชิก
          </button>

          <span
            onClick={() => navigate("/")}
            style={{
              textAlign: "center",
              color: "#add8e6",
              fontSize: "12px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </span>
        </div>
      </div>
    </div>
  );
}
