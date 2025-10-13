import { useEffect, useMemo, useRef, useState } from "react";
import "./productPage.css";
import { useNavigate } from "react-router-dom";

/** ==== Types ==== */
interface Item {
  id: number;
  name: string;
  status: string;
  group: string;
}
type IngredientDraft = {
  id: string;
  materialName: string;
  quantity: string;
  unit: string;
};
type Recipe = {
  id: string;
  name: string;
  note?: string;
  ingredients: Array<{ materialName: string; quantity: number; unit: string }>;
  createdAt: string;
};

/** ==== localStorage helpers ==== */
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
  return (
    safeGetRecipes().find((r) => r.name.trim().toLowerCase() === key) || null
  );
}

export default function ProductPage() {
  const navigate = useNavigate();

  /** ====== รายการสินค้า (มาจาก recipes ใน localStorage) ====== */
  const [items, setItems] = useState<Item[]>([]);

  // แปลง Recipe -> Item เพื่อแสดงบนการ์ด
  const mapRecipesToItems = (recipes: Recipe[]): Item[] =>
    recipes.map((r, idx) => ({
      id: idx + 1,
      name: r.name,
      status: "พร้อมใช้งาน",
      group: "สูตรใหม่", // ถ้าต้องการกลุ่มจริง ให้บันทึก group ลงใน Recipe ด้วย แล้วอ่านมาแสดงแทน
    }));

  const loadItemsFromStorage = () => {
    const recipes = safeGetRecipes();
    setItems(mapRecipesToItems(recipes));
  };

  useEffect(() => {
    loadItemsFromStorage();
  }, []);

  /** ====== Modal แก้ไขสินค้า + สูตร ====== */
  const [_openEdit, _setOpenEdit] = useState(false);

  // สินค้าที่กำลังแก้
  const [editing, setEditing] = useState<Item | null>(null);
  const [editName, setEditName] = useState("");
  const [editGroup, setEditGroup] = useState("");

  // สูตรที่กำลังแก้ (draft)
  const unitOptions = useMemo(() => ["g", "kg", "ml", "L", "ชิ้น"], []);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [recipeNote, setRecipeNote] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState<IngredientDraft[]>([]);
  const [recipeErrors, setRecipeErrors] = useState<string[]>([]);

  // สำหรับ fallback เมื่อไม่เจอสูตรตามชื่อ
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [attachRecipeName, setAttachRecipeName] = useState<string>("");

  /** เปิด Modal แล้วดึง “สูตรเดิม” (ถ้ามี) */
  function openEditModal(item: Item) {
    setEditing(item);
    setEditName(item.name);
    setEditGroup(item.group);

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
        }))
      );
      setAttachRecipeName(found.name);
    } else {
      // ไม่เจอ → ให้เริ่มว่าง + เปิดตัวเลือกแนบสูตร
      setRecipeId(null);
      setRecipeNote("");
      setRecipeIngredients([
        { id: crypto.randomUUID(), materialName: "", quantity: "", unit: "g" },
      ]);
      setAttachRecipeName("");
    }

    setRecipeErrors([]);
    _setOpenEdit(true);
  }

  function closeEditModal() {
    _setOpenEdit(false);
    setEditing(null);
    setEditName("");
    setEditGroup("");
    setRecipeId(null);
    setRecipeNote("");
    setRecipeIngredients([]);
    setRecipeErrors([]);
    setAllRecipes([]);
    setAttachRecipeName("");
  }

  // แนบสูตรจาก dropdown (เมื่อไม่เจออัตโนมัติ)
  function attachSelectedRecipe(name: string) {
    setAttachRecipeName(name);
    const r = findRecipeByNameInsensitive(name);
    if (!r) return;
    setRecipeId(r.id);
    setRecipeNote(r.note ?? "");
    setRecipeIngredients(
      r.ingredients.map((ing) => ({
        id: crypto.randomUUID(),
        materialName: ing.materialName,
        quantity: String(ing.quantity),
        unit: ing.unit,
      }))
    );
  }

  // จัดการแถววัตถุดิบใน modal
  function addIngRow() {
    setRecipeIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), materialName: "", quantity: "", unit: "g" },
    ]);
  }
  function removeIngRow(id: string) {
    setRecipeIngredients((prev) => prev.filter((r) => r.id !== id));
  }
  function updateIngRow(
    id: string,
    key: keyof IngredientDraft,
    value: string
  ) {
    setRecipeIngredients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r))
    );
  }

  // validate สูตร
  function validateRecipe(nameForRecipe: string) {
    const errs: string[] = [];
    if (!nameForRecipe.trim()) errs.push("กรุณากรอกชื่อสินค้า/ชื่อสูตร");

    if (recipeIngredients.length === 0) {
      errs.push("กรุณาเพิ่มวัตถุดิบอย่างน้อย 1 รายการ");
    }
    recipeIngredients.forEach((r, idx) => {
      if (!r.materialName.trim())
        errs.push(`แถวที่ ${idx + 1}: กรุณากรอกชื่อวัตถุดิบ`);
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

  /** บันทึกการแก้ไข (สินค้า + สูตร) */
  function saveEdit() {
    if (!editing) return;
    const name = editName.trim();
    const group = editGroup.trim();
    if (!name) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }
    if (!group) {
      alert("กรุณากรอกหมวดหมู่");
      return;
    }

    // อัปเดตสินค้าใน state (เฉพาะที่แสดงผล)
    setItems((prev) =>
      prev.map((it) => (it.id === editing.id ? { ...it, name, group } : it))
    );

    // อัปเดต/สร้างสูตรใน localStorage
    if (!validateRecipe(name)) return;

    const list = safeGetRecipes();
    const payload: Recipe = {
      id: recipeId ?? crypto.randomUUID(),
      name, // ให้ชื่อสูตรตรงกับชื่อสินค้าปัจจุบัน
      note: recipeNote.trim() || undefined,
      ingredients: recipeIngredients.map((r) => ({
        materialName: r.materialName.trim(),
        quantity: Number(r.quantity),
        unit: r.unit,
      })),
      createdAt:
        (recipeId && list.find((r) => r.id === recipeId)?.createdAt) ||
        new Date().toISOString(),
    };

    // upsert: ลองด้วย id → ถ้าไม่เจอ ลองด้วยชื่อ → ไม่เจอค่อย push ใหม่
    const idxById = recipeId ? list.findIndex((r) => r.id === recipeId) : -1;
    const idxByName = list.findIndex(
      (r) => r.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    const idx = idxById >= 0 ? idxById : idxByName;

    if (idx >= 0) list[idx] = payload;
    else list.push(payload);

    saveRecipes(list);

    // รีโหลดการ์ดจาก localStorage ให้ sync กับที่บันทึก
    loadItemsFromStorage();

    closeEditModal();
    alert("บันทึกการแก้ไขสินค้า/สูตรเรียบร้อยแล้ว");
  }

  /** ลบสินค้า + ลบสูตรใน localStorage ตามชื่อ */
  function removeItemAndRecipe(it: Item) {
    if (!confirm("ต้องการลบสินค้านี้และสูตรที่เกี่ยวข้องใช่หรือไม่?")) return;

    // ลบการ์ดบนจอ
    setItems((prev) => prev.filter((x) => x.id !== it.id));

    // ลบสูตรใน localStorage โดยเทียบชื่อ
    const list = safeGetRecipes().filter(
      (r) => r.name.trim().toLowerCase() !== it.name.trim().toLowerCase()
    );
    saveRecipes(list);

    // รีโหลด ids ให้เรียงใหม่สวย ๆ
    loadItemsFromStorage();
  }

  void removeItemAndRecipe;

  return (
    <div className="product-page">
      {/* Header */}
      {/* <header className="produce-header">
        <button className="back-btn" aria-label="ย้อนกลับ" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>ผลิตสินค้า</h1>
      </header> */}

      {/* ปุ่มเพิ่ม */}
      <div className="add-wrap">
        <button className="add-btn" onClick={() => navigate("/home/build-product")}>
          + เพิ่มสินค้า
        </button>
      </div>

      {/* การ์ดสินค้า */}
      <div className="cards">
        {items.map((it) => (
          <article key={it.id} className="prod-card">
            <div className="prod-thumb" aria-label="product image placeholder" />
            {/* กลาง: ข้อมูลสินค้า */}
      <div className="prod-info">
        <div className="row">
          <span className="label">ชื่อสินค้า : </span>
          <span className="pill">{it.name}</span>
        </div>
        <div className="row">
          <span className="label">หมวดหมู่ : </span>
          <span className="pill">{it.group}</span>
        </div>
      </div>
           

{/* ขวาสุด: ปุ่มจัดการ */}
      <div className="prod-actions">
        <button className="btn ghost" onClick={() => openEditModal(it)}>
          แก้ไข
        </button>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) {
              setItems((prev) => prev.filter((x) => x.id !== it.id));
            }
          }}
        >
          ลบ
        </button>
      </div>
    </article>
        ))}
        {items.length === 0 && (
          <div style={{ padding: 12, color: "#555" }}>
            ยังไม่มีสินค้า/สูตร ลองกด “+ เพิ่มสินค้า” เพื่อบันทึกสูตรใหม่
          </div>
        )}
      </div>

      {/* ===== Modal แก้ไขสินค้า + สูตร ===== */}
      <Modal open={_openEdit} onClose={closeEditModal}>
        <h3 className="modal-title">แก้ไขสินค้า & สูตร</h3>

        {/* ถ้า “ไม่เจอสูตรตามชื่อ” ให้เลือกแนบสูตรจากรายการทั้งหมด */}
        {!recipeId && safeGetRecipes().length > 0 && (
          <div className="modal-tip" style={{ margin: "8px 0 12px" }}>
            <div style={{ marginBottom: 6 }}>ไม่พบสูตรที่ชื่อเดียวกับสินค้า ลองเลือกสูตรที่มีอยู่เพื่อแนบ:</div>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                className="modal-input"
                value={attachRecipeName}
                onChange={(e) => attachSelectedRecipe(e.target.value)}
              >
                <option value="">— เลือกสูตร —</option>
                {allRecipes.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
              <button
                className="btn ghost"
                onClick={() => attachRecipeName && attachSelectedRecipe(attachRecipeName)}
              >
                แนบสูตร
              </button>
            </div>
          </div>
        )}

        {/* error ของสูตร */}
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
              <label className="modal-label" htmlFor="edit-name">ชื่อสินค้า</label>
              <input id="edit-name" className="modal-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <label className="modal-label" htmlFor="edit-group">หมวดหมู่</label>
              <input id="edit-group" className="modal-input" value={editGroup} onChange={(e) => setEditGroup(e.target.value)} />
            </div>

            {/* สูตร */}
            <div className="edit-block">
              <div className="block-title">สูตรสินค้า</div>

              <label className="modal-label" htmlFor="note">หมายเหตุ</label>
              <textarea
                id="note"
                className="modal-textarea"
                rows={3}
                value={recipeNote}
                onChange={(e) => setRecipeNote(e.target.value)}
                placeholder="เช่น เกรดวัตถุดิบ / เงื่อนไขการผลิต"
              />

              <div className="ing-header">
                <div>วัตถุดิบ</div>
                <div>ปริมาณ</div>
                <div>หน่วย</div>
                <div />
              </div>

              {recipeIngredients.map((ing) => (
                <div className="ing-row" key={ing.id}>
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
                    title={recipeIngredients.length === 1 ? "ต้องมีอย่างน้อย 1 แถว" : "ลบแถวนี้"}
                  >
                    ลบ
                  </button>
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
          <button className="btn ghost" onClick={closeEditModal}>ยกเลิก</button>
          <button className="btn primary" onClick={saveEdit}>บันทึก</button>
        </div>
      </Modal>
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

  // ปิดด้วย ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // โฟกัสอัตโนมัติ
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
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={dialogRef}
      >
        {children}
      </div>
    </>
  );
}
