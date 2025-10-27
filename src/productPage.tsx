import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "./context/ProductContext";
import "./productPage.css";


type IngredientDraft = {
  id: string;
  materialName: string;
  quantity: string;
  unit: string;
  description: string;
};

type Recipe = {
  id: string;
  name: string;
  note?: string;
  ingredients: Array<{ materialName: string; quantity: number; unit: string ; description?: string}>;
  createdAt: string;
};

/** ===== LocalStorage สูตร ===== */
function safeGetRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem("recipes");
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function saveRecipes(list: Recipe[]) {
  localStorage.setItem("recipes", JSON.stringify(list));
}
function findRecipeByNameInsensitive(name: string): Recipe | null {
  const key = name.trim().toLowerCase();
  return safeGetRecipes().find((r) => r.name.trim().toLowerCase() === key) || null;
}

/** ====== Component หลัก ====== */
export default function ProductPage() {
  const navigate = useNavigate();
  const { products, setProducts } = useProducts();
  const [showToast, setShowToast] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);


  // ====== Modal ======
  const [_openEdit, _setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editGroup, setEditGroup] = useState("");

  // ====== สูตร ======
  const unitOptions = useMemo(() => ["g", "kg", "ml", "L", "ชิ้น"], []);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [recipeNote, setRecipeNote] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState<IngredientDraft[]>([]);
  const [recipeErrors, setRecipeErrors] = useState<string[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [attachRecipeName, setAttachRecipeName] = useState<string>("");

  /** เปิด Modal */
  function openEditModal(item: any) {
    setEditing(item);
    setEditCode(item.code || "");
    setEditName(item.name);
    setEditUnit(item.unit || "");
    setEditDesc(item.desc || "");
    setEditGroup(item.group || "");

    const found = findRecipeByNameInsensitive(item.name);
    const all = safeGetRecipes();
    setAllRecipes(all);

    if (found) {
      setRecipeId(found.id);
      setRecipeNote(found.note ?? "");
      setRecipeIngredients(
        found.ingredients.map((ing) => ({
          id: crypto.randomUUID(),
          materialName: ing.materialName,
          quantity: String(ing.quantity),
          unit: ing.unit,
          description: ing.description || "",
        }))
      );
      setAttachRecipeName(found.name);
    } else {
      setRecipeId(null);
      setRecipeNote("");
      setRecipeIngredients([{ id: crypto.randomUUID(), materialName: "", quantity: "", unit: "g" ,description: ""}]);
      setAttachRecipeName("");
    }

    setRecipeErrors([]);
    _setOpenEdit(true);
  }

  /** ปิด Modal */
  function closeEditModal() {
    _setOpenEdit(false);
    setEditing(null);
    setEditCode("");
    setEditName("");
    setEditUnit("");
    setEditDesc("");
    setEditGroup("");
    setRecipeId(null);
    setRecipeNote("");
    setRecipeIngredients([]);
    setRecipeErrors([]);
    setAllRecipes([]);
    setAttachRecipeName("");
  }

  /** เพิ่ม / ลบ แถววัตถุดิบ */
  function addIngRow() {
    setRecipeIngredients((prev) => [...prev, { id: crypto.randomUUID(), materialName: "", quantity: "", unit: "g" ,description: ""}]);
  }
  function removeIngRow(id: string) {
    setRecipeIngredients((prev) => prev.filter((r) => r.id !== id));
  }
  function updateIngRow(id: string, key: keyof IngredientDraft, value: string) {
    setRecipeIngredients((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  /** ตรวจสอบสูตร */
  function validateRecipe(nameForRecipe: string) {
    const errs: string[] = [];
    if (!nameForRecipe.trim()) errs.push("กรุณากรอกชื่อสินค้า/ชื่อสูตร");
    if (recipeIngredients.length === 0) errs.push("กรุณาเพิ่มวัตถุดิบอย่างน้อย 1 รายการ");

    recipeIngredients.forEach((r, idx) => {
      if (!r.materialName.trim()) errs.push(`แถวที่ ${idx + 1}: กรุณากรอกชื่อวัตถุดิบ`);
      const q = Number(r.quantity);
      if (r.quantity.trim() === "" || Number.isNaN(q)) {
        errs.push(`แถวที่ ${idx + 1}: ปริมาณต้องเป็นตัวเลข`);
      } else if (q <= 0) {
        errs.push(`แถวที่ ${idx + 1}: ปริมาณต้องมากกว่า 0`);
      }
      if (!r.unit.trim()) errs.push(`แถวที่ ${idx + 1}: กรุณาเลือกหน่วย`);
    });

    setRecipeErrors(errs);
    return errs.length === 0;
  }

  /** บันทึกสินค้า + สูตร */
  function saveEdit() {
    if (!editing) return;
    const name = editName.trim();
    const group = editGroup.trim();
    if (!name) return alert("กรุณากรอกชื่อสินค้า");
    if (!group) return alert("กรุณากรอกหมวดหมู่");
    if (!validateRecipe(name)) return;

    // อัปเดตสินค้าใน global
    setProducts((prev) =>
      prev.map((it) =>
        it.id === editing.id
          ? {
              ...it,
              code: editCode,
              name,
              unit: editUnit,
              desc: editDesc,
              group,
              status: it.status,
            }
          : it
      )
    );

    // อัปเดตสูตรใน localStorage
    const list = safeGetRecipes();
    const payload: Recipe = {
      id: recipeId ?? crypto.randomUUID(),
      name,
      note: recipeNote.trim() || undefined,
      ingredients: recipeIngredients.map((r) => ({
        materialName: r.materialName.trim(),
        quantity: Number(r.quantity),
        unit: r.unit,
        description: r.description?.trim() || "-",
      })),
      createdAt: (recipeId && list.find((r) => r.id === recipeId)?.createdAt) || new Date().toISOString(),
    };

    const idxById = recipeId ? list.findIndex((r) => r.id === recipeId) : -1;
    const idxByName = list.findIndex((r) => r.name.trim().toLowerCase() === name.trim().toLowerCase());
    const idx = idxById >= 0 ? idxById : idxByName;

    if (idx >= 0) list[idx] = payload;
    else list.push(payload);

    saveRecipes(list);
    closeEditModal();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  /** ลบสินค้า */
  function removeItem(it: any) {
    setDeleteTarget(it);
    setOpenDeleteConfirm(true);
  }

  function confirmDelete() {
  if (!deleteTarget) return;
  setProducts((prev) => prev.filter((x) => x.id !== deleteTarget.id));
  setDeleteTarget(null);
  setOpenDeleteConfirm(false);
}

function cancelDelete() {
  setDeleteTarget(null);
  setOpenDeleteConfirm(false);
}


  return (
    <div className="product-page">
      <div className="add-wrap">
        <button className="add-btn" onClick={() => navigate("/production/build-product")}>
          + เพิ่มสินค้า
        </button>
      </div>

      {/* แสดงรายการสินค้า */}
      <div className="cards">
        {products.map((it) => (
          <article key={it.id} className="prod-card">
            <div className="prod-thumb" aria-label="product image placeholder" />
            <div className="prod-info">
              <div className="row">
                <span className="label">รหัสสินค้า :</span>
                <span className="pill">{it.code || "-"}</span>
              </div>
              <div className="row">
                <span className="label">ชื่อสินค้า :</span>
                <span className="pill">{it.name}</span>
              </div>
              <div className="row">
                <span className="label">หน่วย :</span>
                <span className="pill">{it.unit || "-"}</span>
              </div>
              <div className="row">
                <span className="label">คำอธิบาย :</span>
                <span className="pill">{it.desc || "-"}</span>
              </div>
            </div>

            <div className="prod-actions">
              <button className="btn ghost" onClick={() => openEditModal(it)}>
                แก้ไข
              </button>
              <button className="btn danger" onClick={() => removeItem(it)}>
                ลบ
              </button>
            </div>
          </article>
        ))}

        {products.length === 0 && (
          <div style={{ padding: 12, color: "#555" }}>
            ยังไม่มีสินค้า/สูตร ลองกด “+ เพิ่มสินค้า” เพื่อบันทึกสูตรใหม่
          </div>
        )}
      </div>

      {/* ===== Modal แก้ไข ===== */}
      <Modal open={_openEdit} onClose={closeEditModal}>
        <h3 className="modal-title">แก้ไขสินค้า & สูตร</h3>

        {recipeErrors.length > 0 && (
          <div className="modal-error" style={{ marginBottom: 8 }}>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {recipeErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="modal-body">
          <div className="edit-grid">
            {/* ข้อมูลสินค้า */}
            <div className="edit-block">
              <div className="block-title">ข้อมูลสินค้า</div>

              <label className="modal-label">รหัสสินค้า:</label>
              <input className="modal-input" value={editCode} onChange={(e) => setEditCode(e.target.value)} />

              <label className="modal-label">ชื่อสินค้า:</label>
              <input className="modal-input" value={editName} onChange={(e) => setEditName(e.target.value)} />

              <label className="modal-label">หน่วย:</label>
              <input className="modal-input" value={editUnit} onChange={(e) => setEditUnit(e.target.value)} />

              <label className="modal-label">คำอธิบาย:</label>
              <textarea className="modal-textarea" rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />

              <label className="modal-label">หมวดหมู่:</label>
              <input className="modal-input" value={editGroup} onChange={(e) => setEditGroup(e.target.value)} />
            </div>

            {/* สูตรสินค้า */}
            <div className="edit-block">
              <div className="block-title">สูตรสินค้า</div>

              <label className="modal-label">หมายเหตุ</label>
              <textarea className="modal-textarea" rows={3} value={recipeNote} onChange={(e) => setRecipeNote(e.target.value)} />

              <div className="ing-header">
                <div>วัตถุดิบ</div>
                <div>ปริมาณ</div>
                <div>หน่วย</div>
                <div />
              </div>

              

                {recipeIngredients.map((ing, idx) => (
  <div className="ing-row" key={ing.id}>
    {/* ===== บรรทัดบน ===== */}
    <div className="ing-top">
      <input
        className="modal-input"
        placeholder="ชื่อวัตถุดิบ"
        value={ing.materialName}
        onChange={(e) => updateIngRow(ing.id, "materialName", e.target.value)}
      />
      <input
        className="modal-input"
        placeholder="0"
        inputMode="decimal"
        value={ing.quantity}
        onChange={(e) => updateIngRow(ing.id, "quantity", e.target.value)}
      />
      <select
        className="modal-input"
        value={ing.unit}
        onChange={(e) => updateIngRow(ing.id, "unit", e.target.value)}
      >
        {unitOptions.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      <button
        className="btn ghost"
        onClick={() => removeIngRow(ing.id)}
        disabled={recipeIngredients.length === 1}
      >
        ลบ
      </button>

        


    </div>

    {/* ===== บรรทัดล่าง ===== */}
    <div className="ing-desc">
      <label className="desc-label">คำอธิบาย:</label>
      <input
        className="modal-input desc-input"
        placeholder="คำอธิบาย เช่น เกรด A / ยี่ห้อ X"
        value={ing.description || ""}
        onChange={(e) => updateIngRow(ing.id, "description", e.target.value)}
      />
    </div>
  </div>
))}


              
              
              <div style={{ marginTop: 8 }}>
                <button className="btn outline" onClick={addIngRow}>
                  + เพิ่มวัตถุดิบ
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={closeEditModal}>
            ยกเลิก
          </button>
          <button className="btn primary" onClick={saveEdit}>
            บันทึก
          </button>
        </div>
      </Modal>

      {/* ✅ Modal ยืนยันการลบ */}
{openDeleteConfirm && (
  <>
    <div className="modal-overlay" />
    <div className="confirm-modal">
      <h3>ต้องการลบสินค้านี้หรือไม่?</h3>
      <p style={{marginTop:"6px", color:"#2b2b66"}}>ชื่อสินค้า: <b>{deleteTarget?.name}</b></p>
      <div className="confirm-actions">
        <button className="btn ghost" onClick={cancelDelete}>ยกเลิก</button>
        <button className="btn danger" onClick={confirmDelete}>ยืนยัน</button>
      </div>
    </div>
  </>
)}

      {showToast && (
  <div className="toast-popup">
    ✅ บันทึกสินค้าและสูตรเรียบร้อยแล้ว
  </div>


        
)}

    </div>
  );
}

/* ===== Modal Component ===== */
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelector<HTMLElement>("input, button, [href], select, textarea");
      focusable?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button className="modal-overlay" aria-label="Close" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" ref={dialogRef}>
        {children}
      </div>
    </>
  );
}
