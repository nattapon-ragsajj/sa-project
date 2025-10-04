import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "./warehouseStock.css";

type TxType = "ขาย" | "หมดอายุ";

type TxRow = {
  id: number;          // running id
  time: string;        // ISO string
  type: TxType;        // ประเภทการนำออก
  lotNo: string;
  orderNo: string;
  name: string;
  qty: number;
  unit: string;
  note?: string;
};

const seed: TxRow[] = [
  {
    id: 1,
    time: new Date().toISOString(),
    type: "ขาย",
    lotNo: "L-240901",
    orderNo: "PO-001",
    name: "น้ำตาลทรายขาว",
    qty: 5,
    unit: "กก.",
    note: "เดโมข้อมูลเริ่มต้น",
  },
];

function readHistory(): TxRow[] {
  try {
    const raw = localStorage.getItem("wh-history");
    if (!raw) return seed;
    const arr = JSON.parse(raw) as TxRow[];
    if (!Array.isArray(arr)) return seed;
    return arr;
  } catch {
    return seed;
  }
}

function saveHistory(rows: TxRow[]) {
  localStorage.setItem("wh-history", JSON.stringify(rows));
}

export default function WarehouseStock() {
  const [rows, setRows] = useState<TxRow[]>(readHistory());
  const [q, setQ] = useState("");
  const [tx, setTx] = useState<"ทั้งหมด" | TxType>("ทั้งหมด");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    // sync from storage if other tab/page updates
    const onStorage = (e: StorageEvent) => {
      if (e.key === "wh-history") setRows(readHistory());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;

    return rows
      .filter(r => {
        if (tx !== "ทั้งหมด" && r.type !== tx) return false;
        if (from && new Date(r.time) < from) return false;
        if (to && new Date(r.time) > to) return false;

        if (!s) return true;
        const bag =
          `${r.type} ${r.lotNo} ${r.orderNo} ${r.name} ${r.qty} ${r.unit} ${r.note || ""}`.toLowerCase();
        return bag.includes(s);
      })
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()); // ใหม่สุดก่อน
  }, [rows, q, tx, dateFrom, dateTo]);

  const clearFilters = () => {
    setQ(""); setTx("ทั้งหมด"); setDateFrom(""); setDateTo("");
  };

  const exportCSV = () => {
    const header = [
      "เวลา", "ประเภท", "เลขล็อต", "เลขคำสั่งผลิต", "ชื่อสินค้า",
      "จำนวน", "หน่วย", "หมายเหตุ"
    ];
    const lines = filtered.map(r => [
      new Date(r.time).toLocaleString("th-TH"),
      r.type, r.lotNo, r.orderNo, r.name,
      r.qty.toString(), r.unit, r.note?.replaceAll("\n", " ") || ""
    ]);
    const csv = [header, ...lines].map(line =>
      line.map(x => `"${(x ?? "").toString().replaceAll('"', '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "warehouse-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeAll = () => {
    if (!confirm("ลบประวัติทั้งหมด?")) return;
    saveHistory([]);
    setRows([]);
  };

  return (
    <div className="ws-page">
      {/* แท็บนำทาง */}
      
      <div className="wh-tabs">
        <NavLink to="/home/warehouse"end className="tab-link">คลัง</NavLink>
        <NavLink to="/home/warehouse/warehouse-stock" end className="tab-link">ประวัติการทำรายการ</NavLink>
      </div>
      

      <div className="ws-title">ประวัติการทำรายการ</div>

      {/* แถบเครื่องมือค้นหา/กรอง */}
      <div className="ws-tools">
        <input
          className="ws-input"
          placeholder="ค้นหา: ประเภท/ล็อต/คำสั่ง/ชื่อ/หมายเหตุ"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />
        <select className="ws-input" value={tx} onChange={(e)=>setTx(e.target.value as any)}>
          <option value="ทั้งหมด">ทั้งหมด</option>
          <option value="ขาย">ขาย</option>
          <option value="หมดอายุ">หมดอายุ</option>
        </select>
        <input className="ws-input" type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
        <input className="ws-input" type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} />

        <button className="ws-btn" onClick={clearFilters}>ล้างตัวกรอง</button>
        <div className="ws-spacer" />
        <button className="ws-btn outline" onClick={exportCSV}>ส่งออก CSV</button>
        <button className="ws-btn danger" onClick={removeAll}>ลบทั้งหมด</button>
      </div>

      {/* ตาราง */}
      <div className="ws-table-wrap">
        <div className="ws-table">
          <div className="ws-row ws-head">
            <div>เวลา</div>
            <div>ประเภท</div>
            <div>เลขล็อต</div>
            <div>เลขคำสั่งผลิต</div>
            <div>ชื่อสินค้า</div>
            <div>จำนวน</div>
            <div>หน่วย</div>
            <div>หมายเหตุ</div>
          </div>

          {filtered.map((r, i) => (
            <div key={r.id} className={`ws-row ws-body ${i % 2 ? "alt" : ""}`}>
              <div className="mono">{new Date(r.time).toLocaleString("th-TH")}</div>
              <div className={`pill ${r.type === "ขาย" ? "ok" : "warn"}`}>{r.type}</div>
              <div className="mono">{r.lotNo}</div>
              <div className="mono">{r.orderNo}</div>
              <div>{r.name}</div>
              <div className="mono">{r.qty.toLocaleString()}</div>
              <div>{r.unit}</div>
              <div className="truncate" title={r.note}>{r.note || "-"}</div>
            </div>
          ))}

          {filtered.length === 0 && <div className="ws-empty">ไม่พบประวัติ</div>}
        </div>
      </div>
    </div>
  );
}
