import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./rawMaterial.css";

type OrderItem = {
  id: number;
  lotId: string;
  code: string;
  name: string;
  qty: number;
};

type PurchaseRequest = {
  id: string;
  createdDate: string;
};

type AllocateRow = {
  id: number;
  lotId: string;
  code: string;
  name: string;
  qty: number;
  importDate: string;
  expDate: string;
  status: string;
};

export default function RawMaterialAllocate() {
  const [rows, setRows] = useState<AllocateRow[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([
    { id: 1, lotId: "", code: "", name: "", qty: 0 },
  ]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openList, setOpenList] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const addOrderRow = () => {
    const newId = Math.max(0, ...orders.map((o) => o.id)) + 1;
    setOrders([...orders, { id: newId, lotId: "", code: "", name: "", qty: 0 }]);
  };

  const removeOrderRow = (id: number) => {
    if (orders.length === 1) {
      setErrorMsg("ต้องมีอย่างน้อย 1 รายการ");
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOrder = (
    id: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  const confirmCreate = () => {
    const invalid = orders.some(
      (o) => !o.lotId || !o.code || !o.name || o.qty <= 0
    );
    if (invalid) {
      setErrorMsg("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const newRows: AllocateRow[] = orders.map((o, i) => ({
      id: rows.length + i + 1,
      lotId: o.lotId,
      code: o.code,
      name: o.name,
      qty: o.qty,
      importDate: new Date().toISOString().split("T")[0],
      expDate: "",
      status: "รอจัดสรร",
    }));
    setRows((prev) => [...prev, ...newRows]);

    const newReq: PurchaseRequest = {
      id: "PR-" + String(Math.floor(Math.random() * 90000) + 10000),
      createdDate: new Date().toISOString().split("T")[0],
    };
    setRequests((prev) => [...prev, newReq]);

    setErrorMsg("");
    setOrders([{ id: 1, lotId: "", code: "", name: "", qty: 0 }]);
    setOpenCreate(false);
  };

  return (
    <div className="rm-page">
      <h2 className="wmm-title">จัดสรรวัตถุดิบ</h2>


      {/* ===== Tabs ===== */}
      <div className="rm-top">
        <div className="rm-tabs">
          <NavLink to="/warehouse/raw-material" end className="tab-link">
            คลังวัตถุดิบ
          </NavLink>
          <NavLink to="/warehouse/raw-material/lot" className="tab-link">
            สร้างล็อตวัตถุดิบ
          </NavLink>
          <NavLink to="/warehouse/raw-material/store" className="tab-link">
            จัดเก็บวัตถุดิบ
          </NavLink>
          <NavLink
            to="/warehouse/raw-material/allocate"
            className="tab-link active"
          >
            จัดสรรวัตถุดิบ
          </NavLink>
        </div>
        <div className="rm-right-buttons">
          <button className="btn primary" onClick={() => setOpenCreate(true)}>
            สร้างใบคำสั่งซื้อ
          </button>
          <button className="btn primary" onClick={() => setOpenList(true)}>
            รายการใบขอซื้อวัตถุดิบ
          </button>
        </div>
      </div>

      {/* ===== Toolbar ===== */}
      <div className="rm-toolbar">
        <div className="tools-left">
          {/* <div className="title">จัดสรรวัตถุดิบ</div> */}
        </div>

        {/* <div className="rm-right-buttons">
          <button className="btn primary" onClick={() => setOpenCreate(true)}>
            สร้างใบคำสั่งซื้อ
          </button>
          <button className="btn primary" onClick={() => setOpenList(true)}>
            รายการใบขอซื้อวัตถุดิบ
          </button>
        </div> */}
      </div>

      {/* ✅ ตารางหลักกลับมาแล้ว */}
      <div className="rm-table">
        <div className="rm-row rm-head">
          <div className="th">เลขล็อต</div>
          <div className="th">รหัสวัตถุดิบ</div>
          <div className="th">ชื่อวัตถุดิบ</div>
          <div className="th">จำนวน</div>
          <div className="th">วันที่นำเข้า</div>
          <div className="th">วันหมดอายุ</div>
          <div className="th">สถานะ</div>
        </div>

        {rows.map((r) => (
          <div key={r.id} className="rm-row">
            <div className="td">{r.lotId}</div>
            <div className="td">{r.code}</div>
            <div className="td">{r.name}</div>
            <div className="td mono">{r.qty}</div>
            <div className="td">{r.importDate}</div>
            <div className="td">{r.expDate || "-"}</div>
            <div className="td">{r.status}</div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rm-empty">ยังไม่มีข้อมูลการจัดสรรวัตถุดิบ</div>
        )}
      </div>

      {/* ===== Modal: สร้างใบคำสั่งซื้อ ===== */}
      
        
      {/* ===== Modal: สร้างใบคำสั่งซื้อ ===== */}
{openCreate && (
  <>
    <button className="rm-overlay" onClick={() => setOpenCreate(false)} />
    <div className="rm-modal large" role="dialog">
      <h3 className="modal-title">สร้างใบคำสั่งซื้อวัตถุดิบ</h3>

      {/* ✅ แสดงข้อความ error ถ้ามี */}
      {errorMsg && <div className="rm-error">{errorMsg}</div>}

      <div className="multi-order-list">
        {orders.map((o) => (
          <div key={o.id} className="order-block">
            <div className="order-fields">
              <div className="pair">
                <label>เลขล็อต:</label>
                <input
                  value={o.lotId}
                  onChange={(e) => updateOrder(o.id, "lotId", e.target.value)}
                />
              </div>
              <div className="pair">
                <label>รหัสวัตถุดิบ:</label>
                <input
                  value={o.code}
                  onChange={(e) => updateOrder(o.id, "code", e.target.value)}
                />
              </div>
              <div className="pair">
                <label>ชื่อวัตถุดิบ:</label>
                <input
                  value={o.name}
                  onChange={(e) => updateOrder(o.id, "name", e.target.value)}
                />
              </div>
              <div className="pair small">
                <label>จำนวน:</label>
                <input
                  type="number"
                  min={0}
                  value={o.qty}
                  onChange={(e) =>
                    updateOrder(o.id, "qty", Number(e.target.value))
                  }
                />
              </div>
              <div className="pair small">
                <button
                  className="btn danger small"
                  onClick={() => removeOrderRow(o.id)}
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
        <button className="btn soft" onClick={addOrderRow}>
          + เพิ่มรายการใหม่
        </button>
      </div>

      <div className="modal-actions">
        <button className="btn ghost" onClick={() => setOpenCreate(false)}>
          ยกเลิก
        </button>
        <button className="btn primary" onClick={confirmCreate}>
          ยืนยัน
        </button>
      </div>
    </div>
  </>
)}

{/* ===== Modal: รายการใบขอซื้อวัตถุดิบ ===== */}
{openList && (
  <>
    <button className="rm-overlay" onClick={() => setOpenList(false)} />
    <div className="rm-modal list-popup" role="dialog">
      {/* <button className="close-btn" onClick={() => setOpenList(false)}>✖</button> */}
      <h3 className="modal-title">รายการใบขอซื้อวัตถุดิบ</h3>

      <div className="rm-table inner">
        <div className="rm-row rm-head">
          <div className="th">เลขใบขอซื้อวัตถุดิบ</div>
          <div className="th">วันที่สร้าง</div>
        </div>

        {requests.map((r) => (
          <div key={r.id} className="rm-row">
            <div className="td">{r.id}</div>
            <div className="td">{r.createdDate}</div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="rm-empty">ยังไม่มีใบขอซื้อวัตถุดิบ</div>
        )}
        
      </div>
      <div className="modal-actions center">
        <button className="btn primary" onClick={() => setOpenList(false)}>
          ปิด
        </button>
      </div>
    </div>
  </>
)}

    </div>
    
  );
}
