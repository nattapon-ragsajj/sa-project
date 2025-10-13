import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "./rawMaterial.css";

type StockRow = {
  id: number;
  orderNo: string;
  materialName: string;
  requiredQty: number;
  unit: string;
  status: "ปกติ" | "ต่ำกว่าขั้นต่ำ" | "รอตรวจสอบ";
  enough: "พอ" | "ไม่พอ";
};

const seed: StockRow[] = [
  { id: 1, orderNo: "RM-001", materialName: "น้ำตาลทรายขาว", requiredQty: 50, unit: "กก.", status: "ปกติ",           enough: "พอ" },
  { id: 2, orderNo: "RM-002", materialName: "แป้งสาลี",       requiredQty: 60, unit: "กก.", status: "ต่ำกว่าขั้นต่ำ", enough: "ไม่พอ" },
  { id: 3, orderNo: "RM-003", materialName: "เนยจืด",         requiredQty: 12, unit: "กก.", status: "ปกติ",           enough: "ไม่พอ" },
  { id: 4, orderNo: "RM-004", materialName: "ชาเขียวมัทฉะ",   requiredQty: 10, unit: "กก.", status: "ต่ำกว่าขั้นต่ำ", enough: "พอ" },
  { id: 5, orderNo: "RM-005", materialName: "เกลือ",          requiredQty: 20, unit: "กก.", status: "ปกติ",           enough: "ไม่พอ" },
];

export default function RawMaterial() {
  const [data, setData] = useState<StockRow[]>(seed);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof StockRow>("orderNo");
  const [sortAsc, setSortAsc] = useState(true);

  // ===== Modal: เพิ่ม/แก้ไข (เผื่อใช้งานภายหลัง)
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StockRow | null>(null);
  const [form, setForm] = useState<StockRow>({
    id: 0, orderNo: "", materialName: "", requiredQty: 0, unit: "กก.", status: "ปกติ", enough: "พอ",
  });
  const [err, setErr] = useState("");

  // ===== Modal: ใบคำสั่งซื้อวัตถุดิบ
  const [poOpen, setPoOpen] = useState(false);

  const insufficient = useMemo(() => data.filter(d => d.enough === "ไม่พอ"), [data]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return data
      .filter(d =>
        !s ||
        d.orderNo.toLowerCase().includes(s) ||
        d.materialName.toLowerCase().includes(s) ||
        String(d.requiredQty).includes(s) ||
        d.unit.toLowerCase().includes(s) ||
        d.status.toLowerCase().includes(s) ||
        d.enough.toLowerCase().includes(s)
      )
      .sort((a, b) => {
        const av = typeof a[sortKey] === "number" ? (a[sortKey] as number) : String(a[sortKey]);
        const bv = typeof b[sortKey] === "number" ? (b[sortKey] as number) : String(b[sortKey]);
        if (av < bv) return sortAsc ? -1 : 1;
        if (av > bv) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [data, search, sortKey, sortAsc]);

  const onSort = (key: keyof StockRow) => {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const save = () => {
    if (!form.orderNo.trim() || !form.materialName.trim()) { setErr("กรุณากรอก 'เลขคำสั่งผลิต' และ 'ชื่อวัตถุดิบ'"); return; }
    if (form.requiredQty < 0) { setErr("จำนวนที่ต้องใช้ต้องไม่ติดลบ"); return; }
    if (editing) setData(prev => prev.map(d => (d.id === editing.id ? { ...form, id: editing.id } : d)));
    else {
      const newId = Math.max(0, ...data.map(d => d.id)) + 1;
      setData(prev => [{ ...form, id: newId }, ...prev]);
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    if (!confirm("ต้องการลบแถวนี้ใช่หรือไม่?")) return;
    setData(prev => prev.filter(d => d.id !== id));
  };

    
  const openPO = () => setPoOpen(true);
  const closePO = () => setPoOpen(false);

  void remove;
  void setEditing;

  // ตัวอย่าง "อัปเดตคลัง" — เปลี่ยนรายการที่ไม่พอให้เป็น "พอ" แล้วปิดใบ
  const confirmUpdateStock = () => {
    setData(prev => prev.map(d => d.enough === "ไม่พอ" ? { ...d, enough: "พอ" } : d));
    setPoOpen(false);
  };

  return (
    <div className="rm-page">
      <div className="rm-top">
        <div className="rm-tabs">
          <NavLink to="/home/raw-material" end className="tab-link">การจัดการ</NavLink>
          <NavLink to="/home/raw-material/raw-stock" className="tab-link">คลัง</NavLink>
        </div>
        {/* <div className="rm-right-buttons">
          <button className="btn gray">สั่งซื้อวัตถุดิบ</button>
          <button className="btn danger">โอนย้ายคลัง</button>
        </div> */}
      </div>

      <div className="rm-toolbar">
        <div className="tools-left"><div className="title">คลังวัตถุดิบ</div></div>
        <div className="tools-right">
          <input
            className="rm-input"
            placeholder="ค้นหา: เลขคำสั่ง / ชื่อ / สถานะ / ผลการตรวจสอบ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rm-table">
        <div className="rm-row rm-head">
          <button className="th" onClick={() => onSort("orderNo")}>เลขคำสั่งผลิต</button>
          <button className="th" onClick={() => onSort("materialName")}>ชื่อวัตถุดิบ</button>
          <button className="th" onClick={() => onSort("requiredQty")}>จำนวนที่ต้องใช้</button>
          <button className="th" onClick={() => onSort("unit")}>หน่วย</button>
          <div className="th">สถานะ</div>
          <div className="th">ผลการตรวจสอบ</div>
        </div>

        {filtered.map(row => {
          const isRed = row.enough === "ไม่พอ"; // แดงเฉพาะ "ไม่พอ"
          return (
            <div key={row.id} className={`rm-row ${isRed ? "low" : ""}`}>
              <div className="td mono">{row.orderNo}</div>
              <div className="td">{row.materialName}</div>
              <div className="td mono">{row.requiredQty.toLocaleString()}</div>
              <div className="td">{row.unit}</div>
              <div className="td">{row.status}</div>
              <div className="td">{row.enough}</div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="rm-empty">ไม่พบข้อมูล</div>}
      </div>

      <div className="rm-footer-actions">
        <button
          className="btn primary"
          onClick={openPO}
          disabled={insufficient.length === 0}
          title={insufficient.length === 0 ? "ไม่มีรายการที่ไม่เพียงพอ" : ""}
        >
          + สร้างใบคำสั่งซื้อวัตถุดิบ
        </button>
      </div>

      {/* ===== ใบคำสั่งซื้อวัตถุดิบ ===== */}
      {poOpen && (
        <>
          <button className="po-overlay" aria-label="close" onClick={closePO} />
          <div className="po-wrap">
            <div className="po-card">
              <h3 className="po-title">ใบคำสั่งซื้อวัตถุดิบ</h3>
              <div className="po-paper">
                <div className="po-list">
                  {insufficient.map(item => (
                    <div key={item.id} className="po-line">
                      <div className="po-name">ชื่อวัตถุดิบ : {item.materialName}</div>
                      <div className="po-qty">จำนวน : {item.requiredQty} {item.unit}</div>
                    </div>
                  ))}
                  {insufficient.length === 0 && <div className="po-empty">ไม่มีรายการ</div>}
                </div>
              </div>
              <div className="po-actions">
                <button className="btn soft" onClick={closePO}>ยกเลิก</button>
                <button className="btn primary solid" onClick={confirmUpdateStock}>อัปเดตคลัง</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== Modal เพิ่ม/แก้ไข (เก็บไว้) ===== */}
      {open && (
        <>
          <button className="rm-overlay" aria-label="close" onClick={() => setOpen(false)} />
          <div className="rm-modal" role="dialog" aria-modal="true">
            <h3 className="modal-title">{editing ? "แก้ไขแถว" : "เพิ่มแถว"}</h3>
            <div className="form-grid">
              <label>เลขคำสั่งผลิต<span className="req">*</span>
                <input value={form.orderNo} onChange={e => setForm({ ...form, orderNo: e.target.value })} />
              </label>
              <label>ชื่อวัตถุดิบ<span className="req">*</span>
                <input value={form.materialName} onChange={e => setForm({ ...form, materialName: e.target.value })} />
              </label>
              <label>จำนวนที่ต้องใช้
                <input type="number" min={0} value={form.requiredQty} onChange={e => setForm({ ...form, requiredQty: Number(e.target.value) })}/>
              </label>
              <label>หน่วย
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  <option>กก.</option><option>ลิตร</option><option>ก.</option><option>ชิ้น</option>
                </select>
              </label>
              <label>สถานะ
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as StockRow["status"] })}>
                  <option value="ปกติ">ปกติ</option>
                  <option value="ต่ำกว่าขั้นต่ำ">ต่ำกว่าขั้นต่ำ</option>
                  <option value="รอตรวจสอบ">รอตรวจสอบ</option>
                </select>
              </label>
              <label>ผลการตรวจสอบ
                <select value={form.enough} onChange={e => setForm({ ...form, enough: e.target.value as StockRow["enough"] })}>
                  <option value="พอ">พอ</option>
                  <option value="ไม่พอ">ไม่พอ</option>
                </select>
              </label>
            </div>
            {err && <div className="rm-error">{err}</div>}
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setOpen(false)}>ยกเลิก</button>
              <button className="btn primary" onClick={save}>{editing ? "บันทึกการแก้ไข" : "บันทึก"}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
