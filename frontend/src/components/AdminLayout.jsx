import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession } from "../api/client";
import { getAdmin } from "../utils/session";
import "./AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();
  const admin = getAdmin();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const nombre =
    admin?.nombre ||
    admin?.name ||
    [admin?.nombres, admin?.apellidos].filter(Boolean).join(" ") ||
    admin?.correo ||
    "Administrador";

  const handleLogout = async () => {
    setLoggingOut(true);
    clearSession();
    navigate("/inicio-estudiante", { replace: true });
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" aria-label="Navegación de administración">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-logo">
            Practi<span>Nexo</span>
          </span>
          <span className="admin-sidebar-badge">Admin</span>
        </div>

        <p className="admin-sidebar-user" title={admin?.correo || ""}>
          {nombre}
        </p>

        <nav className="admin-sidebar-nav">
          <NavLink to="/admin" end className="admin-nav-link">
            <span className="admin-nav-dot" aria-hidden="true" />
            Panel
          </NavLink>
          <NavLink to="/admin/ofertas" className="admin-nav-link">
            <span className="admin-nav-dot" aria-hidden="true" />
            Ofertas
          </NavLink>
          <NavLink to="/admin/crear-oferta" className="admin-nav-link">
            <span className="admin-nav-dot" aria-hidden="true" />
            Crear oferta
          </NavLink>
          <NavLink to="/admin/postulaciones" className="admin-nav-link">
            <span className="admin-nav-dot" aria-hidden="true" />
            Postulaciones
          </NavLink>
          <NavLink to="/admin/maestras" className="admin-nav-link">
            <span className="admin-nav-dot" aria-hidden="true" />
            Maestras
          </NavLink>
          <NavLink to="/admin/programas" className="admin-nav-link">
            <span className="admin-nav-dot" aria-hidden="true" />
            Programas
          </NavLink>
          <NavLink to="/admin/estudiantes" className="admin-nav-link">
            <span className="admin-nav-dot" aria-hidden="true" />
            Estudiantes
          </NavLink>
          <NavLink to="/admin/reporte-ofertas" className="admin-nav-link">
            <span className="admin-nav-dot" aria-hidden="true" />
            Reporte ofertas
          </NavLink>
          <NavLink to="/admin/reporte-postulaciones" className="admin-nav-link">
            <span className="admin-nav-dot" aria-hidden="true" />
            Reporte postulaciones
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          {confirmLogout ? (
            <div className="admin-logout-confirm" role="alert">
              <p className="admin-logout-confirm-text">¿Cerrar sesión?</p>
              <div className="admin-logout-confirm-actions">
                <button
                  type="button"
                  className="admin-logout-confirm-btn admin-logout-confirm-btn--no"
                  onClick={() => setConfirmLogout(false)}
                  disabled={loggingOut}
                >
                  No
                </button>
                <button
                  type="button"
                  className="admin-logout-confirm-btn admin-logout-confirm-btn--yes"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? "Saliendo…" : "Sí"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="admin-sidebar-logout"
              onClick={() => setConfirmLogout(true)}
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </aside>

      <div className="admin-main-wrap">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
