// src/pages/AdminPricing.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/store";
import { supabase } from "../config/supabase";
import { sanitizeImageUrl } from "../utils/sanitize";
import * as XLSX from "xlsx";
import Input from "../components/Input";
import Button from "../components/Button";
import ImageUploader from "../components/ImageUploader";
import MultiImageUploader from "../components/MultiImageUploader";

export default function AdminPricing() {
  const {
    products, priceConfig, updatePriceConfig, fetchProducts,
    updateProductSortOrder, updateCategorySortOrder, updateProductCategory,
    updateProductImages, updateProductVariantImages, getCategories, sellerPhone, updateSellerPhone,
  } = useApp();
  const { logout } = useAuth();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);

  const [showNewProductForm, setShowNewProductForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    codigos: "",
    articulo: "",
    categoria: "",
    medidas: "",
    variante_de: "",
    precio_30_unidades: 0,
    precio_120_unidades: 0,
    precio_500_unidades: 0,
    image: "",
    images: [],
  });

  const [editVarianteDe, setEditVarianteDe] = useState("");
  const [isSavingVariante, setIsSavingVariante] = useState(false);

  const [editCategory, setEditCategory] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [activeSection, setActiveSection] = useState("products");
  const [phoneInput, setPhoneInput] = useState(sellerPhone);
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySortOrder, setNewCategorySortOrder] = useState(0);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categorySortInputs, setCategorySortInputs] = useState({});

  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [draggedProduct, setDraggedProduct] = useState(null);

  const [excelData, setExcelData] = useState([]);
  const [excelCategory, setExcelCategory] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const excelFileRef = useRef(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const config = selectedProduct ? priceConfig[selectedProduct.id] : null;
  const categories = useMemo(() => getCategories(), [products]);

  useEffect(() => {
    if (selectedProduct) {
      setEditVarianteDe(selectedProduct.varianteDe || "");
      setEditCategory(selectedProduct.cat || "");
    }
  }, [selectedProduct]);

  useEffect(() => {
    const inputs = {};
    categories.forEach((c) => { inputs[c.name] = c.sortOrder; });
    setCategorySortInputs(inputs);
  }, [categories.length]);

  const baseProducts = products.filter(p => p.active && !p.varianteDe);

  const productsByCategory = useMemo(() => {
    const map = new Map();
    products.filter(p => p.active).forEach((p) => {
      if (!map.has(p.cat)) map.set(p.cat, []);
      map.get(p.cat).push(p);
    });
    return map;
  }, [products]);

  const variantsOfSelected = useMemo(() => {
    if (!selectedProduct) return [];
    return products.filter(p => p.active && p.varianteDe === selectedProduct.code && p.id !== selectedProduct.id);
  }, [products, selectedProduct]);

  const selectedProductCodes = useMemo(() => {
    if (!selectedProduct) return [];
    return selectedProduct.code.split(",").map(c => c.trim()).filter(Boolean);
  }, [selectedProduct]);

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

  const handleSaveToSupabase = async () => {
    if (!selectedProductId || !config) return;
    setIsSaving(true);
    setErrorMsg("");
    try {
      const { error } = await supabase
        .from('cover_up')
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

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase
        .from("cover_up")
        .insert([{
          codigos: newProduct.codigos,
          articulo: newProduct.articulo,
          categoria: newProduct.categoria || null,
          medidas: newProduct.medidas || null,
          variante_de: newProduct.variante_de || null,
          precio_30_unidades: parseInt(newProduct.precio_30_unidades) || 0,
          precio_120_unidades: parseInt(newProduct.precio_120_unidades) || 0,
          precio_500_unidades: parseInt(newProduct.precio_500_unidades) || 0,
          image: sanitizeImageUrl(newProduct.image) || null,
          images: JSON.stringify(newProduct.images || []),
          sort_order: 0,
          category_sort_order: 0,
        }])
        .select();
      if (error) throw error;
      showSuccess("¡Producto creado exitosamente!");
      setNewProduct({
        codigos: "", articulo: "", categoria: "", medidas: "", variante_de: "",
        precio_30_unidades: 0, precio_120_unidades: 0, precio_500_unidades: 0, image: "", images: []
      });
      setShowNewProductForm(false);
      if (data && data[0]) setSelectedProductId(data[0].id);
    } catch (error) {
      console.error("Error al crear producto:", error);
      setErrorMsg("Error al crear el producto. Verifica los datos e intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

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
      await fetchProducts();
      showSuccess("Imagen actualizada");
    } catch (error) {
      console.error("Error al actualizar imagen:", error);
      setErrorMsg("Error al guardar la imagen. Intenta nuevamente.");
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleUpdateImages = async (newImages) => {
    if (!selectedProductId) return;
    setIsSavingImage(true);
    setErrorMsg("");
    try {
      const sanitized = newImages.map(sanitizeImageUrl).filter(Boolean);
      const { error } = await supabase
        .from("cover_up")
        .update({
          images: JSON.stringify(sanitized),
          image: sanitized[0] || null,
        })
        .eq("id", selectedProductId);
      if (error) throw error;
      await fetchProducts();
      showSuccess("Imágenes actualizadas");
    } catch (error) {
      console.error("Error al actualizar imágenes:", error);
      setErrorMsg("Error al guardar las imágenes. Intenta nuevamente.");
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleUpdateVariantImages = async (variantCode, newImages) => {
    if (!selectedProductId) return;
    setIsSavingImage(true);
    setErrorMsg("");
    try {
      const sanitized = newImages.map(sanitizeImageUrl).filter(Boolean);
      const ok = await updateProductVariantImages(selectedProductId, variantCode, sanitized);
      if (ok) showSuccess(`Imágenes de "${variantCode}" actualizadas`);
      else setErrorMsg("Error al guardar las imágenes de la variante");
    } catch (error) {
      console.error("Error al actualizar imágenes de variante:", error);
      setErrorMsg("Error al guardar las imágenes de la variante");
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleSaveVariante = async () => {
    if (!selectedProductId) return;
    setIsSavingVariante(true);
    setErrorMsg("");
    try {
      const { error } = await supabase
        .from("cover_up")
        .update({ variante_de: editVarianteDe || null })
        .eq("id", selectedProductId);
      if (error) throw error;
      await fetchProducts();
      showSuccess(editVarianteDe ? `Ahora es variante de ${editVarianteDe}` : "Producto es base (sin variante)");
    } catch (error) {
      console.error("Error al guardar variante:", error);
      setErrorMsg("Error al guardar la variante. Intenta nuevamente.");
    } finally {
      setIsSavingVariante(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!selectedProductId) return;
    setIsSavingCategory(true);
    setErrorMsg("");
    try {
      const { error } = await supabase
        .from("cover_up")
        .update({ categoria: editCategory || null })
        .eq("id", selectedProductId);
      if (error) throw error;
      await fetchProducts();
      showSuccess(`Categoría cambiada a "${editCategory}"`);
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      setErrorMsg("Error al guardar la categoría. Intenta nuevamente.");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    setErrorMsg("");
    try {
      const { data: existing, error: checkErr } = await supabase
        .from("cover_up")
        .select("id")
        .eq("categoria", newCategoryName.trim().toLowerCase())
        .limit(1);
      if (checkErr) throw checkErr;
      if (existing && existing.length > 0) {
        setErrorMsg("Esa categoría ya existe.");
        setIsCreatingCategory(false);
        return;
      }
      showSuccess(`Categoría "${newCategoryName.trim()}" creada (se asigna al primer producto que la use)`);
      setNewCategoryName("");
      setNewCategorySortOrder(0);
    } catch (error) {
      console.error("Error creando categoría:", error);
      setErrorMsg("Error al crear la categoría.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSaveCategorySortOrder = async (categoryName) => {
    const newOrder = parseInt(categorySortInputs[categoryName]) || 0;
    const ok = await updateCategorySortOrder(categoryName, newOrder);
    if (ok) showSuccess(`Orden de "${categoryName}" actualizado a ${newOrder}`);
    else setErrorMsg("Error al guardar el orden de la categoría");
  };

  const handleMoveProduct = async (productId, direction) => {
    const catProducts = [];
    products.filter(p => p.active).forEach((p) => {
      if (p.cat === products.find(pp => pp.id === productId)?.cat) {
        catProducts.push(p);
      }
    });
    catProducts.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const idx = catProducts.findIndex((p) => p.id === productId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= catProducts.length) return;
    const currentSort = catProducts[idx].sortOrder;
    const targetSort = catProducts[targetIdx].sortOrder;
    await updateProductSortOrder(productId, targetSort);
    await updateProductSortOrder(catProducts[targetIdx].id, currentSort);
    await fetchProducts();
  };

  const handleDragStart = (e, productId) => {
    setDraggedProduct(productId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetProductId, targetCategory) => {
    e.preventDefault();
    if (!draggedProduct || draggedProduct === targetProductId) {
      setDraggedProduct(null);
      return;
    }
    const draggedProd = products.find((p) => p.id === draggedProduct);
    if (!draggedProd || draggedProd.cat !== targetCategory) {
      setDraggedProduct(null);
      return;
    }
    const catProducts = products
      .filter((p) => p.active && p.cat === targetCategory)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const draggedIdx = catProducts.findIndex((p) => p.id === draggedProduct);
    const targetIdx = catProducts.findIndex((p) => p.id === targetProductId);
    if (draggedIdx < 0 || targetIdx < 0) {
      setDraggedProduct(null);
      return;
    }
    const newOrder = catProducts.map((p) => p.id);
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedProduct);
    for (let i = 0; i < newOrder.length; i++) {
      await updateProductSortOrder(newOrder[i], i);
    }
    await fetchProducts();
    setDraggedProduct(null);
  };

  const toggleCategory = (catName) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catName)) next.delete(catName);
      else next.add(catName);
      return next;
    });
  };

  function parseExcelFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const existingCodes = new Set(
          products.map(p => p.code.split(",").map(c => c.trim().toLowerCase()).join(","))
        );

        const parsed = [];
        let currentCategory = "sin categoría";

        for (let i = 0; i < raw.length; i++) {
          const row = raw[i];
          if (!row || row.every(v => v === null || v === undefined || v === "")) continue;

          const hasCode = row[0] && String(row[0]).trim() !== "";
          const hasName = row[1] && String(row[1]).trim() !== "";
          const hasPrice = row[4] && !isNaN(parseFloat(row[4]));

          if (!hasCode && hasName && !hasPrice) {
            currentCategory = String(row[1]).trim().toLowerCase();
            continue;
          }

          if (!hasCode || !hasName || !hasPrice) continue;

          const code = String(row[0]).trim();
          const codeLower = code.toLowerCase();
          const isDuplicate = existingCodes.has(codeLower) ||
            products.some(p => p.code.toLowerCase() === codeLower);

          parsed.push({
            codigos: code,
            articulo: String(row[1]).trim(),
            medidas: row[2] ? String(row[2]).trim() : "",
            color: row[3] ? String(row[3]).trim() : "",
            precio_30_unidades: Math.round(parseFloat(row[4]) || 0),
            precio_120_unidades: Math.round(parseFloat(row[5]) || 0),
            precio_500_unidades: Math.round(parseFloat(row[6]) || 0),
            categoria: currentCategory,
            isDuplicate,
          });
        }

        setExcelData(parsed);
        setImportResult(null);
      } catch (err) {
        console.error("Error parseando Excel:", err);
        setImportResult({ error: "Error al leer el archivo Excel. Verificá el formato." });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleImportExcel() {
    const toImport = excelData.filter(p => !p.isDuplicate);
    if (toImport.length === 0) {
      setImportResult({ error: "No hay productos nuevos para importar." });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const rows = toImport.map(p => ({
        codigos: p.codigos,
        articulo: p.articulo,
        categoria: excelCategory || p.categoria || null,
        medidas: p.medidas || null,
        variante_de: null,
        precio_30_unidades: p.precio_30_unidades,
        precio_120_unidades: p.precio_120_unidades,
        precio_500_unidades: p.precio_500_unidades,
        image: null,
        images: "[]",
        variant_images: "{}",
        sort_order: 0,
        category_sort_order: 0,
      }));

      const { data, error } = await supabase
        .from("cover_up")
        .insert(rows)
        .select();

      if (error) throw error;

      await fetchProducts();
      const imported = data ? data.length : rows.length;
      const skipped = excelData.filter(p => p.isDuplicate).length;
      setImportResult({
        success: true,
        imported,
        skipped,
        total: excelData.length,
      });
      setExcelData([]);
      if (excelFileRef.current) excelFileRef.current.value = "";
    } catch (err) {
      console.error("Error importando:", err);
      setImportResult({ error: `Error al importar: ${err.message}` });
    } finally {
      setIsImporting(false);
    }
  }

  const sectionButtonStyle = (section) => ({
    padding: "8px 16px",
    borderRadius: 8,
    border: activeSection === section ? "2px solid #1a1a1a" : "1.5px solid #E8E8E8",
    background: activeSection === section ? "#1a1a1a" : "#fff",
    color: activeSection === section ? "#fff" : "#666",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  });

  const selectStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1.5px solid #E8E8E8", fontSize: 13, background: "#fff", outline: "none",
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#FAFAFA", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "16px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>⚙️ Panel de Administración</h1>
              <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0 0" }}>Gestiona categorías, orden, precios y catálogo</p>
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

        {/* FORMULARIO NUEVO PRODUCTO */}
        {showNewProductForm ? (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", padding: "24px", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px 0" }}>📦 Agregar Nuevo Artículo</h2>
            <form onSubmit={handleCreateProduct}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Input label="Código / Referencia" value={newProduct.codigos} onChange={e => setNewProduct({ ...newProduct, codigos: e.target.value })} required />
                <Input label="Nombre del Artículo" value={newProduct.articulo} onChange={e => setNewProduct({ ...newProduct, articulo: e.target.value })} required />
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                    CATEGORÍA
                  </label>
                  <select
                    value={newProduct.categoria}
                    onChange={e => {
                      if (e.target.value === "__new__") {
                        const name = prompt("Nombre de la nueva categoría:");
                        if (name && name.trim()) {
                          setNewProduct({ ...newProduct, categoria: name.trim().toLowerCase() });
                        }
                      } else {
                        setNewProduct({ ...newProduct, categoria: e.target.value });
                      }
                    }}
                    style={selectStyle}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                    <option value="__new__">+ Crear nueva categoría</option>
                  </select>
                </div>
                <Input label="Medidas (ej: 30x20x10)" value={newProduct.medidas} onChange={e => setNewProduct({ ...newProduct, medidas: e.target.value })} />
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                  ES VARIANTE DE (opcional)
                </label>
                <select
                  value={newProduct.variante_de}
                  onChange={e => setNewProduct({ ...newProduct, variante_de: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">No es variante (producto base)</option>
                  {baseProducts.map(p => (
                    <option key={p.id} value={p.code}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 800, margin: "20px 0 12px 0", textTransform: "uppercase", color: "#555" }}>Precios por Escalón</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Input label="Precio (30 a 119 u.)" type="number" value={newProduct.precio_30_unidades} onChange={e => setNewProduct({ ...newProduct, precio_30_unidades: e.target.value })} required />
                <Input label="Precio (120 a 499 u.)" type="number" value={newProduct.precio_120_unidades} onChange={e => setNewProduct({ ...newProduct, precio_120_unidades: e.target.value })} required />
                <Input label="Precio (500+ u.)" type="number" value={newProduct.precio_500_unidades} onChange={e => setNewProduct({ ...newProduct, precio_500_unidades: e.target.value })} required />
              </div>
              <div style={{ marginTop: 12 }}>
                <MultiImageUploader
                  images={newProduct.images || []}
                  onChange={(imgs) => setNewProduct({ ...newProduct, images: imgs, image: imgs[0] || "" })}
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
          <>
            {/* SECCIONES DE NAVEGACIÓN */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <button style={sectionButtonStyle("products")} onClick={() => setActiveSection("products")}>
                📦 Productos
              </button>
              <button style={sectionButtonStyle("categories")} onClick={() => setActiveSection("categories")}>
                🏷️ Categorías
              </button>
              <button style={sectionButtonStyle("order")} onClick={() => setActiveSection("order")}>
                📋 Orden de Productos
              </button>
              <button style={sectionButtonStyle("settings")} onClick={() => setActiveSection("settings")}>
                ⚙️ Configuración
              </button>
              <button style={sectionButtonStyle("import")} onClick={() => setActiveSection("import")}>
                📥 Importar Excel
              </button>
            </div>

            {/* SECCIÓN: GESTIÓN DE CATEGORÍAS */}
            {activeSection === "categories" && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", padding: "24px", marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px 0" }}>🏷️ Gestionar Categorías</h2>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
                  Asigná un número de orden a cada categoría. Las categorías con menor número se muestran primero en el catálogo.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {categories.map((cat) => (
                    <div key={cat.name} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", background: "#F9F9F9", borderRadius: 10, border: "1px solid #E8E8E8",
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, background: "#1a1a1a",
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 14,
                      }}>
                        {products.filter(p => p.cat === cat.name).length}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{cat.name}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>
                          {products.filter(p => p.cat === cat.name).length} productos
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>Orden:</label>
                        <input
                          type="number"
                          value={categorySortInputs[cat.name] ?? cat.sortOrder}
                          onChange={(e) => setCategorySortInputs({
                            ...categorySortInputs,
                            [cat.name]: parseInt(e.target.value) || 0,
                          })}
                          style={{
                            width: 70, padding: "6px 10px", borderRadius: 6,
                            border: "1.5px solid #E8E8E8", fontSize: 13, textAlign: "center",
                          }}
                        />
                        <button
                          onClick={() => handleSaveCategorySortOrder(cat.name)}
                          style={{
                            padding: "6px 12px", borderRadius: 6, border: "1px solid #6DCCA0",
                            background: "#E8F8EF", color: "#0F6E56", fontWeight: 700,
                            fontSize: 12, cursor: "pointer",
                          }}
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Crear nueva categoría</h3>
                  <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
                    La categoría se creará cuando asignes un producto a ella desde el editor de productos.
                  </p>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        label="Nombre de la categoría"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="ej: bañadores"
                      />
                    </div>
                    <div style={{ width: 100 }}>
                      <Input
                        label="Orden"
                        type="number"
                        value={newCategorySortOrder}
                        onChange={e => setNewCategorySortOrder(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <Button variant="success" onClick={handleCreateCategory} disabled={isCreatingCategory}>
                      {isCreatingCategory ? "⏳" : "➕ Crear"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN: ORDEN DE PRODUCTOS */}
            {activeSection === "order" && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", padding: "24px", marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px 0" }}>📋 Orden de Productos</h2>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
                  Arrastrá los productos o usá las flechas ↑↓ para reordenarlos dentro de cada categoría.
                </p>
                {[...productsByCategory.entries()]
                  .sort(([a], [b]) => {
                    const orderA = categories.find(c => c.name === a)?.sortOrder ?? 0;
                    const orderB = categories.find(c => c.name === b)?.sortOrder ?? 0;
                    return orderA - orderB || a.localeCompare(b);
                  })
                  .map(([catName, catProducts]) => {
                    const sorted = [...catProducts].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
                    const isExpanded = expandedCategories.has(catName);
                    return (
                      <div key={catName} style={{
                        marginBottom: 16, border: "1px solid #E8E8E8", borderRadius: 10, overflow: "hidden",
                      }}>
                        <button
                          onClick={() => toggleCategory(catName)}
                          style={{
                            width: "100%", padding: "12px 16px", border: "none",
                            background: "#F9F9F9", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            borderBottom: isExpanded ? "1px solid #E8E8E8" : "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 16 }}>{isExpanded ? "▼" : "▶"}</span>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{catName}</span>
                            <span style={{
                              fontSize: 11, color: "#999", background: "#E8E8E8",
                              padding: "2px 8px", borderRadius: 10,
                            }}>
                              {catProducts.length} productos
                            </span>
                          </div>
                        </button>
                        {isExpanded && (
                          <div style={{ background: "#fff" }}>
                            {sorted.map((product, idx) => (
                              <div
                                key={product.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, product.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, product.id, catName)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 10,
                                  padding: "10px 16px",
                                  borderBottom: idx < sorted.length - 1 ? "1px solid #F8F8F8" : "none",
                                  cursor: "grab",
                                  background: draggedProduct === product.id ? "#E8F0FF" : "#fff",
                                  opacity: draggedProduct === product.id && draggedProduct !== product.id ? 0.5 : 1,
                                }}
                              >
                                <span style={{ fontSize: 14, color: "#CCC", cursor: "grab" }}>⠿</span>
                                <div style={{
                                  width: 24, height: 24, borderRadius: 4, background: "#F0F0F0",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 11, fontWeight: 700, color: "#999",
                                }}>
                                  {product.sortOrder}
                                </div>
                                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
                                  {product.name}
                                </div>
                                <div style={{ fontSize: 11, color: "#999" }}>
                                  {product.code}
                                </div>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button
                                    onClick={() => handleMoveProduct(product.id, "up")}
                                    disabled={idx === 0}
                                    style={{
                                      width: 28, height: 28, borderRadius: 6,
                                      border: "1px solid #E8E8E8", background: idx === 0 ? "#F8F8F8" : "#fff",
                                      cursor: idx === 0 ? "not-allowed" : "pointer",
                                      fontSize: 12, fontWeight: 700, color: idx === 0 ? "#CCC" : "#666",
                                    }}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick={() => handleMoveProduct(product.id, "down")}
                                    disabled={idx === sorted.length - 1}
                                    style={{
                                      width: 28, height: 28, borderRadius: 6,
                                      border: "1px solid #E8E8E8",
                                      background: idx === sorted.length - 1 ? "#F8F8F8" : "#fff",
                                      cursor: idx === sorted.length - 1 ? "not-allowed" : "pointer",
                                      fontSize: 12, fontWeight: 700,
                                      color: idx === sorted.length - 1 ? "#CCC" : "#666",
                                    }}
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* SECCIÓN: CONFIGURACIÓN */}
            {activeSection === "settings" && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", padding: "24px", marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px 0" }}>⚙️ Configuración General</h2>

                {/* Teléfono del vendedor */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Teléfono de WhatsApp</h3>
                  <p style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                    Número al que los clientes enviarán sus pedidos por WhatsApp.
                  </p>
                  <p style={{ fontSize: 11, color: "#999", marginBottom: 12, fontStyle: "italic" }}>
                    Formato requerido: solo números, sin espacios ni guiones. Ejemplo: 5491136996026 (código país + código área + número)
                  </p>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                    <div style={{ flex: 1, maxWidth: 300 }}>
                      <Input
                        label="Número de teléfono"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        placeholder="ej: 5491136996026"
                      />
                    </div>
                    <Button
                      variant="success"
                      onClick={async () => {
                        setIsSavingPhone(true);
                        const ok = await updateSellerPhone(phoneInput.trim());
                        if (ok) showSuccess("Teléfono actualizado");
                        else setErrorMsg("Error al guardar el teléfono");
                        setIsSavingPhone(false);
                      }}
                      disabled={isSavingPhone || phoneInput === sellerPhone}
                    >
                      {isSavingPhone ? "⏳" : "✓ Guardar"}
                    </Button>
                  </div>
                
                </div>
              </div>
            )}

            {/* SECCIÓN: IMPORTAR EXCEL */}
            {activeSection === "import" && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", padding: "24px", marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px 0" }}>📥 Importar Productos desde Excel</h2>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
                  Subí un archivo Excel con los productos. El sistema detecta duplicados por código y los salta automáticamente.
                </p>

                {/* Categoría global */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                    CATEGORÍA PARA LOS PRODUCTOS IMPORTADOS
                  </label>
                  <select
                    value={excelCategory}
                    onChange={e => {
                      if (e.target.value === "__new__") {
                        const name = prompt("Nombre de la nueva categoría:");
                        if (name && name.trim()) setExcelCategory(name.trim().toLowerCase());
                      } else {
                        setExcelCategory(e.target.value);
                      }
                    }}
                    style={{
                      width: "100%", maxWidth: 400, padding: "9px 12px", borderRadius: 8,
                      border: "1.5px solid #E8E8E8", fontSize: 13, background: "#fff", outline: "none",
                    }}
                  >
                    <option value="">Usar categoría del archivo</option>
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                    <option value="__new__">+ Crear nueva categoría</option>
                  </select>
                </div>

                {/* Upload */}
                <div style={{ marginBottom: 20 }}>
                  <input
                    ref={excelFileRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) parseExcelFile(file);
                    }}
                    style={{ display: "none" }}
                  />
                  <button
                    onClick={() => excelFileRef.current?.click()}
                    style={{
                      padding: "12px 24px", borderRadius: 10,
                      border: "2px dashed #E8E8E8", background: "#FAFAFA",
                      cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#666",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    📁 Seleccionar archivo Excel (.xlsx, .xls, .csv)
                  </button>
                </div>

                {/* Resultado de importación */}
                {importResult && (
                  <div style={{
                    padding: "16px 20px", borderRadius: 10, marginBottom: 20,
                    background: importResult.error ? "#FCE8E6" : "#E8F8EF",
                    border: `1px solid ${importResult.error ? "#EF9A9A" : "#6DCCA0"}`,
                    color: importResult.error ? "#C62828" : "#0F6E56",
                    fontWeight: 600, fontSize: 13,
                  }}>
                    {importResult.error ? (
                      `⚠️ ${importResult.error}`
                    ) : (
                      <div>
                        <div style={{ marginBottom: 8 }}>✅ Importación completada</div>
                        <div style={{ fontSize: 12, fontWeight: 400 }}>
                          • Importados: <strong>{importResult.imported}</strong> productos nuevos<br />
                          • Saltados: <strong>{importResult.skipped}</strong> duplicados<br />
                          • Total en archivo: <strong>{importResult.total}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Preview de productos a importar */}
                {excelData.length > 0 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>
                        Vista previa ({excelData.length} productos)
                      </h3>
                      <Button
                        variant="success"
                        onClick={handleImportExcel}
                        disabled={isImporting || excelData.every(p => p.isDuplicate)}
                      >
                        {isImporting ? "⏳ Importando..." : `📥 Importar ${excelData.filter(p => !p.isDuplicate).length} productos nuevos`}
                      </Button>
                    </div>

                    <div style={{ border: "1px solid #E8E8E8", borderRadius: 10, overflow: "hidden", maxHeight: 500, overflowY: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: "#F9F9F9", borderBottom: "2px solid #E8E8E8", position: "sticky", top: 0 }}>
                            <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700 }}>Estado</th>
                            <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700 }}>Código</th>
                            <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700 }}>Artículo</th>
                            <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700 }}>Medidas</th>
                            <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700 }}>Categoría</th>
                            <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>30u.</th>
                            <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>120u.</th>
                            <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>500u.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {excelData.map((item, idx) => (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: "1px solid #F0F0F0",
                                background: item.isDuplicate ? "#FFF8E1" : "#fff",
                                opacity: item.isDuplicate ? 0.6 : 1,
                              }}
                            >
                              <td style={{ padding: "8px 12px" }}>
                                {item.isDuplicate ? (
                                  <span style={{ color: "#E65100", fontWeight: 600 }}>🔄 Duplicado</span>
                                ) : (
                                  <span style={{ color: "#2E7D32", fontWeight: 600 }}>✅ Nuevo</span>
                                )}
                              </td>
                              <td style={{ padding: "8px 12px", fontWeight: 600, fontFamily: "monospace", fontSize: 11 }}>
                                {item.codigos}
                              </td>
                              <td style={{ padding: "8px 12px" }}>{item.articulo}</td>
                              <td style={{ padding: "8px 12px", color: "#666" }}>{item.medidas}</td>
                              <td style={{ padding: "8px 12px" }}>
                                <span style={{
                                  background: "#F0F0F0", padding: "2px 8px", borderRadius: 4,
                                  fontSize: 11, fontWeight: 600,
                                }}>
                                  {excelCategory || item.categoria}
                                </span>
                              </td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>
                                {formatPrice(item.precio_30_unidades)}
                              </td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>
                                {formatPrice(item.precio_120_unidades)}
                              </td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>
                                {formatPrice(item.precio_500_unidades)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN: PRODUCTOS (SIDEBAR + EDITOR) */}
            {activeSection === "products" && (
              <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
                {/* Sidebar */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0", overflow: "hidden" }}>
                  <div style={{ background: "#F9F9F9", padding: "12px 16px", borderBottom: "1px solid #F0F0F0" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                      PRODUCTOS ({products.filter(p => p.active).length})
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                          width: "100%", padding: "8px 12px 8px 32px",
                          borderRadius: 8, border: "1.5px solid #E8E8E8",
                          fontSize: 12, outline: "none", background: "#fff",
                        }}
                      />
                      <span style={{
                        position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                        fontSize: 13, color: "#999",
                      }}>
                        🔍
                      </span>
                    </div>
                  </div>
                  <div style={{ maxHeight: "540px", overflowY: "auto" }}>
                    {products
                      .filter(p => p.active)
                      .filter(p => {
                        if (!searchTerm) return true;
                        const term = searchTerm.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(term) ||
                          p.code.toLowerCase().includes(term) ||
                          p.cat.toLowerCase().includes(term)
                        );
                      })
                      .map(product => (
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
                            {product.code} · [{product.cat}]
                          </div>
                        </button>
                      ))
                    }
                  </div>
                </div>

                {/* Editor de producto */}
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

                    {/* Editar imágenes */}
                    <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 24, marginBottom: 24 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Imágenes del Producto</h3>
                      <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
                        Subí múltiples imágenes. La primera será la imagen principal. Arrastrá para reordenar.
                      </p>
                      <MultiImageUploader
                        images={selectedProduct.images || (selectedProduct.imageUrl ? [selectedProduct.imageUrl] : [])}
                        onChange={(newImages) => handleUpdateImages(newImages)}
                        disabled={isSavingImage}
                      />
                      {isSavingImage && (
                        <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>⏳ Guardando imágenes...</div>
                      )}
                    </div>

                    {/* Variantes por código separado por coma */}
                    {selectedProductCodes.length > 1 && (
                      <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 24, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Imágenes por Variante</h3>
                        <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
                          Este producto tiene múltiples códigos. Subí una imagen específica para cada variante.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                          {selectedProductCodes.map((code) => (
                            <div key={code} style={{
                              padding: "16px", borderRadius: 10,
                              border: "1px solid #E8E8E8", background: "#F9F9F9",
                            }}>
                              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                                📷 {code.trim()}
                              </div>
                              <MultiImageUploader
                                images={selectedProduct.variantImages?.[code.trim()] || []}
                                onChange={(newImages) => handleUpdateVariantImages(code.trim(), newImages)}
                                disabled={isSavingImage}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Variantes reales (variante_de) */}
                    {variantsOfSelected.length > 0 && (
                      <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 24, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Imágenes por Variante</h3>
                        <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
                          Cada variante (color/modelo) puede tener sus propias imágenes. Hacé clic en una variante para editar sus imágenes.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {variantsOfSelected.map((v) => (
                            <div
                              key={v.id}
                              onClick={() => setSelectedProductId(v.id)}
                              style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "10px 14px", borderRadius: 8,
                                border: selectedProductId === v.id ? "1.5px solid #1a1a1a" : "1px solid #E8E8E8",
                                background: selectedProductId === v.id ? "#E8F0FF" : "#F9F9F9",
                                cursor: "pointer", transition: "all 0.15s",
                              }}
                            >
                              <div style={{
                                width: 40, height: 40, borderRadius: 6, overflow: "hidden",
                                background: "#fff", border: "1px solid #E8E8E8",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                {(v.images && v.images.length > 0) || v.imageUrl ? (
                                  <img
                                    src={(v.images && v.images[0]) || v.imageUrl}
                                    alt={v.code}
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                  />
                                ) : (
                                  <span style={{ fontSize: 18 }}>📷</span>
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 700 }}>{v.code}</div>
                                <div style={{ fontSize: 11, color: "#999" }}>
                                  {(v.images || []).length} imágenes
                                </div>
                              </div>
                              <span style={{ fontSize: 12, color: "#999" }}>→</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Editar variante */}
                    <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 24, marginBottom: 24 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Variante / Color</h3>
                      <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
                        Si este producto es una variante de otro (mismo modelo, distinto color), seleccioná el producto base.
                      </p>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                            ES VARIANTE DE
                          </label>
                          <select
                            value={editVarianteDe}
                            onChange={e => setEditVarianteDe(e.target.value)}
                            style={selectStyle}
                          >
                            <option value="">No es variante (producto base)</option>
                            {baseProducts.filter(p => p.id !== selectedProductId).map(p => (
                              <option key={p.id} value={p.code}>{p.code} - {p.name}</option>
                            ))}
                          </select>
                        </div>
                        <Button variant="success" onClick={handleSaveVariante} disabled={isSavingVariante}>
                          {isSavingVariante ? "⏳" : "✓ Guardar"}
                        </Button>
                      </div>
                      {selectedProduct.varianteDe && (
                        <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
                          Actualmente es variante de: <strong>{selectedProduct.varianteDe}</strong>
                        </div>
                      )}
                    </div>

                    {/* Editar categoría */}
                    <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 24, marginBottom: 24 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Categoría</h3>
                      <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
                        Seleccioná la categoría a la que pertenece este producto.
                      </p>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                            CATEGORÍA
                          </label>
                          <select
                            value={editCategory}
                            onChange={e => {
                              if (e.target.value === "__new__") {
                                const name = prompt("Nombre de la nueva categoría:");
                                if (name && name.trim()) {
                                  const val = name.trim().toLowerCase();
                                  setEditCategory(val);
                                }
                              } else {
                                setEditCategory(e.target.value);
                              }
                            }}
                            style={selectStyle}
                          >
                            {categories.map((c) => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                            <option value="__new__">+ Crear nueva categoría</option>
                          </select>
                        </div>
                        <Button variant="success" onClick={handleSaveCategory} disabled={isSavingCategory}>
                          {isSavingCategory ? "⏳" : "✓ Guardar"}
                        </Button>
                      </div>
                      <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
                        Actual: <strong>{selectedProduct.cat}</strong>
                      </div>
                    </div>

                    {/* Precios */}
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

                    {/* Tabla de referencia */}
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
                    <div style={{ fontSize: 14 }}>Selecciona un producto para editar</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
