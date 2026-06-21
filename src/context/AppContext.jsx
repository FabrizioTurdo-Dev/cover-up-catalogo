// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { sanitizeImageUrl } from "../utils/sanitize";

const AppContext = createContext(null);

function mapSupabaseProduct(dbItem) {
  return {
    id: dbItem.id,
    code: dbItem.codigos,
    name: dbItem.articulo,
    cat: dbItem.categoria ? dbItem.categoria.toLowerCase() : "organizadores",
    details: dbItem.medidas ? `Medida: ${dbItem.medidas}` : "",
    active: true,
    emoji: "📦",
    imageUrl: sanitizeImageUrl(dbItem.image),
    basePrices: [dbItem.precio_30_unidades, dbItem.precio_120_unidades, dbItem.precio_500_unidades],
    tiers: [
      { min: 30, max: 119 },
      { min: 120, max: 499 },
      { min: 500, max: 9999 },
    ],
  };
}

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceConfig, setPriceConfig] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from("cover_up")
        .select("*")
        .order("id", { ascending: true });

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
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
