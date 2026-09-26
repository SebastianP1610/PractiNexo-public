import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOfertas } from "../api/ofertas";
import { fetchDependencias } from "../api/dependencias";
import { fetchProgramas } from "../api/programas";
import { getApiErrorMessage } from "../api/httpError";
import { esUrgente } from "../utils/format";
import AppFooter from "../components/AppFooter";
import StudentHeader from "../components/StudentHeader";
import "./OfertasEstudiante.css";

const initialFiltros = {
  tipo: "",
  programa: "",
  palabrasClave: "",
  dependenciaId: "",
};

const CARD_ICONS = ["rocket_launch", "science", "campaign"];

const FEATURED_IMG = "/matching-hero.jpg";

function buildQueryParams(filtros, pageNum) {
  const params = { soloActivas: "true", page: pageNum, limit: 12 };
  if (filtros.tipo) params.tipo = filtros.tipo;
  if (filtros.programa) params.programa = filtros.programa;
  if (filtros.palabrasClave?.trim()) {
    const partes = filtros.palabrasClave
      .split(/[\s,;]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (partes.length) params.palabrasClave = partes.join(",");
  }
  if (filtros.dependenciaId) params.dependencia = filtros.dependenciaId;
  return params;
}

function formatearFecha(iso) {
  if (!iso) return "Sin fecha límite";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Fecha inválida";
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function OfertasEstudiante() {
  const navigate = useNavigate();
  const [ofertas, setOfertas] = useState([]);
  const [dependencias, setDependencias] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState(initialFiltros);
  const [busquedaInput, setBusquedaInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = busquedaInput.trim();
      setFiltros((prev) => {
        if (prev.palabrasClave === next) return prev;
        return { ...prev, palabrasClave: next };
      });
    }, 350);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  const loadDatos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rOfertas, rDeps, rProg] = await Promise.allSettled([
        fetchOfertas(buildQueryParams(filtros, page)),
        fetchDependencias(),
        fetchProgramas(),
      ]);

      if (rOfertas.status === "fulfilled") {
        const result = rOfertas.value;
        if (result && typeof result === "object" && !Array.isArray(result) && Array.isArray(result.data)) {
          setOfertas(result.data);
          setTotalPages(result.pages || 1);
        } else {
          setOfertas(Array.isArray(result) ? result : []);
          setTotalPages(1);
        }
      } else {
        setOfertas([]);
        setError(getApiErrorMessage(rOfertas.reason, "No se pudieron cargar las ofertas."));
      }

      if (rDeps.status === "fulfilled") {
        setDependencias(Array.isArray(rDeps.value) ? rDeps.value : []);
      }

      if (rProg.status === "fulfilled") {
        setProgramas(
          (Array.isArray(rProg.value) ? rProg.value : []).filter(
            (p) => p.estado === "ACTIVO",
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [filtros, page]);

  useEffect(() => {
    loadDatos();
  }, [loadDatos]);

  const limpiarFiltros = () => {
    setFiltros(initialFiltros);
    setBusquedaInput("");
    setPage(1);
  };

  const handleVerDetalle = (id) => {
    navigate(`/ofertas/${id}`);
  };

  const ofertasActivas = ofertas.filter((o) => o.estadoVigencia === "ACTIVA");

  const usarDestacada = ofertasActivas.length >= 4;
  const listaPrincipal = usarDestacada ? ofertasActivas.slice(0, -1) : ofertasActivas;
  const ofertaDestacada = usarDestacada ? ofertasActivas[ofertasActivas.length - 1] : null;

  const programasDisponibles = programas.map((p) => ({
    value: p.nombre,
    label: p.nombre,
  }));

  const hayFiltros =
    filtros.tipo ||
    filtros.programa ||
    filtros.palabrasClave ||
    filtros.dependenciaId ||
    busquedaInput;

  return (
    <div className="ofertas-page ofertas-page--catalogo ofertas-page--impact">
      <StudentHeader />

      <main className="ofertas-main ofertas-main--catalogo">
        <header className="ofertas-impact-head">
          <h1 className="ofertas-impact-title">Oportunidades de impacto</h1>
          <p className="ofertas-impact-sub">
            Descubre prácticas y vacantes que aceleran tu carrera académica y profesional dentro de
            nuestra red institucional.
          </p>
        </header>

        <div className="ofertas-catalog-shell">
          <aside className="ofertas-sidebar" aria-label="Filtros">
            <div className="ofertas-sidebar-search">
              <span className="material-symbols-outlined" aria-hidden="true">
                search
              </span>
              <input
                type="search"
                placeholder="Buscar palabras clave…"
                value={busquedaInput}
                onChange={(e) => setBusquedaInput(e.target.value)}
                aria-label="Buscar palabras clave"
              />
            </div>

            <div className="ofertas-sidebar-block">
              <span className="ofertas-sidebar-label">Tipo de oferta</span>
              <div className="ofertas-pills" role="group">
                <button
                  type="button"
                  className={`ofertas-pill ${filtros.tipo === "" ? "is-active" : ""}`}
                  onClick={() => setFiltros((p) => ({ ...p, tipo: "" }))}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={`ofertas-pill ${filtros.tipo === "PRACTICA" ? "is-active" : ""}`}
                  onClick={() => setFiltros((p) => ({ ...p, tipo: "PRACTICA" }))}
                >
                  Práctica
                </button>
                <button
                  type="button"
                  className={`ofertas-pill ${filtros.tipo === "SERVICIO_SOCIAL" ? "is-active" : ""}`}
                  onClick={() => setFiltros((p) => ({ ...p, tipo: "SERVICIO_SOCIAL" }))}
                >
                  Servicio social
                </button>
              </div>
            </div>

            <div className="ofertas-sidebar-block">
              <label className="ofertas-sidebar-label" htmlFor="oferta-dep">
                Dependencia
              </label>
              <select
                id="oferta-dep"
                className="ofertas-sidebar-select"
                name="dependenciaId"
                value={filtros.dependenciaId}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, dependenciaId: e.target.value }))
                }
              >
                <option value="">Cualquier dependencia</option>
                {dependencias.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="ofertas-sidebar-block">
              <span className="ofertas-sidebar-label">Programa académico</span>
              {programasDisponibles.length === 0 ? (
                <p className="ofertas-sidebar-empty">No hay programas disponibles.</p>
              ) : (
                <ul className="ofertas-checkbox-list">
                  {programasDisponibles.map((p) => (
                    <li key={p.value}>
                      <label className="ofertas-checkbox">
                        <input
                          type="checkbox"
                          checked={filtros.programa === p.value}
                          onChange={() =>
                            setFiltros((prev) => ({
                              ...prev,
                              programa: prev.programa === p.value ? "" : p.value,
                            }))
                          }
                        />
                        <span>{p.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {hayFiltros ? (
              <button type="button" className="ofertas-sidebar-clear" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            ) : null}
          </aside>

          <div className="ofertas-catalog-main">
            <p className="ofertas-catalog-count" aria-live="polite">
              {ofertasActivas.length} oportunidad{ofertasActivas.length !== 1 ? "es" : ""}{" "}
              disponible{ofertasActivas.length !== 1 ? "s" : ""}
              {totalPages > 1 ? ` — página ${page} de ${totalPages}` : ""}
            </p>

            {error ? <p className="ofertas-error">{error}</p> : null}

            {loading ? (
              <div className="ofertas-loading">
                <p>Cargando ofertas…</p>
              </div>
            ) : ofertasActivas.length === 0 ? (
              <div className="ofertas-empty">
                <p>No hay ofertas con los filtros seleccionados.</p>
                <button type="button" className="ofertas-limpiar" onClick={limpiarFiltros}>
                  Ver todas
                </button>
              </div>
            ) : (
              <div className="ofertas-grid ofertas-grid--impact">
                {listaPrincipal.map((oferta, index) => {
                  const icon = CARD_ICONS[index % CARD_ICONS.length];
                  const nueva =
                    oferta.fechaPublicacion &&
                    Date.now() - new Date(oferta.fechaPublicacion).getTime() <
                      7 * 86400000;
                  return (
                    <article key={oferta._id} className="oferta-card oferta-card--impact">
                      <div className="oferta-card-impact-top">
                        <div className={`oferta-card-icon oferta-card-icon--${(index % 3) + 1}`}>
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {icon}
                          </span>
                        </div>
                        <div className="oferta-card-badges">
                          {nueva ? (
                            <span className="oferta-badge-match">
                              <span className="material-symbols-outlined" aria-hidden="true">
                                bolt
                              </span>
                              Nueva
                            </span>
                          ) : (
                            <span className="oferta-badge-match oferta-badge-match--soft">
                              <span className="material-symbols-outlined" aria-hidden="true">
                                verified
                              </span>
                              Activa
                            </span>
                          )}
                          <span
                            className={`oferta-badge-tipo oferta-badge-tipo--${oferta.tipoOportunidad.toLowerCase()}`}
                          >
                            {oferta.tipoOportunidad === "PRACTICA" ? "Práctica" : "Servicio social"}
                          </span>
                        </div>
                      </div>

                      <h2 className="oferta-card-title">{oferta.titulo}</h2>

                      <div className="oferta-card-impact-meta">
                        {oferta.dependenciaId?.nombre ? (
                          <span>
                            <span className="material-symbols-outlined meta-ico" aria-hidden="true">
                              apartment
                            </span>
                            {oferta.dependenciaId.nombre}
                          </span>
                        ) : null}
                        <span>
                          <span className="material-symbols-outlined meta-ico" aria-hidden="true">
                            location_on
                          </span>
                          {oferta.disponibilidad?.trim() || "Politécnico JIC · Colombia"}
                        </span>
                      </div>

                      <p className="oferta-card-desc">{oferta.descripcion}</p>

                      {oferta.categoriaId?.nombre || oferta.palabrasClave?.length ? (
                        <div className="oferta-card-tags oferta-card-tags--impact">
                          {oferta.categoriaId?.nombre ? (
                            <span className="oferta-tag-pill">{oferta.categoriaId.nombre}</span>
                          ) : null}
                          {oferta.palabrasClave?.slice(0, 2).map((tag) => (
                            <span key={tag} className="oferta-tag-pill oferta-tag-pill--muted">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="oferta-card-impact-footer">
                        <span className="oferta-card-hint">
                          Cierra {formatearFecha(oferta.fechaCierre)}
                        </span>
                        <button
                          type="button"
                          className="oferta-card-link-detail"
                          onClick={() => handleVerDetalle(oferta._id)}
                        >
                          Ver detalles
                          <span className="material-symbols-outlined" aria-hidden="true">
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    </article>
                  );
                })}

                {ofertaDestacada ? (
                  <article className="oferta-card oferta-card--featured">
                    <div className="oferta-featured-visual">
                      <img src={FEATURED_IMG} alt="" loading="lazy" />
                      <div className="oferta-featured-overlay">
                        <span className="oferta-featured-tag">Recomendado</span>
                        <p className="oferta-featured-overlay-title">Prácticas de alto impacto</p>
                      </div>
                    </div>
                    <div className="oferta-featured-body">
                      <div className="oferta-featured-head">
                        <div className="oferta-card-icon oferta-card-icon--2" aria-hidden="true">
                          <span className="material-symbols-outlined">public</span>
                        </div>
                        <div className="oferta-featured-badges">
                          {esUrgente(ofertaDestacada.fechaCierre) ? (
                            <span className="oferta-badge-urgente">Urgente</span>
                          ) : null}
                        </div>
                      </div>
                      <h2 className="oferta-featured-title">{ofertaDestacada.titulo}</h2>
                      <p className="oferta-featured-desc">{ofertaDestacada.descripcion}</p>
                      <button
                        type="button"
                        className="oferta-featured-cta"
                        onClick={() => handleVerDetalle(ofertaDestacada._id)}
                      >
                        Postularse ahora
                      </button>
                    </div>
                  </article>
                ) : null}
              </div>
            )}

            {totalPages > 1 ? (
              <div className="ofertas-pagination" role="navigation" aria-label="Paginación de ofertas">
                <button
                  type="button"
                  className="ofertas-page-btn"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`ofertas-page-btn ${p === page ? "is-active" : ""}`}
                    disabled={loading}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="ofertas-page-btn"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default OfertasEstudiante;
