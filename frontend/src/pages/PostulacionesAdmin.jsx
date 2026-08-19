import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { fetchOfertas } from "../api/ofertas";
import {
  cambiarEstadoPostulacionAdmin,
  downloadHojaVidaPostulacion,
  fetchPostulacionesAdmin,
} from "../api/postulacionesAdmin";
import { getApiErrorMessage } from "../api/httpError";
import { descargarBlob } from "../utils/download";
import toast from "react-hot-toast";
import "./PostulacionesAdmin.css";

const PAGE_SIZE = 20;
const ESTADOS = ["todas", "PENDIENTE", "EN_REVISION", "ACEPTADA", "RECHAZADA", "CANCELADA"];
const ESTADO_LABEL = {
  todas: "Todas",
  PENDIENTE: "Pendiente",
  EN_REVISION: "En revisión",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
};
const ESTADO_CLASS = {
  PENDIENTE: "post-badge post-badge--pend",
  EN_REVISION: "post-badge post-badge--rev",
  ACEPTADA: "post-badge post-badge--ok",
  RECHAZADA: "post-badge post-badge--bad",
  CANCELADA: "post-badge post-badge--muted",
};

function formatearFecha(iso) {
  if (!iso) return "—";
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

function PostulacionesAdmin() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({ estado: "todas", ofertaId: "", q: "" });
  const [detalleId, setDetalleId] = useState("");
  const [accion, setAccion] = useState(null);
  const [procesandoId, setProcesandoId] = useState("");
  const [descargandoId, setDescargandoId] = useState("");
  const modalRef = useRef(null);
  const accionTriggerRef = useRef(null);

  const loadDatos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: PAGE_SIZE };
      if (filtros.estado !== "todas") params.estado = filtros.estado;
      if (filtros.ofertaId) params.ofertaId = filtros.ofertaId;

      const [rPost, rOfertas] = await Promise.allSettled([
        fetchPostulacionesAdmin(params),
        fetchOfertas({ limit: 50 }),
      ]);

      if (rPost.status === "fulfilled") {
        const result = rPost.value;
        const data = Array.isArray(result?.data) ? result.data : [];
        setPostulaciones(data);
        setTotal(result?.total ?? data.length);
        setTotalPages(result?.pages ?? 1);
      } else {
        setError(getApiErrorMessage(rPost.reason, "No se pudieron cargar las postulaciones."));
        setPostulaciones([]);
      }

      if (rOfertas.status === "fulfilled") {
        const ofResult = rOfertas.value;
        const ofData = Array.isArray(ofResult) ? ofResult : ofResult?.data || [];
        setOfertas(ofData);
      } else {
        setOfertas([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filtros.estado, filtros.ofertaId, page]);

  useEffect(() => {
    loadDatos();
  }, [loadDatos]);

  useEffect(() => {
    setPage(1);
  }, [filtros.estado, filtros.ofertaId]);

  useEffect(() => {
    if (!accion) {
      accionTriggerRef.current?.focus();
      accionTriggerRef.current = null;
      return undefined;
    }

    modalRef.current?.focus();
    const handleEscape = (event) => {
      if (event.key === "Escape" && !procesandoId) setAccion(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [accion, procesandoId]);

  const q = filtros.q.trim().toLowerCase();
  const visibles = q
    ? postulaciones.filter((p) => {
        const nombre = p?.estudianteId?.nombre || "";
        const correo = p?.estudianteId?.correo || "";
        const oferta = p?.ofertaId?.titulo || "";
        return (
          nombre.toLowerCase().includes(q) ||
          correo.toLowerCase().includes(q) ||
          oferta.toLowerCase().includes(q)
        );
      })
    : postulaciones;

  const abrirAccion = (postulacion, estadoTarget, trigger) => {
    accionTriggerRef.current = trigger;
    setAccion({
      id: postulacion._id,
      estadoTarget,
      observacion: postulacion.observacion || "",
      titulo: postulacion?.ofertaId?.titulo || "la oferta",
      estudiante: postulacion?.estudianteId?.nombre || "el estudiante",
    });
  };

  const confirmarAccion = async () => {
    if (!accion) return;
    setProcesandoId(accion.id);
    try {
      const res = await cambiarEstadoPostulacionAdmin(
        accion.id,
        accion.estadoTarget,
        accion.observacion,
      );
      toast.success(res?.mensaje || "Postulación actualizada correctamente.");
      setPostulaciones((prev) =>
        prev.map((p) =>
          p._id === accion.id
            ? { ...p, estado: accion.estadoTarget, observacion: accion.observacion.trim() }
            : p,
        ),
      );
      setAccion(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo actualizar la postulación."));
    } finally {
      setProcesandoId("");
    }
  };

  const descargarHojaVida = async (postulacion) => {
    setDescargandoId(postulacion._id);
    try {
      const blob = await downloadHojaVidaPostulacion(postulacion._id);
      const nombre = postulacion.estudianteId?.hojaVidaNombre || "hoja-de-vida.pdf";
      descargarBlob(blob, nombre);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo descargar la hoja de vida."));
    } finally {
      setDescargandoId("");
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ estado: "todas", ofertaId: "", q: "" });
    setPage(1);
  };

  const hayFiltros = filtros.estado !== "todas" || filtros.ofertaId || filtros.q.trim();

  return (
    <div className="post-page">
      <header className="post-header">
        <div>
          <h1 className="post-title">Postulaciones</h1>
          <p className="post-sub">
            {total} postulación{total !== 1 ? "es" : ""} en la consulta. Revisa a los estudiantes
            postulados, descarga su hoja de vida y acepta o rechaza.
          </p>
        </div>
        <button
          type="button"
          className="post-btn post-btn--ghost"
          onClick={loadDatos}
          disabled={loading}
        >
          Refrescar
        </button>
      </header>

      {error ? <p className="post-banner post-banner--err" role="alert">{error}</p> : null}

      <section className="post-filtros" aria-label="Filtros de postulaciones">
        <label className="post-field">
          <span>Estado</span>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros((prev) => ({ ...prev, estado: e.target.value }))}
          >
            {ESTADOS.map((est) => (
              <option key={est} value={est}>
                {ESTADO_LABEL[est]}
              </option>
            ))}
          </select>
        </label>

        <label className="post-field">
          <span>Oferta</span>
          <select
            value={filtros.ofertaId}
            onChange={(e) => setFiltros((prev) => ({ ...prev, ofertaId: e.target.value }))}
          >
            <option value="">Todas</option>
            {ofertas.map((o) => (
              <option key={o._id} value={o._id}>
                {o.titulo}
              </option>
            ))}
          </select>
        </label>

        <label className="post-field post-field--grow">
          <span>Buscar (nombre, correo u oferta)</span>
          <input
            type="search"
            placeholder="Filtra los resultados visibles"
            value={filtros.q}
            onChange={(e) => setFiltros((prev) => ({ ...prev, q: e.target.value }))}
          />
        </label>

        {hayFiltros ? (
          <button type="button" className="post-btn post-btn--ghost" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        ) : null}
      </section>

      <div className="post-table-wrap">
        {loading && visibles.length === 0 ? (
          <p className="post-empty">Cargando postulaciones…</p>
        ) : visibles.length === 0 ? (
          <p className="post-empty">No hay postulaciones con los filtros seleccionados.</p>
        ) : (
          <table className="post-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Oferta</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => {
                const e = p.estudianteId || {};
                const o = p.ofertaId || {};
                const abierto = detalleId === p._id;
                return (
                    <Fragment key={p._id}>
                      <tr className={abierto ? "post-row--active" : ""}>
                        <td>
                        <div className="post-estudiante">
                          <button
                            type="button"
                            className="post-expand"
                            aria-label={`${abierto ? "Ocultar" : "Mostrar"} detalles de ${e.nombre || "estudiante"}`}
                            aria-expanded={abierto}
                            aria-controls={`post-detail-${p._id}`}
                            onClick={() => setDetalleId(abierto ? "" : p._id)}
                          >
                            <span aria-hidden="true">{abierto ? "▾" : "▸"}</span>
                          </button>
                          <div>
                            <strong>{e.nombre || "Estudiante"}</strong>
                            <span className="post-correo">{e.correo || "—"}</span>
                          </div>
                        </div>
                      </td>
                      <td>{o.titulo || "—"}</td>
                      <td>
                        <span className={ESTADO_CLASS[p.estado] || "post-badge"}>{ESTADO_LABEL[p.estado]}</span>
                      </td>
                      <td>{formatearFecha(p.fechaPostulacion)}</td>
                      <td className="post-cell-acciones">
                        {p.estado !== "CANCELADA" ? (
                          <>
                            <button
                              type="button"
                              className="post-btn post-btn--ghost"
                              onClick={(event) => abrirAccion(p, "EN_REVISION", event.currentTarget)}
                              disabled={!!procesandoId}
                            >
                              Revisar
                            </button>
                            <button
                              type="button"
                              className="post-btn post-btn--ok"
                              onClick={(event) => abrirAccion(p, "ACEPTADA", event.currentTarget)}
                              disabled={!!procesandoId}
                            >
                              Aceptar
                            </button>
                            <button
                              type="button"
                              className="post-btn post-btn--bad"
                              onClick={(event) => abrirAccion(p, "RECHAZADA", event.currentTarget)}
                              disabled={!!procesandoId}
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span className="post-muted">Cancelada por el estudiante</span>
                        )}
                      </td>
                    </tr>
                    {abierto ? (
                      <tr id={`post-detail-${p._id}`} key={`${p._id}-detalle`} className="post-row-detalle">
                        <td colSpan={5}>
                          <div className="post-detalle">
                            <div className="post-detalle-col">
                              <h3>Datos del estudiante</h3>
                              <dl className="post-dl">
                                <dt>Programa</dt>
                                <dd>{e.programaAcademico || "—"}</dd>
                                <dt>Área de interés</dt>
                                <dd>{e.areaInteres || "—"}</dd>
                                <dt>Disponibilidad</dt>
                                <dd>{e.disponibilidad || "—"}</dd>
                                <dt>Teléfono</dt>
                                <dd>{e.telefono || "—"}</dd>
                                <dt>LinkedIn</dt>
                                <dd>{e.redesSociales?.linkedin || "—"}</dd>
                                <dt>GitHub</dt>
                                <dd>{e.redesSociales?.github || "—"}</dd>
                                <dt>Estado cuenta</dt>
                                <dd>{e.estado || "—"}</dd>
                              </dl>
                            </div>
                            <div className="post-detalle-col">
                              <h3>Hoja de vida</h3>
                              {e.hojaVida ? (
                                <button
                                  type="button"
                                  className="post-btn post-btn--primary"
                                  onClick={() => descargarHojaVida(p)}
                                  disabled={descargandoId === p._id}
                                >
                                  {descargandoId === p._id ? "Descargando…" : `Descargar ${e.hojaVidaNombre || "HV"}`}
                                </button>
                              ) : (
                                <p className="post-muted">El estudiante no adjuntó hoja de vida.</p>
                              )}

                              <h3>Observación del estudiante</h3>
                              <p className="post-obs">{p.observacion || "Sin observación."}</p>

                              <h3>Oferta</h3>
                              <p>{o.titulo || "—"}</p>
                              <p className="post-muted">
                                {o.tipoOportunidad === "PRACTICA" ? "Práctica" : "Servicio social"} ·{" "}
                                {o.estadoVigencia || "—"}
                                {o.dependenciaId?.nombre ? ` · ${o.dependenciaId.nombre}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                    </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 ? (
        <nav className="post-pagination" aria-label="Paginación">
          <button
            type="button"
            className="post-page-btn"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`post-page-btn ${p === page ? "is-active" : ""}`}
              disabled={loading}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="post-page-btn"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente →
          </button>
        </nav>
      ) : null}

      {accion ? (
        <div className="post-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="post-modal-title">
          <div ref={modalRef} className="post-modal" tabIndex="-1">
            <h3 id="post-modal-title" className="post-modal-title">
              {accion.estadoTarget === "ACEPTADA"
                ? "Aceptar postulación"
                : accion.estadoTarget === "RECHAZADA"
                  ? "Rechazar postulación"
                  : "Marcar en revisión"}
            </h3>
            <p className="post-modal-sub">
              Estudiante: <strong>{accion.estudiante}</strong> · Oferta: {accion.titulo}
            </p>
            <label className="post-modal-field">
              <span>Observación (opcional)</span>
              <textarea
                rows={3}
                value={accion.observacion}
                onChange={(e) => setAccion((prev) => ({ ...prev, observacion: e.target.value }))}
                placeholder="Mensaje para el estudiante…"
              />
            </label>
            <div className="post-modal-actions">
              <button
                type="button"
                className="post-btn post-btn--ghost"
                onClick={() => setAccion(null)}
                disabled={!!procesandoId}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={
                  accion.estadoTarget === "RECHAZADA"
                    ? "post-btn post-btn--bad"
                    : "post-btn post-btn--primary"
                }
                onClick={confirmarAccion}
                disabled={!!procesandoId}
              >
                {procesandoId ? "Guardando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default PostulacionesAdmin;
