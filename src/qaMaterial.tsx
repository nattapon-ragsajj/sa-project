// qaMaterial.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import "./qa.css";

type QaStatus = "ผ่าน" | "ไม่ผ่าน";

type Row = {
  id: number;
  lotNo: string;
  name: string;
  qty: number;
  unit: string;
  expDate: string;
  buyDate: string;
};

type QaHistoryItem = {
  id: string;        // `${lotNo}-${timestamp}`
  lotNo: string;
  result: QaStatus;
  checkedBy: string; // เดโม่เป็น "ระบบ"
  time: string;      // ISO
};

const seedRows: Row[] = [
  { id: 1, lotNo: "RM-240901", name: "แป้งสาลี 25kg", qty: 40,  unit: "กระสอบ", expDate: "2026-09-01", buyDate: "2025-09-03" },
  { id: 2, lotNo: "RM-240915", name: "น้ำตาลทราย 50kg", qty: 12, unit: "กระสอบ", expDate: "2026-03-15", buyDate: "2025-09-17" },
  { id: 3, lotNo: "RM-240920", name: "ผงมัทฉะ 1kg",     qty: 8,  unit: "ถุง",   expDate: "2025-12-01", buyDate: "2025-09-22" },
];

/** ==== ใช้ key แยกสำหรับวัตถุดิบ ==== */
const STORAGE_KEY = "qa-material-history";

function readHistory(): QaHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QaHistoryItem[]) : [];
  } catch {
    return [];
  }
}
function writeHistory(items: QaHistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** แยกแถวตามว่ามีประวัติ QA ใน lot นั้นแล้วหรือยัง */
function separateByHistory(rows: Row[], history: QaHistoryItem[]) {
  const doneLots = new Set(history.map(h => h.lotNo));
  const newRows: Row[] = [];
  const checkedRows: Row[] = [];
  for (const r of rows) (doneLots.has(r.lotNo) ? checkedRows : newRows).push(r);
  return { newRows, checkedRows };
}

export default function QaMaterial() {
  const [tab, setTab] = useState<"stock" | "new">("stock");
  const [rows] = useState<Row[]>(seedRows);

  const [open, setOpen] = useState(false);
  const [activeLot, setActiveLot] = useState<Row | null>(null);
  const [choice, setChoice] = useState<QaStatus>("ผ่าน");
  const overlayRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<QaHistoryItem[]>(() => readHistory());

  const activeLotHistory = useMemo(
    () => (activeLot ? history.filter(h => h.lotNo === activeLot.lotNo) : []),
    [history, activeLot]
  );

  const { newRows, checkedRows } = useMemo(
    () => separateByHistory(rows, history),
    [rows, history]
  );

  // ปิด modal เมื่อคลิกนอกกรอบ
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) setOpen(false);
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
    setOpen(true);
  };

  const confirm = () => {
    if (!activeLot) return;
    const item: QaHistoryItem = {
      id: `${activeLot.lotNo}-${Date.now()}`,
      lotNo: activeLot.lotNo,
      result: choice,
      checkedBy: "ระบบ",
      time: new Date().toISOString(),
    };
    const next = [item, ...history];
    setHistory(next);
    writeHistory(next);
    setOpen(false);
  };

  const tableRows = tab === "new" ? newRows : checkedRows;

  return (
    <div className="qa-page">
      <div className="qa-body">
        <h2 className="qa-title">ควบคุมคุณภาพวัตถุดิบ</h2>

        <div className="qa-tabs">
          <button className={`qa-tab ${tab === "stock" ? "active" : ""}`} onClick={() => setTab("stock")}>
            ในคลัง / ตรวจแล้ว
          </button>
          <button className={`qa-tab ${tab === "new" ? "active" : ""}`} onClick={() => setTab("new")}>
            ใหม่
          </button>
        </div>

        <div className="qa-table-wrap">
          <table className="qa-table">
            <thead>
              <tr>
                <th>เลขล็อต</th>
                <th>ชื่อวัตถุดิบ</th>
                <th>จำนวน</th>
                <th>หน่วย</th>
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
                    <td>{r.name}</td>
                    <td className="num">{r.qty.toLocaleString()}</td>
                    <td>{r.unit}</td>
                    <td>{r.expDate}</td>
                    <td>{r.buyDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="qa-overlay" ref={overlayRef}>
          <div className="qa-modal">
            <button className="qa-close" onClick={() => setOpen(false)} aria-label="ปิด">
              ✕
            </button>

            <div className="qa-judge-card">
              <label className="qa-radio">
                <input
                  type="radio"
                  name="qa"
                  value="ผ่าน"
                  checked={choice === "ผ่าน"}
                  onChange={() => setChoice("ผ่าน")}
                />
                <span>ผ่าน</span>
              </label>
              <label className="qa-radio">
                <input
                  type="radio"
                  name="qa"
                  value="ไม่ผ่าน"
                  checked={choice === "ไม่ผ่าน"}
                  onChange={() => setChoice("ไม่ผ่าน")}
                />
                <span>ไม่ผ่าน</span>
              </label>
              <button className="qa-confirm" onClick={confirm}>ยืนยัน</button>
            </div>

            <h3 className="qa-subtitle">ประวัติการตรวจสอบคุณภาพ</h3>
            <div className="qa-history-wrap">
              <table className="qa-history">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>ผลการตรวจสอบ</th>
                    <th>ตรวจสอบโดย</th>
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
                        <td>{h.checkedBy}</td>
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
