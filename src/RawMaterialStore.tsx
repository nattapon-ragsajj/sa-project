import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./rawMaterial.css";

type StoreRow = {
  id: number;
  lotNo: string;
  code: string;
  name: string;
  qty: number;
  importDate: string;
  expDate: string;
  status: string;
};

export default function RawMaterialStore() {
  const [rows, setRows] = useState<StoreRow[]>([]);
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 
  const [form, setForm] = useState<StoreRow>({
    id: 0,
    lotNo: "",
    code: "",
    name: "",
    qty: 0,
    importDate: "",
    expDate: "",
    status: "ยังไม่จัดเก็บเข้าคลัง",
  });

  const openAdd = () => {
    setForm({
      id: 0,
      lotNo: "",
      code: "",
      name: "",
      qty: 0,
      importDate: "",
      expDate: "",
      status: "ยังไม่จัดเก็บเข้าคลัง",
    });
    setErrorMsg("");
    setOpen(true);
  };

  const save = () => {
    if (!form.lotNo || !form.code || !form.name || form.qty <= 0) {
      setErrorMsg("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    const newId = Math.max(0, ...rows.map((r) => r.id)) + 1;
    setRows((prev) => [...prev, { ...form, id: newId }]);
    setOpen(false);
  };

  return (
    <div className="rm-page">
      <h2 className="wmm-title">จัดเก็บวัตถุดิบ</h2>


      {/* ===== แท็บเมนู ===== */}
      <div className="rm-top">
        <div className="rm-tabs">
          <NavLink to="/warehouse/raw-material" end className="tab-link">
            คลังวัตถุดิบ
          </NavLink>
          <NavLink to="/warehouse/raw-material/lot" className="tab-link">
            สร้างล็อตวัตถุดิบ
          </NavLink>
          <NavLink to="/warehouse/raw-material/store" className="tab-link active">
            จัดเก็บวัตถุดิบ
          </NavLink>
          <NavLink to="/warehouse/raw-material/allocate" className="tab-link">
            จัดสรรวัตถุดิบ
          </NavLink>

        
        </div>

        <div className="tools-right">
          <button className="btn primary" onClick={openAdd}>
            + จัดเก็บวัตถุดิบที่เหลือจากการผลิต
          </button>
        </div>
      </div>
      
      

      {/* ===== ตาราง ===== */}
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
            <div className="td">{r.lotNo}</div>
            <div className="td">{r.code}</div>
            <div className="td">{r.name}</div>
            <div className="td mono">{r.qty.toLocaleString()}</div>
            <div className="td">{r.importDate}</div>
            <div className="td">{r.expDate}</div>
            <div className="td">{r.status}</div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rm-empty">ยังไม่มีข้อมูลการจัดเก็บ</div>
        )}
      </div>

      {/* ===== Modal ===== */}
      {open && (
        <>
          <button
            className="rm-overlay"
            aria-label="close"
            onClick={() => setOpen(false)}
          />
          <div className="rm-modal" role="dialog" aria-modal="true">
            <h3 className="modal-title">เพิ่มรายการจัดเก็บวัตถุดิบ</h3>
            {errorMsg && <div className="rm-error">{errorMsg}</div>}
            <div className="form-grid">
              <label>
                เลขล็อต
                <input
                  value={form.lotNo}
                  onChange={(e) => setForm({ ...form, lotNo: e.target.value })}
                />
              </label>
              <label>
                รหัสวัตถุดิบ
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </label>
              <label>
                ชื่อวัตถุดิบ
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                จำนวน
                <input
                  type="number"
                  min={0}
                  value={form.qty}
                  onChange={(e) =>
                    setForm({ ...form, qty: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                วันที่นำเข้า
                <input
                  type="date"
                  value={form.importDate}
                  onChange={(e) =>
                    setForm({ ...form, importDate: e.target.value })
                  }
                />
              </label>
              <label>
                วันหมดอายุ
                <input
                  type="date"
                  value={form.expDate}
                  onChange={(e) =>
                    setForm({ ...form, expDate: e.target.value })
                  }
                />
              </label>
              {/* <label>
                สถานะ
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <option>ยังไม่จัดเก็บเข้าคลัง</option>
                  <option>จัดเก็บเรียบร้อย</option>
                </select>
              </label> */}
            </div>

            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setOpen(false)}>
                ยกเลิก
              </button>
              <button className="btn primary" onClick={save}>
                บันทึก
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
