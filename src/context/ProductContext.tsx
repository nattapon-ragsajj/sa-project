import { createContext, useContext, useEffect, useState} from "react";

export interface Product {
  id: number;
  code: string;
  name: string;
  unit: string;
  desc: string;
  group: string;
  status: string;
}

interface ProductContextValue {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  saveToStorage: () => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const STORAGE_KEY = "global_products"; // ✅ เปลี่ยนชื่อคีย์ตรงนี้
  const [products, setProducts] = useState<Product[]>([]);

  // โหลดข้อมูลจาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setProducts(JSON.parse(raw));
      } catch {
        setProducts([]);
      }
    }
  }, []);

  // ฟังก์ชันบันทึกลง localStorage
  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  };

  // auto-save ทุกครั้งที่ products เปลี่ยน
  useEffect(() => {
    saveToStorage();
  }, [products]);

  return (
    <ProductContext.Provider value={{ products, setProducts, saveToStorage }}>
      {children}
    </ProductContext.Provider>
  );
}

// hook ใช้งานในทุกหน้า
export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts ต้องอยู่ภายใน <ProductProvider>");
  return ctx;
}
