import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchOfertaById, fetchOfertas } from "../api/ofertas";
import {
  createPostulacion,
  extractPostulacionesList,
  fetchMisPostulaciones,
} from "../api/postulaciones";
import { getApiErrorMessage } from "../api/httpError";
import { readStudentSession } from "../utils/session";
import { formatearFechaLarga } from "../utils/format";
import AppFooter from "../components/AppFooter";
import StudentHeader from "../components/StudentHeader";
import DetalleHeroPanel from "../components/DetalleHeroPanel";
import "./DetalleOferta.css";

const STORAGE_SAVED = "practinexo_saved_ofertas";

function postulacionOfertaId(p) {
  const o = p?.ofertaId;
  if (!o) return null;
  if (typeof o === "string") return o;
  if (typeof o === "object" && o._id) return String(o._id);
  return null;
}

const BENEFICIOS_DEFAULT = [
  "Vinculación avalada por el Politécnico Colombiano Jaime Isaza Cadavid.",
  "Registro formal de horas de práctica o servicio social según el caso.",
  "Acompañamiento de la dependencia y seguimiento académico.",
  "Entorno institucional con enfoque en excelencia y formación integral.",
];

function formatearFecha(iso) {
  if (!iso) return "No especificada";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Fecha inválida";
  return formatearFechaLarga(iso);
}

function normalizarDisponibilidadBadge(texto) {
  if (!texto || !String(texto).trim()) return null;
  const t = String(texto).trim();
  if (t.length > 24) return `${t.slice(0, 22)}…`;
  return t.toUpperCase();
}

function parrafosDescripcion(texto) {
  if (!texto) return [];
  const partes = String(texto)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return partes.length > 0 ? partes : [String(texto).trim()];
}

function DetalleOferta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oferta, setOferta] = useState(null);
  const [relacionadas, setRelacionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState("");
  const [yaPostulado, setYaPostulado] = useState(false);
  const [tuvoCancelada, setTuvoCancelada] = useState(false);
  const [misChecking, setMisChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadOferta() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchOfertaById(id);
        if (cancelled) return;
        setOferta(data);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "No se pudo cargar la oferta."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOferta();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    try {
      const raw = localStorage.getItem(STORAGE_SAVED);
      const ids = raw ? JSON.parse(raw) : [];
      setSaved(Array.isArray(ids) && ids.includes(id));
    } catch {
      setSaved(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOfertas({ soloActivas: "true", page: 1, limit: 12 });
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.data || [];
        const otras = list.filter(
          (o) => o._id !== id && o.estadoVigencia === "ACTIVA",
        );
        setRelacionadas(otras.slice(0, 6));
      } catch {
        if (!cancelled) setRelacionadas([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !oferta || !readStudentSession()) {
      setYaPostulado(false);
      setTuvoCancelada(false);
      setMisChecking(false);
      return;
    }
    let cancelled = false;
    setMisChecking(true);
    (async () => {
      try {
        const res = await fetchMisPostulaciones();
        if (cancelled) return;
        const list = extractPostulacionesList(res);
        setYaPostulado(
          list.some(
            (p) =>
              postulacionOfertaId(p) === id && p.estado !== "CANCELADA",
          ),
        );
        setTuvoCancelada(
          list.some(
            (p) =>
              postulacionOfertaId(p) === id && p.estado === "CANCELADA",
          ),
        );
      } catch {
        if (!cancelled) {
          setYaPostulado(false);
          setTuvoCancelada(false);
        }
      } finally {
        if (!cancelled) setMisChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, oferta]);

  const toggleGuardar = () => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED);
      let ids = Array.isArray(JSON.parse(raw || "[]")) ? JSON.parse(raw || "[]") : [];
      if (!Array.isArray(ids)) ids = [];
      if (ids.includes(id)) {
        ids = ids.filter((x) => x !== id);
        setSaved(false);
      } else {
        ids = [...ids, id];
        setSaved(true);
      }
      localStorage.setItem(STORAGE_SAVED, JSON.stringify(ids));
    } catch {
      localStorage.setItem(STORAGE_SAVED, JSON.stringify([id]));
      setSaved(true);
    }
  };

  const handlePostularPractiNexo = async () => {
    if (!id || yaPostulado || oferta?.estadoVigencia !== "ACTIVA") return;
    setPostError("");
    setPostLoading(true);
    try {
      const body = { ofertaId: id };
      if (observacion.trim()) body.observacion = observacion.trim();
      await createPostulacion(body);
      setYaPostulado(true);
      setObservacion("");
    } catch (err) {
      setPostError(getApiErrorMessage(err, "No se pudo enviar la postulación."));
    } finally {
      setPostLoading(false);
    }
  };

  const contactoEsEmail = oferta?.contacto?.includes("@");

  const postularHref = useMemo(() => {
    if (!oferta?.contacto) return null;
    const subject = encodeURIComponent(`Postulación: ${oferta.titulo || "Oferta PractiNexo"}`);
    const body = encodeURIComponent(
      `Hola,\n\nMe interesa postularme a la oferta "${oferta.titulo}".\n\nSaludos.`,
    );
    if (contactoEsEmail) {
      return `mailto:${oferta.contacto}?subject=${subject}&body=${body}`;
    }
    return `tel:${oferta.contacto.replace(/\s/g, "")}`;
  }, [oferta, contactoEsEmail]);

  const beneficios = useMemo(() => {
    if (!oferta) return BENEFICIOS_DEFAULT;
    const b = oferta.beneficios;
    if (Array.isArray(b) && b.length > 0) return b.map(String);
    return BENEFICIOS_DEFAULT;
  }, [oferta]);

  const subtituloLinea = useMemo(() => {
    if (!oferta) return "";
    const dep = oferta.dependenciaId?.nombre;
    const partes = [dep, oferta.programaAcademico, oferta.areaInteres].filter(Boolean);
    return partes.join(" • ");
  }, [oferta]);

  const badgeSecundario =
    normalizarDisponibilidadBadge(oferta?.disponibilidad) ||
    (oferta?.categoriaId?.nombre ? oferta.categoriaId.nombre.toUpperCase() : null);

  const razonMatch = useMemo(() => {
    if (!oferta) return [];
    const out = [];
    if (oferta.areaInteres) {
      out.push(
        <>
          La vacante enfatiza el área <strong>{oferta.areaInteres}</strong>, alineada con perfiles
          técnicos y académicos similares.
        </>,
      );
    }
    if (oferta.palabrasClave?.length) {
      const k = oferta.palabrasClave.slice(0, 3).join(", ");
      out.push(
        <>
          Competencias clave mencionadas: <strong>{k}</strong>.
        </>,
      );
    }
    if (oferta.programaAcademico) {
      out.push(
        <>
          Dirigida a estudiantes de <strong>{oferta.programaAcademico}</strong>.
        </>,
      );
    }
    if (out.length < 3) {
      out.push(
        <>
          Usa <strong>Matching</strong> en PractiNexo para ver un ranking con porcentaje estimado de
          compatibilidad.
        </>,
      );
    }
    return out.slice(0, 3);
  }, [oferta]);

  if (loading) {
    return (
      <div className="detalle-page">
        <StudentHeader />
        <div className="detalle-loading-wrap">
          <p className="detalle-loading">Cargando detalles de la oferta...</p>
        </div>
      </div>
    );
  }

  if (error || !oferta) {
    return (
      <div className="detalle-page">
        <StudentHeader />
        <div className="detalle-error-wrap">
          <div className="detalle-error">
            <p>{error || "Oferta no encontrada"}</p>
            <Link to="/ofertas" className="detalle-back-link">
              ← Volver a las ofertas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const descripcionPartes = parrafosDescripcion(oferta.descripcion);
  const mostrarRelacionadas = relacionadas.slice(0, 3);
  const studentSession = readStudentSession();
  const ofertaActiva = oferta.estadoVigencia === "ACTIVA";

  return (
    <div className="detalle-page">
      <StudentHeader />

      <main className="detalle-main">
        <div className="detalle-wrap">
          <Link to="/ofertas" className="detalle-back">
            ← Volver a las ofertas
          </Link>

          <DetalleHeroPanel
            oferta={oferta}
            badgeSecundario={badgeSecundario}
            subtituloLinea={subtituloLinea}
            studentSession={studentSession}
            ofertaActiva={ofertaActiva}
            yaPostulado={yaPostulado}
            tuvoCancelada={tuvoCancelada}
            observacion={observacion}
            setObservacion={setObservacion}
            postLoading={postLoading}
            misChecking={misChecking}
            postError={postError}
            setPostError={setPostError}
            saved={saved}
            postularHref={postularHref}
            toggleGuardar={toggleGuardar}
            handlePostularPractiNexo={handlePostularPractiNexo}
          />

          <div className="detalle-content-grid">
            <div className="detalle-col-main">
              <section className="detalle-block" aria-labelledby="detalle-desc">
                <h2 id="detalle-desc" className="detalle-block-title">
                  <span className="material-symbols-outlined detalle-block-icon" aria-hidden="true">
                    description
                  </span>
                  Descripción del rol
                </h2>
                <div className="detalle-descripcion-body">
                  {descripcionPartes.map((p) => (
                    <p key={p.slice(0, 32)} className="detalle-descripcion">
                      {p}
                    </p>
                  ))}
                </div>
              </section>

              <div className="detalle-req-ben-grid">
                {oferta.requisitos?.length > 0 ? (
                  <section className="detalle-panel" aria-labelledby="detalle-req">
                    <h2 id="detalle-req" className="detalle-panel-title">
                      <span
                        className="material-symbols-outlined detalle-panel-icon detalle-panel-icon--req"
                        aria-hidden="true"
                      >
                        checklist
                      </span>
                      Requisitos
                    </h2>
                    <ul className="detalle-checklist detalle-checklist--req">
                      {oferta.requisitos.map((req) => (
                        <li key={req}>
                          <span className="material-symbols-outlined detalle-li-icon" aria-hidden="true">
                            check_circle
                          </span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section className="detalle-panel" aria-labelledby="detalle-ben">
                  <h2 id="detalle-ben" className="detalle-panel-title">
                    <span
                      className="material-symbols-outlined detalle-panel-icon detalle-panel-icon--ben"
                      aria-hidden="true"
                    >
                      redeem
                    </span>
                    Beneficios
                  </h2>
                    <ul className="detalle-checklist detalle-checklist--ben">
                      {beneficios.map((b) => (
                        <li key={b}>
                          <span className="material-symbols-outlined detalle-li-icon-star" aria-hidden="true">
                            star
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                </section>
              </div>

              <section className="detalle-meta-strip" aria-label="Datos de la oferta">
                <div className="detalle-meta-item">
                  <span className="detalle-meta-label">Cierre</span>
                  <span className="detalle-meta-value detalle-meta-value--alert">
                    {formatearFecha(oferta.fechaCierre)}
                  </span>
                </div>
                <div className="detalle-meta-item">
                  <span className="detalle-meta-label">Contacto</span>
                  {contactoEsEmail ? (
                    <a href={`mailto:${oferta.contacto}`} className="detalle-meta-link">
                      {oferta.contacto}
                    </a>
                  ) : (
                    <a href={`tel:${oferta.contacto}`} className="detalle-meta-link">
                      {oferta.contacto}
                    </a>
                  )}
                </div>
              </section>
            </div>

            <aside className="detalle-col-aside" aria-label="Información de la dependencia y matching">
              <div className="detalle-aside-card detalle-aside-card--org">
                <div className="detalle-org-head">
                  <div className="detalle-org-logo" aria-hidden="true">
                    <span className="material-symbols-outlined">apartment</span>
                  </div>
                  <div>
                    <h3 className="detalle-org-name">
                      {oferta.dependenciaId?.nombre || "Dependencia"}
                    </h3>
                    <p className="detalle-org-sector">
                      {oferta.categoriaId?.nombre || "Categoría institucional"}
                    </p>
                  </div>
                </div>
                <p className="detalle-org-desc">
                  Dependencia del Politécnico JIC. Coordina esta oportunidad de{" "}
                  {oferta.tipoOportunidad === "PRACTICA"
                    ? "práctica profesional"
                    : "servicio social"}{" "}
                  para estudiantes cualificados.
                </p>
                <ul className="detalle-org-facts">
                  <li>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      school
                    </span>
                    <span>Institución académica</span>
                  </li>
                  <li>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      link
                    </span>
                    <span>PractiNexo</span>
                  </li>
                  <li>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      location_on
                    </span>
                    <span>Colombia</span>
                  </li>
                </ul>
                <Link to="/ofertas" className="detalle-aside-outline-btn">
                  Ver más ofertas
                </Link>
              </div>

              <div className="detalle-aside-card detalle-aside-card--why">
                <h3 className="detalle-why-title">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    help
                  </span>
                  ¿Por qué encajas?
                </h3>
                <ul className="detalle-why-list">
                  {razonMatch.map((node, i) => (
                    <li key={`razon-${i}`}>{node}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="detalle-aside-link-btn"
                  onClick={() => navigate("/sugerencias")}
                >
                  Ir a matching
                </button>
              </div>

              <div className="detalle-aside-card detalle-aside-card--map" aria-hidden="true">
                <div className="detalle-map-placeholder">
                  <span className="material-symbols-outlined detalle-map-pin">location_on</span>
                </div>
                <p className="detalle-map-caption">Ubicación institucional</p>
              </div>
            </aside>
          </div>

          {mostrarRelacionadas.length > 0 ? (
            <section className="detalle-related" aria-labelledby="detalle-related-h">
              <h2 id="detalle-related-h" className="detalle-related-title">
                Otras prácticas que podrían interesarte
              </h2>
              <div className="detalle-related-row">
                {mostrarRelacionadas.map((o) => (
                  <button
                    key={o._id}
                    type="button"
                    className="detalle-related-card"
                    onClick={() => navigate(`/ofertas/${o._id}`)}
                  >
                    <span className="detalle-related-cat">
                      {o.tipoOportunidad === "PRACTICA" ? "PRÁCTICA" : "SERVICIO SOCIAL"}
                    </span>
                    <span className="detalle-related-job">{o.titulo}</span>
                    <span className="detalle-related-co">
                      {o.dependenciaId?.nombre || "Dependencia"}
                    </span>
                    <span className="material-symbols-outlined detalle-related-arrow" aria-hidden="true">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default DetalleOferta;
