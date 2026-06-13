// src/App.jsx
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import CatalogoCoverUp from "./pages/CatalogoCoverUp";
import AdminPricing from "./pages/AdminPricing";

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/"       element={<CatalogoCoverUp />} />
          <Route path="/admin"  element={<AdminPricing />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
