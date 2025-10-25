import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "./rawMaterial.css";

type StockRow = {
  id: number;
  lotNo: string;
  code: string;
  materialName: string;
  qty: number;
  importDate: string;
  expDate: string;
  status: string;
};

const seed: StockRow[] = [
  { id: 1, lotNo: "L-250101", code: "RM-001", materialName: "น้ำตาลทรายขาว", qty: 50, importDate: "2025-01-01", expDate: "2026-01-01", status: "ปกติ" },
  { id: 2, lotNo: "L-250102", code: "RM-002", materialName: "แป้งสาลี", qty: 60, importDate: "2025-01-05", expDate: "2026-01-05", status: "ต่ำกว่าขั้นต่ำ" },
  { id: 3, lotNo: "L-250103", code: "RM-003", materialName: "เนยจืด", qty: 12, importDate: "2025-02-01", expDate: "2026-02-01", status: "รอตรวจสอบ" },
];

type LotDetail = {
  lotNo: string;
  received: number;
  remain: number;
  used: number;
};

export default function RawMaterial() {
  const [data] = useState<StockRow[]>(seed);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof StockRow>("lotNo");
  const [sortAsc, setSortAsc] = useState(true);

  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState<StockRow | null>(null);

  // ตัวอย่างข้อมูลล็อตใน pop-up
  const lotData: LotDetail[] = [
    { lotNo: "L-250101-A", received: 30, remain: 20, used: 10 },
    { lotNo: "L-250101-B", received: 20, remain: 15, used: 5 },
  ];

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return data
      .filter(
        (d) =>
          !s ||
          d.lotNo.toLowerCase().includes(s) ||
          d.code.toLowerCase().includes(s) ||
          d.materialName.toLowerCase().includes(s) ||
          String(d.qty).includes(s) ||
          d.status.toLowerCase().includes(s)
      )
      .sort((a, b) => {
        const av = String(a[sortKey]);
        const bv = String(b[sortKey]);
        if (av < bv) return sortAsc ? -1 : 1;
        if (av > bv) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [data, search, sortKey, sortAsc]);

  const openPopup = (row: StockRow) => {
    setSelected(row);
    setOpenDetail(true);
  };

  return (
    <div className="rm-page">
      <h2 className="rm-title">คลังวัตถุดิบ</h2>

      {/* ====== Tabs ====== */}
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
          <NavLink to="/warehouse/raw-material/allocate" className="tab-link">
            จัดสรรวัตถุดิบ
          </NavLink>
        </div>

        <div className="rm-toolbar">
          <input
            className="rm-input"
            placeholder="ค้นหา: ล็อต / ชื่อ / สถานะ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ====== ตารางหลัก ====== */}
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

        {filtered.map((r) => (
          <div key={r.id} className="rm-row clickable" onClick={() => openPopup(r)}>
            <div className="td">{r.lotNo}</div>
            <div className="td">{r.code}</div>
            <div className="td">{r.materialName}</div>
            <div className="td mono">{r.qty.toLocaleString()}</div>
            <div className="td">{r.importDate}</div>
            <div className="td">{r.expDate}</div>
            <div className={`td status ${r.status}`}>{r.status}</div>
          </div>
        ))}

        {filtered.length === 0 && <div className="rm-empty">ไม่พบข้อมูล</div>}
      </div>

      {/* ====== Pop-up แสดงรายละเอียด ====== */}
      {openDetail && selected && (
        <>
          <button className="rm-overlay" onClick={() => setOpenDetail(false)} />
          <div className="rm-modal large" role="dialog" aria-modal="true">
            <button
              className="close-btn"
              onClick={() => setOpenDetail(false)}
              aria-label="close"
            >
              ✖
            </button>
            <h3 className="modal-title">รายละเอียดวัตถุดิบ</h3>

            <div className="detail-header">
              <p>
                <b>รหัสวัตถุดิบ:</b> {selected.code}
              </p>
              <p>
                <b>ชื่อวัตถุดิบ:</b> {selected.materialName}
              </p>
            </div>

            <div className="rm-table inner">
              <div className="rm-row rm-head">
                <div className="th">ชื่อวัตถุดิบ</div>
                <div className="th">เลขล็อต</div>
                <div className="th">จำนวนที่ได้รับ</div>
                <div className="th">คงเหลือ</div>
                <div className="th">จำนวนที่ใช้</div>
              </div>

              {lotData.map((l, i) => (
                <div key={i} className="rm-row">
                  <div className="td">{selected.materialName}</div>
                  <div className="td">{l.lotNo}</div>
                  <div className="td">{l.received}</div>
                  <div className="td">{l.remain}</div>
                  <div className="td">{l.used}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
