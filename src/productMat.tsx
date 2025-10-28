import { useState } from "react";
import { createPortal } from "react-dom";
import "./productMat.css";

type MaterialRow = {
  id: string;
  code: string;
  name: string;
  qty: number;
  unit: string;
  description: string;
};

export default function ProductMat() {
  const [materials, setMaterials] = useState<MaterialRow[]>([
    { id: crypto.randomUUID(), code: "M001", name: "น้ำตาลทรายขาว", qty: 10, unit: "kg", description: "วัตถุดิบหลัก" },
    { id: crypto.randomUUID(), code: "M002", name: "แป้งสาลี", qty: 8, unit: "kg", description: "วัตถุดิบรอง" },
  ]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState<MaterialRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaterialRow | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  function handleAdd(mat: Omit<MaterialRow, "id">) {
    setMaterials(prev => [...prev, { ...mat, id: crypto.randomUUID() }]);
  }

  function handleUpdate(newMat: MaterialRow) {
    setMaterials(prev => prev.map(m => (m.id === newMat.id ? newMat : m)));
  }

  function handleDeleteConfirmed(id: string) {
    setMaterials(prev => prev.filter(m => m.id !== id));
    setDeleteTarget(null);
    showToast("ลบวัตถุดิบเรียบร้อยแล้ว");
  }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2000);
  }

  return (
    <div className="product-mat-page">
      <div className="mat-header">
        <h2>รายการวัตถุดิบในสินค้า</h2>
        <button className="btn outline" onClick={() => setOpenAdd(true)}>
          + เพิ่มวัตถุดิบ
        </button>
      </div>

      <div className="mat-table">
        <div className="mat-head">
          <div>รหัส</div>
          <div>ชื่อวัตถุดิบ</div>
          <div>จำนวน</div>
          <div>หน่วย</div>
          <div>คำอธิบาย</div>
          <div></div>
        </div>
        <div className="mat-body">
          {materials.map(m => (
            <div key={m.id} className="mat-row">
              <div>{m.code}</div>
              <div>{m.name}</div>
              <div>{m.qty}</div>
              <div>{m.unit}</div>
              <div>{m.description}</div>
              <div className="actions">
                <button className="btn ghost" onClick={() => setOpenEdit(m)}>
                  แก้ไข
                </button>
                <button className="btn danger" onClick={() => setDeleteTarget(m)}>
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === Popups === */}
      {openAdd && (
        <AddEditModal
          title="เพิ่มวัตถุดิบ"
          onClose={() => setOpenAdd(false)}
          onSubmit={(mat) => {
            handleAdd(mat);
            setOpenAdd(false);
            showToast("บันทึกวัตถุดิบเรียบร้อยแล้ว");
          }}
        />
      )}
      {openEdit && (
        <AddEditModal
          title="แก้ไขวัตถุดิบ"
          defaultValue={openEdit}
          onClose={() => setOpenEdit(null)}
          onSubmit={(mat) => {
            handleUpdate({ ...mat, id: openEdit.id });
            setOpenEdit(null);
            showToast("บันทึกวัตถุดิบเรียบร้อยแล้ว");
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          name={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteConfirmed(deleteTarget.id)}
        />
      )}

      {/* ✅ Toast */}
      {toastMsg && <div className="toast-popup">{toastMsg}</div>}
    </div>
  );
}

/* ========= Modal component ========= */
function AddEditModal({
  title,
  defaultValue,
  onClose,
  onSubmit,
}: {
  title: string;
  defaultValue?: Partial<MaterialRow>;
  onClose: () => void;
  onSubmit: (data: Omit<MaterialRow, "id">) => void;
}) {
  const [code, setCode] = useState(defaultValue?.code || "");
  const [name, setName] = useState(defaultValue?.name || "");
  const [qty, setQty] = useState<number | "">(defaultValue?.qty ?? "");
  const [unit, setUnit] = useState(defaultValue?.unit || "kg");
  const [desc, setDesc] = useState(defaultValue?.description || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const units = ["g", "kg", "ml", "L", "ชิ้น"];

  function validate() {
    const newErr: Record<string, string> = {};
    if (!code.trim()) newErr.code = "กรอกรหัสวัตถุดิบ";
    if (!name.trim()) newErr.name = "กรอกชื่อวัตถุดิบ";
    if (qty === "" || Number(qty) <= 0) newErr.qty = "จำนวนต้องมากกว่า 0";
    if (!unit.trim()) newErr.unit = "กรอกหน่วย";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  }

  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-card clean-modal">
        <h3>{title}</h3>

        {/* <label className="modal-label">รหัสวัตถุดิบ</label>
        <input
          className={`modal-input ${errors.code ? "is-invalid" : ""}`}
          placeholder="เช่น M001"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {errors.code && <div className="error-text">{errors.code}</div>} */}

        <label className="modal-label">ชื่อวัตถุดิบ</label>
        <input
          className={`modal-input ${errors.name ? "is-invalid" : ""}`}
          placeholder="ชื่อวัตถุดิบ"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <div className="error-text">{errors.name}</div>}

        <label className="modal-label">จำนวน</label>
        <input
          className={`modal-input ${errors.qty ? "is-invalid" : ""}`}
          type="number"
          min={0}
          placeholder="0"
          value={qty}
          onChange={(e) => setQty(e.target.value === "" ? "" : Number(e.target.value))}
        />
        {errors.qty && <div className="error-text">{errors.qty}</div>}

        <label className="modal-label">หน่วย</label>
        <select
          className={`modal-input ${errors.unit ? "is-invalid" : ""}`}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        {errors.unit && <div className="error-text">{errors.unit}</div>}

        <label className="modal-label">คำอธิบาย</label>
        <textarea
          className="modal-input"
          rows={3}
          placeholder="รายละเอียดเพิ่มเติม"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="btn primary"
            onClick={() => {
              if (!validate()) return;
              onSubmit({ code, name, qty: Number(qty), unit, description: desc });
            }}
          >
            บันทึก
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ========= Confirm Delete Modal ========= */
function ConfirmDeleteModal({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return createPortal(
    <>
      <div className="modal-overlay" />
      <div className="confirm-modal">
        <h3>ต้องการลบวัตถุดิบนี้หรือไม่?</h3>
        <p style={{ marginTop: "6px", color: "#2b2b66" }}>
          ชื่อวัตถุดิบ: <b>{name}</b>
        </p>
        <div className="confirm-actions">
          <button className="btn ghost" onClick={onCancel}>
            ยกเลิก
          </button>
          <button className="btn danger" onClick={onConfirm}>
            ยืนยัน
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
