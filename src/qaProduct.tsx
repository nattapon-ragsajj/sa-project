// qaProduct.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import "./qa.css";

type QaStatus = "ผ่าน" | "ไม่ผ่าน";

type Row = {
  id: number;
  lotNo: string;
  name: string;
  qty: number;
  pwdPo: string;
  expDate: string;
  buyDate: string;
};

type QaHistoryItem = {
  id: string;            // `${lotNo}-${timestamp}`
  lotNo: string;
  result: QaStatus;
  checkedBy: string;     // เดโม่ไว้เป็น "ระบบ"
  time: string;          // ISO
  // ===== ฟิลด์ใหม่สำหรับ pop-up แบบในภาพ =====
  producer?: string;     // ผลิตโดย
  source?: string;       // ผลิตจาก
  location?: string;     // ตั้งอยู่ที่
  count?: number;        // จำนวนการตรวจสอบ

};

const seedRows: Row[] = [
  { id: 1, lotNo: "L-240901", name: "คุกกี้เนยสด 250g", qty: 120, pwdPo: "LA01", expDate: "2026-09-01", buyDate: "2025-09-03" },
  { id: 2, lotNo: "L-240915", name: "บราวนี่ 50g",       qty: 300, pwdPo: "LA02", expDate: "2026-03-15", buyDate: "2025-09-17" },
  { id: 3, lotNo: "L-240920", name: "มัทฉะโรล 1 ชิ้น",   qty:  48, pwdPo: "LA03", expDate: "2025-12-01", buyDate: "2025-09-22" },
];

/** ===== LocalStorage helpers ===== */
function readHistory(): QaHistoryItem[] {
  try {
    const raw = localStorage.getItem("qa-product-history");
    if (!raw) return [];
    return JSON.parse(raw) as QaHistoryItem[];
  } catch {
    return [];
  }
}
function writeHistory(items: QaHistoryItem[]) {
  localStorage.setItem("qa-product-history", JSON.stringify(items));
}

/** ===== เมธอดคัดแยกตามที่ขอ =====
 * คืนค่า:
 *  - newRows:   แถวที่ยังไม่มีประวัติการตรวจเลย
 *  - checkedRows: แถวที่มีประวัติแล้ว (เคยติ๊กผ่าน/ไม่ผ่านอย่างน้อย 1 ครั้ง)
 */
function separateByHistory(rows: Row[], history: QaHistoryItem[]) {
  const hasHistoryLots = new Set(history.map(h => h.lotNo));
  const newRows: Row[] = [];
  const checkedRows: Row[] = [];

  for (const r of rows) {
    if (hasHistoryLots.has(r.lotNo)) checkedRows.push(r);
    else newRows.push(r);
  }
  return { newRows, checkedRows };
}

export default function QaProduct() {
  // แท็บ: "stock" = รายการที่มีประวัติแล้ว, "new" = ยังไม่เคยตรวจ
  const [tab, setTab] = useState<"stock" | "new">("stock");
  const [rows] = useState<Row[]>(seedRows);

  // modal
  const [open, setOpen] = useState(false);
  const [activeLot, setActiveLot] = useState<Row | null>(null);
  const [choice, setChoice] = useState<QaStatus>("ผ่าน");
  
  // new
  const [producer, setProducer] = useState("");
  const [source, setSource] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [count, setCount] = useState<number | "">("");
  const [err, setErr] = useState("");

  const overlayRef = useRef<HTMLDivElement>(null);

  // ประวัติ
  const [history, setHistory] = useState<QaHistoryItem[]>(() => readHistory());

  // ประวัติของล็อตที่กำลังเปิดอยู่
  const activeLotHistory = useMemo(
    () => (activeLot ? history.filter(h => h.lotNo === activeLot.lotNo) : []),
    [history, activeLot]
  );

  // คัดแยกตามที่ขอ (สำคัญ!)
  const { newRows, checkedRows } = useMemo(
    () => separateByHistory(rows, history),
    [rows, history]
  );

  // ปิด modal เมื่อคลิกนอกกรอบ
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.body.classList.add("no-scroll");
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.body.classList.remove("no-scroll");
    };
  }, [open]);

  const onRowClick = (r: Row) => {
    setActiveLot(r);
    setChoice("ผ่าน");
    setProducer("");
    setSource("");
    setLocationStr("");
    setCount("");
    setErr("");
    setOpen(true);
  };

  const confirm = () => {
    if (!activeLot) return;

    // ตรวจง่าย ๆ
  if (count !== "" && Number(count) < 0) {
    setErr("จำนวนการตรวจสอบต้องมากกว่าหรือเท่ากับ 0");
    return;
  }

  const item: QaHistoryItem = {
    id: `${activeLot.lotNo}-${Date.now()}`,
    lotNo: activeLot.lotNo,
    result: choice,
    checkedBy: producer.trim() || "ระบบ", // ถ้าไม่กรอก ให้เป็น “ระบบ”
    time: new Date().toISOString(),
    producer: producer.trim() || undefined,
    source: source.trim() || undefined,
    location: locationStr.trim() || undefined,
    count: count === "" ? undefined : Number(count),
  };
  
  const next = [item, ...history];
    setHistory(next);
    writeHistory(next);
    setErr("");
    setOpen(false);
  };

  // ตารางที่จะถูกแสดงตามแท็บ
  const tableRows = tab === "new" ? newRows : checkedRows;

  return (
    <div className="qa-page">
      <div className="qa-body">
        <h2 className="qa-title">ควบคุมคุณภาพสินค้า</h2>

        <div className="qa-tabs">
          <button
            className={`qa-tab ${tab === "stock" ? "active" : ""}`}
            onClick={() => setTab("stock")}
            title="รายการที่เคยตรวจแล้ว"
          >
            ในคลัง / ตรวจแล้ว <span className="chip" style={{ marginLeft: 8 }}></span>
          </button>
          <button
            className={`qa-tab ${tab === "new" ? "active" : ""}`}
            onClick={() => setTab("new")}
            title="รายการใหม่ที่ยังไม่เคยตรวจ"
          >
            ใหม่ <span className="chip" style={{ marginLeft: 8 }}></span>
          </button>
        </div>

        {/* ตาราง */}
        <div className="qa-table-wrap">
          <table className="qa-table">
            <thead>
              <tr>
                <th>เลขล็อต</th>
                <th>รหัสสินค้า</th>
                <th>ชื่อสินค้า</th>
                <th>จำนวน</th>
                <th>วันหมดอายุ</th>
                <th>วันที่ซื้อ</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: "center", padding: 16 }}>
                    {tab === "new" ? "ไม่มีรายการใหม่" : "ยังไม่มีรายการที่ตรวจแล้ว"}
                  </td>
                </tr>
              ) : (
                tableRows.map(r => (
                  <tr key={r.id} className="clickable" onClick={() => onRowClick(r)}>
                    <td>{r.lotNo}</td>
                    <td>{r.pwdPo}</td>
                    <td>{r.name}</td>
                    <td className="num">{r.qty.toLocaleString()}</td>
                    <td>{r.expDate}</td>
                    <td>{r.buyDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pop-up */}
      {/* Pop-up */}
{open && (
  <div className="qa-overlay" ref={overlayRef}>
    <div className="qa-modal">
      <button className="qa-close" onClick={() => setOpen(false)} aria-label="ปิด">✕</button>

      {/* ===== แถวฟอร์ม 3 กล่อง ===== */}
      <div className="qa-grid">
        {/* ซ้าย: รายละเอียดอ่านอย่างเดียว */}
        <div className="qa-card">
          <div className="kv">
            <div className="k">เลขล็อต :</div>
            <div className="v">{activeLot?.lotNo || "-"}</div>
          </div>
          <div className="kv">
            <div className="k">รหัสสินค้า :</div>
            <div className="v">{activeLot?.pwdPo || "-"}</div>
          </div>
          <div className="kv">
            <div className="k">ชื่อสินค้า :</div>
            <div className="v">{activeLot?.name || "-"}</div>
          </div>
        </div>

        {/* กลาง: จำนวนการทดสอบ */}
        <div className="qa-card qa-center">
          <label className="qa-label">จำนวนการทดสอบ</label>
          <input
            className="qa-input qa-count"
            type="number"
            min={0}
            placeholder="0"
            value={count}
            onChange={(e)=>setCount(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>

        {/* ขวา: ผ่าน/ไม่ผ่าน + ยืนยัน */}
        <div className="qa-card qa-right">
          <div className="qa-radio">
            <label>
              <input
                type="radio"
                name="qa"
                value="ผ่าน"
                checked={choice === "ผ่าน"}
                onChange={() => setChoice("ผ่าน")}
              />
              <span>ผ่าน</span>
            </label>
          </div>
          <div className="qa-radio">
            <label>
              <input
                type="radio"
                name="qa"
                value="ไม่ผ่าน"
                checked={choice === "ไม่ผ่าน"}
                onChange={() => setChoice("ไม่ผ่าน")}
              />
              <span>ไม่ผ่าน</span>
            </label>
          </div>

          {err && <div className="qa-error">{err}</div>}
          <button className="qa-confirm" onClick={confirm}>ยืนยัน</button>
        </div>
      </div>

      {/* ===== ตารางประวัติ ===== */}
      <h3 className="qa-subtitle">ประวัติการตรวจสอบคุณภาพ</h3>
      <div className="qa-history-wrap">
        <table className="qa-history">
          <thead>
            <tr>
              <th>ครั้งที่</th>
              <th>ผลการตรวจสอบ</th>
              <th>จำนวนคงเหลือ</th>
              <th>วันที่</th>
            </tr>
          </thead>
          <tbody>
            {activeLotHistory.length === 0 ? (
              <tr><td colSpan={4} className="muted">ยังไม่มีประวัติ</td></tr>
            ) : (
              activeLotHistory.map((h, i) => (
                <tr key={h.id}>
                  <td className="num">{i + 1}</td>
                  <td className={h.result === "ผ่าน" ? "ok" : "ng"}>{h.result}</td>
                  <td className="num">{activeLot?.qty.toLocaleString()}</td>
                  <td>{new Date(h.time).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
