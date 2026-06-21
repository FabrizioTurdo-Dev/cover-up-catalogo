// src/pages/AdminPricing.jsx
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/store";
import { supabase } from "../config/supabase";
import { sanitizeImageUrl } from "../utils/sanitize";
import Input from "../components/Input";
import Button from "../components/Button";
import ImageUploader from "../components/ImageUploader";

export default function AdminPricing() {
  const { products, priceConfig, updatePriceConfig, fetchProducts } = useApp();
  const { logout } = useAuth();
  
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  
  // Estado para controlar si mostramos el formulario de "Nuevo Producto"
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  
  // Estado para los campos del nuevo producto
  const [newProduct, setNewProduct] = useState({
    codigos: "",
    articulo: "",
    categoria: "",
    medidas: "",
    precio_30_unidades: 0,
    precio_120_unidades: 0,
    precio_500_unidades: 0,
    image: ""
  });

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

  const handleLogout = async () => {
    try {
      await logout();
      window.location.hash = "#/";
      window.location.reload();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // 1. GUARDAR CAMBIOS DE PRECIOS EN UN PRODUCTO EXISTENTE
  const handleSaveToSupabase = async () => {
    if (!selectedProductId || !config) return;

    setIsSaving(true);
    setErrorMsg("");

    try {
      // Mapeamos los precios del array local [0, 1, 2] a tus columnas de Supabase
      const { error } = await supabase
        .from('cover_up') // Asegúrate de que el nombre de la tabla sea correcto
        .update({
          precio_30_unidades: config.prices[0] || 0,
          precio_120_unidades: config.prices[1] || 0,
          precio_500_unidades: config.prices[2] || 0,
        })
        .eq("id", selectedProductId);

      if (error) throw error;

      showSuccess("Precios actualizados en la base de datos");
    } catch (error) {
      console.error("Error al guardar precios:", error);
      setErrorMsg("Error al actualizar los precios. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. CREAR UN NUEVO PRODUCTO EN SUPABASE
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from("cover_up")
        .insert([
          {
            codigos: newProduct.codigos,
            articulo: newProduct.articulo,
            categoria: newProduct.categoria || null,
            medidas: newProduct.medidas || null,
            precio_30_unidades: parseInt(newProduct.precio_30_unidades) || 0,
            precio_120_unidades: parseInt(newProduct.precio_120_unidades) || 0,
            precio_500_unidades: parseInt(newProduct.precio_500_unidades) || 0,
            image: sanitizeImageUrl(newProduct.image) || null
          }
        ])
        .select();

      if (error) throw error;

      showSuccess("¡Producto creado exitosamente!");
      
      // Limpiar formulario y cerrar
      setNewProduct({
        codigos: "", articulo: "", categoria: "", medidas: "",
        precio_30_unidades: 0, precio_120_unidades: 0, precio_500_unidades: 0, image: ""
      });
      setShowNewProductForm(false);
      
      // Recargar productos para verlo reflejado en la lista lateral
      if (data && data[0]) setSelectedProductId(data[0].id);

    } catch (error) {
      console.error("Error al crear producto:", error);
      setErrorMsg("Error al crear el producto. Verifica los datos e intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. ACTUALIZAR IMAGEN DE UN PRODUCTO EXISTENTE
  const handleUpdateImage = async (imageUrl) => {
    if (!selectedProductId) return;

    setIsSavingImage(true);
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("cover_up")
        .update({ image: sanitizeImageUrl(imageUrl) || null })
        .eq("id", selectedProductId);

      if (error) throw error;

      // Recargar productos para ver el cambio
      await fetchProducts();
      showSuccess("Imagen actualizada");
    } catch (error) {
      console.error("Error al actualizar imagen:", error);
      setErrorMsg("Error al guardar la imagen. Intenta nuevamente.");
    } finally {
      setIsSavingImage(false);
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#FAFAFA", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "16px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>⚙️ Panel de Administración</h1>
              <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0 0" }}>Gestiona precios, escalones y catálogo</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="primary" onClick={() => setShowNewProductForm(!showNewProductForm)}>
                {showNewProductForm ? "✕ Cancelar creación" : "➕ Nuevo Producto"}
              </Button>
              <a href="#/" style={{
                padding: "8px 16px", borderRadius: 8, background: "#F0F0F0", color: "#666",
                textDecoration: "none", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center"
              }}>← Volver al catálogo</a>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px", borderRadius: 8, background: "#FEF0F0",
                  border: "1px solid #F09595", color: "#A32D2D",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center",
                }}
              >🚪 Salir</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
        {successMsg && (
          <div style={{ background: "#E8F8EF", border: "1px solid #6DCCA0", color: "#0F6E56", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontWeight: 600, fontSize: 13 }}>
            ✓ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ background: "#FCE8E6", border: "1px solid #EF9A9A", color: "#C62828", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontWeight: 600, fontSize: 13 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* FORMULARIO PARA AGREGAR NUEVO PRODUCTO */}
        {showNewProductForm ? (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", padding: "24px", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px 0" }}>📦 Agregar Nuevo Artículo a Supabase</h2>
            <form onSubmit={handleCreateProduct}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Input label="Código / Referencia" value={newProduct.codigos} onChange={e => setNewProduct({...newProduct, codigos: e.target.value})} required />
                <Input label="Nombre del Artículo" value={newProduct.articulo} onChange={e => setNewProduct({...newProduct, articulo: e.target.value})} required />
                <Input label="Categoría" value={newProduct.categoria} onChange={e => setNewProduct({...newProduct, categoria: e.target.value})} />
                <Input label="Medidas (ej: 30x20x10)" value={newProduct.medidas} onChange={e => setNewProduct({...newProduct, medidas: e.target.value})} />
              </div>
              
              <h3 style={{ fontSize: 13, fontWeight: 800, margin: "20px 0 12px 0", textTransform: "uppercase", color: "#555" }}>Precios por Escalón</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Input label="Precio (30 a 119 u.)" type="number" value={newProduct.precio_30_unidades} onChange={e => setNewProduct({...newProduct, precio_30_unidades: e.target.value})} required />
                <Input label="Precio (120 a 499 u.)" type="number" value={newProduct.precio_120_unidades} onChange={e => setNewProduct({...newProduct, precio_120_unidades: e.target.value})} required />
                <Input label="Precio (500+ u.)" type="number" value={newProduct.precio_500_unidades} onChange={e => setNewProduct({...newProduct, precio_500_unidades: e.target.value})} required />
              </div>

              <div style={{ marginTop: 12 }}>
                <ImageUploader
                  value={newProduct.image}
                  onChange={(url) => setNewProduct({...newProduct, image: url})}
                  disabled={isSaving}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <Button variant="success" type="submit" disabled={isSaving}>
                  {isSaving ? "⏳ Guardando..." : "💾 Guardar en Base de Datos"}
                </Button>
                <Button variant="ghost" type="button" onClick={() => setShowNewProductForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* VISTA PRINCIPAL DE EDICIÓN (SIDEBAR + DETALLE) */
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
            {/* Sidebar */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", overflow: "hidden" }}>
              <div style={{ background: "#F9F9F9", padding: "16px", borderBottom: "1px solid #F0F0F0", fontWeight: 700, fontSize: 13 }}>
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
                      textAlign: "left", cursor: "pointer", borderBottom: "1px solid #F8F8F8", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F5F5F5"}
                    onMouseLeave={e => {
                      if (selectedProductId !== product.id) e.currentTarget.style.background = "#fff";
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
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", padding: "24px" }}>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px 0" }}>
                    {selectedProduct.emoji} {selectedProduct.name}
                  </h2>
                  <p style={{ fontSize: 13, color: "#666", margin: "0" }}>
                    {selectedProduct.details}
                  </p>
                </div>

                {/* Editar imagen del producto */}
                <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 24, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Imagen del Producto</h3>
                  <ImageUploader
                    value={selectedProduct.imageUrl || ""}
                    onChange={handleUpdateImage}
                    disabled={isSavingImage}
                  />
                  {isSavingImage && (
                    <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                      ⏳ Guardando imagen...
                    </div>
                  )}
                </div>

                <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Configurar Escalones de Precio</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {config.tiers.map((tier, idx) => (
                      <div key={idx} style={{ background: "#F9F9F9", padding: "16px", borderRadius: 12, border: "1px solid #E8E8E8" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 12, marginBottom: 12 }}>
                          <Input label={`Escalón ${idx + 1} - Cantidad mínima`} type="number" value={tier.min} onChange={(e) => handleTierChange(idx, "min", e.target.value)} />
                          <Input label="Cantidad máxima" type="number" value={tier.max === Infinity ? "Ilimitado" : tier.max} onChange={(e) => handleTierChange(idx, "max", e.target.value === "Ilimitado" ? Infinity : e.target.value)} />
                          <Input label="Precio unitario" type="number" value={config.prices[idx]} onChange={(e) => handlePriceChange(idx, e.target.value)} />
                        </div>
                        <div style={{ fontSize: 12, color: "#666", fontWeight: 600, padding: "12px", background: "#fff", borderRadius: 6 }}>
                          {tier.min} - {tier.max === Infinity ? "∞" : tier.max} unidades = {formatPrice(config.prices[idx])}/u
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <Button variant="success" onClick={handleSaveToSupabase} disabled={isSaving}>
                      {isSaving ? "⏳ Guardando en Supabase..." : "✓ Guardar cambios"}
                    </Button>
                    <Button variant="ghost" onClick={() => {
                      setSelectedProductId(null);
                      setTimeout(() => setSelectedProductId(selectedProduct.id), 10);
                    }} disabled={isSaving}>
                      ↺ Recargar
                    </Button>
                  </div>
                </div>

                {/* Tabla de referencia rápida */}
                <div style={{ marginTop: 32, borderTop: "1px solid #F0F0F0", paddingTop: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Tabla de Precios</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
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
                          <td style={{ padding: 12 }}>{tier.min} - {tier.max === Infinity ? "∞" : tier.max}</td>
                          <td style={{ padding: 12, fontWeight: 700 }}>{formatPrice(config.prices[idx])}</td>
                          <td style={{ padding: 12 }}>{formatPrice(config.prices[idx] * 100)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", padding: "24px", textAlign: "center", color: "#999" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <div style={{ fontSize: 14 }}>Selecciona un producto para editar sus precios</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}