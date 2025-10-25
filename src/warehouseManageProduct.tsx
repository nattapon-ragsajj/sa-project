import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./warehouseManageProduct.css";

type Product = {
  code: string;
  name: string;
  total: number;
  lots: Lot[];
};

type Lot = {
  lotNo: string;
  remain: number;
  expDate: string;
  qa: string;
};

type OutItem = {
  code: string;
  name: string;
  lotNo: string;
  qty: number;
};

export default function WarehouseManageProduct() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [lotQty, setLotQty] = useState<{ [key: string]: number }>({});
  const [outList, setOutList] = useState<OutItem[]>([]);

  const products: Product[] = [
    {
      code: "PO-001",
      name: "น้ำตาลทรายขาว",
      total: 120,
      lots: [
        { lotNo: "L-240901", remain: 60, expDate: "2026-09-01", qa: "ผ่าน" },
        { lotNo: "L-240902", remain: 60, expDate: "2026-09-10", qa: "ผ่าน" },
      ],
    },
    {
      code: "PO-002",
      name: "แป้งสาลี",
      total: 30,
      lots: [{ lotNo: "L-240915", remain: 30, expDate: "2026-03-15", qa: "ผ่าน" }],
    },
  ];

  // ✅ กด "ยืนยัน" ใน popup
  const confirmOut = () => {
    if (!selected) return;
    const chosen = selected.lots
      .filter((lot) => lotQty[lot.lotNo] && lotQty[lot.lotNo] > 0)
      .map((lot) => ({
        code: selected.code,
        name: selected.name,
        lotNo: lot.lotNo,
        qty: lotQty[lot.lotNo],
      }));

    if (chosen.length === 0) {
      alert("กรุณาใส่จำนวนที่ต้องการนำออกอย่างน้อย 1 รายการ");
      return;
    }

    setOutList((prev) => [...prev, ...chosen]);
    setOpen(false);
    setLotQty({});
  };

  const removeItem = (lotNo: string) => {
    setOutList((prev) => prev.filter((i) => i.lotNo !== lotNo));
  };

  return (
    <div className="wm-page">

      <h2 className="wmm-title">นำสินค้าจากคลังออก</h2>

      {/* ===== Tabs ===== */}
      <div className="wh-tabs">
        <NavLink to="/warehouse" end className="tab-link">
          คลังสินค้า
        </NavLink>
        <NavLink to="/warehouse/warehouse-stock" end className="tab-link">
          จัดเก็บวัตถุดิบ
        </NavLink>
        <NavLink to="/warehouse/manage-product" end className="tab-link">
          นำสินค้าจากคลังออก
        </NavLink>
      </div>

      

      <div className="wm-layout">
        {/* ===== ฝั่งซ้าย: ตารางหลัก ===== */}
        <div className="wm-left">
          <div className="wm-table">
            <div className="wm-row wm-head">
              <div>รหัสสินค้า</div>
              <div>ชื่อสินค้า</div>
              <div>จำนวนทั้งหมด</div>
              <div>จำนวนล็อต</div>
            </div>

            {products.map((p, i) => (
              <div
                key={p.code}
                className={`wm-row wm-body ${i % 2 ? "alt" : ""}`}
                onClick={() => {
                  setSelected(p);
                  setOpen(true);
                }}
              >
                <div>{p.code}</div>
                <div>{p.name}</div>
                <div>{p.total}</div>
                <div>{p.lots.length}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ฝั่งขวา: รายการสินค้าที่นำออก ===== */}
        <div className="wm-right">
          <div className="wm-card">
            <h4>รายการสินค้าที่นำออก</h4>

            {outList.length === 0 ? (
              <p style={{ color: "#999" }}>ยังไม่มีรายการ</p>
            ) : (
              outList.map((item) => (
                <div key={item.lotNo} className="wm-item">
                  <div className="wm-info">
                    <p>
                      <b>เลขล็อต:</b> {item.lotNo} &nbsp;|&nbsp; <b>สินค้า:</b>{" "}
                      {item.name}
                    </p>
                    <p>
                      <b>รหัสสินค้า:</b> {item.code} &nbsp;|&nbsp;{" "}
                      <b>จำนวน:</b> {item.qty}
                    </p>
                  </div>
                  <div className="wm-actions">
                    {/* <button className="edit">แก้ไข</button> */}
                    <button className="delete" onClick={() => removeItem(item.lotNo)}>
                      ลบ
                    </button>
                  </div>
                </div>
              ))
            )}

            <div className="wm-reason">
              <label>หมายเหตุ *</label>
              <textarea placeholder="กรอกหมายเหตุ" />
            </div>

            <button className="wm-submit">ทำรายการ</button>
          </div>
        </div>
      </div>

      {/* ===== Popup Modal ===== */}
      {open && selected && (
        <>
          <div className="wm-overlay" onClick={() => setOpen(false)}></div>
          <div className="wm-modal">
            <button className="wm-close" onClick={() => setOpen(false)}>
              ×
            </button>
            <h3 className="wm-modal-title">
              รหัสสินค้า: {selected.code} | {selected.name}
            </h3>

            <div className="wm-inner-table">
              <div className="wm-row wm-head">
                <div>เลขล็อต</div>
                <div>จำนวนที่เหลือ</div>
                <div>วันหมดอายุ</div>
                <div>ตรวจสอบคุณภาพ</div>
                <div>จำนวนที่นำออก</div>
              </div>

              {selected.lots.map((lot, i) => (
                <div key={lot.lotNo} className={`wm-row wm-body ${i % 2 ? "alt" : ""}`}>
                  <div>{lot.lotNo}</div>
                  <div>{lot.remain}</div>
                  <div>{lot.expDate}</div>
                  <div>{lot.qa}</div>
                  <div>
                    <input
                      type="number"
                      min={0}
                      max={lot.remain}
                      className="wm-input"
                      value={lotQty[lot.lotNo] || ""}
                      onChange={(e) =>
                        setLotQty((prev) => ({
                          ...prev,
                          [lot.lotNo]: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="wm-modal-actions">
              <button className="wm-confirm" onClick={confirmOut}>
                ยืนยัน
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
