import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, ESTUDIANTE_KEY, TOKEN_KEY } from "../api/client";
import "./StudentHeader.css";

const linksBase = [
  { to: "/inicio-estudiante", label: "Inicio" },
  { to: "/ofertas", label: "Ofertas" },
];

const linkMisPostulaciones = { to: "/mis-postulaciones", label: "Mis postulaciones" };

const linksSugerencias = { to: "/sugerencias", label: "Sugerencias" };

function IconUser() {
  return (
    <svg className="student-user-icon-svg" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  );
}

function StudentHeader() {
  const navigate = useNavigate();
  const hasSession = Boolean(sessionStorage.getItem(TOKEN_KEY));
  const isStudentSession =
    hasSession && Boolean(sessionStorage.getItem(ESTUDIANTE_KEY));

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <header className="student-header">
      <div className="student-header-inner">
        <Link to="/inicio-estudiante" className="student-logo">
          Practi<span>Nexo</span>
        </Link>

        <nav className="student-nav" aria-label="Navegacion de estudiante">
          {linksBase.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `student-nav-link ${isActive ? "is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isStudentSession ? (
            <NavLink
              to={linkMisPostulaciones.to}
              className={({ isActive }) =>
                `student-nav-link ${isActive ? "is-active" : ""}`
              }
            >
              {linkMisPostulaciones.label}
            </NavLink>
          ) : null}
          <NavLink
            to={linksSugerencias.to}
            className={({ isActive }) =>
              `student-nav-link ${isActive ? "is-active" : ""}`
            }
          >
            {linksSugerencias.label}
          </NavLink>
        </nav>

        {hasSession ? (
          <div className="student-session-wrap">
            {isStudentSession ? (
              <Link
                to="/perfil"
                className="student-user-btn"
                aria-label="Ver mi perfil"
              >
                <IconUser />
              </Link>
            ) : null}
            <button type="button" className="student-admin-link student-logout-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link to="/login" className="student-admin-link">
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}

export default StudentHeader;
