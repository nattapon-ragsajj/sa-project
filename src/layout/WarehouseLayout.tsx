import { NavLink, Outlet } from "react-router-dom";
import "../home.css"; // ใช้ navbar/style เดิม


export default function WarehouseLayout() {
return (
<div className="layout">
<div className="fullscreenHome" />


<header className="navbar">
<div className="logo">ฝ่ายคลัง</div>
<nav className="menu">
<NavLink to="/warehouse" end className="nav-link">คลังสินค้า</NavLink>
<NavLink to="/warehouse/raw-material" className="nav-link">คลังวัตถุดิบ</NavLink>
<NavLink to="/warehouse/warehouse-stock" className="nav-link">ประวัติการทำรายการ</NavLink>
</nav>
<div className="right-menu"><span className="bell">🔔</span></div>
</header>


<main className="content-shell">
<Outlet />
</main>
</div>
);
}