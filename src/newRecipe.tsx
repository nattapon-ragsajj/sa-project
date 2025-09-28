import { useEffect, useMemo, useState } from "react";


export type MaterialLite = {
  id: number;
  code: string;
  name: string;
  unit: string; // หน่วยมาตรฐานของวัตถุดิบตัวนั้น เช่น "กก.", "ลิตร"
};

export type RecipeItem = {
  materialId: number | null;
  name: string;         // เก็บชื่อไว้ด้วย เผื่อโชว์/บันทึก
  qty: number | "";     // จำนวนที่ใช้ต่อ 1 หน่วยผลิต
  unit: string;         // หน่วย (ดึงจาก material หรือแก้ไขได้)
  note?: string;
};

type Props = {
  open: boolean;
  productName: string;
  materials: MaterialLite[];      // ลิสต์วัตถุดิบให้เลือก
  onClose: () => void;
  onSave: (items: RecipeItem[]) => void; // ส่งสูตรกลับไปให้หน้าพ่อ
};

export default function NewRecipe({
  open,
  productName,
  materials,
  onClose,
  onSave,
}: Props) {
  const emptyRow: RecipeItem = { materialId: null, name: "", qty: "", unit: "" };
  const [rows, setRows] = useState<RecipeItem[]>([emptyRow]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRows([emptyRow]);
      setError("");
    }
  }, [open]);

  const materialMap = useMemo(() => {
    const m = new Map<number, MaterialLite>();
    materials.forEach(mt => m.set(mt.id, mt));
    return m;
  }, [materials]);

  const setRow = (idx: number, patch: Partial<RecipeItem>) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows(prev => [...prev, emptyRow]);
  const removeRow = (idx: number) => setRows(prev => prev.filter((_, i) => i !== idx));

  const onMaterialChange = (idx: number, materialIdStr: string) => {
    const id = materialIdStr ? Number(materialIdStr) : null;
    if (!id) {
      setRow(idx, { materialId: null, name: "", unit: "" });
      return;
    }
    const mt = materialMap.get(id);
    if (!mt) return;
    setRow(idx, { materialId: id, name: mt.name, unit: mt.unit });
  };

  const validate = (): boolean => {
    // ห้ามว่างทั้งแถว, qty ต้อง > 0, ไม่ซ้ำ material
    const used = new Set<number>();
    for (const r of rows) {
      if (!r.materialId) return setError("กรุณาเลือกวัตถุดิบให้ครบทุกแถว"), false;
      if (r.qty === "" || Number(r.qty) <= 0)
        return setError("จำนวนต้องมากกว่า 0"), false;
      if (used.has(r.materialId)) return setError("มีวัตถุดิบซ้ำในสูตร"), false;
      used.add(r.materialId);
    }
    if (rows.length === 0) return setError("กรุณาเพิ่มรายการวัตถุดิบอย่างน้อย 1 รายการ"), false;
    setError("");
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    // แปลง qty ให้เป็น number ให้เรียบร้อย
    const normalized = rows.map(r => ({ ...r, qty: Number(r.qty) }));
    onSave(normalized);
  };

  if (!open) return null;

  return (
    <>
      <button className="nr-overlay" aria-label="close" onClick={onClose} />
      <div className="nr-modal" role="dialog" aria-modal="true">
        <h3 className="nr-title">สูตรวัตถุดิบ: <span className="nr-prod">{productName}</span></h3>
        <p className="nr-sub">กรอกปริมาณวัตถุดิบต่อ “หน่วยผลิต” ของสินค้า</p>

        <div className="nr-table">
          <div className="nr-row nr-head">
            <div>วัตถุดิบ</div>
            <div>จำนวน</div>
            <div>หน่วย</div>
            <div>หมายเหตุ</div>
            <div></div>
          </div>

          {rows.map((r, idx) => (
            <div key={idx} className="nr-row">
              {/* วัตถุดิบ */}
              <div>
                <select
                  className="nr-input"
                  value={r.materialId ?? ""}
                  onChange={(e) => onMaterialChange(idx, e.target.value)}
                >
                  <option value="">-- เลือกวัตถุดิบ --</option>
                  {materials.map(mt => (
                    <option key={mt.id} value={mt.id}>
                      {mt.code} — {mt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* จำนวน */}
              <div>
                <input
                  className="nr-input"
                  type="number"
                  min={0}
                  step="any"
                  value={r.qty}
                  onChange={(e) => setRow(idx, { qty: e.target.value === "" ? "" : Number(e.target.value) })}
                  placeholder="เช่น 0.5"
                />
              </div>

              {/* หน่วย */}
              <div>
                <input
                  className="nr-input"
                  value={r.unit}
                  onChange={(e) => setRow(idx, { unit: e.target.value })}
                  placeholder="เช่น กก., ลิตร, ชิ้น"
                />
              </div>

              {/* โน้ต */}
              <div>
                <input
                  className="nr-input"
                  value={r.note ?? ""}
                  onChange={(e) => setRow(idx, { note: e.target.value })}
                  placeholder="บันทึกเพิ่มเติม (ถ้ามี)"
                />
              </div>

              {/* ลบแถว */}
              <div className="nr-actions">
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => removeRow(idx)}
                  disabled={rows.length <= 1}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="nr-error">{error}</div>}

        <div className="nr-foot">
          <button className="btn ghost" onClick={addRow}>+ เพิ่มแถว</button>
          <div className="spacer" />
          <button className="btn ghost" onClick={onClose}>ยกเลิก</button>
          <button className="btn primary" onClick={handleSave}>บันทึกสูตร</button>
        </div>
      </div>
    </>
  );
}
