import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchReporteOfertas, fetchReporteOfertasCsv } from "../api/reportes";
import { getApiErrorMessage } from "../api/httpError";
import "./ReporteOfertas.css";

const ESTADOS = ['ACTIVA', 'INACTIVA', 'CERRADA', 'VENCIDA', 'Sin datos'];
const TIPOS = ['PRACTICA', 'SERVICIO_SOCIAL', 'Sin datos'];

function BarraProgreso({ valor, max }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div className="reporte-bar-track">
      <div className="reporte-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function ReporteOfertas() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadReporte = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReporteOfertas();
      setStats(data);
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo generar el reporte de ofertas."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReporte();
  }, [loadReporte]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await fetchReporteOfertasCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte-ofertas.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV exportado correctamente.");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "No se pudo exportar el CSV."));
    } finally {
      setExporting(false);
    }
  };

  const maxEstado = stats ? Math.max(...Object.values(stats.porEstado || {}), 0) : 0;
  const maxTipo = stats ? Math.max(...Object.values(stats.porTipo || {}), 0) : 0;
  const maxDep = stats && stats.dependenciasOrdenadas?.length
    ? stats.dependenciasOrdenadas[0].cantidad
    : 0;

  return (
    <div className="reporte-page">
      <header className="reporte-header">
        <div>
          <h1 className="reporte-title">Reporte de ofertas</h1>
          <p className="reporte-sub">
            Resumen estadístico de las ofertas por estado, tipo de oportunidad y dependencia.
          </p>
        </div>
        <button
          type="button"
          className="reporte-btn reporte-btn--primary"
          onClick={handleExportCsv}
          disabled={exporting || loading}
        >
          {exporting ? "Exportando…" : "Exportar CSV"}
        </button>
      </header>

      {error ? <p className="reporte-banner reporte-banner--err" role="alert">{error}</p> : null}

      {loading ? (
        <p className="reporte-muted">Generando reporte…</p>
      ) : stats ? (
        <>
          <section className="reporte-kpi-row">
            <div className="reporte-kpi">
              <span className="reporte-kpi-value">{stats.total}</span>
              <span className="reporte-kpi-label">Total de ofertas</span>
            </div>
            <div className="reporte-kpi">
              <span className="reporte-kpi-value">{stats.porEstado?.ACTIVA || 0}</span>
              <span className="reporte-kpi-label">Ofertas activas</span>
            </div>
            <div className="reporte-kpi">
              <span className="reporte-kpi-value">{stats.porTipo?.PRACTICA || 0}</span>
              <span className="reporte-kpi-label">Prácticas</span>
            </div>
            <div className="reporte-kpi">
              <span className="reporte-kpi-value">{stats.porTipo?.SERVICIO_SOCIAL || 0}</span>
              <span className="reporte-kpi-label">Servicio social</span>
            </div>
          </section>

          <section className="reporte-card">
            <h2 className="reporte-card-title">Por estado de vigencia</h2>
            <div className="reporte-chart">
              {ESTADOS.filter((e) => stats.porEstado?.[e] > 0).map((estado) => (
                <div key={estado} className="reporte-chart-row">
                  <span className="reporte-chart-label">{estado}</span>
                  <BarraProgreso valor={stats.porEstado[estado]} max={maxEstado} />
                  <span className="reporte-chart-value">{stats.porEstado[estado]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="reporte-card">
            <h2 className="reporte-card-title">Por tipo de oportunidad</h2>
            <div className="reporte-chart">
              {TIPOS.filter((t) => stats.porTipo?.[t] > 0).map((tipo) => (
                <div key={tipo} className="reporte-chart-row">
                  <span className="reporte-chart-label">{tipo}</span>
                  <BarraProgreso valor={stats.porTipo[tipo]} max={maxTipo} />
                  <span className="reporte-chart-value">{stats.porTipo[tipo]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="reporte-card">
            <h2 className="reporte-card-title">Por dependencia</h2>
            {stats.dependenciasOrdenadas?.length === 0 ? (
              <p className="reporte-muted">No hay datos de dependencias.</p>
            ) : (
              <div className="reporte-chart">
                {stats.dependenciasOrdenadas.map((dep) => (
                  <div key={dep.nombre} className="reporte-chart-row">
                    <span className="reporte-chart-label">{dep.nombre}</span>
                    <BarraProgreso valor={dep.cantidad} max={maxDep} />
                    <span className="reporte-chart-value">{dep.cantidad}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default ReporteOfertas;
