import { NavLink } from "react-router-dom";
import "./warehouseManageMat.css";

type MatRecord = {
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

const mockData: MatRecord[] = [
  {
    lotNo: "L-240901",
    code: "RM-001",
    name: "น้ำตาลทรายขาว",
    qty: 50,
    actionType: "นำออก",
    category: "ขาย",
    refNo: "PO-99001",
    date: "2025-10-01",
    note: "นำออกเพื่อผลิตสินค้า",
  },
  {
    lotNo: "L-240902",
    code: "RM-002",
    name: "แป้งสาลี",
    qty: 30,
    actionType: "นำเข้า",
    category: "จัดเก็บ",
    refNo: "PO-99002",
    date: "2025-10-02",
    note: "รับวัตถุดิบเข้าคลัง",
  },
];

export default function WarehouseManageMat() {
  return (
    <div className="wmm-page">
      <h2 className="wmm-title">การทำรายการคลังวัตถุดิบ</h2>

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


      {/* ===== ตารางแสดงข้อมูล ===== */}
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
