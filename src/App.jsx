// src/App.jsx
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CatalogoCoverUp from "./pages/CatalogoCoverUp";
import AdminPricing from "./pages/AdminPricing";
import Login from "./pages/Login";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#666",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔐</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Verificando acceso...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<CatalogoCoverUp />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPricing />
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
}
