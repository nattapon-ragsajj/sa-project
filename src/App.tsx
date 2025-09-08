import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./loginPage";
import Home from "./home";
import ProductProduce from "./productProduce";
import MaterialSelect from "./materialSelect";

// เพื่อน ๆ เมนูอื่น (ทำหน้าเปล่าไว้ก่อน)
const RawMaterial = () => <div style={{padding:16}}>คลังวัตถุดิบ</div>;
const Warehouse    = () => <div style={{padding:16}}>คลังสินค้า</div>;
const MatHistory   = () => <div style={{padding:16}}>คุณภาพสินค้า</div>;
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
          {/*<Route path="material-select" element={<MaterialSelect />} />*/}
          <Route path="raw-material"    element={<RawMaterial />} />
          <Route path="warehouse"       element={<Warehouse />} />
          <Route path="q-control"       element={<MatHistory />} />
          <Route path="sales-list"      element={<SalesList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
