import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import "./materialSelect.css"; // (ถ้ายังไม่มี ใช้สไตล์เบื้องต้นด้านล่างได้)

export default function MaterialSelect() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const product = state?.product;
  const baseQty = state?.quantity ?? 0;

  // ถ้าเข้าหน้านี้ตรง ๆ โดยไม่มี state ให้ย้อนกลับ
  if (!product) {
    return (
      <div style={{padding:16}}>
        ไม่พบข้อมูลสินค้า <button onClick={() => navigate(-1)}>ย้อนกลับ</button>
      </div>
    );
  }

  // ตัวอย่าง: สูตรวัตถุดิบต่อ 1 หน่วยสินค้า (mock)
  const bom = useMemo(() => [
    { id: "MAT-01", name: "ผงมัทฉะ", unit: "g", perUnit: 10 },
    { id: "MAT-02", name: "นมสด",   unit: "ml", perUnit: 200 },
    { id: "MAT-03", name: "น้ำตาล",  unit: "g", perUnit: 15 },
  ], []);

  // คำนวณจำนวนที่ต้องใช้ตาม baseQty
  const initial = bom.map(m => ({
    ...m,
    required: m.perUnit * baseQty,
  }));

  const [materials, setMaterials] = useState(initial);

  const updateRequired = (id, val) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, required: Number(val) || 0 } : m));
  };

  const handleSubmit = () => {
    // TODO: ส่งข้อมูล materials ไป backend เพื่อจอง/ตัดสต็อก
    console.log("สร้างคำสั่งผลิต:", {
      product,
      quantity: baseQty,
      materials
    });
    // เสร็จแล้วอาจพากลับหน้ารายการผลิต หรือโชว์ success
    navigate("/home/product-produce");
  };

  return (
    <div className="ms-wrap">
      <div className="ms-header">
        <button className="ms-back" onClick={() => navigate(-1)} aria-label="ย้อนกลับ">←</button>
        <h2>ระบุรายการวัตถุดิบ</h2>
      </div>

      <div className="ms-product">
        <div><strong>สินค้า:</strong> {product.name}</div>
        <div><strong>จำนวนผลิต:</strong> {baseQty}</div>
      </div>

      <div className="ms-table">
        <div className="ms-row ms-head">
          <div>รหัสวัตถุดิบ</div>
          <div>ชื่อวัตถุดิบ</div>
          <div>ต่อหน่วย</div>
          <div>ที่ต้องใช้รวม</div>
        </div>

        {materials.map(m => (
          <div key={m.id} className="ms-row">
            <div className="mono">{m.id}</div>
            <div>{m.name}</div>
            <div>{m.perUnit} {m.unit} / ชิ้น</div>
            <div>
              <input
                type="number"
                min="0"
                value={m.required}
                onChange={(e) => updateRequired(m.id, e.target.value)}
                className="ms-input"
              />
              <span className="unit">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="ms-actions">
        <button className="btn ghost" onClick={() => navigate(-1)}>ยกเลิก</button>
        <button className="btn primary" onClick={handleSubmit}>บันทึกและดำเนินการ</button>
      </div>
    </div>
  );
}
