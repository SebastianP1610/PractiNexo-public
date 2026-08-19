import { Component } from "react";
import toast, { Toaster } from "react-hot-toast";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (typeof console !== "undefined") {
      console.error("[ErrorBoundary]", error, info);
    }
    toast.error("Ocurrió un error inesperado. Recarga la página.");
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      return (
        <div
          role="alert"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            fontFamily: "Inter, Segoe UI, sans-serif",
            color: "#1e293b",
            background: "#f4f7fb",
          }}
        >
          <Toaster position="top-right" />
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Algo salió mal</h1>
          <p style={{ margin: 0, color: "#64748b" }}>
            La aplicación encontró un error inesperado.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                padding: "0.6rem 1.2rem",
                border: "1px solid #14629e",
                background: "transparent",
                color: "#14629e",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                padding: "0.6rem 1.2rem",
                border: "none",
                background: "#14629e",
                color: "#fff",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
