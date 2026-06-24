// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { sanitizeImageUrl } from "../utils/sanitize";

const AppContext = createContext(null);

function mapSupabaseProduct(dbItem) {
  let images = [];
  if (dbItem.images) {
    if (Array.isArray(dbItem.images)) {
      images = dbItem.images.filter(Boolean);
    } else if (typeof dbItem.images === "string") {
      try { images = JSON.parse(dbItem.images).filter(Boolean); } catch { images = []; }
    }
  }
  const mainImage = sanitizeImageUrl(dbItem.image);
  if (mainImage && !images.includes(mainImage)) {
    images.unshift(mainImage);
  }

  let variantImages = {};
  if (dbItem.variant_images) {
    if (typeof dbItem.variant_images === "object" && !Array.isArray(dbItem.variant_images)) {
      variantImages = dbItem.variant_images;
    } else if (typeof dbItem.variant_images === "string") {
      try { variantImages = JSON.parse(dbItem.variant_images); } catch { variantImages = {}; }
    }
  }

  return {
    id: dbItem.id,
    code: dbItem.codigos,
    name: dbItem.articulo,
    cat: dbItem.categoria ? dbItem.categoria.toLowerCase() : "organizadores",
    details: dbItem.medidas ? `Medida: ${dbItem.medidas}` : "",
    active: true,
    emoji: "📦",
    imageUrl: mainImage,
    images,
    variantImages,
    basePrices: [dbItem.precio_30_unidades, dbItem.precio_120_unidades, dbItem.precio_500_unidades],
    tiers: [
      { min: 30, max: 119 },
      { min: 120, max: 499 },
      { min: 500, max: 9999 },
    ],
    varianteDe: dbItem.variante_de || null,
    sortOrder: dbItem.sort_order ?? 0,
    categorySortOrder: dbItem.category_sort_order ?? 0,
  };
}

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceConfig, setPriceConfig] = useState({});
  const [sellerPhone, setSellerPhone] = useState(
    () => localStorage.getItem("sellerPhone") || "1154922800"
  );

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSettings();
  }, []);

  async function fetchProducts() {
    try {
      let data = null;
      let error = null;

      const result = await supabase
        .from("cover_up")
        .select("*")
        .order("category_sort_order", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      data = result.data;
      error = result.error;

      if (error) {
        console.warn("Query with sort columns failed, falling back to id order:", error.message);
        const fallback = await supabase
          .from("cover_up")
          .select("*")
          .order("id", { ascending: true });
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.error("Supabase error:", error.code, error.message);
        throw error;
      }

      const mapped = (data || []).map(mapSupabaseProduct);
      setProducts(mapped);

      const config = {};
      mapped.forEach((p) => {
        config[p.id] = { tiers: p.tiers, prices: p.basePrices };
      });
      setPriceConfig(config);
    } catch (err) {
      console.error("Error cargando catálogo:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.warn("Tabla 'orders' no existe todavía. Creadala desde Supabase Dashboard.");
          setOrders([]);
          return;
        }
        throw error;
      }
      setOrders(data || []);
    } catch (err) {
      console.error("Error cargando órdenes:", err.message);
      setOrders([]);
    }
  }

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "seller_phone")
        .single();

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.warn("Tabla 'settings' no existe. Usando valor de localStorage.");
          return;
        }
        if (error.code === "PGRST116") return;
        throw error;
      }
      if (data?.value) {
        setSellerPhone(data.value);
        localStorage.setItem("sellerPhone", data.value);
      }
    } catch (err) {
      console.error("Error cargando configuración:", err.message);
    }
  }

  async function updateSellerPhone(newPhone) {
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "seller_phone", value: newPhone }, { onConflict: "key" });

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.warn("Tabla 'settings' no existe. Guardando localmente.");
          localStorage.setItem("sellerPhone", newPhone);
          setSellerPhone(newPhone);
          return true;
        }
        throw error;
      }

      localStorage.setItem("sellerPhone", newPhone);
      setSellerPhone(newPhone);
      return true;
    } catch (err) {
      console.error("Error guardando teléfono:", err.message);
      localStorage.setItem("sellerPhone", newPhone);
      setSellerPhone(newPhone);
      return true;
    }
  }

  async function addOrder(order) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            client: order.client || "Cliente nuevo",
            phone: order.phone || null,
            items: order.items,
            total: order.total,
            status: "pendiente",
          }
        ])
        .select();

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.warn("Tabla 'orders' no existe. Guardando localmente.");
          setOrders((prev) => [
            { ...order, id: Date.now(), date: new Date().toISOString().split("T")[0], status: "pendiente" },
            ...prev,
          ]);
          return;
        }
        throw error;
      }

      if (data && data[0]) {
        setOrders((prev) => [data[0], ...prev]);
      }
    } catch (err) {
      console.error("Error guardando orden:", err.message);
      setOrders((prev) => [
        { ...order, id: Date.now(), date: new Date().toISOString().split("T")[0], status: "pendiente" },
        ...prev,
      ]);
    }
  }

  function updatePriceConfig(productId, newTiers, newPrices) {
    setPriceConfig((prev) => ({
      ...prev,
      [productId]: { tiers: newTiers, prices: newPrices },
    }));
  }

  async function updateProductSortOrder(productId, newSortOrder) {
    try {
      const { error } = await supabase
        .from("cover_up")
        .update({ sort_order: newSortOrder })
        .eq("id", productId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, sortOrder: newSortOrder } : p
        )
      );
      return true;
    } catch (err) {
      console.error("Error actualizando sort_order:", err.message);
      return false;
    }
  }

  async function updateCategorySortOrder(categoryName, newCategorySortOrder) {
    try {
      const { error } = await supabase
        .from("cover_up")
        .update({ category_sort_order: newCategorySortOrder })
        .eq("categoria", categoryName);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.cat === categoryName
            ? { ...p, categorySortOrder: newCategorySortOrder }
            : p
        )
      );
      return true;
    } catch (err) {
      console.error("Error actualizando category_sort_order:", err.message);
      return false;
    }
  }

  async function updateProductCategory(productId, newCategory) {
    try {
      const { error } = await supabase
        .from("cover_up")
        .update({ categoria: newCategory })
        .eq("id", productId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, cat: newCategory } : p
        )
      );
      return true;
    } catch (err) {
      console.error("Error actualizando categoría:", err.message);
      return false;
    }
  }

  async function updateProductImages(productId, images) {
    try {
      const { error } = await supabase
        .from("cover_up")
        .update({ images: JSON.stringify(images) })
        .eq("id", productId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return { ...p, images, imageUrl: images[0] || p.imageUrl };
        })
      );
      return true;
    } catch (err) {
      console.error("Error actualizando imágenes:", err.message);
      return false;
    }
  }

  async function updateProductVariantImages(productId, variantCode, images) {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return false;
      const newVariantImages = { ...(product.variantImages || {}), [variantCode]: images };
      const { error } = await supabase
        .from("cover_up")
        .update({ variant_images: JSON.stringify(newVariantImages) })
        .eq("id", productId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return { ...p, variantImages: newVariantImages };
        })
      );
      return true;
    } catch (err) {
      console.error("Error actualizando imágenes de variante:", err.message);
      return false;
    }
  }

  function getCategories() {
    const catMap = new Map();
    products.forEach((p) => {
      if (!catMap.has(p.cat)) {
        catMap.set(p.cat, p.categorySortOrder);
      }
    });
    return [...catMap.entries()]
      .map(([name, sortOrder]) => ({ name, sortOrder }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }

  return (
    <AppContext.Provider value={{
      products,
      setProducts,
      orders,
      setOrders,
      addOrder,
      priceConfig,
      updatePriceConfig,
      loading,
      fetchProducts,
      updateProductSortOrder,
      updateCategorySortOrder,
      updateProductCategory,
      updateProductImages,
      updateProductVariantImages,
      getCategories,
      sellerPhone,
      updateSellerPhone,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
