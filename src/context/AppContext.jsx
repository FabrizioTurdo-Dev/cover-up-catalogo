// src/context/AppContext.jsx
import { createContext, useContext, useState } from "react";
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from "../data/store";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  
  // Configuración de precios escalonados editable por admin
  const [priceConfig, setPriceConfig] = useState(() => {
    // Inicializar con los tiers por defecto de cada producto
    const config = {};
    INITIAL_PRODUCTS.forEach(p => {
      config[p.id] = {
        tiers: p.tiers,
        prices: p.basePrices,
      };
    });
    return config;
  });

  function addOrder(order) {
    setOrders(prev => [
      { ...order, id: Date.now(), date: new Date().toISOString().split("T")[0], status: "pendiente" },
      ...prev,
    ]);
  }

  function updatePriceConfig(productId, newTiers, newPrices) {
    setPriceConfig(prev => ({
      ...prev,
      [productId]: { tiers: newTiers, prices: newPrices }
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
      updatePriceConfig
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
