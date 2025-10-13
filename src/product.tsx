import { useEffect, useRef, useState } from "react";
import "./product.css";
import { useNavigate } from "react-router-dom";


interface Item {
  id: number;
  no: string;
  status: string;
  date: string;
  name?: string; 
}



export default function Product() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [error, setError] = useState<string>("");

  // ข้อมูลตัวอย่าง
  const [items] = useState<Item[]>([
    { id: 1, no: "ID : NO.1", status: "กำลังแพ็ค", date: "01/18/2568 15:34:02" },
    { id: 2, no: "ID : NO.2", status: "กำลังประกอบอาหาร", date: "01/18/2568 15:34:02" },
  ]);

  const handleCreateProductClick = (item: Item) => {
    setSelected(item);
    setQuantity("");
    setError("");
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      setError("กรุณากรอกจำนวนที่ถูกต้อง");
      return;
    }
    navigate("/home/material-select", {
      state: { product: selected, quantity: Number(quantity) },
    });
  };

  const qtyValid = quantity !== "" && !isNaN(Number(quantity)) && Number(quantity) > 0;


  

  return (
    <div className="produce-page">
      {/* แถบหัวข้อ */}
      <header className="produce-header">
        <button className="back-btn" aria-label="ย้อนกลับ" onClick={() => navigate(-1)}>←</button>
        <h1>ผลิตสินค้า</h1>
      </header>

      {/* ปุ่มเพิ่มด้านล่าง */}
      {/* <div className="add-wrap">
        <button className="add-btn" onClick={() => navigate("/home/product")}>
          + สร้างคำสั่งผลิต
        </button>
      </div> */}

      {/* รายการการ์ดสินค้า */}
      <div className="cards">
        {items.map((it) => (
          <article key={it.id} className="prod-card">
            <div className="prod-thumb" aria-label="product image placeholder" />

            <div className="prod-info">
              <div className="row">
                <span className="label">เลขคำสั่งซื้อสินค้า : </span>
                <span className="pill">{it.no}</span>
              </div>
              <div className="row">
                <span className="label">วันที่สร้างคำสั่งผลิตสินค้า : </span>
                <span className="pill">{it.date}</span>
              </div>
              <div className="row">
                <span className="label">สถานะ : </span>
                <span className="pill">{it.status}</span>
              </div>
            </div>

            {/* ปุ่มขวา 
            <div className="prod-actions">
              <button
                className="btn primary"
                onClick={() => handleCreateProductClick(it)}
              >
                สั่งผลิต
              </button>
              <button className="btn ghost">สั่งวัตถุดิบ</button>
            </div>*/}
          </article>
        ))}
      </div>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 id="modal-title" className="modal-title">ยืนยันการสั่งผลิต</h3>
        <p className="modal-sub">
          ต้องการผลิต <strong>{selected?.name}</strong> หรือไม่?
        </p>

        <label className="modal-label" htmlFor="qty-input">จำนวนที่ต้องการผลิต:</label>
        <input
          id="qty-input"
          type="number"
          min={1}
          className="modal-input"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        {error && <div className="modal-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn ghost" onClick={() => setOpen(false)}>ยกเลิก</button>
          <button
            className="btn primary"
            onClick={handleConfirm}
            disabled={!qtyValid}
            style={{ opacity: qtyValid ? 1 : 0.6, cursor: qtyValid ? "pointer" : "not-allowed" }}
          >
            ยืนยัน
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ===== Modal Component ===== */
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // ปิดด้วย ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // โฟกัสอัตโนมัติ
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelector<HTMLElement>("input, button, [href], select, textarea");
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
