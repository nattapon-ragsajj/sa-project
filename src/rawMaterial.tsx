import { useMemo, useState } from "react";
import "./rawMaterial.css";

type Material = {
  id: number;
  code: string;
  name: string;
  category: string;
  qty: number;
  unit: string;
  minQty: number; // จุดเตือนสต็อกต่ำ
  note?: string;
};




/*ดึงข้องมูลจากตรงนี้ */
const seed: Material[] = [
  { id: 1, code: "RM-001", name: "น้ำตาลทรายขาว", category: "วัตถุดิบหลัก", qty: 120, unit: "กก.", minQty: 50, note: "" },
  { id: 2, code: "RM-002", name: "แป้งสาลี",     category: "วัตถุดิบหลัก", qty: 30,  unit: "กก.", minQty: 40, note: "" },
  { id: 3, code: "RM-003", name: "เนยจืด",       category: "วัตถุดิบเสริม", qty: 12,  unit: "กก.", minQty: 10, note: "" },
  { id: 4, code: "RM-004", name: "ชาเขียวมัทฉะ", category: "สารแต่งกลิ่น/สี", qty: 6, unit: "กก.", minQty: 8, note: "" },
  { id: 5, code: "RM-005", name: "เกลือ",        category: "วัตถุดิบเสริม", qty: 80,  unit: "กก.", minQty: 30, note: "" },
];

export default function RawMaterial() {
  const [data, setData] = useState<Material[]>(seed);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ทั้งหมด");
  const [sortKey, setSortKey] = useState<keyof Material>("code");
  const [sortAsc, setSortAsc] = useState(true);

  // modal states
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState<Material>({
    id: 0, code: "", name: "", category: "", qty: 0, unit: "กก.", minQty: 0, note: ""
  });
  const [err, setErr] = useState("");

  const categories = useMemo(() => ["ทั้งหมด", ...Array.from(new Set(data.map(d => d.category)))], [data]);

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
        const va = a[sortKey];
        const vb = b[sortKey];
        // แปลงเป็นตัวเลข/สตริงเพื่อเปรียบเทียบ
        const av = typeof va === "number" ? va : String(va);
        const bv = typeof vb === "number" ? vb : String(vb);
        if (av < bv) return sortAsc ? -1 : 1;
        if (av > bv) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [data, search, catFilter, sortKey, sortAsc]);

  const resetForm = () => {
    setForm({ id: 0, code: "", name: "", category: "", qty: 0, unit: "กก.", minQty: 0, note: "" });
    setErr("");
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const openEdit = (row: Material) => {
    setEditing(row);
    setForm({ ...row });
    setErr("");
    setOpen(true);
  };

  const save = () => {
    // validate
    if (!form.code.trim() || !form.name.trim()) {
      setErr("กรุณากรอก 'รหัส' และ 'ชื่อวัตถุดิบ'");
      return;
    }
    if (form.qty < 0 || form.minQty < 0) {
      setErr("จำนวนต้องไม่ติดลบ");
      return;
    }

    if (editing) {
      // update
      setData(prev => prev.map(d => (d.id === editing.id ? { ...form, id: editing.id } : d)));
    } else {
      // create
      const newId = Math.max(0, ...data.map(d => d.id)) + 1;
      setData(prev => [{ ...form, id: newId }, ...prev]);
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    if (!confirm("ต้องการลบวัตถุดิบนี้ใช่หรือไม่?")) return;
    setData(prev => prev.filter(d => d.id !== id));
  };

  const onSort = (key: keyof Material) => {
    if (sortKey === key) setSortAsc(a => !a);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="rm-wrap">
      <header className="rm-header">
        <h2>คลังวัตถุดิบ</h2>
        <div className="rm-actions">
          <input
            className="rm-search"
            placeholder="ค้นหา: รหัส/ชื่อ/หมวดหมู่"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rm-select"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn primary" onClick={openAdd}>+ เพิ่มวัตถุดิบ</button>
        </div>
      </header>

      <div className="rm-table">
        <div className="rm-row rm-head">
          <button className="th" onClick={() => onSort("code")}>รหัส</button>
          <button className="th" onClick={() => onSort("name")}>ชื่อวัตถุดิบ</button>
          <button className="th" onClick={() => onSort("category")}>หมวดหมู่</button>
          <button className="th" onClick={() => onSort("qty")}>คงเหลือ</button>
          <div className="th">ขั้นต่ำ</div>
          <div className="th">การจัดการ</div>
        </div>

        {filtered.map(row => {
          const low = row.qty < row.minQty;
          return (
            <div key={row.id} className={`rm-row ${low ? "low" : ""}`}>
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

        {filtered.length === 0 && (
          <div className="rm-empty">ไม่พบข้อมูล</div>
        )}
      </div>

      {/* Modal เพิ่ม/แก้ไข */}
      {open && (
        <>
          <button className="rm-overlay" aria-label="close" onClick={() => setOpen(false)} />
          <div className="rm-modal" role="dialog" aria-modal="true">
            <h3 className="modal-title">{editing ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบ"}</h3>

            <div className="form-grid">
              <label>
                รหัส<span className="req">*</span>
                <input
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                />
              </label>
              <label>
                ชื่อวัตถุดิบ<span className="req">*</span>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                หมวดหมู่
                <input
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="เช่น วัตถุดิบหลัก / วัตถุดิบเสริม"
                />
              </label>
              <label>
                คงเหลือ
                <div className="inline">
                  <input
                    type="number"
                    min={0}
                    value={form.qty}
                    onChange={e => setForm({ ...form, qty: Number(e.target.value) })}
                  />
                  <select
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                  >
                    <option>กก.</option>
                    <option>ลิตร</option>
                    <option>ก.</option>
                    <option>ชิ้น</option>
                  </select>
                </div>
              </label>
              <label>
                ขั้นต่ำ (แจ้งเตือน)
                <input
                  type="number"
                  min={0}
                  value={form.minQty}
                  onChange={e => setForm({ ...form, minQty: Number(e.target.value) })}
                />
              </label>
              <label className="col-span">
                หมายเหตุ
                <textarea
                  rows={2}
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                />
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
