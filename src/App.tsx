import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./loginPage";

import ProductionLayout from "./layout/ProductionLayout";
import WarehouseLayout from "./layout/WarehouseLayout";
import QALayout from "./layout/QALayout";

// หน้าย่อย ฝ่ายผลิต
import ProductPage from "./productPage";
import BuildProduct from "./buildProduct";
import MaterialSelect from "./materialSelect";
import Product from "./product";

// หน้าย่อย ฝ่ายคลัง
import RawMaterial from "./rawMaterial";
import RawMaterialStock from "./rawMaterialStock";
import WareHouse from "./warehouse";
import WarehouseStock from "./warehouseStock";

// หน้าย่อย ฝ่าย QA
import QaMaterial from "./qaMaterial";
import QaProduct from "./qaProduct";

// ✅ Import global provider
import { ProductProvider } from "./context/ProductContext";

function App() {
  return (
    <ProductProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* ฝ่ายผลิต */}
          <Route path="/production" element={<ProductionLayout />}>
            <Route index element={<ProductPage />} />
            <Route path="product" element={<Product />} />
            <Route path="build-product" element={<BuildProduct />} />
            <Route path="material-select" element={<MaterialSelect />} />
          </Route>

          {/* ฝ่ายคลัง */}
          <Route path="/warehouse" element={<WarehouseLayout />}>
            <Route index element={<WareHouse />} />
            <Route path="raw-material" element={<RawMaterial />} />
            <Route path="raw-stock" element={<RawMaterialStock />} />
            <Route path="warehouse-stock" element={<WarehouseStock />} />
          </Route>

          {/* ฝ่าย QA */}
          <Route path="/qa" element={<QALayout />}>
            <Route index element={<QaProduct />} />
            <Route path="product" element={<QaProduct />} />
            <Route path="material" element={<QaMaterial />} />
          </Route>
        </Routes>
      </Router>
    </ProductProvider>
  );
}

export default App;
