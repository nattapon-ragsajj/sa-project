import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./warehouse.css";

type StockRow = {
  id: number;
  orderNo: string;
  materialName: string;
  requiredQty: number;
  unit: string;
  status: "ปกติ" | "ต่ำกว่าขั้นต่ำ" | "รอตรวจสอบ";
  qa: "ผ่าน" | "ไม่ผ่าน" | "รอผล";
};

const seed: StockRow[] = [
  { id: 1, orderNo: "RM-001", materialName: "น้ำตาลทรายขาว", requiredQty: 50, unit: "กก.", status: "ปกติ", qa: "ผ่าน" },
  { id: 2, orderNo: "RM-002", materialName: "แป้งสาลี", requiredQty: 60, unit: "กก.", status: "ต่ำกว่าขั้นต่ำ", qa: "รอผล" },
  { id: 3, orderNo: "RM-003", materialName: "เนยจืด", requiredQty: 12, unit: "กก.", status: "ปกติ", qa: "ผ่าน" },
  { id: 4, orderNo: "RM-004", materialName: "ชาเขียวมัทฉะ", requiredQty: 10, unit: "กก.", status: "ต่ำกว่าขั้นต่ำ", qa: "ไม่ผ่าน" },
  { id: 5, orderNo: "RM-005", materialName: "เกลือ", requiredQty: 20, unit: "กก.", status: "ปกติ", qa: "ผ่าน" },
];

export default function WarehouseStock() {
  const [rows, setRows] = useState<StockRow[]>(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StockRow>({
    id: 0,
    orderNo: "",
    materialName: "",
    requiredQty: 0,
    unit: "กก.",
    status: "ปกติ",
    qa: "รอผล",
  });

  const openAdd = () => {
    setForm({
      id: 0,
      orderNo: "",
      materialName: "",
      requiredQty: 0,
      unit: "กก.",
      status: "ปกติ",
      qa: "รอผล",
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.orderNo.trim() || !form.materialName.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    const newId = Math.max(0, ...rows.map(r => r.id)) + 1;
    setRows(prev => [...prev, { ...form, id: newId }]);
    setOpen(false);
  };

  return (
    <div className="wh-page">
      {/* Tabs */}
      <div className="wh-top">
        <div className="wh-tabs">
          <NavLink to="/home/warehouse" end className="tab-link">การจัดสรร</NavLink>
          <NavLink to="/home/warehouse/warehouse-stock" className="tab-link">คลัง</NavLink>
        </div>
        <div className="wh-right-buttons">
          <button className="btn primary" onClick={openAdd}>+ เพิ่มวัตถุดิบ</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="wh-toolbar" style={{ marginTop: 70 }}>
        <div className="tools-left"><div className="title">คลังสินค้า</div></div>
      </div>

      {/* Table */}
      <div className="wh-table">
        <div className="wh-row wh-head">
          <div className="th">เลขคำสั่งผลิต</div>
          <div className="th">ชื่อวัตถุดิบ</div>
          <div className="th">จำนวนที่ต้องใช้</div>
          <div className="th">หน่วย</div>
          <div className="th">สถานะ</div>
          <div className="th">ผลการตรวจสอบ</div>
        </div>

        {rows.map(r => {
          const low = r.status === "ต่ำกว่าขั้นต่ำ";
          return (
            <div key={r.id} className={`wh-row ${low ? "low" : ""}`}>
              <div className="td mono">{r.orderNo}</div>
              <div className="td">{r.materialName}</div>
              <div className="td mono">{r.requiredQty.toLocaleString()}</div>
              <div className="td">{r.unit}</div>
              <div className="td">{r.status}</div>
              <div className="td">{r.qa}</div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {open && (
        <>
          <button className="wh-overlay" aria-label="close" onClick={() => setOpen(false)} />
          <div className="wh-modal" role="dialog" aria-modal="true">
            <h3 className="modal-title">เพิ่มวัตถุดิบ</h3>
            <div className="form-grid">
              <label>รหัส
                <input value={form.orderNo} onChange={e => setForm({ ...form, orderNo: e.target.value })} />
              </label>
              <label>ชื่อวัตถุดิบ
                <input value={form.materialName} onChange={e => setForm({ ...form, materialName: e.target.value })} />
              </label>
              <label>จำนวนที่ต้องใช้
                <input type="number" value={form.requiredQty} onChange={e => setForm({ ...form, requiredQty: Number(e.target.value) })} />
              </label>
              <label>หน่วย
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  <option>กก.</option>
                  <option>ลิตร</option>
                  <option>ชิ้น</option>
                </select>
              </label>
              <label>สถานะ
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as StockRow["status"] })}>
                  <option>ปกติ</option>
                  <option>ต่ำกว่าขั้นต่ำ</option>
                  <option>รอตรวจสอบ</option>
                </select>
              </label>
              <label>ผลการตรวจสอบ
                <select value={form.qa} onChange={e => setForm({ ...form, qa: e.target.value as StockRow["qa"] })}>
                  <option>ผ่าน</option>
                  <option>ไม่ผ่าน</option>
                  <option>รอผล</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setOpen(false)}>ยกเลิก</button>
              <button className="btn primary" onClick={save}>บันทึก</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
