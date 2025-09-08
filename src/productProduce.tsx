import { useEffect, useRef, useState } from "react";
import "./productProduce.css";

export default function ProductProduce() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");

  // ข้อมูลตัวอย่าง
  const [items] = useState([
    { id: 1, name: "ชาเขียวมัทฉะ 500ml", status: "update" },
    { id: 2, name: "คุกกี้ช็อกชิพ", status: "update" },
  ]);

  const handleCreateProductClick = (item) => {
    setSelected(item);
    setQuantity("");
    setError("");
    setOpen(true);
  };

  const handleConfirm = () => {
    // TODO: เรียก API สร้างคำสั่งผลิตที่นี่
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setError("กรุณากรอกจำนวนที่ถูกต้อง");
      return;
    }
    console.log("ยืนยันผลิต:", selected, "จำนวน:", quantity);
    setOpen(false);
  };

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
            <div className="prod-thumb" aria-label="product image placeholder" />
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

            {/* ปุ่มขวา */}
            <div className="prod-actions">
              <button
                className="btn primary"
                onClick={() => handleCreateProductClick(it)}
              >
                สั่งผลิต
              </button>
              <button className="btn ghost">สั่งวัตถุดิบ</button>
            </div>
          </article>
        ))}
      </div>

      {/* ปุ่มเพิ่มด้านล่าง */}
      <div className="add-wrap">
        <button className="add-btn">+ เพิ่มสินค้าที่ต้องการผลิต</button>
        
      </div>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="modal-title">ยืนยันการสั่งผลิต</h3>
        <p className="modal-sub">
          ต้องการผลิต <strong>{selected?.name}</strong> หรือไม่?
        </p>

        <label className="modal-label">
          จำนวนที่ต้องการผลิต:
          <input
            type="number"
            min="1"
            className="modal-input"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
        {error && <div className="modal-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn ghost" onClick={() => setOpen(false)}>ยกเลิก</button>
          <button className="btn primary" onClick={handleConfirm}>ยืนยัน</button>
        </div>
      </Modal>
    </div>
  );
}

/* ===== Modal Component ===== */
function Modal({ open, onClose, children }) {
  const dialogRef = useRef(null);

  // ปิดด้วย ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // โฟกัสปุ่มแรกเมื่อเปิด
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelector("button, [href], input, select, textarea");
      focusable?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button className="modal-overlay" aria-label="Close" onClick={onClose} />
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={dialogRef}
      >
        {children}
      </div>
    </>
  );
}
