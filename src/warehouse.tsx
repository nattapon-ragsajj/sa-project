import { useMemo, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./warehouse.css";

type Row = {
  id: number;
  lotNo: string;        // เลขล็อต
  orderNo: string;      // เลขคำสั่งผลิต (ใช้เป็นรหัสสินค้า)
  name: string;         // ชื่อสินค้า
  qty: number;          // จำนวนคงเหลือ
  unit: string;         // หน่วย
  mfgDate: string;      // วันที่ผลิต
  expDate: string;      // วันหมดอายุ
};

// ตัวอย่างข้อมูล
const seed: Row[] = [
  { id: 1, lotNo: "L-240901", orderNo: "PO-001", name: "น้ำตาลทรายขาว", qty: 40, unit: "กก.", mfgDate: "2025-09-01", expDate: "2026-09-01" },
  { id: 2, lotNo: "L-240902", orderNo: "PO-001", name: "น้ำตาลทรายขาว", qty: 80, unit: "กก.", mfgDate: "2025-09-10", expDate: "2026-09-10" },
  { id: 3, lotNo: "L-240915", orderNo: "PO-002", name: "แป้งสาลี", qty: 30, unit: "กก.", mfgDate: "2025-09-15", expDate: "2026-03-15" },
  { id: 4, lotNo: "L-240920", orderNo: "PO-003", name: "เนยจืด", qty: 12, unit: "กก.", mfgDate: "2025-09-20", expDate: "2026-01-20" },
  { id: 5, lotNo: "L-240925", orderNo: "PO-004", name: "ชาเขียวมัทฉะ", qty: 6, unit: "กก.", mfgDate: "2025-09-25", expDate: "2026-09-25" },
  { id: 6, lotNo: "L-240930", orderNo: "PO-005", name: "เกลือ", qty: 80, unit: "กก.", mfgDate: "2025-09-30", expDate: "2027-09-30" },
];

export default function WareHouse() {
  const [rows, setRows] = useState<Row[]>(seed);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ทั้งหมด");
  const [openSheet, setOpenSheet] = useState(false);
  const [active, setActive] = useState<Row | null>(null);
  const [takeQty, setTakeQty] = useState<number>(0);
  const [takeType, setTakeType] = useState<"ขาย" | "หมดอายุ">("ขาย");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  // 🟣 state ใหม่: เก็บสินค้าที่เลือกเพื่อดูรายละเอียดล็อต
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenSheet(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        !s ||
        r.lotNo.toLowerCase().includes(s) ||
        r.orderNo.toLowerCase().includes(s) ||
        r.name.toLowerCase().includes(s)
    );
  }, [rows, q]);

  const confirmTakeOut = () => {
    if (!active) return;
    if (takeQty <= 0) {
      setErr("กรุณากรอกจำนวนที่นำออก (> 0)");
      return;
    }
    if (takeQty > active.qty) {
      setErr("จำนวนที่นำออกมากกว่าคงเหลือ");
      return;
    }

    setRows((prev) =>
      prev.map((x) => (x.id === active.id ? { ...x, qty: x.qty - takeQty } : x))
    );

    try {
      const rec = {
        id: Date.now(),
        time: new Date().toISOString(),
        type: takeType,
        lotNo: active.lotNo,
        orderNo: active.orderNo,
        name: active.name,
        qty: takeQty,
        unit: active.unit,
        note: note?.trim() || "",
      };
      const raw = localStorage.getItem("wh-history");
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(rec);
      localStorage.setItem("wh-history", JSON.stringify(arr));
    } catch {}
    setOpenSheet(false);
  };

  // ✅ รวมสินค้าไม่ซ้ำ (เพื่อแสดงในตารางหลัก)
  const uniqueProducts = useMemo(() => {
    const map = new Map<string, { name: string; total: number; lots: number }>();
    for (const r of rows) {
      if (!map.has(r.orderNo))
        map.set(r.orderNo, { name: r.name, total: 0, lots: 0 });
      const p = map.get(r.orderNo)!;
      p.total += r.qty;
      p.lots += 1;
    }
    return Array.from(map.entries()).map(([code, v]) => ({
      code,
      ...v,
    }));
  }, [rows]);

  // ✅ แสดงเฉพาะล็อตของสินค้าที่เลือก
  const selectedLots = useMemo(
    () => rows.filter((r) => r.orderNo === selectedProduct),
    [rows, selectedProduct]
  );

  return (
    <div className="wh-page">
      {/* ===== Tabs ด้านบน ===== */}
      
      
      <h2 className="wmm-title">คลังสินค้า</h2>

      <div className="wh-header">
        

        <div className="wh-tabs">
    <NavLink to="/warehouse" end className="tab-link">
      คลังสินค้า
    </NavLink>
    <NavLink to="/warehouse/warehouse-stock" end className="tab-link">
      จัดเก็บสินค้า
    </NavLink>
    <NavLink to="/warehouse/manage-product" end className="tab-link">
      นำสินค้าจากคลังออก
    </NavLink>
  </div>

  {/* ✅ ย้ายเครื่องมือค้นหามาอยู่นอกแท็บ */}
  <div className="wh-tools">
    <input
      className="wh-input"
      placeholder="ค้นหา: รหัส / ชื่อสินค้า"
      value={q}
      onChange={(e) => setQ(e.target.value)}
    />
    <select
      className="wh-input"
      value={cat}
      onChange={(e) => setCat(e.target.value)}
    >
      <option>ทั้งหมด</option>
    </select>
  </div>
        
      </div>

      {/* ================= ตารางหลัก (สรุปสินค้า) ================= */}
      {!selectedProduct && (
        <div className="wh-table-wrap">
          <div className="wh-table">
            <div className="wh-row wh-head">
              <div>รหัสสินค้า</div>
              <div>ชื่อสินค้า</div>
              <div>จำนวนทั้งหมด</div>
              <div>จำนวนล็อต</div>
            </div>

            {uniqueProducts.map((p, i) => (
              <div
                key={p.code}
                className={`wh-row wh-body ${i % 2 ? "alt" : ""}`}
                onClick={() => setSelectedProduct(p.code)}
                role="button"
              >
                <div>{p.code}</div>
                <div>{p.name}</div>
                <div>{p.total}</div>
                <div>{p.lots}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= ตารางรายละเอียดล็อต ================= */}
      {selectedProduct && (
        <div>
          <div style={{ marginBottom: "25px" ,marginTop: "25px"}}>
            <strong>รหัสสินค้า:</strong> {selectedLots[0]?.orderNo} <br />
            <strong>ชื่อสินค้า:</strong> {selectedLots[0]?.name}
          </div>

          <div className="wh-table-wrap">
            <div className="wh-table">
              <div className="wh-row wh-head">
                <div>เลขล็อต</div>
                <div>จำนวนที่มีอยู่</div>
                <div>วันที่ผลิต</div>
                <div>วันหมดอายุ</div>
              </div>

              {selectedLots.map((r, i) => (
                <div
                  key={r.id}
                  className={`wh-row wh-body ${i % 2 ? "alt" : ""}`}
                  onClick={() => setActive(r)}
                  role="button"
                >
                  <div>{r.lotNo}</div>
                  <div>{r.qty}</div>
                  <div>{r.mfgDate}</div>
                  <div>{r.expDate}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button className="btn primary" onClick={() => setSelectedProduct(null)}>
              ← กลับหน้ารวมสินค้า
            </button>
          </div>
        </div>
      )}

      {/* ========== แผ่นนำออก (ของเดิม) ========== */}
      {openSheet && active && (
        <>
          <button
            className="sheet-backdrop"
            onClick={() => setOpenSheet(false)}
            aria-label="close"
          />
          <div className="sheet">
            <div className="sheet-left">
              <div>
                <span>เลขล็อต</span>
                <b>{active.lotNo}</b>
              </div>
              <div>
                <span>เลขคำสั่งผลิต</span>
                <b>{active.orderNo}</b>
              </div>
              <div>
                <span>ชื่อสินค้า</span>
                <b>{active.name}</b>
              </div>
              <div>
                <span>จำนวน</span>
                <b>{active.qty.toLocaleString()}</b>
              </div>
              <div>
                <span>วันที่ผลิต</span>
                <b>{active.mfgDate}</b>
              </div>
              <div>
                <span>วันหมดอายุ</span>
                <b>{active.expDate}</b>
              </div>
            </div>

            <div className="sheet-right">
              <div className="form-card">
                <h3>นำออก</h3>
                <label className="inline">
                  <span>จำนวน</span>
                  <input
                    type="number"
                    min={0}
                    value={takeQty}
                    onChange={(e) => setTakeQty(Number(e.target.value))}
                  />
                  <span className="unit">{active.unit}</span>
                </label>
                <div className="inline">
                  <span>ประเภทการนำออก</span>
                  <div className="seg">
                    <button
                      type="button"
                      className={`seg-btn ${
                        takeType === "ขาย" ? "on" : ""
                      }`}
                      onClick={() => setTakeType("ขาย")}
                    >
                      ขาย
                    </button>
                    <button
                      type="button"
                      className={`seg-btn ${
                        takeType === "หมดอายุ" ? "on" : ""
                      }`}
                      onClick={() => setTakeType("หมดอายุ")}
                    >
                      หมดอายุ
                    </button>
                  </div>
                </div>

                <label className="block">
                  <span>หมายเหตุ</span>
                  <textarea
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>

                {err && <div className="form-error">{err}</div>}

                <div className="sheet-actions">
                  <button
                    className="btn cancel"
                    onClick={() => setOpenSheet(false)}
                  >
                    ยกเลิก
                  </button>
                  <button className="btn confirm" onClick={confirmTakeOut}>
                    ยืนยัน
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
