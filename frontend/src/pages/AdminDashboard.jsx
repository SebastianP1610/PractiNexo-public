import { Link } from "react-router-dom";
import { getAdmin } from "../utils/session";
import "./AdminDashboard.css";

function AdminDashboard() {
  const admin = getAdmin();
  const saludo =
    admin?.nombre ||
    admin?.name ||
    [admin?.nombres, admin?.apellidos].filter(Boolean).join(" ") ||
    admin?.correo ||
    "administrador";

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-head">
        <h1 className="admin-dashboard-title">Panel de administración</h1>
        <p className="admin-dashboard-sub">
          Hola, <strong>{saludo}</strong>. Elige un módulo en la barra lateral o usa los accesos
          rápidos.
        </p>
      </header>

      <div className="admin-dashboard-cards">
        <Link to="/admin/ofertas" className="admin-dash-card">
          <h2 className="admin-dash-card-title">Ofertas</h2>
          <p className="admin-dash-card-desc">
            Ver, editar, eliminar y gestionar el estado de las ofertas (incluidas las vencidas).
          </p>
          <span className="admin-dash-card-cta">Abrir →</span>
        </Link>
        <Link to="/admin/crear-oferta" className="admin-dash-card">
          <h2 className="admin-dash-card-title">Crear oferta</h2>
          <p className="admin-dash-card-desc">
            Publica una nueva oferta de práctica o servicio social.
          </p>
          <span className="admin-dash-card-cta">Abrir →</span>
        </Link>
        <Link to="/admin/postulaciones" className="admin-dash-card">
          <h2 className="admin-dash-card-title">Postulaciones</h2>
          <p className="admin-dash-card-desc">
            Revisa a los estudiantes postulados, descarga su hoja de vida y acepta o rechaza.
          </p>
          <span className="admin-dash-card-cta">Abrir →</span>
        </Link>
        <Link to="/admin/maestras" className="admin-dash-card">
          <h2 className="admin-dash-card-title">Maestras</h2>
          <p className="admin-dash-card-desc">
            Gestionar dependencias y categorías usadas en las ofertas.
          </p>
          <span className="admin-dash-card-cta">Abrir →</span>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
