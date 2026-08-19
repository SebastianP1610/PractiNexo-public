import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchDependencias } from "../api/dependencias";
import { deleteOferta, fetchOfertas, updateOferta } from "../api/ofertas";
import { getApiErrorMessage } from "../api/httpError";
import toast from "react-hot-toast";
import "./GestionarOfertas.css";

const PAGE_SIZE = 20;
const ESTADOS = ["todas", "ACTIVA", "INACTIVA", "CERRADA", "VENCIDA"];
const ESTADO_LABEL = {
  todas: "Todas",
  ACTIVA: "Activa",
  INACTIVA: "Inactiva",
  CERRADA: "Cerrada",
  VENCIDA: "Vencida",
};

function formatearFecha(iso) {
  if (!iso) return "Sin cierre";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Fecha inválida";
  return d.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildParams(filtros, page) {
  const params = { page, limit: PAGE_SIZE };
  if (filtros.estadoVigencia && filtros.estadoVigencia !== "todas") {
    params.estadoVigencia = filtros.estadoVigencia;
  }
  if (filtros.tipo) params.tipo = filtros.tipo;
  if (filtros.dependenciaId) params.dependencia = filtros.dependenciaId;
  return params;
}

function GestionarOfertas() {
  const navigate = useNavigate();
  const [dependencias, setDependencias] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({
    estadoVigencia: "todas",
    tipo: "",
    dependenciaId: "",
    q: "",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [estadoCambiandoId, setEstadoCambiandoId] = useState("");

  const loadDatos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rOf, rDeps] = await Promise.allSettled([
        fetchOfertas(buildParams(filtros, page)),
        fetchDependencias(),
      ]);

      if (rOf.status === "fulfilled") {
        const result = rOf.value;
        if (result && typeof result === "object" && !Array.isArray(result) && Array.isArray(result.data)) {
          setOfertas(result.data);
          setTotal(result.total || 0);
          setTotalPages(result.pages || 1);
        } else {
          setOfertas(Array.isArray(result) ? result : []);
          setTotal(Array.isArray(result) ? result.length : 0);
          setTotalPages(1);
        }
      } else {
        setError(getApiErrorMessage(rOf.reason, "No se pudieron cargar las ofertas."));
        setOfertas([]);
      }

      if (rDeps.status === "fulfilled") {
        setDependencias(Array.isArray(rDeps.value) ? rDeps.value : []);
      } else {
        setDependencias([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filtros, page]);

  useEffect(() => {
    loadDatos();
  }, [loadDatos]);

  useEffect(() => {
    setPage(1);
  }, [filtros.estadoVigencia, filtros.tipo, filtros.dependenciaId]);

  const onFilterChange = (name, value) => {
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({ estadoVigencia: "todas", tipo: "", dependenciaId: "", q: "" });
    setPage(1);
  };

  const hayFiltros =
    filtros.estadoVigencia !== "todas" ||
    filtros.tipo ||
    filtros.dependenciaId ||
    filtros.q.trim();

  const q = filtros.q.trim().toLowerCase();
  const ofertasVisibles = q
    ? ofertas.filter((o) => (o.titulo || "").toLowerCase().includes(q))
    : ofertas;

  const irEditar = (o) => {
    navigate(`/admin/crear-oferta?edit=${o._id}`);
  };

  const handleDeleteOne = async (o) => {
    setDeletingId(o._id);
    try {
      const res = await deleteOferta(o._id);
      toast.success(res?.mensaje || "Oferta eliminada correctamente.");
      await loadDatos();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo eliminar la oferta."));
    } finally {
      setDeletingId("");
      setDeleteConfirmId("");
    }
  };

  const handleEstadoChange = async (o, nuevoEstado) => {
    if (!nuevoEstado || nuevoEstado === o.estadoVigencia) return;
    setEstadoCambiandoId(o._id);
    try {
      const res = await updateOferta(o._id, { estadoVigencia: nuevoEstado });
      toast.success(res?.mensaje || "Estado actualizado correctamente.");
      setOfertas((prev) =>
        prev.map((it) => (it._id === o._id ? { ...it, estadoVigencia: nuevoEstado } : it)),
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo cambiar el estado."));
    } finally {
      setEstadoCambiandoId("");
    }
  };

  const handleBulkDeleteVencidas = async () => {
    setBulkRunning(true);
    try {
      let pagina = 1;
      let borradas = 0;
      let fallidas = 0;
      let seguir = true;
      while (seguir && pagina <= 50) {
        const result = await fetchOfertas({ estadoVigencia: "VENCIDA", page: pagina, limit: PAGE_SIZE });
        const data = Array.isArray(result) ? result : result?.data || [];
        if (!data.length) break;
        const resultados = await Promise.allSettled(data.map((o) => deleteOferta(o._id)));
        borradas += resultados.filter((r) => r.status === "fulfilled").length;
        fallidas += resultados.filter((r) => r.status === "rejected").length;
        const totalPaginas = Array.isArray(result) ? 1 : result?.pages || 1;
        if (pagina >= totalPaginas) seguir = false;
        pagina += 1;
      }
      if (borradas > 0) {
        toast.success(`Se eliminaron ${borradas} oferta(s) vencida(s).`);
      }
      if (fallidas > 0) {
        toast.error(`No se pudieron eliminar ${fallidas} oferta(s).`);
      }
      if (borradas === 0 && fallidas === 0) {
        toast("No había ofertas vencidas para eliminar.");
      }
      await loadDatos();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo completar el borrado en lote."));
    } finally {
      setBulkRunning(false);
      setBulkConfirm(false);
    }
  };

  return (
    <div className="gestionar-page">
      <header className="gestionar-header">
        <div>
          <h1 className="gestionar-title">Gestionar ofertas</h1>
          <p className="gestionar-sub">
            {total} oferta{total !== 1 ? "s" : ""} en la consulta.
          </p>
        </div>
        <div className="gestionar-header-actions">
          <button
            type="button"
            className="gestionar-btn gestionar-btn--ghost"
            onClick={loadDatos}
            disabled={loading || bulkRunning}
          >
            Refrescar
          </button>
          <Link to="/admin/crear-oferta" className="gestionar-btn gestionar-btn--primary">
            Crear oferta
          </Link>
          {bulkConfirm ? (
            <span className="gestionar-bulk-confirm" role="alert">
              <span>¿Eliminar todas las vencidas?</span>
              <button
                type="button"
                className="gestionar-btn gestionar-btn--danger"
                onClick={handleBulkDeleteVencidas}
                disabled={bulkRunning}
              >
                {bulkRunning ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button
                type="button"
                className="gestionar-btn gestionar-btn--ghost"
                onClick={() => setBulkConfirm(false)}
                disabled={bulkRunning}
              >
                Cancelar
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="gestionar-btn gestionar-btn--danger"
              onClick={() => setBulkConfirm(true)}
              disabled={bulkRunning || loading}
            >
              Eliminar vencidas en lote
            </button>
          )}
        </div>
      </header>

      {error ? <p className="gestionar-banner gestionar-banner--err" role="alert">{error}</p> : null}

      <section className="gestionar-filtros" aria-label="Filtros de ofertas">
        <label className="gestionar-field">
          <span>Estado</span>
          <select
            name="estadoVigencia"
            value={filtros.estadoVigencia}
            onChange={(e) => onFilterChange("estadoVigencia", e.target.value)}
          >
            {ESTADOS.map((est) => (
              <option key={est} value={est}>
                {ESTADO_LABEL[est]}
              </option>
            ))}
          </select>
        </label>

        <label className="gestionar-field">
          <span>Tipo</span>
          <select
            name="tipo"
            value={filtros.tipo}
            onChange={(e) => onFilterChange("tipo", e.target.value)}
          >
            <option value="">Todos</option>
            <option value="PRACTICA">Práctica</option>
            <option value="SERVICIO_SOCIAL">Servicio social</option>
          </select>
        </label>

        <label className="gestionar-field">
          <span>Dependencia</span>
          <select
            name="dependenciaId"
            value={filtros.dependenciaId}
            onChange={(e) => onFilterChange("dependenciaId", e.target.value)}
          >
            <option value="">Todas</option>
            {dependencias.map((d) => (
              <option key={d._id} value={d._id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="gestionar-field gestionar-field--grow">
          <span>Buscar por título</span>
          <input
            type="search"
            placeholder="Filtra los títulos de esta página"
            value={filtros.q}
            onChange={(e) => setFiltros((prev) => ({ ...prev, q: e.target.value }))}
          />
        </label>

        {hayFiltros ? (
          <button type="button" className="gestionar-btn gestionar-btn--ghost" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        ) : null}
      </section>

      <div className="gestionar-table-wrap">
        {loading && ofertasVisibles.length === 0 ? (
          <p className="gestionar-empty">Cargando ofertas…</p>
        ) : ofertasVisibles.length === 0 ? (
          <p className="gestionar-empty">No hay ofertas con los filtros seleccionados.</p>
        ) : (
          <table className="gestionar-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Dependencia</th>
                <th>Estado</th>
                <th>Fecha de cierre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ofertasVisibles.map((o) => {
                const depNombre =
                  typeof o.dependenciaId === "object" ? o.dependenciaId?.nombre : null;
                return (
                  <tr key={o._id}>
                    <td className="gestionar-cell-titulo">
                      <strong>{o.titulo}</strong>
                      <span className="gestionar-cell-fecha">
                        Publicada {formatearFecha(o.fechaPublicacion)}
                      </span>
                    </td>
                    <td>{o.tipoOportunidad === "PRACTICA" ? "Práctica" : "Servicio social"}</td>
                    <td>{depNombre || "—"}</td>
                    <td>
                      <select
                        className="gestionar-estado-select"
                        value={o.estadoVigencia}
                        disabled={estadoCambiandoId === o._id}
                        onChange={(e) => handleEstadoChange(o, e.target.value)}
                        aria-label={`Estado de ${o.titulo}`}
                      >
                        <option value="ACTIVA">Activa</option>
                        <option value="INACTIVA">Inactiva</option>
                        <option value="CERRADA">Cerrada</option>
                        <option value="VENCIDA">Vencida</option>
                      </select>
                    </td>
                    <td>{formatearFecha(o.fechaCierre)}</td>
                    <td className="gestionar-cell-acciones">
                      <button
                        type="button"
                        className="gestionar-btn gestionar-btn--ghost"
                        onClick={() => irEditar(o)}
                        disabled={deletingId === o._id}
                      >
                        Editar
                      </button>
                      {deleteConfirmId === o._id ? (
                        <button
                          type="button"
                          className="gestionar-btn gestionar-btn--danger"
                          onClick={() => handleDeleteOne(o)}
                          disabled={!!deletingId}
                        >
                          {deletingId === o._id ? "Eliminando…" : "¿Confirmar?"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="gestionar-btn gestionar-btn--danger"
                          onClick={() => setDeleteConfirmId(o._id)}
                          disabled={!!deletingId}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 ? (
        <nav className="gestionar-pagination" aria-label="Paginación">
          <button
            type="button"
            className="gestionar-page-btn"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`gestionar-page-btn ${p === page ? "is-active" : ""}`}
              disabled={loading}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="gestionar-page-btn"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente →
          </button>
        </nav>
      ) : null}
    </div>
  );
}

export default GestionarOfertas;