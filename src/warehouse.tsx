import { useMemo, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./warehouse.css";

type Row = {
  id: number;
  lotNo: string;        // เลขล็อต
  orderNo: string;      // เลขคำสั่งผลิต
  name: string;         // ชื่อสินค้า/วัตถุดิบ
  qty: number;          // จำนวนคงเหลือ
  unit: string;         // หน่วย
  mfgDate: string;      // วันที่ผลิต (YYYY-MM-DD)
  expDate: string;      // วันหมดอายุ (YYYY-MM-DD)
};

// ตัวอย่างข้อมูล
const seed: Row[] = [
  { id:1, lotNo:"L-240901", orderNo:"PO-001", name:"น้ำตาลทรายขาว", qty:120, unit:"กก.", mfgDate:"2025-09-01", expDate:"2026-09-01" },
  { id:2, lotNo:"L-240915", orderNo:"PO-002", name:"แป้งสาลี",       qty:30,  unit:"กก.", mfgDate:"2025-09-15", expDate:"2026-03-15" },
  { id:3, lotNo:"L-240920", orderNo:"PO-003", name:"เนยจืด",         qty:12,  unit:"กก.", mfgDate:"2025-09-20", expDate:"2026-01-20" },
  { id:4, lotNo:"L-240925", orderNo:"PO-004", name:"ชาเขียวมัทฉะ",  qty:6,   unit:"กก.", mfgDate:"2025-09-25", expDate:"2026-09-25" },
  { id:5, lotNo:"L-240930", orderNo:"PO-005", name:"เกลือ",          qty:80,  unit:"กก.", mfgDate:"2025-09-30", expDate:"2027-09-30" },
];

export default function WareHouse() {
  const [rows, setRows] = useState<Row[]>(seed);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ทั้งหมด"); // เผื่ออนาคตถ้าจะกรองหมวดหมู่

  // ========== แผ่นนำออก (สีน้ำเงิน) ==========
  const [openSheet, setOpenSheet] = useState(false);
  const [active, setActive] = useState<Row | null>(null);
  const [takeQty, setTakeQty] = useState<number>(0);
  const [takeType, setTakeType] = useState<"ขาย" | "หมดอายุ">("ขาย");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenSheet(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(r =>
      !s ||
      r.lotNo.toLowerCase().includes(s) ||
      r.orderNo.toLowerCase().includes(s) ||
      r.name.toLowerCase().includes(s)
    );
  }, [rows, q]);

  const onRowClick = (r: Row) => {
    setActive(r);
    setTakeQty(0);
    setTakeType("ขาย");
    setNote("");
    setErr("");
    setOpenSheet(true);
  };

  const confirmTakeOut = () => {
    if (!active) return;
    if (takeQty <= 0) { setErr("กรุณากรอกจำนวนที่นำออก (> 0)"); return; }
    if (takeQty > active.qty) { setErr("จำนวนที่นำออกมากกว่าคงเหลือ"); return; }

    setRows(prev =>
      prev.map(x => (x.id === active.id ? { ...x, qty: x.qty - takeQty } : x))
    );

    try {
      const rec = {
        id: Date.now(),
        time: new Date().toISOString(),
        type: takeType,               // "ขาย" | "หมดอายุ"
        lotNo: active.lotNo,
        orderNo: active.orderNo,
        name: active.name,
        qty: takeQty,
        unit: active.unit,
        note: note?.trim() || "",
      };
      const raw = localStorage.getItem("wh-history");
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(rec); // ใส่บนสุด
      localStorage.setItem("wh-history", JSON.stringify(arr));
    } catch {}
    
    setOpenSheet(false);
  };

  return (
    <div className="wh-page">

      {/* ===== แท็บบน: ไป-กลับระหว่างคลัง และประวัติการทำรายการ ===== */}
      <div className="wh-tabs" style={{ marginBottom: 12 }}>
        <NavLink to="/home/warehouse" end className="tab-link">คลัง</NavLink>
        <NavLink to="/home/warehouse/warehouse-stock"end className="tab-link">
          ประวัติการทำรายการ
        </NavLink>
      </div>


    <div className="wh-header">
  <div className="wh-section-title">คลังสินค้า</div>
  <div className="wh-tools">
    <input
      className="wh-input"
      placeholder="ค้นหา: เลขล็อต / เลขคำสั่งผลิต / ชื่อสินค้า"
      value={q}
      onChange={(e)=>setQ(e.target.value)}
    />
    <select className="wh-input" value={cat} onChange={(e)=>setCat(e.target.value)}>
      <option>ทั้งหมด</option>
    </select>
  </div>
</div>



      {/* ตารางหลัก */}
      <div className="wh-table-wrap">
        <div className="wh-table">
          <div className="wh-row wh-head">
            <div>เลขล็อต</div>
            <div>เลขคำสั่งผลิต</div>
            <div>ชื่อสินค้า</div>
            <div>จำนวน</div>
            <div>หน่วย</div>
            <div>วันที่ผลิต</div>
            <div>วันหมดอายุ</div>
          </div>

          {filtered.map((r, i) => (
            <div
              key={r.id}
              className={`wh-row wh-body ${i % 2 ? "alt" : ""}`}
              onClick={() => onRowClick(r)}
              role="button"
            >
              <div className="mono">{r.lotNo}</div>
              <div className="mono">{r.orderNo}</div>
              <div>{r.name}</div>
              <div className="mono">{r.qty.toLocaleString()}</div>
              <div>{r.unit}</div>
              <div className="mono">{r.mfgDate}</div>
              <div className="mono">{r.expDate}</div>
            </div>
          ))}

          {filtered.length === 0 && <div className="wh-empty">ไม่พบข้อมูล</div>}
        </div>
      </div>

      {/* ========== แผ่นสีน้ำเงิน (นำออก) ========== */}
      {openSheet && active && (
        <>
          <button className="sheet-backdrop" onClick={()=>setOpenSheet(false)} aria-label="close" />
          <div className="sheet">
            {/* ซ้าย: รายละเอียดคงที่ */}
            <div className="sheet-left">
              <div><span>เลขล็อต</span><b>{active.lotNo}</b></div>
              <div><span>เลขคำสั่งผลิต</span><b>{active.orderNo}</b></div>
              <div><span>ชื่อสินค้า</span><b>{active.name}</b></div>
              <div><span>จำนวน</span><b>{active.qty.toLocaleString()}</b></div>
              <div><span>วันที่ผลิต</span><b>{active.mfgDate}</b></div>
              <div><span>วันหมดอายุ</span><b>{active.expDate}</b></div>
            </div>

            {/* ขวา: กล่องฟอร์มม่วงอ่อน */}
            <div className="sheet-right">
              <div className="form-card">
                <h3>นำออก</h3>

                <label className="inline">
                  <span>จำนวน</span>
                  <input
                    type="number"
                    min={0}
                    value={takeQty}
                    onChange={(e)=>setTakeQty(Number(e.target.value))}
                  />
                  <span className="unit">{active.unit}</span>
                </label>

                <div className="inline">
                  <span>ประเภทการนำออก</span>
                  <div className="seg">
                    <button
                      type="button"
                      className={`seg-btn ${takeType === "ขาย" ? "on":""}`}
                      onClick={()=>setTakeType("ขาย")}
                    >ขาย</button>
                    <button
                      type="button"
                      className={`seg-btn ${takeType === "หมดอายุ" ? "on":""}`}
                      onClick={()=>setTakeType("หมดอายุ")}
                    >หมดอายุ</button>
                  </div>
                </div>

                <label className="block">
                  <span>หมายเหตุ</span>
                  <textarea rows={4} value={note} onChange={(e)=>setNote(e.target.value)} />
                </label>

                {err && <div className="form-error">{err}</div>}

                <div className="sheet-actions">
                  <button className="btn cancel" onClick={()=>setOpenSheet(false)}>ยกเลิก</button>
                  <button className="btn confirm" onClick={confirmTakeOut}>ยืนยัน</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
