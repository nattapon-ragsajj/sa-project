import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "./product.css";

/* ========= Types ========= */
type ProduceOrder = {
  orderNo: string;
  productName: string;
  qty: number;
  createDate: string;
  startDate: string;
  dueDate: string;
  status: "กำลังผลิต" | "เสร็จสิ้น" | "เสร็จสิ้นบางส่วนหรือยังไม่เสร็จ" | "ยกเลิก" ;
};

type ReqRow = {
  id: string;
  name: string;
  lotNo: string;
  received: number;
  remain: number;
  used: number;
};

type RatioRow = { id: string; code: string; name: string; ratio: string };

/* ========= Demo data ========= */
const demo: ProduceOrder = {
  orderNo: "6613235555",
  productName: "ข้าวต้มกุ้ง",
  qty: 10,
  createDate: "15/10/2568",
  startDate: "15/10/2568",
  dueDate: "15/10/2568",
  status: "เสร็จสิ้น",
};

const reqSeed: ReqRow[] = [
  { id: "r1", name: "น้ำตาลทรายขาว", lotNo: "L-240901", received: 120, remain: 36, used: 84 },
  { id: "r2", name: "แป้งสาลี",       lotNo: "L-240915", received:  60, remain: 12, used: 48 },
  { id: "r3", name: "เนยจืด",         lotNo: "L-240930", received:  25, remain:  5, used: 20 },
];

/* ========= Touch / Press feedback ========= */
function pressHandlers<T extends HTMLElement>() {
  return {
    onTouchStart: (e: React.TouchEvent<T>) => {
      const el = e.currentTarget as HTMLElement;
      el.classList.add("is-pressed");
      const t = e.touches[0], r = el.getBoundingClientRect();
      el.style.setProperty("--rx", `${t.clientX - r.left}px`);
      el.style.setProperty("--ry", `${t.clientY - r.top}px`);
    },
    onTouchEnd:    (e: React.TouchEvent<T>) => (e.currentTarget as HTMLElement).classList.remove("is-pressed"),
    onTouchCancel: (e: React.TouchEvent<T>) => (e.currentTarget as HTMLElement).classList.remove("is-pressed"),
    onMouseDown:   (e: React.MouseEvent<T>) => (e.currentTarget as HTMLElement).classList.add("is-pressed"),
    onMouseUp:     (e: React.MouseEvent<T>) => (e.currentTarget as HTMLElement).classList.remove("is-pressed"),
    onMouseLeave:  (e: React.MouseEvent<T>) => (e.currentTarget as HTMLElement).classList.remove("is-pressed"),
  };
}

/* ========= Modal primitives (Portal) ========= */
function Overlay({ onClose }: { onClose: () => void }) {
  return createPortal(
    <button className="modal-overlay" aria-label="close" onClick={onClose} />,
    document.body
  );
}
function ModalCard({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return createPortal(
    <div className="modal-card">
      <div className="modal-content">
        <button className="modal-close" aria-label="close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ========= Modal: สร้างคำสั่งผลิตใหม่ ========= */
function CreateOrderModal({
  open,
  products,
  onClose,
  onCreate,
}: {
  open: boolean;
  products: string[];
  onClose: () => void;
  onCreate: (order: ProduceOrder) => void;
}) {
  const [name, setName] = useState("");
  const [qty, setQty]   = useState<number | "">("");
  const [err, setErr]   = useState("");

  useEffect(() => {
    if (open) { setName(""); setQty(""); setErr(""); }
  }, [open]);

  if (!open) return null;

  const genOrderNo = () => {
    const d = new Date();
    const y = String(d.getFullYear()).slice(-2);
    const m = String(d.getMonth()+1).padStart(2,"0");
    const day= String(d.getDate()).padStart(2,"0");
    const rand = Math.floor(Math.random()*9000+1000);
    return `PO${y}${m}${day}-${rand}`;
  };
  const thaiDate = (d = new Date()) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth()+1).padStart(2, "0");
    const yyyy = d.getFullYear() + 543;
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <>
      <Overlay onClose={onClose} />
      <ModalCard onClose={onClose}>
        <div className="lot-card">
          <div className="lot-form">
            <label className="lot-row">
              <span className="lot-label">ชื่อสินค้า</span>
              <select
                className="lot-input select-like"
                value={name}
                onChange={e=>setName(e.target.value)}
              >
                <option value="" disabled>— เลือกชื่อสินค้า —</option>
                {products.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>

            <label className="lot-row">
              <span className="lot-label">จำนวน</span>
              <input
                className="lot-input"
                type="number"
                min={1}
                placeholder="0"
                value={qty}
                onChange={e=>setQty(e.target.value==="" ? "" : Number(e.target.value))}
              />
            </label>
          </div>

          {err && <div className="lot-error">{err}</div>}

          <div className="lot-actions">
            <button
              className="btn primary"
              onClick={()=>{
                if (!name || qty==="" || Number(qty)<=0) {
                  setErr("กรุณาเลือกชื่อสินค้าและกรอกจำนวน (> 0)");
                  return;
                }
                const now = new Date();
                onCreate({
                  orderNo: genOrderNo(),
                  productName: name,
                  qty: Number(qty),
                  createDate: thaiDate(now),
                  startDate: thaiDate(now),
                  dueDate: thaiDate(now),
                  status: "กำลังผลิต",
                });
                onClose();
              }}
            >
              เพิ่ม
            </button>
          </div>
        </div>
      </ModalCard>
    </>
  );
}

/* ========= Modal #1: อัปเดตสถานะ ========= */
type StatusOpt = "กำลังผลิต" | "เสร็จสิ้น" | "เสร็จสิ้นบางส่วนหรือยังไม่เสร็จ" | "ยกเลิก";
function UpdateStatusModal({
  open, defaultValue = "กำลังผลิต", onClose, onConfirm
}: {
  open: boolean;
  defaultValue?: StatusOpt;
  onClose: () => void;
  onConfirm: (val: StatusOpt) => void;
}) {
  const [val, setVal] = useState<StatusOpt>(defaultValue);
  useEffect(() => { if (open) setVal(defaultValue); }, [open, defaultValue]);
  if (!open) return null;

  return (
    <>
      <Overlay onClose={onClose} />
      <ModalCard onClose={onClose}>
        <div className="m-gray">
          <div className="m-white">
            <h3 className="m-title">อัปเดตสถานะ</h3>
            <div className="radio-list">
              {(["กำลังผลิต","เสร็จสิ้น","เสร็จสิ้นบางส่วนหรือยังไม่เสร็จ","ยกเลิก"] as StatusOpt[]).map(v => (
                <label key={v} className="radio-item">
                  <input type="radio" name="st" checked={val===v} onChange={()=>setVal(v)} />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="m-actions in-gray">
            <button className="btn ghost" onClick={onClose}>ยกเลิก</button>
            <button className="btn primary" onClick={()=>{ onConfirm(val); onClose(); }}>ยืนยัน</button>
          </div>
        </div>
      </ModalCard>
    </>
  );
}

/* ========= Modal #2: สร้างล็อตสินค้า ========= */
function CreateLotModal({
  open, defaultName, onClose, onConfirm
}: {
  open: boolean;
  defaultName: string;
  onClose: () => void;
  onConfirm: (payload: { lotNo: string; qty: number; name: string }) => void;
}) {
  const [lotNo,setLotNo]=useState("");
  const [qty,setQty]=useState<number | "">("");
  const [name,setName]=useState(defaultName);
  const [err,setErr]=useState("");

  useEffect(()=>{ if(open){ setLotNo(""); setQty(""); setName(defaultName); setErr(""); } },[open,defaultName]);
  if (!open) return null;

  return (
    <>
      <Overlay onClose={onClose} />
      <ModalCard onClose={onClose}>
        <div className="lot-card">
          <div className="lot-form">
            <label className="lot-row">
              <span className="lot-label">เลขล็อต</span>
              <input className="lot-input" value={lotNo} onChange={e=>setLotNo(e.target.value)} placeholder="เช่น L-250101" />
            </label>
            <label className="lot-row">
              <span className="lot-label">จำนวน</span>
              <input className="lot-input" type="number" min={0}
                value={qty} onChange={e=>setQty(e.target.value===""?"":Number(e.target.value))} placeholder="0" />
            </label>
            <label className="lot-row">
              <span className="lot-label">ชื่อสินค้า</span>
              <input className="lot-input" value={name} onChange={e=>setName(e.target.value)} placeholder="ชื่อสินค้า" />
            </label>
          </div>
          {err && <div className="lot-error">{err}</div>}
          <div className="lot-actions">
            <button className="btn primary" onClick={()=>{
              if(!lotNo.trim() || qty==="" || Number(qty)<=0 || !name.trim()){
                setErr("กรอกข้อมูลให้ครบ และจำนวนต้อง > 0"); return;
              }
              onConfirm({ lotNo: lotNo.trim(), qty: Number(qty), name: name.trim() });
              onClose();
            }}>ยืนยัน</button>
          </div>
        </div>
      </ModalCard>
    </>
  );
}

/* ========= Modal #3: บันทึกการใช้วัตถุดิบ ========= */
type MatRow = { id:string; name:string; amount:string; };
function UseMaterialModal({
  open, onClose, onConfirm
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (rows: { name:string; amount:number }[]) => void;
}) {
  const empty = useMemo<MatRow>(()=>({ id:crypto.randomUUID(), name:"", amount:"" }),[]);
  const [rows,setRows]=useState<MatRow[]>([empty]);
  const addRow=()=>setRows(p=>[...p,{ id:crypto.randomUUID(), name:"", amount:"" }]);
  const removeRow=(id:string)=>setRows(p=>p.length>1?p.filter(x=>x.id!==id):p);

  const press = pressHandlers<HTMLButtonElement>();
  useEffect(()=>{ if(open) setRows([empty]); },[open,empty]);
  if (!open) return null;

  return (
    <>
      <Overlay onClose={onClose} />
      <ModalCard onClose={onClose}>
        <div className="m-head-flex">
          <h3 className="m-title">บันทึกการใช้วัตถุดิบ</h3>
          <button className="btn outline" data-ripple {...press} onClick={addRow}>+ เพิ่ม</button>
        </div>

        <div className="mat-list">
          {rows.map(r=>(
            <div key={r.id} className="mat-row">
              <input className="m-input grow" placeholder="ชื่อวัตถุดิบ"
                     value={r.name}
                     onChange={e=>setRows(prev=>prev.map(x=>x.id===r.id?{...x,name:e.target.value}:x))}/>
              <input className="m-input w80" placeholder="0" type="number" min={0}
                     value={r.amount}
                     onChange={e=>setRows(prev=>prev.map(x=>x.id===r.id?{...x,amount:e.target.value}:x))}/>
              <button className="btn ghost" data-ripple {...press}
                      onClick={()=>removeRow(r.id)} disabled={rows.length===1}>ลบ</button>
            </div>
          ))}
        </div>

        <div className="m-actions">
          <button className="btn ghost" data-ripple {...press} onClick={onClose}>ยกเลิก</button>
          <button className="btn primary" data-ripple {...press} onClick={()=>{
            const clean = rows.map(r=>({ name:r.name.trim(), amount:Number(r.amount) }))
                              .filter(r=>r.name && Number.isFinite(r.amount) && r.amount>0);
            onConfirm(clean);
            onClose();
          }}>ยืนยัน</button>
        </div>
      </ModalCard>
    </>
  );
}

/* ========= Modal #4: ขอเพิ่มวัตถุดิบ ========= */
function EditQtyModal({ open, row, onClose, onSave }: {
  open: boolean; row: ReqRow | null; onClose: () => void; onSave: (newUsed: number) => void;
}) {
  const [val, setVal] = useState<number | "">("");
  useEffect(() => { if (open && row) setVal(row.used); }, [open, row]);
  if (!open || !row) return null;
  const max = row.received;

  return (
    <>
      <Overlay onClose={onClose} />
      <ModalCard onClose={onClose}>
        <div className="eq-card">
          <label className="eq-row">
            <span className="eq-label">จำนวน</span>
            <input className="eq-input" type="number" min={0} max={max}
                   value={val} onChange={(e)=> setVal(e.target.value==="" ? "" : Number(e.target.value))}
                   placeholder="0" />
          </label>
          <div className="eq-actions">
            <button className="btn primary" onClick={()=>{
              if (val==="" || Number(val) < 0) return;
              const v = Math.min(Number(val), max);
              onSave(v);
              onClose();
            }}>ยืนยัน</button>
          </div>
        </div>
      </ModalCard>
    </>
  );
}
function RequestMaterialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rows, setRows] = useState<ReqRow[]>(reqSeed);
  const [editing, setEditing] = useState<ReqRow | null>(null);
  if (!open) return null;

  return (
    <>
      <Overlay onClose={onClose} />
      <ModalCard onClose={onClose}>
        <div className="req-card">
          <div className="req-head"><h3 className="req-title">ตารางบันทึกการใช้วัตถุดิบ</h3></div>
          <div className="req-table">
            <div className="req-thead">
              <div>ชื่อวัตถุดิบ</div><div>เลขล็อต</div><div>จำนวนที่ได้รับ</div><div>คงเหลือ</div><div>จำนวนที่ใช้</div>
            </div>
            <div className="req-tbody">
              {rows.map(r=>(
                <div key={r.id} className="req-row is-clickable" onClick={()=>setEditing(r)} title="คลิกเพื่อแก้ไขจำนวนที่ใช้">
                  <div>{r.name}</div><div>{r.lotNo}</div><div>{r.received}</div><div>{r.remain}</div><div>{r.used}</div>
                </div>
              ))}
              {Array.from({length:4}).map((_,i)=>(
                <div key={`empty-${i}`} className="req-row is-empty"><div></div><div></div><div></div><div></div><div></div></div>
              ))}
            </div>
          </div>
          <div className="req-actions"><button className="btn primary" onClick={onClose}>ยืนยัน</button></div>
        </div>
      </ModalCard>

      <EditQtyModal
        open={!!editing}
        row={editing}
        onClose={()=> setEditing(null)}
        onSave={(newUsed)=>{
          if (!editing) return;
          setRows(prev => prev.map(x => x.id === editing.id
            ? { ...x, used: newUsed, remain: Math.max(0, x.received - newUsed) }
            : x));
        }}
      />
    </>
  );
}

/* ========= Modal #5: สัดส่วนวัตถุดิบ ========= */
function IngredientRatioModal({
  open, product, onClose
}: {
  open: boolean;
  product: ProduceOrder;
  onClose: () => void;
}) {
  const [rows] = useState<RatioRow[]>([
    { id: crypto.randomUUID(), code: "", name: "", ratio: "" },
  ]);

  if (!open) return null;

  const preview = rows.map(r => ({
    code: r.code.trim(),
    name: r.name.trim(),
    qty: Math.round(((Number(r.ratio) || 0) * product.qty) / 100),
  }));

  return (
    <>
      <Overlay onClose={onClose} />
      <ModalCard onClose={onClose}>
        <div className="ratio-card">
          <div className="ratio-header">
            <div className="rh-row"><span className="rh-k">รหัสสินค้า:</span><span className="rh-v">{product.orderNo}</span></div>
            <div className="rh-row"><span className="rh-k">ชื่อสินค้า:</span><span className="rh-v">{product.productName}</span></div>
            <div className="rh-row"><span className="rh-k">จำนวนผลิต:</span><span className="rh-v">{product.qty}</span></div>
          </div>

          <div className="m-head-flex">
            <h3 className="m-title">สัดส่วนวัตถุดิบ</h3>
          </div>

          <div className="ratio-preview">
            {preview.map((p, i) => (
              <div key={i} className="ratio-item-card">
                <div className="ric-left">
                  <div className="ric-code">รหัสวัตถุดิบ</div>
                  <div className="ric-code-val">{rows[i].code || "-"}</div>
                  <div className="ric-name">ชื่อวัตถุดิบ</div>
                  <div className="ric-name-val">{rows[i].name || "-"}</div>
                </div>
                <div className="ric-right">
                  <div className="ric-qty-label">จำนวน</div>
                  <div className="ric-qty-val">{p.qty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModalCard>
    </>
  );
}

/* ========= ProduceCard (การ์ดหนึ่งใบ) ========= */
function ProduceCard({ order }: { order: ProduceOrder }) {
  const [status, setStatus] = useState<StatusOpt>(order.status);
  const [openStatus,setOpenStatus]=useState(false);
  const [openCreateLot,setOpenCreateLot]=useState(false);
  const [openUseMat,setOpenUseMat]=useState(false);
  const [openReq, setOpenReq] = useState(false);
  const [openRatio, setOpenRatio] = useState(false);
  const press = pressHandlers<HTMLButtonElement>();

  return (
    <>
      <div className="produce-card">
        <div className="produce-left">
          <div className="kv"><span className="k">เลขคำสั่งผลิต :</span><span className="v">{order.orderNo}</span></div>
          <div className="kv"><span className="k">ชื่อสินค้า :</span><span className="v">{order.productName}</span></div>
          <div className="kv"><span className="k">จำนวนที่จะผลิต :</span><span className="v">{order.qty}</span></div>
          <div className="kv"><span className="k">วันสร้างคำสั่งซื้อสินค้า :</span><span className="v">{order.createDate}</span></div>
          <div className="kv"><span className="k">วันที่เริ่มการผลิต :</span><span className="v">{order.startDate}</span></div>
          <div className="kv"><span className="k">วันที่จบการผลิต :</span><span className="v">{order.dueDate}</span></div>
          <div className="kv"><span className="k">สถานะ :</span><span className="v">{status}</span></div>
        </div>

        <div className="produce-right">
          <button className="pill-btn" data-ripple {...press} onClick={()=>setOpenStatus(true)}>อัปเดตสถานะ</button>
          <button className="pill-btn" data-ripple {...press} onClick={()=>setOpenRatio(true)}>สัดส่วนวัตถุดิบ</button>
          <button className="pill-btn" data-ripple {...press} onClick={()=>setOpenCreateLot(true)}>สร้างล็อตสินค้า</button>
          <button className="pill-btn" data-ripple {...press} onClick={()=>setOpenUseMat(true)}>บันทึกการใช้วัตถุดิบ</button>
          <button className="pill-btn" data-ripple {...press} onClick={()=>setOpenReq(true)}>ขอวัตถุดิบเพิ่ม</button>
        </div>
      </div>

      {/* Modals ของการ์ดใบนี้ */}
      <UpdateStatusModal
        open={openStatus}
        defaultValue={status}
        onClose={()=>setOpenStatus(false)}
        onConfirm={(v)=> setStatus(v)}
      />
      <CreateLotModal
        open={openCreateLot}
        defaultName={order.productName}
        onClose={()=>setOpenCreateLot(false)}
        onConfirm={(p)=>console.log("สร้างล็อต:", p)}
      />
      <UseMaterialModal
        open={openUseMat}
        onClose={()=>setOpenUseMat(false)}
        onConfirm={(rows)=>console.log("ใช้วัตถุดิบ:", rows)}
      />
      <RequestMaterialModal open={openReq} onClose={()=>setOpenReq(false)} />
      <IngredientRatioModal open={openRatio} product={order} onClose={()=>setOpenRatio(false)} />
    </>
  );
}

/* ========= หน้า Product ========= */
export default function Product() {
  // เก็บ “หลายออเดอร์”
  const [orders, setOrders] = useState<ProduceOrder[]>([demo]);
  const [openCreateOrder, setOpenCreateOrder] = useState(false);
  const press = pressHandlers<HTMLButtonElement>();

  const productNames = ["ข้าวต้มกุ้ง", "ข้าวผัดหมู", "กระเพราหมูสับ"];

  useEffect(() => {
    const enableActive = () => {};
    document.addEventListener("touchstart", enableActive, { passive: true });
    return () => document.removeEventListener("touchstart", enableActive);
  }, []);

  return (
    <div className="prod-page">
      {/* TOP BAR */}
      <div className="prod-topbar">
        <h2 className="prod-title">รายการคำสั่งผลิต</h2>
        <button
          className="btn-create"
          data-ripple
          {...press}
          onClick={()=>setOpenCreateOrder(true)}
        >
          + สร้างคำสั่งผลิต
        </button>
      </div>

      {/* แสดงผลหลายใบ */}
      {orders.map(o => (
        <ProduceCard key={o.orderNo} order={o} />
      ))}

      {/* โมดัลสร้างคำสั่งผลิต (append) */}
      <CreateOrderModal
        open={openCreateOrder}
        products={productNames}
        onClose={()=>setOpenCreateOrder(false)}
        onCreate={(newOrder)=> {
          setOrders(prev => [newOrder, ...prev]); // หรือ [...prev, newOrder] ถ้าอยากให้ใหม่อยู่ล่าง
        }}
      />
    </div>
  );
}
