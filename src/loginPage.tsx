import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./picture.css"; // อย่าลืม import CSS
import "./keyword.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // ใช้เปลี่ยนหน้า

  const handleLogin = () => { 
    if (username === "admin" && password === "1234") {
      setMessage("✅ Login สำเร็จ! ยินดีต้อนรับ " + username);
      navigate("/Home"); // ไปหน้า Home
    } else {
      setMessage("❌ Login ไม่สำเร็จ! กรุณาลองใหม่");
    }
  };

  return (
    <div className="fullscreen">
      {/* inner container ทั้งหมดรวม LOGO + ฟอร์ม */}


      {/* หิมะ */}
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
      
      <div className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center", // กึ่งกลางแนวตั้ง
          height: "100%",           // ต้องเต็มความสูง container
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



        <div style={{ display: "flex",flexDirection: "column",gap: "15px",textAlign: "left"}}>
        <label style={{color: "white" ,fontSize: "12px",marginBottom: "-14px",fontFamily: "Arial, sans-serif"}}>Username / ชื่อผู้ใช้</label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "270px",height: "20px", padding: "10px", borderRadius: "10px" }}
        />
        <label style={{color: "white" ,fontSize: "12px",marginBottom: "-14px",fontFamily: "Arial, sans-serif"}}>รหัสผ่าน</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "270px",height: "20px", padding: "10px", borderRadius: "10px" }}
        />
        <label style={{textAlign: "right",color: "white" ,fontSize: "12px",marginTop: "-14px",fontFamily: "Arial, sans-serif"}}>ลืมรหัสผ่าน</label>


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
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "darkblue")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "blue")}
        >
          Login
        </button>
        <label style={{textAlign: "center",color: "white" ,fontSize: "12px",marginBottom: "-14px",fontFamily: "Arial, sans-serif",}}>สร้างบัญชีใหม่</label>

        <p style={{ color: "white", marginTop: "10px",textAlign: "center"}}>{message}</p>
      </div>
    </div>
  </div>
  );
}

export default Login;
