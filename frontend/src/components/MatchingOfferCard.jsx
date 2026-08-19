import { useCallback, useState } from "react";
import { etiquetaCriterio } from "../utils/matching";
import { calcularPorcentaje } from "../utils/matching";

function DetalleCriterio({ criterio, detalle }) {
  if (!detalle) return null;

  if (criterio === "tipoOportunidad" || criterio === "disponibilidad") {
    return (
      <div className="matching-detalle-item">
        <span className="matching-detalle-label">{etiquetaCriterio(criterio)}</span>
        <span className="matching-detalle-valor">{detalle.valor}</span>
      </div>
    );
  }

  if (criterio === "palabrasClave" || criterio === "requisitos") {
    const refLabel = criterio === "palabrasClave" ? "Oferta" : "Requisitos";
    return (
      <div className="matching-detalle-item">
        <span className="matching-detalle-label">
          {etiquetaCriterio(criterio)}
          <span className="matching-detalle-peso">
            ({detalle.puntaje}/{detalle.peso} pts)
          </span>
        </span>
        {detalle.coinciden?.length > 0 && (
          <div className="matching-detalle-palabras">
            <span className="matching-detalle-palabras-label">Coinciden:</span>
            <div className="matching-detalle-tags">
              {detalle.coinciden.map((p) => (
                <span key={p} className="matching-detalle-tag match">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="matching-detalle-palabras">
          <span className="matching-detalle-palabras-label">Tu perfil:</span>
          <div className="matching-detalle-tags">
            {detalle.palabrasPerfil?.map((p) => (
              <span
                key={p}
                className={`matching-detalle-tag ${palabraCoincide(p, detalle.coinciden) ? "match" : "nomatch"}`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="matching-detalle-palabras">
          <span className="matching-detalle-palabras-label">{refLabel}:</span>
          <div className="matching-detalle-tags">
            {(detalle.palabrasOferta || detalle.palabrasReferencia)?.map((p) => (
              <span
                key={p}
                className={`matching-detalle-tag ${palabraCoincide(p, detalle.coinciden) ? "match" : "nomatch"}`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (criterio === "programaAcademico" || criterio === "areaInteres") {
    return (
      <div className="matching-detalle-item">
        <span className="matching-detalle-label">
          {etiquetaCriterio(criterio)}
          <span className="matching-detalle-peso">
            ({detalle.puntaje}/{detalle.peso} pts)
          </span>
        </span>
        {detalle.coinciden?.length > 0 && (
          <div className="matching-detalle-palabras">
            <span className="matching-detalle-palabras-label">Coinciden:</span>
            <div className="matching-detalle-tags">
              {detalle.coinciden.map((p) => (
                <span key={p} className="matching-detalle-tag match">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="matching-detalle-palabras">
          <span className="matching-detalle-palabras-label">Tu perfil:</span>
          <div className="matching-detalle-tags">
            {detalle.palabrasPerfil?.map((p) => (
              <span
                key={p}
                className={`matching-detalle-tag ${palabraCoincide(p, detalle.coinciden) ? "match" : "nomatch"}`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="matching-detalle-palabras">
          <span className="matching-detalle-palabras-label">Oferta:</span>
          <div className="matching-detalle-tags">
            {detalle.palabrasOferta?.map((p) => (
              <span
                key={p}
                className={`matching-detalle-tag ${palabraCoincide(p, detalle.coinciden) ? "match" : "nomatch"}`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function palabraCoincide(palabra, lista) {
  if (!lista || !lista.length) return false;
  const p = palabra.toLowerCase().trim();
  return lista.some((c) => {
    if (c === p) return true;
    if (c.length >= 3 && p.length >= 3) {
      if (c.includes(p) || p.includes(c)) return true;
    }
    return false;
  });
}

const CARD_ICONS = ["code", "database", "cloud"];

function MatchingOfferCard({ item, iconIndex, navigate, metaModalidad, textoPublicacion }) {
  const [showDetails, setShowDetails] = useState(false);
  const toggleDetails = useCallback(() => setShowDetails((s) => !s), []);
  const o = item?.oferta;
  if (!o) return null;
  const pct = calcularPorcentaje(item.puntajeCoincidencia);
  const icon = CARD_ICONS[iconIndex % CARD_ICONS.length];
  const detalles = item.detalles;
  return (
    <article className="matching-result-card">
      <div className="matching-result-card-top">
        <span className={`matching-result-icon matching-result-icon--${icon}`}>
          <span className="material-symbols-outlined" aria-hidden="true">
            {icon}
          </span>
        </span>
        <div className="matching-result-match">
          <span className="matching-result-pct">{pct}%</span>
          <span className="matching-result-pct-label">coincidencia</span>
        </div>
      </div>
      <h3 className="matching-result-title">{o.titulo}</h3>
      <p className="matching-result-co">{o?.dependenciaId?.nombre || "Dependencia"}</p>
      {item.criteriosCoincidentes?.length > 0 ? (
        <div className="matching-result-criteria">
          <span className="matching-result-criteria-label">Criterios coincidentes</span>
          <div className="matching-result-criteria-tags">
            {item.criteriosCoincidentes.map((c) => (
              <span key={c} className="matching-criteria-tag">
                <span className="material-symbols-outlined" aria-hidden="true">
                  check
                </span>
                {etiquetaCriterio(c)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {detalles && Object.keys(detalles).length > 0 && (
        <div className="matching-detalle-section">
          <button
            type="button"
            className="matching-detalle-toggle"
            onClick={toggleDetails}
            aria-expanded={showDetails}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {showDetails ? "expand_less" : "expand_more"}
            </span>
            {showDetails ? "Ocultar detalles" : "Ver qué coincidió"}
          </button>
          {showDetails && (
            <div className="matching-detalle-content">
              {item.criteriosCoincidentes.map((c) => (
                <DetalleCriterio key={c} criterio={c} detalle={detalles[c]} />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="matching-result-footer">
        <div className="matching-result-meta">
          <span>
            <span className="material-symbols-outlined meta-ico" aria-hidden="true">
              schedule
            </span>
            {textoPublicacion(o?.fechaPublicacion)}
          </span>
          <span>
            <span className="material-symbols-outlined meta-ico" aria-hidden="true">
              wifi_tethering
            </span>
            {metaModalidad(o)}
          </span>
        </div>
        <button
          type="button"
          className="matching-result-detail-btn"
          onClick={() => navigate(`/ofertas/${o._id}`)}
        >
          Ver detalle
        </button>
      </div>
    </article>
  );
}

export default MatchingOfferCard;
export { DetalleCriterio };
