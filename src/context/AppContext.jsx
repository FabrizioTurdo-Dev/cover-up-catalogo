// src/context/AppContext.jsx
import { createContext, useContext, useState } from "react";
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from "../data/store";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders]     = useState(INITIAL_ORDERS);

  function addOrder(order) {
    setOrders(prev => [
      { ...order, id: Date.now(), date: new Date().toISOString().split("T")[0], status: "pendiente" },
      ...prev,
    ]);
  }

  return (
    <AppContext.Provider value={{ products, setProducts, orders, setOrders, addOrder }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
