import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchReportePostulaciones, fetchReportePostulacionesCsv } from "../api/reportes";
import { getApiErrorMessage } from "../api/httpError";
import "./ReporteOfertas.css";

const ESTADOS = ['PENDIENTE', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'Sin datos'];

function BarraProgreso({ valor, max }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div className="reporte-bar-track">
      <div className="reporte-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function ReportePostulaciones() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadReporte = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReportePostulaciones();
      setStats(data);
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo generar el reporte de postulaciones."));
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
      const blob = await fetchReportePostulacionesCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte-postulaciones.csv";
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
  const maxEst = stats && stats.estudiantesOrdenados?.length
    ? stats.estudiantesOrdenados[0].cantidad
    : 0;
  const maxOferta = stats && stats.ofertasOrdenadas?.length
    ? stats.ofertasOrdenadas[0].cantidad
    : 0;

  return (
    <div className="reporte-page">
      <header className="reporte-header">
        <div>
          <h1 className="reporte-title">Reporte de postulaciones</h1>
          <p className="reporte-sub">
            Resumen estadístico de postulaciones por estado, estudiante y oferta.
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
              <span className="reporte-kpi-label">Total postulaciones</span>
            </div>
            <div className="reporte-kpi">
              <span className="reporte-kpi-value">{stats.porEstado?.PENDIENTE || 0}</span>
              <span className="reporte-kpi-label">Pendientes</span>
            </div>
            <div className="reporte-kpi">
              <span className="reporte-kpi-value">{stats.porEstado?.ACEPTADA || 0}</span>
              <span className="reporte-kpi-label">Aceptadas</span>
            </div>
            <div className="reporte-kpi">
              <span className="reporte-kpi-value">{stats.tasaAceptacion}%</span>
              <span className="reporte-kpi-label">Tasa de aceptación</span>
            </div>
          </section>

          <section className="reporte-card">
            <h2 className="reporte-card-title">Por estado</h2>
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
            <h2 className="reporte-card-title">Top estudiantes</h2>
            {stats.estudiantesOrdenados?.length === 0 ? (
              <p className="reporte-muted">No hay datos de estudiantes.</p>
            ) : (
              <div className="reporte-chart">
                {stats.estudiantesOrdenados.slice(0, 10).map((est) => (
                  <div key={est.nombre} className="reporte-chart-row">
                    <span className="reporte-chart-label">{est.nombre}</span>
                    <BarraProgreso valor={est.cantidad} max={maxEst} />
                    <span className="reporte-chart-value">{est.cantidad}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="reporte-card">
            <h2 className="reporte-card-title">Top ofertas</h2>
            {stats.ofertasOrdenadas?.length === 0 ? (
              <p className="reporte-muted">No hay datos de ofertas.</p>
            ) : (
              <div className="reporte-chart">
                {stats.ofertasOrdenadas.slice(0, 10).map((of) => (
                  <div key={of.titulo} className="reporte-chart-row">
                    <span className="reporte-chart-label">{of.titulo}</span>
                    <BarraProgreso valor={of.cantidad} max={maxOferta} />
                    <span className="reporte-chart-value">{of.cantidad}</span>
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

export default ReportePostulaciones;
