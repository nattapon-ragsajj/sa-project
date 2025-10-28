import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./picture.css";
import "./keyword.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = () => {
    if (username === "prod" && password === "1234") navigate("/production");
    else if (username === "wh" && password === "1234") navigate("/warehouse");
    else if (username === "qa" && password === "1234") navigate("/qa");
    else setMessage("❌ Login ไม่สำเร็จ");
  };

  return (
    <>
      <div className="fullscreen">
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

        {/* 🧊 กล่อง login */}
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: "20px",
          }}
        >
          <h1
            style={{
              color: "white",
              textAlign: "center",
              padding: "20px",
              fontSize: "3rem",
              margin: 0,
            }}
          >
            LOGO
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              textAlign: "left",
            }}
          >
            <label
              style={{
                color: "white",
                fontSize: "12px",
                marginBottom: "-14px",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Username / ชื่อผู้ใช้
            </label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "290px",
                height: "40px",
                padding: "10px",
                borderRadius: "10px",
              }}
            />

            <label
              style={{
                color: "white",
                fontSize: "12px",
                marginBottom: "-14px",
                fontFamily: "Arial, sans-serif",
              }}
            >
              รหัสผ่าน
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "290px",
                height: "40px",
                padding: "10px",
                borderRadius: "10px",
              }}
            />

            {/* 🔹 ปุ่มลืมรหัสผ่าน */}
            <span
              onClick={() => setShowForgot(true)}
              style={{
                textAlign: "right",
                color: "#add8e6",
                fontSize: "12px",
                cursor: "pointer",
                marginTop: "-14px",
              }}
            >
              ลืมรหัสผ่าน?
            </span>

            {/* 🔹 ปุ่ม Login */}
            <button
              onClick={handleLogin}
              style={{
                marginTop: "30px",
                fontSize: "0.9rem",
                width: "295px",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "blue",
                color: "white",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "darkblue")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "blue")
              }
            >
              Login
            </button>

            {/* 🔹 สมัครสมาชิก */}
            <span
              onClick={() => navigate("/register")}
              style={{
                textAlign: "center",
                color: "#add8e6",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ยังไม่มีบัญชี? สมัครสมาชิก
            </span>

            <p
              style={{
                color: "white",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 Pop-up ลืมรหัสผ่าน */}
      {showForgot && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <ForgotPasswordPopup onClose={() => setShowForgot(false)} />
        </div>
      )}
    </>
  );
}

export default Login;

/* =============================================
   📦 Component ย่อย: ForgotPasswordPopup
   ============================================= */
function ForgotPasswordPopup({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!username || !newPass || !confirmPass) {
      setError("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (newPass !== confirmPass) {
      setError("❌ รหัสผ่านไม่ตรงกัน");
      return;
    }

    const existing = localStorage.getItem("user");
    if (existing) {
      const user = JSON.parse(existing);
      if (user.username === username) {
        user.password = newPass;
        localStorage.setItem("user", JSON.stringify(user));
        setError("");
        alert("✅ เปลี่ยนรหัสผ่านสำเร็จ!");
        onClose();
      } else {
        setError("❌ ไม่พบบัญชีผู้ใช้ที่ระบุ");
      }
    } else {
      setError("❌ ยังไม่มีข้อมูลผู้ใช้ในระบบ");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "15px",
        padding: "25px",
        width: "340px",
        textAlign: "center",
        boxShadow: "0 0 15px rgba(0,0,0,0.3)",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>เปลี่ยนรหัสผ่านใหม่</h3>
      <p style={{ fontSize: "14px", color: "gray", marginBottom: "15px" }}>
        กรุณากรอกชื่อผู้ใช้และรหัสผ่านใหม่ของคุณ
      </p>

      <input
        type="text"
        placeholder="ชื่อผู้ใช้ (Username)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "10px",
          border: "1px solid gray",
        }}
      />

      <input
        type="password"
        placeholder="รหัสผ่านใหม่"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "10px",
          border: "1px solid gray",
        }}
      />

      <input
        type="password"
        placeholder="ยืนยันรหัสผ่านใหม่"
        value={confirmPass}
        onChange={(e) => setConfirmPass(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "10px",
          border: "1px solid gray",
        }}
      />

      {error && (
        <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        style={{
          padding: "10px",
          borderRadius: "10px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          cursor: "pointer",
          width: "100%",
          fontWeight: "bold",
        }}
      >
        ยืนยันการเปลี่ยนรหัสผ่าน
      </button>

      <button
        onClick={onClose}
        style={{
          marginTop: "10px",
          backgroundColor: "gray",
          color: "white",
          border: "none",
          borderRadius: "10px",
          padding: "8px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        ยกเลิก
      </button>
    </div>
  );
}
