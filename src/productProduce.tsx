import { useState } from "react";
import "./productProduce.css";

export default function ProductProduce() {
  // ข้อมูลตัวอย่าง (คุณต่อ API/จริงได้)
  const [items] = useState([
    { id: 1, name: "ชาเขียวมัทฉะ 500ml", status: "update" },
    { id: 2, name: "คุกกี้ช็อกชิพ", status: "update" },
  ]);

  return (
    <div className="produce-page">
      {/* แถบหัวข้อ */}
      <header className="produce-header">
        <button className="back-btn" aria-label="ย้อนกลับ">←</button>
        <h1>ผลิตสินค้า</h1>
      </header>

      {/* รายการการ์ดสินค้า */}
      <div className="cards">
        {items.map((it) => (
          <article key={it.id} className="prod-card">
            {/* รูป/placeholder */}
            <div className="prod-thumb" aria-label="product image placeholder" />

            {/* ข้อมูลกลาง */}
            <div className="prod-info">
              <div className="row">
                <span className="label">ชื่อสินค้า : </span>
                <span className="pill">{it.name}</span>
              </div>
              <div className="row">
                <span className="label">สถานะ : </span>
                <span className="pill">{it.status}</span>
              </div>
            </div>

            {/* แผงปุ่มด้านขวา */}
            <div className="prod-actions">
              <button className="btn primary">ผลิต</button>
              <button className="btn ghost">สั่งวัตถุดิบ</button>
            </div>
          </article>
        ))}
      </div>

      {/* ปุ่มเพิ่มด้านล่าง */}
      <div className="add-wrap">
        <button className="add-btn">+ เพิ่มสินค้าที่ต้องการผลิต</button>
      </div>
    </div>
  );
}
