// src/pages/CatalogoCoverUp.jsx
import { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  formatPrice,
  getGlobalTierIndex,
  DEFAULT_TIERS,
} from "../data/store";
import WhatsAppIcon from "../components/WhatsAppIcon";

function PriceDisplay({ product, globalQty, priceConfig }) {
  const tierPrices = priceConfig[product.id]?.prices || product.basePrices;
  const tiers = priceConfig[product.id]?.tiers || product.tiers || DEFAULT_TIERS;

  const tierIndex = getGlobalTierIndex(globalQty, tiers);
  const currentPrice = tierPrices[tierIndex] || tierPrices[0];

  const nextTier = tiers.find((t) => globalQty < t.min);

  return (
    <div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#1a1a1a",
          marginBottom: 4,
        }}
      >
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

function ProductModal({ group, selectedIdx, onClose, onSelectVariant, priceConfig, globalQty, onAdd }) {
  const product = group.variants[selectedIdx];
  const [qty, setQty] = useState(1);
  const [modalImgIdx, setModalImgIdx] = useState(0);

  const tierPrices = priceConfig[product.id]?.prices || product.basePrices;
  const tiers = priceConfig[product.id]?.tiers || product.tiers || DEFAULT_TIERS;
  const tierIndex = getGlobalTierIndex(globalQty, tiers);
  const currentUnitPrice = tierPrices[tierIndex] || tierPrices[0];
  const totalPrice = currentUnitPrice * qty;
  const hasVariants = group.variants.length > 1;

  const productImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  useEffect(() => {
    setModalImgIdx(0);
  }, [selectedIdx]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.6)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, cursor: "pointer",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, maxWidth: 520, width: "100%",
          maxHeight: "90vh", overflowY: "auto", cursor: "default",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header con imagen grande */}
        <div style={{ position: "relative" }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 12, right: 12, zIndex: 10,
              width: 32, height: 32, borderRadius: 20,
              background: "rgba(0,0,0,0.5)", color: "#fff",
              border: "none", fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
          <div style={{
            background: "#F5F5F5", height: 280,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24, borderRadius: "16px 16px 0 0",
            position: "relative",
          }}>
            {productImages.length > 0 ? (
              <>
                <img
                  src={productImages[modalImgIdx] || productImages[0]}
                  alt={product.name}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
                {productImages.length > 1 && (
                  <>
                    {modalImgIdx > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setModalImgIdx(modalImgIdx - 1); }}
                        style={{
                          position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                          width: 32, height: 32, borderRadius: 16,
                          background: "rgba(0,0,0,0.4)", color: "#fff", border: "none",
                          cursor: "pointer", fontSize: 14, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        ‹
                      </button>
                    )}
                    {modalImgIdx < productImages.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setModalImgIdx(modalImgIdx + 1); }}
                        style={{
                          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                          width: 32, height: 32, borderRadius: 16,
                          background: "rgba(0,0,0,0.4)", color: "#fff", border: "none",
                          cursor: "pointer", fontSize: 14, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        ›
                      </button>
                    )}
                  </>
                )}
              </>
            ) : (
              <span style={{ fontSize: 80 }}>{product.emoji}</span>
            )}
          </div>
          {productImages.length > 1 && (
            <div style={{
              display: "flex", justifyContent: "center", gap: 6,
              padding: "8px 0", background: "#F5F5F5",
            }}>
              {productImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setModalImgIdx(i); }}
                  style={{
                    width: 8, height: 8, borderRadius: 4, border: "none",
                    background: i === modalImgIdx ? "#1a1a1a" : "#CCC",
                    cursor: "pointer", padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div style={{ padding: "20px 24px 24px" }}>
          {/* Código y nombre */}
          <div style={{ fontSize: 10, color: "#AAA", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>
            COD: {product.code}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>
            {product.name}
          </div>
          {product.details && (
            <div style={{ fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 1.5 }}>
              {product.details}
            </div>
          )}

          {/* Selector de variantes */}
          {hasVariants && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>
                Variante / Color
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {group.variants.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => onSelectVariant(i)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                      border: i === selectedIdx ? "1.5px solid #1a1a1a" : "1px solid #E8E8E8",
                      background: i === selectedIdx ? "#1a1a1a" : "#fff",
                      color: i === selectedIdx ? "#fff" : "#666",
                    }}
                  >
                    {v.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de cantidad y precio */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>
                Cantidad
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: "1px solid #E8E8E8", background: "#fff",
                    cursor: "pointer", fontSize: 16, fontWeight: 700,
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: 56, height: 32, borderRadius: 8,
                    border: "1px solid #E8E8E8", textAlign: "center",
                    fontSize: 14, fontWeight: 700,
                  }}
                />
                <button
                  onClick={() => setQty(qty + 1)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: "1px solid #E8E8E8", background: "#fff",
                    cursor: "pointer", fontSize: 16, fontWeight: 700,
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a" }}>
                {formatPrice(currentUnitPrice)}/u
              </div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                Subtotal: {formatPrice(totalPrice)}
              </div>
            </div>
          </div>

          {/* Botón agregar */}
          <button
            onClick={() => { onAdd(product, qty); onClose(); }}
            style={{
              width: "100%", padding: "12px", borderRadius: 10,
              background: "#1a1a1a", color: "#fff", border: "none",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            + Agregar {qty} {qty === 1 ? "unidad" : "unidades"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ group, onAdd, priceConfig, globalQty, onImageClick }) {
  const [qty, setQty] = useState(1);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [cardImgIdx, setCardImgIdx] = useState(0);

  const product = group.variants[selectedIdx];

  useEffect(() => {
    setCardImgIdx(0);
  }, [selectedIdx]);

  const bgColors = {
    organizadores: { base: "#F0F8FF", accent: "#E0F0FF" },
    cestos: { base: "#FFF8F0", accent: "#FFE8D0" },
    mascotas: { base: "#FFE8F0", accent: "#FFF0F8" },
    limpieza: { base: "#F0FFF0", accent: "#E0FFE0" },
  };
  const bg = bgColors[product.cat] || bgColors.organizadores;

  const tierPrices =
    priceConfig[product.id]?.prices || product.basePrices;
  const tiers =
    priceConfig[product.id]?.tiers || product.tiers || DEFAULT_TIERS;
  const tierIndex = getGlobalTierIndex(globalQty, tiers);
  const currentUnitPrice = tierPrices[tierIndex] || tierPrices[0];
  const totalPrice = currentUnitPrice * qty;

  const hasVariants = group.variants.length > 1;

  const cardImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #F0F0F0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Header */}
      <div
        onClick={() => onImageClick(group, selectedIdx)}
        style={{
          background: bg.base,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          position: "relative",
          padding: "12px",
          cursor: "pointer",
        }}
      >
        {product.tag && (
          <span
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "#1a1a1a",
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 20,
            }}
          >
            {product.tag}
          </span>
        )}
        {cardImages.length > 0 ? (
          <>
            <img
              src={cardImages[cardImgIdx] || cardImages[0]}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
            {cardImages.length > 1 && (
              <>
                {cardImgIdx > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCardImgIdx(cardImgIdx - 1); }}
                    style={{
                      position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)",
                      width: 22, height: 22, borderRadius: 11,
                      background: "rgba(0,0,0,0.35)", color: "#fff", border: "none",
                      cursor: "pointer", fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ‹
                  </button>
                )}
                {cardImgIdx < cardImages.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCardImgIdx(cardImgIdx + 1); }}
                    style={{
                      position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
                      width: 22, height: 22, borderRadius: 11,
                      background: "rgba(0,0,0,0.35)", color: "#fff", border: "none",
                      cursor: "pointer", fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ›
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          product.emoji
        )}
      </div>

      <div
        style={{
          padding: "12px 14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Código y nombre */}
        <div>
          <div
            style={{
              fontSize: 9,
              color: "#AAA",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            COD: {product.code}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1a1a1a",
              marginTop: 2,
            }}
          >
            {product.name}
          </div>
          <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
            {product.details}
          </div>
        </div>

        {/* Selector de variantes/colores */}
        {hasVariants && (
          <div>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#666",
                textTransform: "uppercase",
              }}
            >
              Variante:
            </label>
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 4,
                flexWrap: "wrap",
              }}
            >
              {group.variants.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedIdx(i)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                    border:
                      i === selectedIdx
                        ? "1.5px solid #1a1a1a"
                        : "1px solid #E8E8E8",
                    background: i === selectedIdx ? "#1a1a1a" : "#fff",
                    color: i === selectedIdx ? "#fff" : "#666",
                    transition: "all 0.15s",
                  }}
                  title={v.code}
                >
                  {v.code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de cantidad */}
        <div>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#666",
              textTransform: "uppercase",
            }}
          >
            Cantidad:
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
            }}
          >
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "1px solid #E8E8E8",
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              −
            </button>
            <input
              type="number"
              value={qty}
              onChange={(e) =>
                setQty(Math.max(1, parseInt(e.target.value) || 1))
              }
              style={{
                width: 50,
                height: 28,
                borderRadius: 6,
                border: "1px solid #E8E8E8",
                textAlign: "center",
                fontSize: 13,
                fontWeight: 700,
              }}
            />
            <button
              onClick={() => setQty(qty + 1)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "1px solid #E8E8E8",
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Precios */}
        <div
          style={{
            background: "#F9F9F9",
            padding: "10px 12px",
            borderRadius: 8,
            marginTop: "auto",
            marginBottom: 8,
          }}
        >
          <PriceDisplay
            product={product}
            globalQty={globalQty}
            priceConfig={priceConfig}
          />
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#1a1a1a",
              marginTop: 6,
              borderTop: "1px solid #E8E8E8",
              paddingTop: 6,
            }}
          >
            Total: {formatPrice(totalPrice)}
          </div>
        </div>

        {/* Botón agregar */}
        <button
          onClick={() => onAdd(product, qty)}
          style={{
            padding: "8px",
            borderRadius: 8,
            border: "1.5px solid #1a1a1a",
            background: "transparent",
            color: "#1a1a1a",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1a1a1a";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#1a1a1a";
          }}
        >
          + Agregar {qty} {qty === 1 ? "unidad" : "unidades"}
        </button>
      </div>
    </div>
  );
}

function CartView({
  cart,
  onClose,
  onChangeQty,
  onRemove,
  onSent,
  priceConfig,
}) {
  const { addOrder, sellerPhone } = useApp();
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const totalQty = cart.reduce((s, item) => s + item.qty, 0);

  const tiers = DEFAULT_TIERS;
  const globalTierIdx = getGlobalTierIndex(totalQty, tiers);

  const total = cart.reduce((s, item) => {
    const tierPrices =
      priceConfig[item.id]?.prices || item.basePrices;
    const unitPrice = tierPrices[globalTierIdx] || tierPrices[0];
    return s + unitPrice * item.qty;
  }, 0);

  function sendToWhatsApp() {
    let msg = "Hola! Quiero realizar el siguiente pedido:\n\n";
    cart.forEach((item) => {
      const tierPrices =
        priceConfig[item.id]?.prices || item.basePrices;
      const unitPrice = tierPrices[globalTierIdx] || tierPrices[0];
      const subtotal = unitPrice * item.qty;
      msg += `• ${item.code} - ${item.name}\n`;
      msg += `  ${item.qty} U × ${formatPrice(unitPrice)} = ${formatPrice(subtotal)}\n\n`;
    });
    msg += `*Total (${totalQty} unidades): ${formatPrice(total)}*`;
    if (clientName) msg += `\nCliente: ${clientName}`;
    if (phone) msg += `\nTeléfono: ${phone}`;

    addOrder({
      client: clientName || "Cliente nuevo",
      phone,
      items: cart.map((c) => ({
        name: c.name,
        code: c.code,
        qty: c.qty,
      })),
      total,
    });

    window.open(
      `https://wa.me/${sellerPhone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
    setSent(true);
    onSent();
  }

  if (sent) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
          ¡Pedido enviado!
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#666",
            marginBottom: 24,
          }}
        >
          Se abrió WhatsApp con tu pedido. El vendedor te confirmará en breve.
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "10px 28px",
            borderRadius: 10,
            border: "1.5px solid #1a1a1a",
            background: "#1a1a1a",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "1px solid #E8E8E8",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 13,
            color: "#666",
          }}
        >
          ← Volver
        </button>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          Tu pedido{" "}
          <span
            style={{
              color: "#999",
              fontWeight: 400,
              fontSize: 13,
            }}
          >
            ({totalQty} {totalQty === 1 ? "unidad" : "unidades"})
          </span>
        </div>
      </div>

      {cart.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 0",
            color: "#AAA",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
          <div style={{ fontSize: 14 }}>El carrito está vacío</div>
        </div>
      ) : (
        <>
          <div
            style={{
              border: "1px solid #F0F0F0",
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {cart.map((item, i) => {
              const tierPrices =
                priceConfig[item.id]?.prices || item.basePrices;
              const unitPrice =
                tierPrices[globalTierIdx] || tierPrices[0];
              return (
                <div
                  key={`${item.id}-${item.code}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom:
                      i < cart.length - 1
                        ? "1px solid #F8F8F8"
                        : "none",
                    background: "#fff",
                  }}
                >
                  <div style={{ fontSize: 26, minWidth: 36 }}>
                    {item.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#999",
                      }}
                    >
                      COD: {item.code} · Cant. {item.qty} ·{" "}
                      {formatPrice(unitPrice)}/u
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <button
                      onClick={() => onChangeQty(item, -1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: "1px solid #E8E8E8",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      −
                    </button>
                    <div
                      style={{
                        minWidth: 28,
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {item.qty}
                    </div>
                    <button
                      onClick={() => onChangeQty(item, +1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: "1px solid #E8E8E8",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemove(item)}
                      style={{
                        marginLeft: 12,
                        background: "#FEF0F0",
                        border: "1px solid #F09595",
                        color: "#A32D2D",
                        borderRadius: 6,
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                  <div
                    style={{
                      minWidth: 80,
                      textAlign: "right",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {formatPrice(unitPrice * item.qty)}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              background: "#F9F9F9",
              padding: "16px",
              borderRadius: 12,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{ fontSize: 12, color: "#666", fontWeight: 600 }}
            >
              TOTAL ({totalQty} unidades)
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#1a1a1a",
              }}
            >
              {formatPrice(total)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#888",
                  letterSpacing: "0.05em",
                }}
              >
                NOMBRE DEL CLIENTE (OPCIONAL)
              </label>
              <input
                type="text"
                placeholder="Ej: Comercio Centro"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1.5px solid #E8E8E8",
                  fontSize: 13,
                  background: "#fff",
                  outline: "none",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#888",
                  letterSpacing: "0.05em",
                }}
              >
                TELÉFONO (OPCIONAL)
              </label>
              <input
                type="text"
                placeholder="Ej: +54 9 11 3699-6026"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1.5px solid #E8E8E8",
                  fontSize: 13,
                  background: "#fff",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <button
            onClick={sendToWhatsApp}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              background: "#25D366",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.opacity = "0.8")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = "1")
            }
          >
            <WhatsAppIcon size={18} /> Enviar pedido por WhatsApp
          </button>
        </>
      )}
    </div>
  );
}

export default function CatalogoCoverUp() {
  const { products, addOrder, priceConfig, loading, sellerPhone } = useApp();
  const [view, setView] = useState("catalog");
  const [cart, setCart] = useState([]);
  const [catFilter, setCatFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(0);

  const categories = useMemo(() => {
    const catMap = new Map();
    products.forEach((p) => {
      if (!catMap.has(p.cat)) {
        catMap.set(p.cat, p.categorySortOrder ?? 0);
      }
    });
    return [...catMap.entries()]
      .map(([name, sortOrder]) => ({ name, sortOrder }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((c) => c.name);
  }, [products]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.active) return false;
        const catOk = catFilter === "todos" || p.cat === catFilter;
        const searchOk =
          !searchTerm ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.code.toLowerCase().includes(searchTerm.toLowerCase());
        return catOk && searchOk;
      })
      .sort((a, b) => {
        if (a.cat !== b.cat) {
          return (a.categorySortOrder ?? 0) - (b.categorySortOrder ?? 0);
        }
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id;
      });
  }, [products, catFilter, searchTerm]);

  // Agrupar productos: base + variantes (por variante_de O por códigos separados por coma)
  const groupedProducts = useMemo(() => {
    const baseMap = new Map();
    const variantsMap = new Map();

    filtered.forEach((p) => {
      if (p.varianteDe) {
        if (!variantsMap.has(p.varianteDe)) {
          variantsMap.set(p.varianteDe, []);
        }
        variantsMap.get(p.varianteDe).push(p);
      } else {
        baseMap.set(p.code, p);
      }
    });

    const groups = [];

    // Productos base que tienen variantes por variante_de
    baseMap.forEach((baseProduct, code) => {
      const variants = variantsMap.get(code) || [];
      if (variants.length > 0) {
        groups.push({
          id: baseProduct.id,
          base: baseProduct,
          variants: [baseProduct, ...variants],
        });
      } else {
        groups.push({
          id: baseProduct.id,
          base: baseProduct,
          variants: [baseProduct],
        });
      }
    });

    // Variantes cuyo base no está en el filtered (huérfanas)
    variantsMap.forEach((variants, baseCode) => {
      if (!baseMap.has(baseCode)) {
        variants.forEach((v) => {
          groups.push({
            id: v.id,
            base: v,
            variants: [v],
          });
        });
      }
    });

    // Detectar productos con códigos separados por coma (ej: "GRIS THS034-G, BEIGE THS034-B")
    const finalGroups = [];
    groups.forEach((g) => {
      const codes = g.base.code.split(",").map((c) => c.trim()).filter(Boolean);
      if (codes.length > 1) {
        const variantImages = g.base.variantImages || {};
        const virtualVariants = codes.map((code, i) => {
          const vImages = variantImages[code] || [];
          const mainImg = vImages.length > 0 ? vImages[0] : g.base.imageUrl;
          return {
            ...g.base,
            id: `${g.base.id}_v${i}`,
            code: code,
            images: vImages.length > 0 ? vImages : g.base.images,
            imageUrl: mainImg || g.base.imageUrl,
          };
        });
        finalGroups.push({
          ...g,
          id: g.base.id,
          base: g.base,
          variants: virtualVariants,
        });
      } else {
        finalGroups.push(g);
      }
    });

    return finalGroups.sort((a, b) => {
      const orderA = a.base.sortOrder ?? 0;
      const orderB = b.base.sortOrder ?? 0;
      return orderA - orderB || a.base.id - b.base.id;
    });
  }, [filtered]);

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);

  const globalTierIdx = getGlobalTierIndex(totalQty, DEFAULT_TIERS);
  const totalPrice = cart.reduce((s, c) => {
    const tierPrices =
      priceConfig[c.id]?.prices || c.basePrices;
    const unitPrice =
      tierPrices[globalTierIdx] || tierPrices[0];
    return s + unitPrice * c.qty;
  }, 0);

  function addToCart(product, qty) {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === product.id);
      return ex
        ? prev.map((c) =>
            c.id === product.id ? { ...c, qty: c.qty + qty } : c
          )
        : [...prev, { ...product, qty }];
    });
    showToast(`${product.name} (${product.code}) agregado ✓`);
  }

  function changeQty(item, delta) {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === item.id) {
            const newQty = c.qty + delta;
            if (newQty <= 0) return null;
            return { ...c, qty: newQty };
          }
          return c;
        })
        .filter(Boolean)
    );
  }

  function removeItem(item) {
    setCart((prev) => prev.filter((c) => c.id !== item.id));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function handleImageClick(group, idx) {
    setExpandedGroup(group);
    setExpandedIdx(idx);
  }

  const pill = (active) => ({
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: 13,
    cursor: "pointer",
    border: active
      ? "1.5px solid #1a1a1a"
      : "1px solid #E8E8E8",
    background: active ? "#1a1a1a" : "#fff",
    color: active ? "#fff" : "#666",
    fontWeight: active ? 700 : 400,
    transition: "all 0.15s",
  });

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          color: "#666",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>
            📦
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            Cargando catálogo...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        background: "#FAFAFA",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #F0F0F0",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "0 20px",
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 28 }}>📦</span>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                Cover Up Home
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#AAA",
                  letterSpacing: "0.1em",
                }}
              >
                MAYORISTA
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              setView(view === "cart" ? "catalog" : "cart")
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 20,
              cursor: "pointer",
              border:
                totalItems > 0
                  ? "1.5px solid #1a1a1a"
                  : "1px solid #E8E8E8",
              background:
                totalItems > 0 ? "#1a1a1a" : "#fff",
              color: totalItems > 0 ? "#fff" : "#666",
              fontSize: 13,
              fontWeight: 700,
              transition: "all 0.2s",
            }}
          >
            🛒{" "}
            {totalItems > 0
              ? `${totalItems} item${totalItems !== 1 ? "s" : ""} - ${formatPrice(totalPrice)}`
              : "Carrito"}
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "24px 20px",
        }}
      >
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
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1.5px solid #E8E8E8",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setCatFilter("todos")}
                  style={pill(catFilter === "todos")}
                >
                  Todos (
                  {
                    products.filter((p) => p.active).length
                  }
                  )
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCatFilter(cat)}
                    style={pill(catFilter === cat)}
                  >
                    {cat} (
                    {
                      products.filter(
                        (p) => p.active && p.cat === cat
                      ).length
                    }
                    )
                  </button>
                ))}
              </div>
            </div>

            {/* Contador */}
            <div
              style={{
                fontSize: 12,
                color: "#BBB",
                marginBottom: 16,
              }}
            >
              {groupedProducts.length} producto
              {groupedProducts.length !== 1 ? "s" : ""}
            </div>

            {/* Grilla de productos */}
            {groupedProducts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem 0",
                  color: "#AAA",
                }}
              >
                <div
                  style={{ fontSize: 40, marginBottom: 8 }}
                >
                  😕
                </div>
                <div style={{ fontSize: 14 }}>
                  Sin productos para ese filtro
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 16,
                }}
              >
                {groupedProducts.map((group) => (
                  <ProductCard
                    key={group.id}
                    group={group}
                    onAdd={addToCart}
                    priceConfig={priceConfig}
                    globalQty={totalQty}
                    onImageClick={handleImageClick}
                  />
                ))}
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
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1a1a1a",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            whiteSpace: "nowrap",
            zIndex: 999,
          }}
        >
          {toast}
        </div>
      )}

      {/* Modal de producto expandido */}
      {expandedGroup && (
        <ProductModal
          group={expandedGroup}
          selectedIdx={expandedIdx}
          onClose={() => setExpandedGroup(null)}
          onSelectVariant={(idx) => setExpandedIdx(idx)}
          priceConfig={priceConfig}
          globalQty={totalQty}
          onAdd={addToCart}
        />
      )}

      {/* Link a Admin */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          fontSize: 12,
        }}
      >
        <a
          href="#/admin"
          style={{
            padding: "8px 14px",
            borderRadius: 20,
            background: "#1a1a1a",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
            display: "inline-block",
          }}
        >
          ⚙️ Admin
        </a>
      </div>
    </div>
  );
}
