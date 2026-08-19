import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  deletePostulacion,
  extractPostulacionesList,
  fetchMisPostulaciones,
} from "../api/postulaciones";
import { getApiErrorMessage } from "../api/httpError";
import { readStudentSession } from "../utils/session";
import { formatearFecha, truncar } from "../utils/format";
import StudentHeader from "../components/StudentHeader";
import "./MisPostulaciones.css";

const ESTADO_LABELS = {
  PENDIENTE: { label: "Pendiente", tone: "pendiente" },
  EN_REVISION: { label: "En revisión", tone: "revision" },
  ACEPTADA: { label: "Aceptada", tone: "aceptada" },
  RECHAZADA: { label: "Rechazada", tone: "rechazada" },
  CANCELADA: { label: "Cancelada", tone: "cancelada" },
};

const ESTADOS_CANCELABLES = new Set(["PENDIENTE", "EN_REVISION"]);

function ofertaIdKey(p) {
  const o = p?.ofertaId;
  if (!o) return null;
  if (typeof o === "string") return o;
  if (typeof o === "object" && o._id) return String(o._id);
  return null;
}

function MisPostulaciones() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [confirmId, setConfirmId] = useState("");

  useEffect(() => {
    if (!readStudentSession()) {
      setLoading(false);
      setLista([]);
      setError("");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchMisPostulaciones();
        if (cancelled) return;
        setLista(extractPostulacionesList(res));
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "No se pudieron cargar tus postulaciones."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const puedeVer = readStudentSession();

  const handleCancelar = async (postulacion) => {
    const id = postulacion._id;
    setCancellingId(id);
    try {
      await deletePostulacion(id);
      setLista((prev) =>
        prev.map((p) =>
          p._id === id
            ? { ...p, estado: "CANCELADA", fechaCancelacion: new Date().toISOString() }
            : p,
        ),
      );
      toast.success("Postulación cancelada correctamente.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo cancelar la postulación."));
    } finally {
      setCancellingId("");
      setConfirmId("");
    }
  };

  return (
    <div className="mis-post-page">
      <StudentHeader />
      <main className="mis-post-main">
        <div className="mis-post-inner">
          <h1 className="mis-post-title">Mis postulaciones</h1>
          <p className="mis-post-sub">
            Postulaciones registradas en PractiNexo, de la más reciente a la más antigua.
          </p>

          {!puedeVer ? (
            <div className="mis-post-card mis-post-card--notice">
              <p>Inicia sesión como estudiante para ver tus postulaciones.</p>
              <Link to="/login" className="mis-post-link-login">
                Ir al inicio de sesión
              </Link>
            </div>
          ) : loading ? (
            <p className="mis-post-muted">Cargando…</p>
          ) : error ? (
            <p className="mis-post-error">{error}</p>
          ) : lista.length === 0 ? (
            <div className="mis-post-card mis-post-card--notice">
              <p>Aún no tienes postulaciones. Explora las ofertas y envía la tuya.</p>
              <Link to="/ofertas" className="mis-post-link-login">
                Ver ofertas
              </Link>
            </div>
          ) : (
            <ul className="mis-post-list">
              {lista.map((p) => {
                const oid = ofertaIdKey(p);
                const of = typeof p.ofertaId === "object" && p.ofertaId ? p.ofertaId : null;
                const titulo = of?.titulo || "Oferta";
                const fullDesc = of?.descripcion ? String(of.descripcion) : "";
                const desc = truncar(fullDesc, 160);
                const tipo =
                  of?.tipoOportunidad === "PRACTICA"
                    ? "Práctica"
                    : of?.tipoOportunidad === "SERVICIO_SOCIAL"
                      ? "Servicio social"
                      : of?.tipoOportunidad || "";
                const estado = ESTADO_LABELS[p.estado] || {
                  label: p.estado || "—",
                  tone: "default",
                };
                const esCancelable = ESTADOS_CANCELABLES.has(p.estado);
                const isCancelling = cancellingId === p._id;
                const isConfirming = confirmId === p._id;
                return (
                  <li key={p._id || `${oid}-${p.fechaPostulacion}`} className="mis-post-item">
                    <div className="mis-post-item-head">
                      <span className={`mis-post-estado mis-post-estado--${estado.tone}`}>
                        {estado.label}
                      </span>
                      <time className="mis-post-fecha" dateTime={p.fechaPostulacion}>
                        {formatearFecha(p.fechaPostulacion, { withTime: true })}
                      </time>
                    </div>
                    <h2 className="mis-post-item-title">
                      {oid ? <Link to={`/ofertas/${oid}`}>{titulo}</Link> : titulo}
                    </h2>
                    {tipo ? <p className="mis-post-item-meta">{tipo}</p> : null}
                    {of?.estadoVigencia != null ? (
                      <p className="mis-post-item-vig">Vigencia oferta: {String(of.estadoVigencia)}</p>
                    ) : null}
                    {of?.fechaCierre ? (
                      <p className="mis-post-item-cierre">Cierre: {formatearFecha(of.fechaCierre)}</p>
                    ) : null}
                    {desc ? <p className="mis-post-item-desc">{desc}</p> : null}
                    {p.observacion ? (
                      <p className="mis-post-item-obs">
                        <strong>Tu mensaje:</strong> {p.observacion}
                      </p>
                    ) : null}
                    {p.fechaCancelacion ? (
                      <p className="mis-post-item-cancelada">
                        Cancelada el {formatearFecha(p.fechaCancelacion, { withTime: true })}
                      </p>
                    ) : null}

                    {esCancelable ? (
                      isConfirming ? (
                        <div className="mis-post-cancel-confirm" role="alert">
                          <p>¿Cancelar tu postulación a esta oferta? Esta acción no se puede deshacer.</p>
                          <div className="mis-post-cancel-actions">
                            <button
                              type="button"
                              className="mis-post-btn mis-post-btn--ghost"
                              onClick={() => setConfirmId("")}
                              disabled={isCancelling}
                            >
                              Mantener
                            </button>
                            <button
                              type="button"
                              className="mis-post-btn mis-post-btn--danger"
                              onClick={() => handleCancelar(p)}
                              disabled={isCancelling}
                            >
                              {isCancelling ? "Cancelando…" : "Sí, cancelar"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mis-post-item-actions">
                          <button
                            type="button"
                            className="mis-post-btn mis-post-btn--ghost-danger"
                            onClick={() => setConfirmId(p._id)}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">
                              cancel
                            </span>
                            Cancelar postulación
                          </button>
                        </div>
                      )
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default MisPostulaciones;
