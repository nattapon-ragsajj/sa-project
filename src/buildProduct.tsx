import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./buildProduct.css";

type NewProduct = {
  name: string;
  category: string;
  imageUrl: string;
  note: string;
  status: "active" | "inactive";
};

export default function ProductProcess() {
  const navigate = useNavigate();
  const [form, setForm] = useState<NewProduct>({
    name: "",
    category: "",
    imageUrl: "",
    note: "",
    status: "active",
  });
  const [error, setError] = useState<string>("");

  const onChange = (k: keyof NewProduct, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อสินค้า");
      return;
    }
    // TODO: เรียก API บันทึกสินค้าใหม่
    console.log("สร้างสินค้าใหม่:", form);

    // เสร็จแล้วกลับไปหน้า ProductProduce
    navigate("/home/product-produce", { replace: true });
  };

  return (
    <div className="pp-wrap">
      <div className="pp-container">
      <div className="pp-header">
        <button className="pp-back" onClick={() => navigate(-1)}>←</button>
        <h2>เพิ่มสินค้าใหม่</h2>
      </div>

      <form className="pp-form" onSubmit={onSubmit}>
        <div className="pp-row">
          <label className="pp-label">ชื่อสินค้า <span className="req">*</span></label>
          <input
            className="pp-input"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="เช่น ชาเขียวมัทฉะ 500ml"
          />
        </div>

        <div className="pp-row">
          <label className="pp-label">หมวดหมู่</label>
          <input
            className="pp-input"
            value={form.category}
            onChange={(e) => onChange("category", e.target.value)}
            placeholder="เช่น เครื่องดื่ม"
          />
        </div>

        <div className="pp-row">
          <label className="pp-label">ลิงก์รูปภาพ</label>
          <input
            className="pp-input"
            value={form.imageUrl}
            onChange={(e) => onChange("imageUrl", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="pp-row">
          <label className="pp-label">สถานะ</label>
          <select
            className="pp-select"
            value={form.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            <option value="active">เปิดใช้งาน</option>
            <option value="inactive">ปิดใช้งาน</option>
          </select>
        </div>

        <div className="pp-row">
          <label className="pp-label">หมายเหตุ</label>
          <textarea
            className="pp-textarea"
            value={form.note}
            onChange={(e) => onChange("note", e.target.value)}
            rows={3}
            placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
          />
        </div>

        {error && <div className="pp-error">{error}</div>}

        <div className="pp-actions">
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate(-1)}
          >
            ยกเลิก
          </button>
          <button type="submit" className="btn primary">
            บันทึกสินค้า
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
