import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchSugerencias } from "../api/matching";
import {
  extractMeSugerenciasList,
  fetchEstudianteMeSugerencias,
} from "../api/estudiantes";
import { getApiErrorMessage } from "../api/httpError";
import { readStudentSession } from "../utils/session";
import { textoPublicacion } from "../utils/format";
import AppFooter from "../components/AppFooter";
import MatchingOfferCard from "../components/MatchingOfferCard";
import StudentHeader from "../components/StudentHeader";
import "./MatchingEstudiante.css";

const initialForm = {
  programaAcademico: "",
  areaInteres: "",
  tipoOportunidadInteres: "",
  disponibilidad: "",
};

const initialErrors = {};

/** Imagen en `public/matching-hero.jpg` (equipo con portátiles, acorde al mock de matching). */
const HERO_IMG = "/matching-hero.jpg";

const PAGE_SIZE = 3;

/** Normaliza fila del GET /me/sugerencias al shape que usa las tarjetas (item.oferta, …). */
function normalizeMeSugerenciaItem(row) {
  if (!row || typeof row !== "object") return null;
  if (row.oferta && typeof row.oferta === "object") {
    return {
      oferta: row.oferta,
      puntajeCoincidencia: row.puntajeCoincidencia,
      criteriosCoincidentes: Array.isArray(row.criteriosCoincidentes)
        ? row.criteriosCoincidentes
        : [],
      detalles: row.detalles || {},
    };
  }
  const { puntajeCoincidencia, criteriosCoincidentes, detalles, ...rest } = row;
  if (rest && (rest._id != null || rest.titulo)) {
    return {
      oferta: rest,
      puntajeCoincidencia,
      criteriosCoincidentes: Array.isArray(criteriosCoincidentes) ? criteriosCoincidentes : [],
      detalles: detalles || {},
    };
  }
  return null;
}

function MatchingEstudiante() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [palabrasTags, setPalabrasTags] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sinSugerencias, setSinSugerencias] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [resultsPage, setResultsPage] = useState(0);
  const [perfilSugerencias, setPerfilSugerencias] = useState([]);
  const [perfilLoading, setPerfilLoading] = useState(false);
  const [perfilError, setPerfilError] = useState("");

  const studentSession = readStudentSession();

  useEffect(() => {
    if (!studentSession) {
      setPerfilSugerencias([]);
      setPerfilLoading(false);
      setPerfilError("");
      return;
    }
    let cancelled = false;
    setPerfilLoading(true);
    setPerfilError("");
    (async () => {
      try {
        const res = await fetchEstudianteMeSugerencias();
        if (cancelled) return;
        const raw = extractMeSugerenciasList(res);
        setPerfilSugerencias(raw.map(normalizeMeSugerenciaItem).filter(Boolean));
      } catch (err) {
        if (!cancelled) {
          setPerfilError(
            getApiErrorMessage(err, "No se pudieron cargar las sugerencias según tu ficha."),
          );
        }
      } finally {
        if (!cancelled) setPerfilLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentSession]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validarForm = () => {
    const nuevosErrores = {};

    if (!form.programaAcademico.trim()) {
      nuevosErrores.programaAcademico = "El programa académico es obligatorio";
    }

    if (!form.areaInteres.trim()) {
      nuevosErrores.areaInteres = "El área de interés es obligatoria";
    }

    if (!form.tipoOportunidadInteres) {
      nuevosErrores.tipoOportunidadInteres = "Selecciona un tipo de oportunidad";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const agregarHabilidad = (e) => {
    e.preventDefault();
    const t = skillInput.trim();
    if (!t) return;
    setPalabrasTags((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setSkillInput("");
  };

  const quitarHabilidad = (tag) => {
    setPalabrasTags((prev) => prev.filter((p) => p !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSinSugerencias(false);

    if (!validarForm()) return;

    setLoading(true);

    const perfil = {
      programaAcademico: form.programaAcademico.trim(),
      areaInteres: form.areaInteres.trim(),
      tipoOportunidadInteres: form.tipoOportunidadInteres,
      disponibilidad: form.disponibilidad.trim(),
      palabrasClave: [...palabrasTags],
    };

    try {
      const resultado = await fetchSugerencias(perfil);

      if (!resultado.data || resultado.data.length === 0) {
        setSinSugerencias(true);
        setSugerencias([]);
      } else {
        setSugerencias(resultado.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron obtener sugerencias. Intenta de nuevo."));
      setSugerencias([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarForm = () => {
    setForm(initialForm);
    setErrors({});
    setPalabrasTags([]);
    setSkillInput("");
    setSugerencias([]);
    setSinSugerencias(false);
    setError("");
    setSearchQuery("");
    setResultsPage(0);
  };

  const filteredSugerencias = useMemo(() => {
    if (!searchQuery.trim()) return sugerencias;
    const q = searchQuery.toLowerCase().trim();
    return sugerencias.filter((item) => {
      const o = item.oferta;
      if (!o) return false;
      const blob = [
        o.titulo,
        o.descripcion,
        o.dependenciaId?.nombre,
        o.areaInteres,
        o.programaAcademico,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [sugerencias, searchQuery]);

  useEffect(() => {
    setResultsPage(0);
  }, [searchQuery, sugerencias]);

  const totalResultPages = Math.max(1, Math.ceil(filteredSugerencias.length / PAGE_SIZE));

  useEffect(() => {
    setResultsPage((p) => Math.min(p, Math.max(0, totalResultPages - 1)));
  }, [totalResultPages]);

  const pageSlice = filteredSugerencias.slice(
    resultsPage * PAGE_SIZE,
    resultsPage * PAGE_SIZE + PAGE_SIZE,
  );

  const irAnterior = () => setResultsPage((p) => Math.max(0, p - 1));
  const irSiguiente = () => setResultsPage((p) => Math.min(totalResultPages - 1, p + 1));

  const metaModalidad = (o) => {
    const d = o?.disponibilidad?.trim();
    if (d) return d;
    return "Modalidad a convenir";
  };

  return (
    <div className="matching-page">
      <StudentHeader />

      <div className="matching-search-strip">
        <div className="matching-search-inner">
          <span className="material-symbols-outlined matching-search-icon" aria-hidden="true">
            search
          </span>
          <input
            type="search"
            className="matching-search-input"
            placeholder="Buscar en prácticas y resultados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar en resultados de matching"
          />
        </div>
      </div>

      {studentSession ? (
        <section className="matching-perfil-strip" aria-labelledby="matching-perfil-h">
          <div className="matching-perfil-strip-inner">
            <div className="matching-perfil-head">
              <h2 id="matching-perfil-h" className="matching-perfil-title">
                Según tu ficha en PractiNexo
              </h2>
              <p className="matching-perfil-desc">
                Ofertas activas y no vencidas que encajan con el perfil que tienes guardado (programa,
                área, tipo de oportunidad, disponibilidad y palabras clave). El cálculo es en tiempo
                real y{" "}
                <strong>no guarda coincidencias en la base de datos</strong> como el otro flujo de
                matching.
              </p>
              <Link to="/mis-postulaciones" className="matching-perfil-link">
                Ver mis postulaciones
              </Link>
            </div>
            {perfilLoading ? (
              <div className="matching-perfil-state">Cargando sugerencias de tu perfil…</div>
            ) : perfilError ? (
              <div className="matching-perfil-state matching-perfil-state--err">{perfilError}</div>
            ) : perfilSugerencias.length === 0 ? (
              <div className="matching-perfil-state matching-perfil-state--empty">
                <p>
                  No hay ofertas con coincidencia según tu perfil. Completa o ajusta tus datos en{" "}
                  <strong>Mi perfil</strong> (icono de usuario) y vuelve a esta página.
                </p>
              </div>
            ) : (
              <div className="matching-cards-row matching-cards-row--perfil">
                {perfilSugerencias.map((item, index) => (
                  <MatchingOfferCard
                    key={item.oferta?._id ?? `p-${index}`}
                    item={item}
                    iconIndex={index}
                    navigate={navigate}
                    metaModalidad={metaModalidad}
                    textoPublicacion={textoPublicacion}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      <main className="matching-main">
        <section className="matching-hero-grid" aria-labelledby="matching-hero-title">
          <div className="matching-hero-left">
            <h1 id="matching-hero-title" className="matching-hero-title">
              Encuentra tu <span className="matching-gradient-text">práctica ideal</span>
            </h1>
            <p className="matching-hero-sub">
              Nuestro algoritmo cura oportunidades del Politécnico JIC según tu programa, área de
              interés y habilidades, para que postules con datos claros y sin ruido.
            </p>

            <form className="matching-filters-card" onSubmit={handleSubmit}>
              <div className="matching-filters-head">
                <span className="material-symbols-outlined" aria-hidden="true">
                  tune
                </span>
                <h2 className="matching-filters-title">Filtros de perfil</h2>
              </div>

              <label className="matching-field">
                <span>Programa</span>
                <input
                  name="programaAcademico"
                  value={form.programaAcademico}
                  onChange={handleChange}
                  placeholder="Ej. Ingeniería de Software"
                  className={errors.programaAcademico ? "is-error" : ""}
                />
                {errors.programaAcademico ? (
                  <span className="matching-field-error">{errors.programaAcademico}</span>
                ) : null}
              </label>

              <label className="matching-field">
                <span>Área de interés</span>
                <input
                  name="areaInteres"
                  value={form.areaInteres}
                  onChange={handleChange}
                  placeholder="Ej. Desarrollo Web"
                  className={errors.areaInteres ? "is-error" : ""}
                />
                {errors.areaInteres ? (
                  <span className="matching-field-error">{errors.areaInteres}</span>
                ) : null}
              </label>

              <div className="matching-field">
                <span>Tipo</span>
                <div className="matching-toggle-row" role="group" aria-label="Tipo de oportunidad">
                  <button
                    type="button"
                    className={`matching-toggle ${form.tipoOportunidadInteres === "PRACTICA" ? "is-selected" : ""}`}
                    onClick={() => {
                      setForm((p) => ({ ...p, tipoOportunidadInteres: "PRACTICA" }));
                      setErrors((e) => ({ ...e, tipoOportunidadInteres: "" }));
                    }}
                  >
                    Práctica
                  </button>
                  <button
                    type="button"
                    className={`matching-toggle ${form.tipoOportunidadInteres === "SERVICIO_SOCIAL" ? "is-selected" : ""}`}
                    onClick={() => {
                      setForm((p) => ({ ...p, tipoOportunidadInteres: "SERVICIO_SOCIAL" }));
                      setErrors((e) => ({ ...e, tipoOportunidadInteres: "" }));
                    }}
                  >
                    Servicio social
                  </button>
                </div>
                {errors.tipoOportunidadInteres ? (
                  <span className="matching-field-error">{errors.tipoOportunidadInteres}</span>
                ) : null}
              </div>

              <div className="matching-field">
                <span>Modalidad</span>
                <div className="matching-toggle-row" role="group" aria-label="Modalidad preferida">
                  <button
                    type="button"
                    className={`matching-toggle ${form.disponibilidad === "Presencial" ? "is-selected" : ""}`}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        disponibilidad: p.disponibilidad === "Presencial" ? "" : "Presencial",
                      }))
                    }
                  >
                    Presencial
                  </button>
                  <button
                    type="button"
                    className={`matching-toggle ${form.disponibilidad === "Remoto" ? "is-selected" : ""}`}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        disponibilidad: p.disponibilidad === "Remoto" ? "" : "Remoto",
                      }))
                    }
                  >
                    Remoto
                  </button>
                </div>
              </div>

              <div className="matching-field">
                <span>Palabras clave</span>
                <div className="matching-tags-input-wrap">
                  {palabrasTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="matching-tag"
                      onClick={() => quitarHabilidad(tag)}
                      title="Quitar"
                    >
                      {tag}
                      <span className="matching-tag-x" aria-hidden="true">
                        ×
                      </span>
                    </button>
                  ))}
                </div>
                <div className="matching-skill-add">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") agregarHabilidad(e);
                    }}
                    placeholder="Agregar habilidad..."
                    className="matching-skill-input"
                  />
                  <button type="button" className="matching-skill-plus" onClick={agregarHabilidad}>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      add
                    </span>
                  </button>
                </div>
              </div>

              <div className="matching-form-actions">
                <button
                  type="submit"
                  className="matching-btn-submit"
                  disabled={loading}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    auto_awesome
                  </span>
                  {loading ? "Generando…" : "Generar sugerencias"}
                </button>
                <button type="button" className="matching-btn-clear" onClick={limpiarForm}>
                  Limpiar filtros
                </button>
              </div>
            </form>
          </div>

          <div className="matching-hero-right">
            <div className="matching-hero-visual">
              <img
                src={HERO_IMG}
                alt="Personas colaborando con equipos portátiles en un espacio de trabajo moderno"
                className="matching-hero-img"
                loading="lazy"
              />
              <div className="matching-smart-card">
                <span className="material-symbols-outlined matching-smart-icon" aria-hidden="true">
                  verified
                </span>
                <div>
                  <strong className="matching-smart-title">Matching inteligente</strong>
                  <p className="matching-smart-quote">
                    «Encontré una vacante con 100% de coincidencia en criterios académicos.»
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="matching-results-wrap" aria-live="polite">
          {loading ? (
            <div className="matching-state matching-state--loading">
              <p>Buscando las mejores coincidencias para tu perfil…</p>
            </div>
          ) : error ? (
            <div className="matching-state matching-state--error">{error}</div>
          ) : sinSugerencias ? (
            <div className="matching-state matching-state--empty">
              <span className="material-symbols-outlined matching-state-icon" aria-hidden="true">
                travel_explore
              </span>
              <h3>Sin sugerencias por ahora</h3>
              <p>
                No hay ofertas que cumplan los criterios de coincidencia. Prueba otras palabras
                clave o un tipo distinto de oportunidad.
              </p>
              <button type="button" className="matching-btn-clear" onClick={limpiarForm}>
                Ajustar filtros
              </button>
            </div>
          ) : sugerencias.length > 0 ? (
            <>
              {filteredSugerencias.length === 0 ? (
                <div className="matching-state matching-state--empty">
                  <p>
                    Ningún resultado coincide con “{searchQuery}”. Prueba otro término o borra la
                    búsqueda.
                  </p>
                </div>
              ) : (
                <>
                  <div className="matching-results-head">
                    <div>
                      <p className="matching-results-kicker">Resultados personalizados</p>
                      <h2 className="matching-results-heading">Ofertas recomendadas para ti</h2>
                    </div>
                    <div className="matching-results-pager">
                      <button
                        type="button"
                        className="matching-pager-btn"
                        onClick={irAnterior}
                        disabled={resultsPage <= 0}
                        aria-label="Página anterior"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          chevron_left
                        </span>
                      </button>
                      <button
                        type="button"
                        className="matching-pager-btn"
                        onClick={irSiguiente}
                        disabled={resultsPage >= totalResultPages - 1}
                        aria-label="Página siguiente"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="matching-cards-row">
                    {pageSlice.map((item, index) => (
                      <MatchingOfferCard
                        key={item.oferta?._id ?? index}
                        item={item}
                        iconIndex={resultsPage * PAGE_SIZE + index}
                        navigate={navigate}
                        metaModalidad={metaModalidad}
                        textoPublicacion={textoPublicacion}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="matching-state matching-state--placeholder">
              <span className="material-symbols-outlined matching-state-icon" aria-hidden="true">
                psychology
              </span>
              <h3>Configura tu perfil</h3>
              <p>
                Completa los filtros y pulsa <strong>Generar sugerencias</strong> para ver ofertas
                ordenadas por afinidad.
              </p>
            </div>
          )}
        </section>
      </main>

      <AppFooter />
    </div>
  );
}

export default MatchingEstudiante;
