// src/pages/AdminPricing.jsx
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../data/store";

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={{
          padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8E8E8",
          fontSize: 13, background: "#fff", outline: "none",
        }}
      />
    </div>
  );
}

function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary: { background: "#1a1a1a", color: "#fff", border: "none" },
    success: { background: "#25D366", color: "#fff", border: "none" },
    danger: { background: "#E24B4A", color: "#fff", border: "none" },
    ghost: { background: "transparent", border: "1.5px solid #E8E8E8", color: "#666" },
  };
  return (
    <button
      {...props}
      style={{
        padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
        cursor: "pointer", transition: "opacity 0.15s",
        ...variants[variant],
        ...props.style,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      {children}
    </button>
  );
}

export default function AdminPricing() {
  const { products, priceConfig, updatePriceConfig } = useApp();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || null);
  const [successMsg, setSuccessMsg] = useState("");

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const config = selectedProduct ? priceConfig[selectedProduct.id] : null;

  const handleTierChange = (tierIndex, field, value) => {
    if (!config) return;
    const newTiers = [...config.tiers];
    newTiers[tierIndex] = { ...newTiers[tierIndex], [field]: parseInt(value) || 0 };
    updatePriceConfig(selectedProductId, newTiers, config.prices);
  };

  const handlePriceChange = (tierIndex, value) => {
    if (!config) return;
    const newPrices = [...config.prices];
    newPrices[tierIndex] = parseInt(value) || 0;
    updatePriceConfig(selectedProductId, config.tiers, newPrices);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#FAFAFA", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "16px 20px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>⚙️ Panel de Administración</h1>
              <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0 0" }}>Gestiona precios y escalones</p>
            </div>
            <a href="#/" style={{
              padding: "8px 16px", borderRadius: 8,
              background: "#F0F0F0", color: "#666",
              textDecoration: "none", fontWeight: 700, fontSize: 13,
            }}>← Volver al catálogo</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
        {successMsg && (
          <div style={{
            background: "#E8F8EF", border: "1px solid #6DCCA0", color: "#0F6E56",
            padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontWeight: 600,
            fontSize: 13,
          }}>
            ✓ {successMsg}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
          {/* Sidebar: Seleccionar producto */}
          <div style={{
            background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0",
            overflow: "hidden",
          }}>
            <div style={{
              background: "#F9F9F9", padding: "16px", borderBottom: "1px solid #F0F0F0",
              fontWeight: 700, fontSize: 13,
            }}>
              PRODUCTOS ({products.filter(p => p.active).length})
            </div>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {products.filter(p => p.active).map(product => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  style={{
                    width: "100%", padding: "12px 16px", border: "none",
                    background: selectedProductId === product.id ? "#E8F0FF" : "#fff",
                    borderLeft: selectedProductId === product.id ? "3px solid #1a1a1a" : "3px solid transparent",
                    textAlign: "left", cursor: "pointer",
                    borderBottom: "1px solid #F8F8F8",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F5F5F5"}
                  onMouseLeave={e => {
                    if (selectedProductId !== product.id) {
                      e.currentTarget.style.background = "#fff";
                    }
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
                    {product.emoji} {product.name}
                  </div>
                  <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
                    {product.code}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main content: Editar precios */}
          {selectedProduct && config ? (
            <div style={{
              background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0",
              padding: "24px",
            }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px 0" }}>
                  {selectedProduct.emoji} {selectedProduct.name}
                </h2>
                <p style={{ fontSize: 13, color: "#666", margin: "0" }}>
                  {selectedProduct.details}
                </p>
              </div>

              <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>
                  Configurar Escalones de Precio
                </h3>
                <p style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>
                  Define la cantidad mínima y máxima para cada nivel de precio
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {config.tiers.map((tier, idx) => (
                    <div key={idx} style={{
                      background: "#F9F9F9", padding: "16px", borderRadius: 12,
                      border: "1px solid #E8E8E8",
                    }}>
                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 12,
                        marginBottom: 12,
                      }}>
                        <Input
                          label={`Escalón ${idx + 1} - Cantidad mínima`}
                          type="number"
                          value={tier.min}
                          onChange={(e) => handleTierChange(idx, "min", e.target.value)}
                        />
                        <Input
                          label="Cantidad máxima"
                          type="number"
                          value={tier.max === Infinity ? "Ilimitado" : tier.max}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.toLowerCase() === "ilimitado") {
                              handleTierChange(idx, "max", Infinity);
                            } else {
                              handleTierChange(idx, "max", val);
                            }
                          }}
                        />
                        <Input
                          label="Precio unitario"
                          type="number"
                          value={config.prices[idx]}
                          onChange={(e) => handlePriceChange(idx, e.target.value)}
                        />
                      </div>
                      <div style={{
                        fontSize: 12, color: "#666", fontWeight: 600,
                        padding: "12px", background: "#fff", borderRadius: 6,
                      }}>
                        {tier.min} - {tier.max === Infinity ? "∞" : tier.max} unidades = {formatPrice(config.prices[idx])}/u
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 24, padding: 16, background: "#FFF8E6", borderRadius: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#B07D00", marginBottom: 8 }}>
                    💡 EJEMPLO DE APLICACIÓN
                  </div>
                  <ul style={{ fontSize: 12, color: "#B07D00", margin: 0, paddingLeft: 20 }}>
                    <li>Si el cliente compra entre {config.tiers[0].min} y {config.tiers[0].max} unidades, paga {formatPrice(config.prices[0])} cada una</li>
                    {config.tiers[1] && (
                      <li>Si compra entre {config.tiers[1].min} y {config.tiers[1].max} unidades, paga {formatPrice(config.prices[1])} cada una</li>
                    )}
                    {config.tiers[2] && (
                      <li>Si compra {config.tiers[2].min} o más unidades, paga {formatPrice(config.prices[2])} cada una</li>
                    )}
                  </ul>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <Button variant="success" onClick={() => showSuccess("Cambios guardados correctamente")}>
                    ✓ Guardar cambios
                  </Button>
                  <Button variant="ghost" onClick={() => {
                    // Recargar desde estado original
                    setSelectedProductId(null);
                    setTimeout(() => setSelectedProductId(selectedProduct.id), 10);
                  }}>
                    ↺ Recargar
                  </Button>
                </div>
              </div>

              {/* Tabla de referencia rápida */}
              <div style={{ marginTop: 32, borderTop: "1px solid #F0F0F0", paddingTop: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                  Tabla de Precios
                </h3>
                <table style={{
                  width: "100%", borderCollapse: "collapse",
                  fontSize: 13,
                }}>
                  <thead>
                    <tr style={{ background: "#F9F9F9", borderBottom: "2px solid #E8E8E8" }}>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 700 }}>Cantidad</th>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 700 }}>Precio Unitario</th>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 700 }}>Precio por 100 u.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.tiers.map((tier, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #F0F0F0" }}>
                        <td style={{ padding: 12 }}>
                          {tier.min} - {tier.max === Infinity ? "∞" : tier.max}
                        </td>
                        <td style={{ padding: 12, fontWeight: 700 }}>
                          {formatPrice(config.prices[idx])}
                        </td>
                        <td style={{ padding: 12 }}>
                          {formatPrice(config.prices[idx] * 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{
              background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0",
              padding: "24px", textAlign: "center", color: "#999",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 14 }}>Selecciona un producto para editar sus precios</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
