import { Link, useNavigate } from "react-router-dom";

function DetalleHeroPanel({
  oferta,
  badgeSecundario,
  subtituloLinea,
  studentSession,
  ofertaActiva,
  yaPostulado,
  tuvoCancelada,
  observacion,
  setObservacion,
  postLoading,
  misChecking,
  postError,
  setPostError,
  saved,
  postularHref,
  toggleGuardar,
  handlePostularPractiNexo,
}) {
  const navigate = useNavigate();

  return (
    <header className="detalle-hero-panel">
      <div className="detalle-badges">
        <button
          type="button"
          className="detalle-badge detalle-badge--match"
          onClick={() => navigate("/sugerencias")}
        >
          Ver compatibilidad (matching)
        </button>
        {badgeSecundario ? (
          <span className="detalle-badge detalle-badge--muted">{badgeSecundario}</span>
        ) : (
          <span className="detalle-badge detalle-badge--muted">
            {oferta.tipoOportunidad === "PRACTICA" ? "PRÁCTICA" : "SERVICIO SOCIAL"}
          </span>
        )}
      </div>
      <h1 className="detalle-title">{oferta.titulo}</h1>
      {subtituloLinea ? <p className="detalle-subtitle">{subtituloLinea}</p> : null}
      {oferta.palabrasClave?.length > 0 ? (
        <div className="detalle-hero-tags">
          {oferta.palabrasClave.map((tag) => (
            <span key={tag} className="detalle-hero-tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="detalle-hero-actions">
        {studentSession ? (
          <div className="detalle-postulacion-bloque">
            {yaPostulado ? (
              <p className="detalle-postulacion-ya" role="status">
                Ya enviaste tu postulación a esta oferta.
              </p>
            ) : (
              <>
                {tuvoCancelada ? (
                  <p
                    className="detalle-postulacion-ya detalle-postulacion-ya--cancelada"
                    role="status"
                  >
                    Tuviste una postulación cancelada para esta oferta. Puedes volver a postularte.
                  </p>
                ) : null}
                {!ofertaActiva ? (
                  <p className="detalle-postulacion-aviso">
                    Esta oferta no está activa; no puedes postularte desde PractiNexo.
                  </p>
                ) : null}
                <label className="detalle-postulacion-label" htmlFor="detalle-obs">
                  Mensaje opcional para la dependencia
                </label>
                <textarea
                  id="detalle-obs"
                  className="detalle-postulacion-textarea"
                  rows={2}
                  placeholder="Ej. disponibilidad u otro comentario breve"
                  value={observacion}
                  onChange={(e) => {
                    setObservacion(e.target.value);
                    setPostError("");
                  }}
                  disabled={postLoading || !ofertaActiva || misChecking}
                />
                <button
                  type="button"
                  className="detalle-btn detalle-btn--apply"
                  disabled={postLoading || !ofertaActiva || misChecking}
                  onClick={handlePostularPractiNexo}
                >
                  {postLoading
                    ? "Enviando…"
                    : misChecking
                      ? "Comprobando…"
                      : "Postularme en PractiNexo"}
                </button>
                {postError ? <p className="detalle-postulacion-error">{postError}</p> : null}
              </>
            )}
          </div>
        ) : (
          <>
            {postularHref ? (
              <a
                href={postularHref}
                className="detalle-btn detalle-btn--apply"
                target="_blank"
                rel="noopener noreferrer"
              >
                Postularme ahora
              </a>
            ) : (
              <span className="detalle-btn detalle-btn--apply detalle-btn--disabled">
                Postularme ahora
              </span>
            )}
            <Link to="/login" className="detalle-btn detalle-btn--ghost">
              Iniciar sesión para postularte en PractiNexo
            </Link>
          </>
        )}
        <button
          type="button"
          className="detalle-btn detalle-btn--save"
          onClick={toggleGuardar}
          aria-pressed={saved}
        >
          <span className="material-symbols-outlined detalle-btn-icon" aria-hidden="true">
            {saved ? "bookmark" : "bookmark_add"}
          </span>
          {saved ? "Guardada" : "Guardar"}
        </button>
      </div>
    </header>
  );
}

export default DetalleHeroPanel;
