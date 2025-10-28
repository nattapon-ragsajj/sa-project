import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./loginPage";
import RegisterPage from "./registerPage"; 

import ProductionLayout from "./layout/ProductionLayout";
import WarehouseLayout from "./layout/WarehouseLayout";
import QALayout from "./layout/QALayout";

// หน้าย่อย ฝ่ายผลิต
import ProductPage from "./productPage";
import BuildProduct from "./buildProduct";
import MaterialSelect from "./materialSelect";
import Product from "./product";
import ProductMat from "./productMat";

// หน้าย่อย ฝ่ายคลัง
import RawMaterial from "./rawMaterial";
import RawMaterialStock from "./rawMaterialStock";
import WareHouse from "./warehouse";
import WarehouseStock from "./warehouseStock";
import RawMaterialLot from "./RawMaterialLot";
import RawMaterialStore from "./RawMaterialStore";
import RawMaterialAllocate from "./RawMaterialAllocate";
import WarehouseManageProduct from "./warehouseManageProduct";
import WarehouseManageMat from "./warehouseManageMat";
import WarehouseManageProductList from "./warehouseManageProductList";



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
          <Route path="/register" element={<RegisterPage />} />

          {/* ฝ่ายผลิต */}
          <Route path="/production" element={<ProductionLayout />}>
            <Route index element={<ProductPage />} />
            <Route path="product" element={<Product />} />
            <Route path="build-product" element={<BuildProduct />} />
            <Route path="material-select" element={<MaterialSelect />} />
            <Route path="product-mat" element={<ProductMat />} />

          </Route>

          {/* ฝ่ายคลัง */}
            <Route path="/warehouse" element={<WarehouseLayout />}>
          {/* หน้าหลักคลังสินค้า */}
          <Route index element={<WareHouse />} />

          {/* หน้าย่อยของคลัง */}
           <Route path="warehouse-stock" element={<WarehouseStock />} />
          <Route path="manage-product" element={<WarehouseManageProduct />} />
          <Route path="warehouse-manage-product" element={<WarehouseManageProductList />} />

          {/* หน้าหลักคลังสินค้า */}
        
        
  {/* ====== คลังวัตถุดิบ + หน้าย่อย ====== */}
        <Route path="raw-material" element={<RawMaterial />} />
        <Route path="raw-material/lot" element={<RawMaterialLot />} />
        <Route path="raw-material/store" element={<RawMaterialStore />} />
        <Route path="raw-material/allocate" element={<RawMaterialAllocate />} />

  {/* คลังวัตถุดิบ (สต็อก) */}
        <Route path="raw-stock" element={<RawMaterialStock />} />

  {/* จัดเก็บสินค้า */}
        <Route path="warehouse-stock" element={<WarehouseStock />} />

  {/* จัดการทำรายการคลัง */}
        <Route path="warehouse-manage-mat" element={<WarehouseManageMat />}/>


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
