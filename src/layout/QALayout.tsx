import { NavLink, Outlet } from "react-router-dom";
import "../home.css"; // ใช้ navbar/style เดิม


export default function QALayout() {
return (
<div className="layout">
<div className="fullscreenHome" />


<header className="navbar">
<div className="logo">ฝ่ายควบคุมคุณภาพ</div>
<nav className="menu">
<NavLink to="/qa" end className="nav-link">QA สินค้า</NavLink>
<NavLink to="/qa/material" className="nav-link">QA วัตถุดิบ</NavLink>
</nav>
<div className="right-menu"><span className="bell">🔔</span></div>
</header>


<main className="content-shell">
<Outlet />
</main>
</div>
);
}