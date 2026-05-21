// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Catalogo from "./pages/Catalogo";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"       element={<Catalogo />} />
          <Route path="/admin"  element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
