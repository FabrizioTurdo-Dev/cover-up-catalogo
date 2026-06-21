// src/components/ErrorBoundary.jsx
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary capturó:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          fontFamily: "system-ui, sans-serif",
          padding: "40px 20px",
          textAlign: "center",
          minHeight: "100vh",
          background: "#FAFAFA",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
            Algo salió mal
          </h1>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 20, maxWidth: 500 }}>
            {this.state.error?.message || "Error desconocido"}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "1.5px solid #1a1a1a",
              background: "#1a1a1a", color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
