import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "./warehouseStock.css";

type StockRow = {
  id: number;
  lotNo: string;
  orderNo: string;
  productCode: string;
  name: string;
  qty: number;
  mfgDate: string;
  expDate: string;
  status: string;
};

const seed: StockRow[] = [
  {
    id: 1,
    lotNo: "L-240901",
    orderNo: "PO-001",
    productCode: "P-001",
    name: "น้ำตาลทรายขาว",
    qty: 50,
    mfgDate: "2025-09-01",
    expDate: "2026-09-01",
    status: "ยังไม่จัดเก็บเข้าคลัง",
  },
  {
    id: 2,
    lotNo: "L-240915",
    orderNo: "PO-002",
    productCode: "P-002",
    name: "แป้งสาลี",
    qty: 30,
    mfgDate: "2025-09-15",
    expDate: "2026-03-15",
    status: "ยังไม่จัดเก็บเข้าคลัง",
  },
  {
    id: 3,
    lotNo: "L-240920",
    orderNo: "PO-003",
    productCode: "P-003",
    name: "เนยจืด",
    qty: 12,
    mfgDate: "2025-09-20",
    expDate: "2026-01-20",
    status: "ยังไม่จัดเก็บเข้าคลัง",
  },
];

export default function WarehouseStock() {
  const [rows, setRows] = useState<StockRow[]>(seed);
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [open, setOpen] = useState(false); // ✅ popup toggle

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;
    return rows.filter((r) => {
      if (from && new Date(r.mfgDate) < from) return false;
      if (to && new Date(r.mfgDate) > to) return false;
      if (!s) return true;
      const bag = `${r.lotNo} ${r.orderNo} ${r.productCode} ${r.name} ${r.status}`.toLowerCase();
      return bag.includes(s);
    });
  }, [rows, q, dateFrom, dateTo]);

  const clearFilters = () => {
    setQ("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="ws-page">
      <h2 className="wmm-title">จัดเก็บสินค้า</h2>


      {/* ===== Tabs ด้านบน ===== */}
      {/* ===== Header ส่วนบน ===== */}
<div className="ws-header">
  {/* ปุ่มแท็บฝั่งซ้าย */}
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

  {/* ปุ่มขวาสุด */}
  <div className="ws-top-actions">
    <button className="btn-store" onClick={() => setOpen(true)}>
      จัดเก็บสินค้าที่เหลือจากการขาย
    </button>
  </div>
</div>


      

      {/* ===== ตารางหลัก ===== */}
      <div className="ws-table-wrap">
        <div className="ws-table">
          <div className="ws-row ws-head">
            <div>เลขล็อต</div>
            <div>เลขที่สั่งผลิต</div>
            <div>รหัสสินค้า</div>
            <div>ชื่อสินค้า</div>
            <div>จำนวน</div>
            <div>วันที่ผลิต</div>
            <div>วันหมดอายุ</div>
            <div>สถานะ</div>
          </div>

          {filtered.map((r, i) => (
            <div key={r.id} className={`ws-row ws-body ${i % 2 ? "alt" : ""}`}>
              <div>{r.lotNo}</div>
              <div>{r.orderNo}</div>
              <div>{r.productCode}</div>
              <div>{r.name}</div>
              <div>{r.qty}</div>
              <div>{r.mfgDate}</div>
              <div>{r.expDate}</div>
              <div>{r.status}</div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="ws-empty">ยังไม่มีรายการจัดเก็บ</div>
          )}
        </div>
      </div>

      {/* ===== Popup ===== */}
      {open && (
        <>
          <div className="modal-backdrop" onClick={() => setOpen(false)} />
          <div className="modal">
            <button className="close-btn" onClick={() => setOpen(false)}>×</button>
            <div className="modal-inner">
              <label>รหัสสินค้า</label>
              <input type="text" placeholder="เลือกสินค้า" />
              <label>ชื่อสินค้า</label>
              <input type="text" placeholder="เลือกชื่อสินค้า" />
              <label>เลขล็อต</label>
              <input type="text" placeholder="กรอกเลขล็อต" />
              <label>จำนวน</label>
              <input type="number" placeholder="กรอกจำนวน" />
              <button className="confirm-btn">ยืนยัน</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
