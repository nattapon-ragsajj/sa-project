import { NavLink } from "react-router-dom";
import "./warehouseManageMat.css"; // ใช้ CSS เดิม (สี ตาราง ปุ่ม)

type ProductRecord = {
  lotNo: string;
  code: string;
  name: string;
  qty: number;
  actionType: string;
  category: string;
  refNo: string;
  date: string;
  note: string;
};

// 🔹 ตัวอย่างข้อมูล (mock)
const mockData: ProductRecord[] = [
  {
    lotNo: "P-240901",
    code: "PO-001",
    name: "ข้าวเกรียบกุ้ง",
    qty: 20,
    actionType: "นำเข้า",
    category: "ผลิตเสร็จ",
    refNo: "ORDER-20251001",
    date: "2025-10-01",
    note: "รับเข้าคลังจากฝ่ายผลิต",
  },
  {
    lotNo: "P-240902",
    code: "PO-002",
    name: "ข้าวเกรียบปลา",
    qty: 15,
    actionType: "นำออก",
    category: "ขาย",
    refNo: "SALE-20251002",
    date: "2025-10-02",
    note: "นำออกเพื่อจำหน่าย",
  },
];

export default function WarehouseManageProductList() {
  return (
    <div className="wmm-page">
      <h2 className="wmm-title">การทำรายการคลังสินค้า</h2>

      {/* ===== ปุ่มแท็บ ===== */}
      <div className="wmm-tabs">
        <NavLink
          to="/warehouse/warehouse-manage-mat"
          end
          className={({ isActive }) =>
            isActive ? "tab-btn active" : "tab-btn"
          }
        >
          การทำรายการคลังวัตถุดิบ
        </NavLink>

        <NavLink
          to="/warehouse/warehouse-manage-product"
          end
          className={({ isActive }) =>
            isActive ? "tab-btn active" : "tab-btn"
          }
        >
          การทำรายการคลังสินค้า
        </NavLink>
      </div>

      {/* ===== ตาราง ===== */}
      <div className="wmm-table">
        <div className="wmm-row wmm-head">
          <div>เลขล็อต</div>
          <div>รหัสสินค้า</div>
          <div>ชื่อสินค้า</div>
          <div>จำนวน</div>
          <div>ประเภทการทำรายการ</div>
          <div>ประเภท(ย่อย)</div>
          <div>เลขอ้างอิง</div>
          <div>วันที่ทำรายการ</div>
          <div>หมายเหตุ</div>
        </div>

        {mockData.map((r, i) => (
          <div key={r.lotNo} className={`wmm-row ${i % 2 ? "alt" : ""}`}>
            <div>{r.lotNo}</div>
            <div>{r.code}</div>
            <div>{r.name}</div>
            <div>{r.qty}</div>
            <div>{r.actionType}</div>
            <div>{r.category}</div>
            <div>{r.refNo}</div>
            <div>{r.date}</div>
            <div>{r.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
