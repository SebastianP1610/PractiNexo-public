import { Link } from "react-router-dom";
import AppFooter from "../components/AppFooter";
import StudentHeader from "../components/StudentHeader";
import "./InicioEstudiante.css";
import "./OfertasEstudiante.css";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD-Gche-q5iYK3YpsSt-zn_cmyCczHFcpATghbfcpP1H4BmkphtiYGjsoyoP3WZFW_LctfccRCOV96nVQleWF_RA-aXO8yRa81TKVicBTPgwPu8SHeIHq4G0DFKI4HZy9TCsv2nVhdN-aP2TbMCW0aieDTSP8eWCoL9d1cjjUooKuL5-gxHHMHD64aB490TDkgN4LFY0hw5KO7-TBpZh4020f_8ntcFtyH8IZolyEUOE0gqQvWLhpGjbxz6Wh-6kdI0B05gikUrFkmW";

function InicioEstudiante() {
  return (
    <div className="inicio-page ofertas-page">
      <StudentHeader />

      <main className="ofertas-main">
        <section className="ofertas-landing-hero" aria-labelledby="inicio-hero-heading">
          <div className="ofertas-landing-hero-inner">
            <div className="ofertas-landing-hero-copy">
              <h1 id="inicio-hero-heading">
                Encuentra tu <span>práctica ideal</span>
              </h1>
              <p>
                Centraliza las oportunidades del Politécnico JIC. Nuestra plataforma une el talento
                académico con la excelencia institucional en un solo pulso digital.
              </p>
              <div className="ofertas-landing-hero-actions">
                <Link to="/ofertas" className="ofertas-btn-hero ofertas-btn-hero--grad">
                  Ver ofertas
                </Link>
                <Link to="/sugerencias" className="ofertas-btn-hero ofertas-btn-hero--outline">
                  Buscar por matching
                </Link>
              </div>
            </div>
            <div className="ofertas-landing-hero-visual" aria-hidden="true">
              <div className="ofertas-landing-hero-blob1" />
              <div className="ofertas-landing-hero-blob2" />
              <div className="ofertas-landing-hero-frame">
                <img
                  src={HERO_IMG}
                  alt="Estudiantes universitarios colaborando en un espacio de estudio luminoso"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="ofertas-landing-how" aria-labelledby="inicio-how-heading">
          <div className="ofertas-landing-how-inner">
            <div className="ofertas-landing-section-head">
              <h2 id="inicio-how-heading">¿Cómo funciona?</h2>
              <p>
                Tres pasos sencillos para impulsar tu carrera profesional desde el Politécnico JIC.
              </p>
            </div>
            <div className="ofertas-landing-steps">
              <div className="ofertas-step-card">
                <div className="ofertas-step-icon ofertas-step-icon--primary">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <h3 className="text-primary">1. Busca ofertas</h3>
                <p>
                  Explora el catálogo unificado de prácticas pre-profesionales disponibles en todas
                  las dependencias del Politécnico.
                </p>
              </div>
              <div className="ofertas-step-card">
                <div className="ofertas-step-icon ofertas-step-icon--secondary">
                  <span className="material-symbols-outlined">filter_alt</span>
                </div>
                <h3 className="text-secondary">2. Filtra por tu perfil</h3>
                <p>
                  Utiliza nuestro algoritmo de matching para encontrar las vacantes que mejor se
                  alinean con tus habilidades y carrera.
                </p>
              </div>
              <div className="ofertas-step-card">
                <div className="ofertas-step-icon ofertas-step-icon--tertiary">
                  <span className="material-symbols-outlined material-symbols-outlined--fill">
                    hub
                  </span>
                </div>
                <h3 className="text-tertiary">3. Conecta con la dependencia</h3>
                <p>
                  Inicia el proceso de vinculación de forma directa y transparente con los
                  coordinadores de cada área institucional.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="ofertas-landing-featured" aria-labelledby="inicio-featured-heading">
          <div className="ofertas-landing-featured-inner">
            <div className="ofertas-landing-featured-copy">
              <div className="ofertas-badge">Inteligencia de matching</div>
              <h2 id="inicio-featured-heading">
                Tu perfil es único,
                <br />
                tu práctica también.
              </h2>
              <p>
                Olvídate de revisar cientos de archivos PDF. PractiNexo analiza tus competencias y
                te ofrece un porcentaje de compatibilidad en tiempo real para cada vacante.
              </p>
              <div className="ofertas-check-list">
                <div className="ofertas-check-row">
                  <span className="material-symbols-outlined material-symbols-outlined--fill">
                    check_circle
                  </span>
                  <span>Análisis de malla curricular</span>
                </div>
                <div className="ofertas-check-row">
                  <span className="material-symbols-outlined material-symbols-outlined--fill">
                    check_circle
                  </span>
                  <span>Validación automática de requisitos</span>
                </div>
              </div>
            </div>
            <div className="ofertas-landing-match-card-wrap">
              <div className="ofertas-landing-match-card">
                <div className="ofertas-landing-match-card-header">
                  <div>
                    <small>Empresa / Dependencia</small>
                    <h4>Soporte TI - Rectoría</h4>
                  </div>
                  <div className="ofertas-match-ring" aria-hidden="true">
                    94%
                  </div>
                </div>
                <div className="ofertas-landing-match-tags">
                  <span>SQL</span>
                  <span>Helpdesk</span>
                  <span>Redes</span>
                </div>
                <Link to="/sugerencias" className="ofertas-btn-match">
                  Ver detalles del match
                </Link>
              </div>
              <div className="ofertas-landing-match-glow" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="ofertas-landing-cta" aria-labelledby="inicio-cta-heading">
          <div className="ofertas-landing-cta-inner">
            <div className="ofertas-landing-cta-pattern" aria-hidden="true" />
            <h2 id="inicio-cta-heading">¿Listo para dar tu siguiente paso académico?</h2>
            <p>
              Únete a cientos de estudiantes que ya han centralizado su futuro profesional en el
              Politécnico JIC.
            </p>
            <Link to="/ofertas" className="ofertas-btn-cta">
              Comenzar ahora
            </Link>
          </div>
        </section>
      </main>

      <AppFooter brandLabel="PractiNexo" />
    </div>
  );
}

export default InicioEstudiante;
