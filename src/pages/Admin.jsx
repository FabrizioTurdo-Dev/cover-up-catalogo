// src/pages/Admin.jsx
import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { formatPrice, ALL_SIZES_ADULTO, ALL_SIZES_NINO } from "../data/store";

// ─── UI atómica ────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  pendiente:  { bg: "#FFF8E6", text: "#B07D00", border: "#FADA79" },
  confirmado: { bg: "#E8F8EF", text: "#0F6E56", border: "#6DCCA0" },
  enviado:    { bg: "#E6F0FF", text: "#1A4FAB", border: "#7AABF0" },
  cancelado:  { bg: "#FEF0F0", text: "#A32D2D", border: "#F09595" },
};

function Badge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pendiente;
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 20, fontSize: 11, fontWeight: 700,
      padding: "3px 10px", textTransform: "capitalize",
    }}>{status}</span>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
      <input {...props} style={{
        padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8E8E8",
        fontSize: 13, background: "#fff", color: "#1a1a1a", outline: "none",
        transition: "border-color 0.15s", ...props.style,
      }}
        onFocus={e => e.target.style.borderColor = "#1a1a1a"}
        onBlur={e => e.target.style.borderColor = "#E8E8E8"}
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
      <select {...props} style={{
        padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8E8E8",
        fontSize: 13, background: "#fff", color: "#1a1a1a", outline: "none", cursor: "pointer",
        ...props.style,
      }}>{children}</select>
    </div>
  );
}

function Btn({ children, variant = "primary", small, ...props }) {
  const variants = {
    primary: { background: "#1a1a1a", color: "#fff", border: "none" },
    ghost:   { background: "transparent", border: "1.5px solid #E8E8E8", color: "#666" },
    danger:  { background: "#FEF0F0", color: "#A32D2D", border: "1px solid #F09595" },
    green:   { background: "#25D366", color: "#fff", border: "none" },
    success: { background: "#E8F8EF", color: "#0F6E56", border: "1px solid #6DCCA0" },
  };
  return (
    <button {...props} style={{
      padding: small ? "6px 14px" : "10px 18px",
      borderRadius: 8, fontSize: small ? 12 : 13, fontWeight: 700,
      cursor: "pointer", transition: "opacity 0.15s",
      display: "inline-flex", alignItems: "center", gap: 6,
      ...variants[variant], ...props.style,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%",
        maxWidth: wide ? 720 : 480, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #F0F0F0",
          position: "sticky", top: 0, background: "#fff", zIndex: 1,
        }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999" }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Formulario producto ───────────────────────────────────────────────────
function ProductForm({ product, onSave, onCancel }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    name:   product?.name   || "",
    brand:  product?.brand  || "",
    cat:    product?.cat    || "adulto",
    price:  product?.price  || "",
    tag:    product?.tag    || "",
    active: product?.active !== false,
    emoji:  product?.emoji  || "👟",
    stock:  product?.stock  || {},
    image:  product?.image  || null,
  });
  const [imgPreview, setImgPreview] = useState(product?.image || null);
  const fileRef = useRef();

  const sizePool = form.cat === "adulto" ? ALL_SIZES_ADULTO : ALL_SIZES_NINO;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  function toggleSize(s) {
    setForm(f => {
      const st = { ...f.stock };
      s in st ? delete st[s] : (st[s] = 0);
      return { ...f, stock: st };
    });
  }

  function setStock(s, val) {
    setForm(f => ({ ...f, stock: { ...f.stock, [s]: Math.max(0, parseInt(val) || 0) } }));
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setImgPreview(ev.target.result); set("image", ev.target.result); };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.name || !form.brand || !form.price) return alert("Completá nombre, marca y precio");
    onSave({ ...form, id: product?.id || Date.now(), price: Number(form.price) });
  }

  const activeSizes = Object.keys(form.stock).map(Number).sort((a, b) => a - b);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Imagen */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div onClick={() => fileRef.current.click()} style={{
          width: 100, height: 100, borderRadius: 12, border: "2px dashed #E8E8E8",
          background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", overflow: "hidden", flexShrink: 0,
          fontSize: imgPreview ? "initial" : 36,
        }}>
          {imgPreview
            ? <img src={imgPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : form.emoji}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn small variant="ghost" onClick={() => fileRef.current.click()}>📎 Subir foto</Btn>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["👟", "👠", "👡", "👞", "🥿", "⚡", "🎨"].map(e => (
              <button key={e} onClick={() => set("emoji", e)} style={{
                fontSize: 18, border: form.emoji === e ? "2px solid #1a1a1a" : "1px solid #E8E8E8",
                borderRadius: 8, padding: "4px 8px", cursor: "pointer", background: "#fff",
              }}>{e}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Nombre *" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Runner Pro" />
        <Input label="Marca *" value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="Nike" />
        <Input label="Precio *" type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="12500" />
        <Select label="Categoría" value={form.cat} onChange={e => { set("cat", e.target.value); set("stock", {}); }}>
          <option value="adulto">Adultos</option>
          <option value="nino">Niños</option>
        </Select>
        <Input label="Tag (etiqueta)" value={form.tag} onChange={e => set("tag", e.target.value)} placeholder="Nuevo, Oferta…" />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase" }}>Estado</label>
          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => set("active", v)} style={{
                flex: 1, padding: "9px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                border: form.active === v ? "1.5px solid #1a1a1a" : "1.5px solid #E8E8E8",
                background: form.active === v ? "#1a1a1a" : "#fff",
                color: form.active === v ? "#fff" : "#666",
              }}>{v ? "✓ Activo" : "✗ Oculto"}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Talles y stock */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
          Talles y stock
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {sizePool.map(s => (
            <button key={s} onClick={() => toggleSize(s)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              border: s in form.stock ? "1.5px solid #1D9E75" : "1px solid #E8E8E8",
              background: s in form.stock ? "#E8F8EF" : "#fff",
              color: s in form.stock ? "#0F6E56" : "#666",
              fontWeight: s in form.stock ? 700 : 400,
            }}>{s}</button>
          ))}
        </div>
        {activeSizes.length > 0 && (
          <div style={{ background: "#FAFAFA", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
              {activeSizes.map(s => (
                <div key={s} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, color: "#888", fontWeight: 700, textAlign: "center" }}>T.{s}</label>
                  <input
                    type="number" min="0" value={form.stock[s]}
                    onChange={e => setStock(s, e.target.value)}
                    style={{
                      padding: "6px 8px", borderRadius: 6, border: "1.5px solid",
                      borderColor: form.stock[s] === 0 ? "#F09595" : "#E8E8E8",
                      fontSize: 13, textAlign: "center",
                      color: form.stock[s] === 0 ? "#E24B4A" : "#1a1a1a",
                      background: "#fff", outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #F0F0F0" }}>
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={handleSubmit}>{isEdit ? "Guardar cambios" : "Crear producto"}</Btn>
      </div>
    </div>
  );
}

// ─── Sección Productos ────────────────────────────────────────────────────
function ProductsSection() {
  const { products, setProducts } = useApp();
  const [modal, setModal] = useState(null);

  function saveProduct(data) {
    setProducts(prev => {
      const exists = prev.find(p => p.id === data.id);
      return exists ? prev.map(p => p.id === data.id ? data : p) : [...prev, data];
    });
    setModal(null);
  }

  function deleteProduct(id) {
    if (window.confirm("¿Eliminar este producto?")) setProducts(prev => prev.filter(p => p.id !== id));
  }

  function toggleActive(id) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }

  const sizes = (p) => Object.keys(p.stock).map(Number).sort((a, b) => a - b);
  const totalStock = (p) => Object.values(p.stock).reduce((s, v) => s + v, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Productos</div>
          <div style={{ fontSize: 12, color: "#999" }}>{products.length} cargados</div>
        </div>
        <Btn onClick={() => setModal("new")}>+ Nuevo producto</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total", val: products.length, icon: "📦" },
          { label: "Activos", val: products.filter(p => p.active).length, icon: "✅" },
          { label: "Talles sin stock", val: products.reduce((s, p) => s + Object.values(p.stock).filter(v => v === 0).length, 0), icon: "⚠️" },
          { label: "Adult / Niño", val: `${products.filter(p => p.cat === "adulto").length} / ${products.filter(p => p.cat === "nino").length}`, icon: "👥" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#999" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAFA" }}>
              {["Producto", "Categoría", "Precio", "Talles / Stock", "Estado", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", borderBottom: "1px solid #F0F0F0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? "1px solid #F8F8F8" : "none" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", background: "#F8F8F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      {p.image ? <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : p.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#999" }}>{p.brand}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>{p.cat === "adulto" ? "👟 Adulto" : "🧒 Niño"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>{formatPrice(p.price)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {sizes(p).map(s => (
                      <span key={s} style={{
                        fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                        background: p.stock[s] === 0 ? "#FEF0F0" : "#E8F8EF",
                        color: p.stock[s] === 0 ? "#A32D2D" : "#0F6E56",
                        border: `1px solid ${p.stock[s] === 0 ? "#F09595" : "#6DCCA0"}`,
                      }}>{s}: {p.stock[s]}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "#AAA", marginTop: 2 }}>{totalStock(p)} pares totales</div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => toggleActive(p.id)} style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                    border: `1px solid ${p.active ? "#6DCCA0" : "#E8E8E8"}`,
                    background: p.active ? "#E8F8EF" : "#F8F8F8",
                    color: p.active ? "#0F6E56" : "#AAA",
                  }}>{p.active ? "● Activo" : "○ Oculto"}</button>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn small variant="ghost" onClick={() => setModal(p)}>Editar</Btn>
                    <Btn small variant="danger" onClick={() => deleteProduct(p.id)}>🗑</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Nuevo producto" : `Editar: ${modal.name}`} onClose={() => setModal(null)} wide>
          <ProductForm product={modal === "new" ? null : modal} onSave={saveProduct} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

// ─── Sección Pedidos ──────────────────────────────────────────────────────
function OrdersSection() {
  const { orders, setOrders } = useApp();
  const [filter, setFilter] = useState("todos");

  function setStatus(id, status) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  function sendWA(order) {
    const msg = `Hola ${order.client}! ✅ Confirmamos tu pedido #${order.id}:\n\n` +
      order.items.map(i => `• ${i.name} talle ${i.size} x${i.qty}`).join("\n") +
      `\n\nTotal: ${formatPrice(order.total)}\nTe avisamos cuando esté listo para envío. 👟`;
    window.open(`https://wa.me/${order.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const counts = {
    todos: orders.length,
    pendiente: orders.filter(o => o.status === "pendiente").length,
    confirmado: orders.filter(o => o.status === "confirmado").length,
    enviado: orders.filter(o => o.status === "enviado").length,
  };
  const filtered = filter === "todos" ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Pedidos</div>
        <div style={{ fontSize: 12, color: "#999" }}>{orders.length} pedidos en total</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(counts).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: filter === k ? "1.5px solid #1a1a1a" : "1px solid #E8E8E8",
            background: filter === k ? "#1a1a1a" : "#fff",
            color: filter === k ? "#fff" : "#666",
          }}>{k.charAt(0).toUpperCase() + k.slice(1)} ({v})</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#AAA", fontSize: 14 }}>No hay pedidos en esta categoría</div>
        )}
        {filtered.map(order => (
          <div key={order.id} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{order.client}</span>
                  <Badge status={order.status} />
                </div>
                <div style={{ fontSize: 11, color: "#AAA" }}>Pedido #{order.id} · {order.date}</div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{formatPrice(order.total)}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {order.items.map((item, i) => (
                <span key={i} style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 6,
                  background: "#F8F8F8", color: "#555", border: "1px solid #EEE",
                }}>{item.name} t.{item.size} ×{item.qty}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Btn small variant="green" onClick={() => sendWA(order)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Confirmar por WA
              </Btn>
              {order.status === "pendiente"  && <Btn small variant="success" onClick={() => setStatus(order.id, "confirmado")}>✓ Confirmar</Btn>}
              {order.status === "confirmado" && <Btn small variant="ghost"   onClick={() => setStatus(order.id, "enviado")}>🚚 Marcar enviado</Btn>}
              {order.status !== "cancelado"  && <Btn small variant="danger"  onClick={() => setStatus(order.id, "cancelado")}>Cancelar</Btn>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sección Configuración ────────────────────────────────────────────────
function SettingsSection() {
  const [cfg, setCfg] = useState({
    shopName: "Calzado Mayorista", phone: "5491100000000",
    minOrder: 3, currency: "ARS",
    welcomeMsg: "Hola! Gracias por elegirnos. Revisá nuestro catálogo mayorista 👟",
  });
  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Configuración</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>🏪 Datos del negocio</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Nombre" value={cfg.shopName} onChange={e => set("shopName", e.target.value)} />
            <Input label="Teléfono WhatsApp" value={cfg.phone} onChange={e => set("phone", e.target.value)} />
            <Input label="Pedido mínimo (pares)" type="number" value={cfg.minOrder} onChange={e => set("minOrder", e.target.value)} />
            <Select label="Moneda" value={cfg.currency} onChange={e => set("currency", e.target.value)}>
              <option value="ARS">ARS – Peso argentino</option>
              <option value="USD">USD – Dólar</option>
              <option value="BRL">BRL – Real</option>
            </Select>
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}><span style={{ color: "#25D366" }}>●</span> Mensajes WhatsApp</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase" }}>Mensaje de bienvenida</label>
              <textarea value={cfg.welcomeMsg} onChange={e => set("welcomeMsg", e.target.value)} rows={3}
                style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8E8E8", fontSize: 13, resize: "vertical", fontFamily: "inherit", outline: "none" }} />
            </div>
            <div style={{ background: "#F0FFF8", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#0F6E56" }}>
              <strong>Preview:</strong> "{cfg.welcomeMsg}"
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Btn onClick={() => alert("Configuración guardada ✓")}>Guardar cambios</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Admin principal ──────────────────────────────────────────────────────
const NAV = [
  { id: "products", label: "Productos", icon: "📦" },
  { id: "orders",   label: "Pedidos",   icon: "🛒" },
  { id: "settings", label: "Config",    icon: "⚙️" },
];

function AdminApp() {
  const { orders } = useApp();
  const [page, setPage] = useState("products");
  const pending = orders.filter(o => o.status === "pendiente").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif", background: "#F7F7F7" }}>
      {/* Sidebar */}
      <div style={{
        width: 210, background: "#fff", borderRight: "1px solid #F0F0F0",
        display: "flex", flexDirection: "column", padding: "20px 12px",
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "0 8px", marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>👟 Admin</div>
          <div style={{ fontSize: 11, color: "#AAA" }}>Calzado Mayorista</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
              background: page === n.id ? "#1a1a1a" : "transparent",
              color: page === n.id ? "#fff" : "#555",
              fontSize: 13, fontWeight: page === n.id ? 700 : 400,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
              {n.id === "orders" && pending > 0 && (
                <span style={{ marginLeft: "auto", background: "#E24B4A", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "1px 7px" }}>{pending}</span>
              )}
            </button>
          ))}
        </nav>
        <a href="/" style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
          borderRadius: 8, color: "#AAA", fontSize: 12, textDecoration: "none",
        }}>🌐 Ver catálogo</a>
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {page === "products" && <ProductsSection />}
        {page === "orders"   && <OrdersSection />}
        {page === "settings" && <SettingsSection />}
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────
export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [form, setForm] = useState({ user: "", pass: "" });
  const [error, setError] = useState(false);

  function handleLogin() {
    if (form.user === "admin" && form.pass === "1234") {
      setLoggedIn(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  if (!loggedIn) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F4F4F4", fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 340, boxShadow: "0 4px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>👟</div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Panel Admin</div>
          <div style={{ fontSize: 12, color: "#AAA" }}>Calzado Mayorista</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Input label="Usuario" value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))} placeholder="admin" />
          <Input label="Contraseña" type="password" value={form.pass}
            onChange={e => setForm(f => ({ ...f, pass: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
          />
          {error && <div style={{ fontSize: 12, color: "#A32D2D", textAlign: "center" }}>Usuario o contraseña incorrectos</div>}
          <Btn style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={handleLogin}>Ingresar →</Btn>
          <div style={{ fontSize: 11, color: "#CCC", textAlign: "center" }}>Demo: admin / 1234</div>
        </div>
      </div>
    </div>
  );

  return <AdminApp />;
}
