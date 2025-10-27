import { useMemo, useState } from "react";
import "./buildProduct.css";
import { useProducts } from "./context/ProductContext";


/**
 * หน้านี้ทำเฉพาะ "บันทึกสูตรใหม่"
 * - กรอกชื่อสูตร (จำเป็น)
 * - เพิ่มวัตถุดิบหลายรายการ (อย่างน้อย 1 รายการ, แต่ละรายการต้องมีชื่อวัตถุดิบและปริมาณ > 0)
 * - หมายเหตุ (ไม่บังคับ)
 * - แสดง error แบบ inline และ error summary ด้านบนเมื่อกดบันทึกแต่ไม่ครบ
 * - ไม่มีการผลิตสินค้าในหน้านี้ (หน้าผลิตจะไปที่ product-page แยกต่างหาก)
 *
 * หมายเหตุการต่อยอด:
 * - ส่วน saveRecipe ปัจจุบันเดโมเก็บใน localStorage key: "recipes"
 *   ถ้ามี backend ให้เปลี่ยนไปเรียก API ตรงนี้ได้เลย
 */

type Ingredient = {
  id: string;
  materialName: string;
  quantity: string; // เก็บเป็น string เพื่อรองรับ input ตรง ๆ แล้วค่อย validate เป็นตัวเลข
  unit: string;
  description: string; // ✅ เพิ่มช่องอธิบายต่อวัตถุดิบ
};

type Recipe = {
  id: string;
  name: string;
  note?: string;
  productUnit: string;
  ingredients: Array<{
    materialName: string;
    quantity: number;
    unit: string;
  }>;
  createdAt: string;
};


// เพิ่มก่อนฟังก์ชัน return
const warehouseMaterials = [
  "น้ำตาลทรายขาว",
  "แป้งสาลี",
  "เนยจืด",
  "ไข่ไก่",
  "นมสด",
];

export default function BuildProduct() {
  const [recipeName, setRecipeName] = useState("");
  const [productUnit, setProductUnit] = useState("");

  const [note, setNote] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: crypto.randomUUID(), materialName: "", quantity: "", unit: "g",description: "" },
  ]);

  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedToast, setSavedToast] = useState<string>("");
  const { products, setProducts } = useProducts();

  // หน่วยให้เลือก (ปรับเพิ่ม/ลดได้ตามต้องการ)
  const unitOptions = useMemo(() => ["g", "kg", "ml", "L", "ชิ้น"], []);

  function addRow() {
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), materialName: "", quantity: "", unit: "g", description: ""},
    ]);
  }

  function removeRow(id: string) {
    setIngredients((prev) => prev.filter((x) => x.id !== id));
  }

  function updateRow(id: string, key: keyof Ingredient, value: string) {
    setIngredients((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  }

  function validate(): {
    ok: boolean;
    errors: string[];
    fieldErrors: Record<string, string>;
  } {
    const newErrors: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    if (!recipeName.trim()) {
      newErrors.push("กรุณากรอกชื่อสูตร");
      newFieldErrors["recipeName"] = "กรุณากรอกชื่อสูตร";
    }

    if (ingredients.length === 0) {
      newErrors.push("กรุณาเพิ่มรายการวัตถุดิบอย่างน้อย 1 รายการ");
    }

    ingredients.forEach((row, idx) => {
      const prefix = `ingredients.${idx}`;
      if (!row.materialName.trim()) {
        newErrors.push(`แถวที่ ${idx + 1}: กรุณากรอกชื่อวัตถุดิบ`);
        newFieldErrors[`${prefix}.materialName`] = "จำเป็น";
      }
      const qty = Number(row.quantity);
      if (row.quantity.trim() === "" || Number.isNaN(qty)) {
        newErrors.push(`แถวที่ ${idx + 1}: ปริมาณต้องเป็นตัวเลข`);
        newFieldErrors[`${prefix}.quantity`] = "ต้องเป็นตัวเลข";
      } else if (qty <= 0) {
        newErrors.push(`แถวที่ ${idx + 1}: ปริมาณต้องมากกว่า 0`);
        newFieldErrors[`${prefix}.quantity`] = "ต้อง > 0";
      }
      if (!row.unit.trim()) {
        newErrors.push(`แถวที่ ${idx + 1}: กรุณาเลือกหน่วย`);
        newFieldErrors[`${prefix}.unit`] = "จำเป็น";
      }
    });

    return {
      ok: newErrors.length === 0,
      errors: newErrors,
      fieldErrors: newFieldErrors,
    };
  }

  /**
   * บันทึก/อัพเดตสูตรลง localStorage แบบ case-insensitive ตามชื่อ
   * - ถ้าพบสูตรชื่อเดียวกัน (trim().toLowerCase()) → อัพเดตทับ (คง id/createdAt เดิม)
   * - ถ้าไม่พบ → push ใหม่
   */
  function saveRecipeToLocalStorage(recipe: Recipe) {
    const key = "recipes";
    const safeLower = (s: string) => s.trim().toLowerCase();

    try {
      const raw = localStorage.getItem(key);
      const list: Recipe[] = raw ? JSON.parse(raw) : [];

      const idx = list.findIndex(
        (r) => safeLower(r.name) === safeLower(recipe.name)
      );

      if (idx >= 0) {
        // คง id / createdAt เดิม แล้วอัพเดต field ที่แก้ไข
        const updated: Recipe = {
          ...list[idx],
          ...recipe,
          id: list[idx].id,
          createdAt: list[idx].createdAt,
          name: recipe.name.trim(), // normalize
        };
        list[idx] = updated;
      } else {
        // เพิ่มใหม่ (normalize name)
        list.push({ ...recipe, name: recipe.name.trim() });
      }

      localStorage.setItem(key, JSON.stringify(list));
    } catch (e: any) {
      throw e;
    }
  }

  function handleSave() {
    
    setSavedToast("");
    const v = validate();
    setErrors(v.errors);
    setFieldErrors(v.fieldErrors);
    // เพิ่มเข้า global_products ถ้ายังไม่มีสินค้าเดียวกัน
setProducts((prev) => {
  const exists = prev.some(
    (p) => p.name.trim().toLowerCase() === recipeName.trim().toLowerCase()
  );
  if (exists) return prev;
  const newItem = {
    id: Date.now(),
    code: `P${String(prev.length + 1).padStart(3, "0")}`,
    name: recipeName.trim(),
    unit: productUnit.trim(),
    desc: note.trim() || "",
    group: "สินค้าใหม่",
    status: "พร้อมผลิต",
  };
  return [...prev, newItem];
});


    if (!v.ok) return;

    const payload: Recipe = {
      id: crypto.randomUUID(), // ถ้ามีอยู่แล้ว จะถูกแทนด้วย id เดิมใน saveRecipeToLocalStorage
      name: recipeName.trim(),
      note: note.trim() ? note.trim() : undefined,
      ingredients: ingredients.map((r) => ({
        materialName: r.materialName.trim(),
        quantity: Number(r.quantity),
        unit: r.unit,
        description: r.description?.trim() || "-",      })),
      createdAt: new Date().toISOString(),
      productUnit: productUnit.trim(),
      
    };

    try {
      // ปัจจุบันเดโมบันทึกไว้ที่ localStorage (upsert แบบ case-insensitive)
      saveRecipeToLocalStorage(payload);
      setSavedToast("บันทึกสูตรเรียบร้อยแล้ว");

      // เคลียร์ฟอร์ม
      setRecipeName("");
      setProductUnit("");
      setNote("");
      setIngredients([
        { id: crypto.randomUUID(), materialName: "", quantity: "", unit: "g" ,description: ""},
      ]);
      setErrors([]);
      setFieldErrors({});
    } catch (e: any) {
      setErrors([e?.message || "บันทึกไม่สำเร็จ"]);
    }
  }

  return (
    <div className="build-wrapper bp">
      <div className="page-title">
        บันทึกสูตรใหม่
        <span className="page-subtitle">สร้างสูตรสินค้าและกำหนดส่วนผสม</span>
      </div>

      {/* Error summary */}
      {errors.length > 0 && (
        <div className="alert error">
          <div className="alert-title">กรุณาตรวจสอบข้อมูล</div>
          <ul className="alert-list">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Saved toast */}
      {savedToast && (
        <div className="alert success">
          <div>{savedToast}</div>
        </div>
      )}

      <div className="card">
        <div className="section">
          <label className="label" htmlFor="recipeName">
            ชื่อสูตร <span className="req">*</span>
          </label>
          <input
            id="recipeName"
            className={`input ${fieldErrors["recipeName"] ? "is-invalid" : ""}`}
            placeholder="เช่น ชาเขียวมัทฉะ 500ml"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
          />
          {fieldErrors["recipeName"] && (
            <div className="field-error">{fieldErrors["recipeName"]}</div>
          )}

          {/* ✅ ช่องหน่วยของสินค้า */}
<label className="label" htmlFor="productUnit" style={{ marginTop: 10 }}>
  หน่วยของสินค้า <span className="req">*</span>
</label>
<input
  id="productUnit"
  className="input"
  placeholder="เช่น ขวด / กล่อง / ชิ้น"
  value={productUnit}
  onChange={(e) => setProductUnit(e.target.value)}
/>

        </div>

        <div className="section">
          <div className="row header">
            <div className="col col-name">
              วัตถุดิบ <span className="req">*</span>
            </div>
            <div className="col col-qty">
              ปริมาณ <span className="req">*</span>
            </div>
            <div className="col col-unit">
              หน่วย <span className="req">*</span>
            </div>
            <div className="col col-action" />
          </div>

          {ingredients.map((row, idx) => {
  const nameKey = `ingredients.${idx}.materialName`;
  const qtyKey = `ingredients.${idx}.quantity`;
  const unitKey = `ingredients.${idx}.unit`;
  const descKey = `ingredients.${idx}.description`;

  return (
    <div className="row" key={row.id}>
      
      <div className="col col-name">
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {/* 🔹 ปุ่ม V = dropdown เลือกจากคลัง */}
          <select
            className="select"
            style={{ width: "150px", flexShrink: 0 }}
            value={warehouseMaterials.includes(row.materialName) ? row.materialName : ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                updateRow(row.id, "materialName", val);
              }
            }}
          >
            <option value="">วัตถุดิบ</option>
            {warehouseMaterials.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* 🔹 ช่องพิมพ์ชื่อเอง (กรอกเองได้เสมอ) */}
          <input
            className={`input ${fieldErrors[nameKey] ? "is-invalid" : ""}`}
            placeholder="ชื่อวัตถุดิบ เช่น ผงชาเขียว"
            value={row.materialName}
            onChange={(e) => updateRow(row.id, "materialName", e.target.value)}
          />
        </div>

        {fieldErrors[nameKey] && (
          <div className="field-error">{fieldErrors[nameKey]}</div>
        )}
      </div>

      <div className="col col-qty">
        <input
          className={`input ${fieldErrors[qtyKey] ? "is-invalid" : ""}`}
          placeholder="0"
          inputMode="decimal"
          value={row.quantity}
          onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
        />
        {fieldErrors[qtyKey] && (
          <div className="field-error">{fieldErrors[qtyKey]}</div>
        )}
      </div>

      <div className="col col-unit">
        <select
          className={`select ${fieldErrors[unitKey] ? "is-invalid" : ""}`}
          value={row.unit}
          onChange={(e) => updateRow(row.id, "unit", e.target.value)}
        >
          {unitOptions.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        {fieldErrors[unitKey] && (
          <div className="field-error">{fieldErrors[unitKey]}</div>
        )}
      </div>


      

      <div className="col col-action">
        <button
          type="button"
          className="btn ghost"
          onClick={() => removeRow(row.id)}
          disabled={ingredients.length === 1}
          title={
            ingredients.length === 1
              ? "ต้องมีอย่างน้อย 1 แถว"
              : "ลบแถวนี้"
          }
        >
          ลบ
        </button>
      </div>

      <div className="col col-desc">
        <input
          className="input"
          placeholder="คำอธิบาย เช่น เกรด A / ยี่ห้อ X"
          value={row.description}
          onChange={(e) => updateRow(row.id, "description", e.target.value)}
        />
      </div>
    </div>
  );
})}

        
          <div className="row">
            <div className="col col-add">
              <button type="button" className="btn outline" onClick={addRow}>
                + เพิ่มวัตถุดิบ
              </button>
            </div>
          </div>
        </div>

        <div className="section">
          <label className="label" htmlFor="note">
            หมายเหตุ (ถ้ามี)
          </label>
          <textarea
            id="note"
            className="textarea"
            placeholder="เช่น ใช้มัทฉะเกรด A ห้ามแทนด้วยยี่ห้ออื่น"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="footer">
          <button type="button" className="btn primary" onClick={handleSave}>
            บันทึกสูตร
          </button>
          <span className="hint">
            * ช่องที่มีเครื่องหมายดอกจัน จำเป็นต้องกรอก
          </span>
        </div>
      </div>
    </div>
  );
}
