// src/pages/CatalogoCoverUp.jsx
import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { formatPrice, getPriceByQuantity, SELLER_PHONE } from "../data/store";
import WhatsAppIcon from "../components/WhatsAppIcon";

function PriceDisplay({ product, qty, priceConfig }) {
  const tierPrices = priceConfig[product.id]?.prices || product.basePrices;
  const tiers = priceConfig[product.id]?.tiers || product.tiers;

  const currentPrice = (() => {
    const tierIndex = tiers.findIndex(t => qty >= t.min && qty <= t.max);
    return tierPrices[tierIndex >= 0 ? tierIndex : 0];
  })();

  const nextTier = tiers.find(t => qty < t.min);

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>
        {formatPrice(currentPrice)}/u
      </div>
      {nextTier && (
        <div style={{ fontSize: 10, color: "#999" }}>
          Próximo descuento en {nextTier.min} unidades
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd, priceConfig }) {
  const [qty, setQty] = useState(1);

  const bgColors = {
    organizadores: { base: "#F0F8FF", accent: "#E0F0FF" },
    cestos: { base: "#FFF8F0", accent: "#FFE8D0" },
    mascotas: { base: "#FFE8F0", accent: "#FFF0F8" },
    limpieza: { base: "#F0FFF0", accent: "#E0FFE0" },
  };
  const bg = bgColors[product.cat] || bgColors.organizadores;

  const currentUnitPrice = getPriceByQuantity(product, qty);
  const totalPrice = currentUnitPrice * qty;

  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0",
      overflow: "hidden", display: "flex", flexDirection: "column",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Header */}
      <div style={{
        background: bg.base, height: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 48, position: "relative", padding: "12px",
      }}>
        {product.tag && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            background: "#1a1a1a", color: "#fff",
            fontSize: 9, fontWeight: 700, padding: "2px 6px",
            borderRadius: 20,
          }}>{product.tag}</span>
        )}
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "contain" /* 'contain' evita que la imagen se recorte */
            }} 
          />
        ) : (
          product.emoji
        )}
      </div>

      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Código y nombre */}
        <div>
          <div style={{ fontSize: 9, color: "#AAA", fontWeight: 700, letterSpacing: "0.1em" }}>
            COD: {product.code}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginTop: 2 }}>
            {product.name}
          </div>
          <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
            {product.details}
          </div>
        </div>

        {/* Selector de cantidad */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: "#666", textTransform: "uppercase" }}>
            Cantidad:
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
              width: 28, height: 28, borderRadius: 6, border: "1px solid #E8E8E8",
              background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
            }}>−</button>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: 50, height: 28, borderRadius: 6, border: "1px solid #E8E8E8",
                textAlign: "center", fontSize: 13, fontWeight: 700,
              }}
            />
            <button onClick={() => setQty(qty + 1)} style={{
              width: 28, height: 28, borderRadius: 6, border: "1px solid #E8E8E8",
              background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
            }}>+</button>
          </div>
        </div>

        {/* Precios */}
        <div style={{
          background: "#F9F9F9", padding: "10px 12px", borderRadius: 8,
          marginTop: "auto", marginBottom: 8,
        }}>
          <PriceDisplay product={product} qty={qty} priceConfig={priceConfig} />
          <div style={{
            fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginTop: 6,
            borderTop: "1px solid #E8E8E8", paddingTop: 6,
          }}>
            Total: {formatPrice(totalPrice)}
          </div>
        </div>

        {/* Botón agregar */}
        <button
          onClick={() => onAdd(product, qty)}
          style={{
            padding: "8px", borderRadius: 8,
            border: "1.5px solid #1a1a1a", background: "transparent",
            color: "#1a1a1a", fontSize: 12, fontWeight: 700,
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a1a1a"; }}
        >
          + Agregar {qty} {qty === 1 ? "unidad" : "unidades"}
        </button>
      </div>
    </div>
  );
}

function CartView({ cart, onClose, onChangeQty, onRemove, onSent, priceConfig }) {
  const { addOrder } = useApp();
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const total = cart.reduce((s, item) => s + item.currentPrice * item.qty, 0);
  const totalQty = cart.reduce((s, item) => s + item.qty, 0);

  function sendToWhatsApp() {
    let msg = "Hola! Quiero realizar el siguiente pedido:\n\n";
    cart.forEach(item => {
      msg += `• ${item.name} x${item.qty} = ${formatPrice(item.currentPrice * item.qty)}\n`;
    });
    msg += `\n*Total: ${formatPrice(total)}*`;
    if (clientName) msg += `\nCliente: ${clientName}`;
    if (phone) msg += `\nTeléfono: ${phone}`;

    addOrder({
      client: clientName || "Cliente nuevo",
      phone,
      items: cart.map(c => ({ name: c.name, code: c.code, qty: c.qty })),
      total,
    });

    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
    onSent();
  }

  if (sent) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>¡Pedido enviado!</div>
        <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>Se abrió WhatsApp con tu pedido. El vendedor te confirmará en breve.</div>
        <button onClick={onClose} style={{
          padding: "10px 28px", borderRadius: 10, border: "1.5px solid #1a1a1a",
          background: "#1a1a1a", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>Volver al catálogo</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onClose} style={{
          background: "none", border: "1px solid #E8E8E8", borderRadius: 8,
          padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#666",
        }}>← Volver</button>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          Tu pedido <span style={{ color: "#999", fontWeight: 400, fontSize: 13 }}>({totalQty} {totalQty === 1 ? "unidad" : "unidades"})</span>
        </div>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#AAA" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
          <div style={{ fontSize: 14 }}>El carrito está vacío</div>
        </div>
      ) : (
        <>
          <div style={{ border: "1px solid #F0F0F0", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
            {cart.map((item, i) => (
              <div key={`${item.id}-${item.code}`} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                borderBottom: i < cart.length - 1 ? "1px solid #F8F8F8" : "none", background: "#fff",
              }}>
                <div style={{ fontSize: 26, minWidth: 36 }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#999 " }}>
                    Cant. {item.qty} · {formatPrice(item.currentPrice)}/u
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => onChangeQty(item, -1)} style={{
                    width: 28, height: 28, borderRadius: 6, border: "1px solid #E8E8E8",
                    background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  }}>−</button>
                  <div style={{ minWidth: 28, textAlign: "center", fontSize: 12, fontWeight: 700 }}>
                    {item.qty}
                  </div>
                  <button onClick={() => onChangeQty(item, +1)} style={{
                    width: 28, height: 28, borderRadius: 6, border: "1px solid #E8E8E8",
                    background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  }}>+</button>
                  <button onClick={() => onRemove(item)} style={{
                    marginLeft: 12, background: "#FEF0F0", border: "1px solid #F09595",
                    color: "#A32D2D", borderRadius: 6, padding: "4px 8px",
                    cursor: "pointer", fontSize: 11, fontWeight: 600,
                  }}>Quitar</button>
                </div>
                <div style={{ minWidth: 80, textAlign: "right", fontSize: 12, fontWeight: 700 }}>
                  {formatPrice(item.currentPrice * item.qty)}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: "#F9F9F9", padding: "16px", borderRadius: 12,
            marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>TOTAL</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#1a1a1a" }}>{formatPrice(total)}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>
                NOMBRE DEL CLIENTE (OPCIONAL)
              </label>
              <input
                type="text"
                placeholder="Ej: Comercio Centro"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={{
                  padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8E8E8",
                  fontSize: 13, background: "#fff", outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>
                TELÉFONO (OPCIONAL)
              </label>
              <input
                type="text"
                placeholder="Ej: 1155221100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8E8E8",
                  fontSize: 13, background: "#fff", outline: "none",
                }}
              />
            </div>
          </div>

          <button
            onClick={sendToWhatsApp}
            style={{
              width: "100%", padding: "12px", borderRadius: 10,
              background: "#25D366", color: "#fff", border: "none",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <WhatsAppIcon size={18} /> Enviar pedido por WhatsApp
          </button>
        </>
      )}
    </div>
  );
}

export default function CatalogoCoverUp() {
  const { products, addOrder, priceConfig, loading } = useApp();
  const [view, setView] = useState("catalog");
  const [cart, setCart] = useState([]);
  const [catFilter, setCatFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);



const categories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => cats.add(p.cat));
    return [...cats].sort();
  }, [products]);

const filtered = useMemo(() => products.filter(p => {
    if (!p.active) return false;
    const catOk = catFilter === "todos" || p.cat === catFilter;
    const searchOk = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    return catOk && searchOk;
  }), [products, catFilter, searchTerm]);

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.currentPrice * c.qty, 0);

  function addToCart(product, qty) {
    setCart(prev => {
      const ex = prev.find(c => c.id === product.id);
      const currentPrice = getPriceByQuantity(product, qty);
      return ex
        ? prev.map(c => c.id === product.id ? { ...c, qty: c.qty + qty, currentPrice } : c)
        : [...prev, { ...product, qty, currentPrice }];
    });
    showToast(`${product.name} agregado ✓`);
  }

  function changeQty(item, delta) {
    setCart(prev => prev.map(c => {
      if (c.id === item.id) {
        const newQty = c.qty + delta;
        if (newQty <= 0) return null;
        const newPrice = getPriceByQuantity(c, newQty);
        return { ...c, qty: newQty, currentPrice: newPrice };
      }
      return c;
    }).filter(Boolean));
  }

  function removeItem(item) {
    setCart(prev => prev.filter(c => c.id !== item.id));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const pill = (active) => ({
    padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer",
    border: active ? "1.5px solid #1a1a1a" : "1px solid #E8E8E8",
    background: active ? "#1a1a1a" : "#fff",
    color: active ? "#fff" : "#666",
    fontWeight: active ? 700 : 400,
    transition: "all 0.15s",
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#666" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Cargando catálogo...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#FAFAFA", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #F0F0F0",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto", padding: "0 20px",
          height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>📦</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Cover Up Home</div>
              <div style={{ fontSize: 10, color: "#AAA", letterSpacing: "0.1em" }}>MAYORISTA</div>
            </div>
          </div>
          <button
            onClick={() => setView(view === "cart" ? "catalog" : "cart")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 18px", borderRadius: 20, cursor: "pointer",
              border: totalItems > 0 ? "1.5px solid #1a1a1a" : "1px solid #E8E8E8",
              background: totalItems > 0 ? "#1a1a1a" : "#fff",
              color: totalItems > 0 ? "#fff" : "#666",
              fontSize: 13, fontWeight: 700, transition: "all 0.2s",
            }}
          >
            🛒 {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? "s" : ""} - ${formatPrice(totalPrice)}` : "Carrito"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px" }}>
        {view === "catalog" ? (
          <>
            {/* Filtros */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8,
                    border: "1.5px solid #E8E8E8", fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setCatFilter("todos")} style={pill(catFilter === "todos")}>
                  Todos ({products.filter(p => p.active).length})
                </button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCatFilter(cat)} style={pill(catFilter === cat)}>
                    {cat} ({products.filter(p => p.active && p.cat === cat).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Contador */}
            <div style={{ fontSize: 12, color: "#BBB", marginBottom: 16 }}>
              {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
            </div>

            {/* Grilla de productos */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#AAA" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>😕</div>
                <div style={{ fontSize: 14 }}>Sin productos para ese filtro</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} priceConfig={priceConfig} />)}
              </div>
            )}
          </>
        ) : (
          <CartView
            cart={cart}
            onClose={() => setView("catalog")}
            onChangeQty={changeQty}
            onRemove={removeItem}
            onSent={() => setCart([])}
            priceConfig={priceConfig}
          />
        )}
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1a1a1a", color: "#fff", padding: "10px 22px", borderRadius: 20,
          fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          whiteSpace: "nowrap", zIndex: 999,
        }}>{toast}</div>
      )}

      {/* Link a Admin */}
      <div style={{
        position: "fixed", bottom: 20, right: 20,
        fontSize: 12,
      }}>
        <a href="#/admin" style={{
          padding: "8px 14px", borderRadius: 20,
          background: "#1a1a1a", color: "#fff",
          textDecoration: "none", fontWeight: 700,
          display: "inline-block",
        }}>⚙️ Admin</a>
      </div>
    </div>
  );
}
