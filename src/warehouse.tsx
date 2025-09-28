import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "./warehouse.css";

type Warehouse = {
  id: number;
  code: string;
  name: string;
  category: string;
  qty: number;
  unit: string;
  minQty: number;
  note?: string;
};

const seed: Warehouse[] = [
  { id: 1, code: "RM-001", name: "น้ำตาลทรายขาว", category: "วัตถุดิบหลัก", qty: 120, unit: "กก.", minQty: 50 },
  { id: 2, code: "RM-002", name: "แป้งสาลี",     category: "วัตถุดิบหลัก", qty: 30,  unit: "กก.", minQty: 40 },
  { id: 3, code: "RM-003", name: "เนยจืด",       category: "วัตถุดิบเสริม", qty: 12,  unit: "กก.", minQty: 10 },
  { id: 4, code: "RM-004", name: "ชาเขียวมัทฉะ", category: "สารแต่งกลิ่น/สี", qty: 6, unit: "กก.", minQty: 8 },
  { id: 5, code: "RM-005", name: "เกลือ",        category: "วัตถุดิบเสริม", qty: 80,  unit: "กก.", minQty: 30 },
];

export default function WareRawMaterial() {
  const [data, setData] = useState<Warehouse[]>(seed);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ทั้งหมด");
  const [sortKey, setSortKey] = useState<keyof Warehouse>("code");
  const [sortAsc, setSortAsc] = useState(true);

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [form, setForm] = useState<Warehouse>({
    id: 0, code: "", name: "", category: "", qty: 0, unit: "กก.", minQty: 0, note: ""
  });
  const [err, setErr] = useState("");

  const categories = useMemo(
    () => ["ทั้งหมด", ...Array.from(new Set(data.map(d => d.category)))],
    [data]
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return data
      .filter(d => (catFilter === "ทั้งหมด" ? true : d.category === catFilter))
      .filter(d =>
        !s ||
        d.code.toLowerCase().includes(s) ||
        d.name.toLowerCase().includes(s) ||
        d.category.toLowerCase().includes(s)
      )
      .sort((a, b) => {
        const av = typeof a[sortKey] === "number" ? (a[sortKey] as number) : String(a[sortKey]);
        const bv = typeof b[sortKey] === "number" ? (b[sortKey] as number) : String(b[sortKey]);
        if (av < bv) return sortAsc ? -1 : 1;
        if (av > bv) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [data, search, catFilter, sortKey, sortAsc]);

  const onSort = (key: keyof Warehouse) => {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const resetForm = () => {
    setForm({ id: 0, code: "", name: "", category: "", qty: 0, unit: "กก.", minQty: 0, note: "" });
    setErr("");
  };
  const openAdd = () => { setEditing(null); resetForm(); setOpen(true); };
  const openEdit = (row: Warehouse) => { setEditing(row); setForm({ ...row }); setErr(""); setOpen(true); };

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) { setErr("กรุณากรอก 'รหัส' และ 'ชื่อวัตถุดิบ'"); return; }
    if (form.qty < 0 || form.minQty < 0) { setErr("จำนวนต้องไม่ติดลบ"); return; }

    if (editing) setData(prev => prev.map(d => (d.id === editing.id ? { ...form, id: editing.id } : d)));
    else {
      const newId = Math.max(0, ...data.map(d => d.id)) + 1;
      setData(prev => [{ ...form, id: newId }, ...prev]);
    }
    setOpen(false);
  };
  const remove = (id: number) => {
    if (!confirm("ต้องการลบวัตถุดิบนี้ใช่หรือไม่?")) return;
    setData(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="wh-page">
      {/* แถบหัวข้อ + เมนูย่อย + ปุ่มด้านขวา */}
      <div className="wh-top">
        <div className="wh-tabs">
          <NavLink to="/home/warehouse" end className="tab-link">การจัดการ</NavLink>
          <NavLink to="/home/warehouse/warehouse-stock" className="tab-link">คลัง</NavLink>
      </div>


        <div className="wh-right-buttons">
          {/* <button className="btn primary" onClick={openAdd}>+ เพิ่มวัตถุดิบ</button> */}
          <button className="btn gray">สั่งซื้อวัตถุดิบ</button>
          <button className="btn danger">โอนย้ายคลัง</button>
        </div>
      </div>

      {/* แถวเครื่องมือค้นหา/กรอง */}
      <div className="wh-toolbar">
        <div className="tools-left">
          <div className="title">คลังสินค้า</div>
        </div>
        <div className="tools-right">
          <input
            className="wh-input"
            placeholder="ค้นหา: รหัส / ชื่อ / หมวดหมู่"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="wh-input"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* ตาราง */}
      <div className="wh-table">
        <div className="wh-row wh-head">
          <button className="th" onClick={() => onSort("code")}>เลขคำสั่งผลิต</button>
          <button className="th" onClick={() => onSort("name")}>ชื่อวัตถุดิบ</button>
          <button className="th" onClick={() => onSort("category")}>หมวดหมู่</button>
          <button className="th" onClick={() => onSort("qty")}>คงเหลือ</button>
          <div className="th">ขั้นต่ำ</div>
          <div className="th">การจัดการ</div>
        </div>

        {filtered.map(row => {
          const low = row.qty < row.minQty;
          return (
            <div key={row.id} className={`wh-row ${low ? "low" : ""}`}>
              <div className="td mono">{row.code}</div>
              <div className="td">{row.name}</div>
              <div className="td">{row.category}</div>
              <div className="td mono">{row.qty.toLocaleString()} <span className="unit">{row.unit}</span></div>
              <div className="td mono">{row.minQty.toLocaleString()} <span className="unit">{row.unit}</span></div>
              <div className="td actions">
                <button className="btn ghost" onClick={() => openEdit(row)}>แก้ไข</button>
                <button className="btn danger" onClick={() => remove(row.id)}>ลบ</button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && <div className="wh-empty">ไม่พบข้อมูล</div>}
      </div>

      {/* Modal เพิ่ม/แก้ไข */}
      {open && (
        <>
          <button className="wh-overlay" aria-label="close" onClick={() => setOpen(false)} />
          <div className="wh-modal" role="dialog" aria-modal="true">
            <h3 className="modal-title">{editing ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบ"}</h3>

            <div className="form-grid">
              <label>รหัส<span className="req">*</span>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              </label>
              <label>ชื่อวัตถุดิบ<span className="req">*</span>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>หมวดหมู่
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </label>
              <label>คงเหลือ
                <div className="inline">
                  <input
                    type="number" min={0}
                    value={form.qty}
                    onChange={e => setForm({ ...form, qty: Number(e.target.value) })}
                  />
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option>กก.</option><option>ลิตร</option><option>ก.</option><option>ชิ้น</option>
                  </select>
                </div>
              </label>
              <label>ขั้นต่ำ (แจ้งเตือน)
                <input
                  type="number" min={0}
                  value={form.minQty}
                  onChange={e => setForm({ ...form, minQty: Number(e.target.value) })}
                />
              </label>
              <label className="col-span">หมายเหตุ
                <textarea rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
              </label>
            </div>

            {err && <div className="wh-error">{err}</div>}

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
