import { NavLink, Outlet } from "react-router-dom";
import "../home.css"; // รีใช้สไตล์ layout/navbar เดิม


export default function ProductionLayout() {
return (
<div className="layout">
<div className="fullscreenHome" />


<header className="navbar">
<div className="logo">ฝ่ายผลิต</div>
<nav className="menu">
<NavLink to="/production" end className="nav-link">สินค้า</NavLink>
<NavLink to="/production/product" className="nav-link">ผลิตสินค้า</NavLink>
<NavLink to="/production/build-product" className="nav-link">สร้างสูตร</NavLink>
</nav>
<div className="right-menu"><span className="bell">🔔</span></div>
</header>


<main className="content-shell">
<Outlet />
</main>
</div>
);
}