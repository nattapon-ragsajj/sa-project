import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./loginPage";
import Home from "./home";
import ProductProduce from "./productProduce";
import MaterialSelect from "./materialSelect";
import BuildProduct from "./buildProduct";

// เพื่อน ๆ เมนูอื่น (ทำหน้าเปล่าไว้ก่อน)
const RawMaterial = () => <div style={{padding:16}}>คลังวัตถุดิบ</div>;
const Warehouse    = () => <div style={{padding:16}}>คลังสินค้า</div>;
const Qcontrol   = () => <div style={{padding:16}}>คุณภาพสินค้า</div>;
const ProductionOrder = () => <div style={{padding:16}}>รายการคำสั่งซื้อสินค้า</div>;
const SalesList    = () => <div style={{padding:16}}>รายการขายสินค้า</div>;
const Welcome      = () => <div style={{padding:16}}>ยินดีต้อนรับสู่ Home</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Home = แพลตฟอร์มหลัก (Navbar อยู่ตลอด) */}
        <Route path="/home" element={<Home />}>
          <Route index element={<Welcome />} />
          <Route path="product-produce" element={<ProductProduce />} />
          {<Route path="material-select" element={<MaterialSelect />} />}
          <Route path="raw-material"    element={<RawMaterial />} />
          <Route path="warehouse"       element={<Warehouse />} />
          <Route path="q-control"       element={<Qcontrol />} />
          <Route path="production-order" element={<ProductionOrder/>}/>
          <Route path="sales-list"      element={<SalesList />} />
          <Route path="build-product" element={<BuildProduct />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
