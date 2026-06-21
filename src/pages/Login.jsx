// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Redirigir al admin tras login exitoso
      window.location.hash = "#/admin";
      window.location.reload();
    } catch (err) {
      console.error("Error de login:", err);
      if (err.message.includes("Invalid login")) {
        setError("Email o contraseña incorrectos");
      } else if (err.message.includes("Email not confirmed")) {
        setError("El email no fue confirmado. Revisa tu bandeja de entrada.");
      } else {
        setError("Error al iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      fontFamily: "system-ui, sans-serif",
      background: "#FAFAFA",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #F0F0F0",
        padding: "40px 32px",
        width: "100%",
        maxWidth: 380,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px 0" }}>
            Panel Admin
          </h1>
          <p style={{ fontSize: 13, color: "#999", margin: 0 }}>
            Cover Up Home - Mayorista
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#FCE8E6",
            border: "1px solid #EF9A9A",
            color: "#C62828",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@coverup.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #E8E8E8",
                fontSize: 14,
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}>
              CONTRASEÑA
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #E8E8E8",
                fontSize: 14,
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: loading ? "#999" : "#1a1a1a",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.opacity = "1"; }}
          >
            {loading ? "⏳ Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Volver al catálogo */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a
            href="#/"
            style={{
              fontSize: 13,
              color: "#999",
              textDecoration: "none",
            }}
          >
            ← Volver al catálogo
          </a>
        </div>
      </div>
    </div>
  );
}
