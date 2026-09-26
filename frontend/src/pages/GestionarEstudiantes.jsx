import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createEstudianteAdmin,
  deleteEstudianteAdmin,
  fetchEstudiantesAdmin,
  updateEstudianteAdmin,
} from "../api/estudiantesAdmin";
import { getApiErrorMessage } from "../api/httpError";
import "./GestionarEstudiantes.css";

const emptyEstudiante = {
  nombre: "",
  correo: "",
  password: "",
  programaAcademico: "",
  areaInteres: "",
  tipoOportunidadInteres: "",
  disponibilidad: "",
  habilidades: "",
  palabrasClave: "",
  estado: "ACTIVO",
};

function GestionarEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [form, setForm] = useState(emptyEstudiante);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadEstudiantes = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const params = { page, limit: 20 };
      if (busqueda.trim()) params.busqueda = busqueda.trim();
      if (filtroEstado) params.estado = filtroEstado;

      const result = await fetchEstudiantesAdmin(params);
      setEstudiantes(result.data || []);
      setTotal(result.total || 0);
      setPages(result.pages || 1);
    } catch (e) {
      setListError(getApiErrorMessage(e, "No se pudieron cargar los estudiantes."));
      setEstudiantes([]);
    } finally {
      setLoadingList(false);
    }
  }, [page, busqueda, filtroEstado]);

  useEffect(() => {
    loadEstudiantes();
  }, [loadEstudiantes]);

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 350);
    return () => clearTimeout(t);
  }, [busqueda, filtroEstado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setSubmitError("");
  };

  const resetForm = () => {
    setForm(emptyEstudiante);
    setEditingId(null);
    setSubmitError("");
  };

  const startEdit = (e) => {
    setEditingId(e._id);
    setForm({
      nombre: e.nombre ?? "",
      correo: e.correo ?? "",
      password: "",
      programaAcademico: e.programaAcademico ?? "",
      areaInteres: e.areaInteres ?? "",
      tipoOportunidadInteres: e.tipoOportunidadInteres ?? "",
      disponibilidad: e.disponibilidad ?? "",
      habilidades: Array.isArray(e.habilidades) ? e.habilidades.join(", ") : "",
      palabrasClave: Array.isArray(e.palabrasClave) ? e.palabrasClave.join(", ") : "",
      estado: e.estado ?? "ACTIVO",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (ev) => {
    ev.preventDefault();

    if (!form.nombre.trim()) {
      setSubmitError("El nombre es obligatorio.");
      toast.error("El nombre es obligatorio.");
      return;
    }
    if (!form.correo.trim()) {
      setSubmitError("El correo es obligatorio.");
      toast.error("El correo es obligatorio.");
      return;
    }
    if (!editingId && form.password.length < 6) {
      setSubmitError("La contraseña debe tener al menos 6 caracteres.");
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const body = {
      nombre: form.nombre.trim(),
      correo: form.correo.trim(),
      programaAcademico: form.programaAcademico.trim(),
      areaInteres: form.areaInteres.trim(),
      tipoOportunidadInteres: form.tipoOportunidadInteres || undefined,
      disponibilidad: form.disponibilidad.trim(),
      habilidades: form.habilidades.split(",").map((s) => s.trim()).filter(Boolean),
      palabrasClave: form.palabrasClave.split(",").map((s) => s.trim()).filter(Boolean),
      estado: form.estado,
    };

    if (form.password) body.password = form.password;

    setSubmitting(true);
    setSubmitError("");
    try {
      if (editingId) {
        await updateEstudianteAdmin(editingId, body);
        toast.success("Estudiante actualizado correctamente.");
      } else {
        await createEstudianteAdmin(body);
        toast.success("Estudiante creado correctamente.");
      }
      resetForm();
      await loadEstudiantes();
    } catch (err) {
      const msg = getApiErrorMessage(err, "No se pudo guardar el estudiante.");
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteEstudianteAdmin(id);
      toast.success("Estudiante eliminado correctamente.");
      await loadEstudiantes();
      if (editingId === id) resetForm();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo eliminar el estudiante."));
    } finally {
      setDeletingId("");
      setDeleteConfirmId("");
    }
  };

  return (
    <div className="estudiantes-page">
      <header className="estudiantes-header">
        <div>
          <h1 className="estudiantes-title">Gestión de estudiantes</h1>
          <p className="estudiantes-sub">
            Catálogo maestro de estudiantes registrados en la plataforma.
          </p>
        </div>
      </header>

      {listError ? <p className="estudiantes-banner estudiantes-banner--warn">{listError}</p> : null}
      {submitError ? (
        <p className="estudiantes-banner estudiantes-banner--err" role="alert">
          {submitError}
        </p>
      ) : null}

      <section className="estudiantes-form-card">
        <h2 className="estudiantes-form-title">
          {editingId ? "Editar estudiante" : "Nuevo estudiante"}
        </h2>

        <form className="estudiantes-form" onSubmit={submit} noValidate>
          <div className="estudiantes-field">
            <label htmlFor="est-nombre">Nombre *</label>
            <input
              id="est-nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Juan Pérez"
              maxLength={100}
            />
          </div>

          <div className="estudiantes-field">
            <label htmlFor="est-correo">Correo *</label>
            <input
              id="est-correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="juan@correo.com"
            />
          </div>

          <div className="estudiantes-field">
            <label htmlFor="est-password">
              {editingId ? "Nueva contraseña (opcional)" : "Contraseña *"}
            </label>
            <input
              id="est-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={editingId ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"}
            />
          </div>

          <div className="estudiantes-field">
            <label htmlFor="est-programa">Programa académico</label>
            <input
              id="est-programa"
              name="programaAcademico"
              type="text"
              value={form.programaAcademico}
              onChange={handleChange}
              placeholder="Ingeniería de Sistemas"
            />
          </div>

          <div className="estudiantes-field">
            <label htmlFor="est-area">Área de interés</label>
            <input
              id="est-area"
              name="areaInteres"
              type="text"
              value={form.areaInteres}
              onChange={handleChange}
              placeholder="Desarrollo de software"
            />
          </div>

          <div className="estudiantes-field">
            <label htmlFor="est-tipo">Tipo de oportunidad</label>
            <select
              id="est-tipo"
              name="tipoOportunidadInteres"
              value={form.tipoOportunidadInteres}
              onChange={handleChange}
            >
              <option value="">Sin especificar</option>
              <option value="PRACTICA">Práctica profesional</option>
              <option value="SERVICIO_SOCIAL">Servicio social</option>
            </select>
          </div>

          <div className="estudiantes-field">
            <label htmlFor="est-disp">Disponibilidad</label>
            <input
              id="est-disp"
              name="disponibilidad"
              type="text"
              value={form.disponibilidad}
              onChange={handleChange}
              placeholder="Tiempo completo"
            />
          </div>

          <div className="estudiantes-field">
            <label htmlFor="est-habilidades">Habilidades (coma)</label>
            <input
              id="est-habilidades"
              name="habilidades"
              type="text"
              value={form.habilidades}
              onChange={handleChange}
              placeholder="JavaScript, Python, SQL"
            />
          </div>

          <div className="estudiantes-field">
            <label htmlFor="est-palabras">Palabras clave (coma)</label>
            <input
              id="est-palabras"
              name="palabrasClave"
              type="text"
              value={form.palabrasClave}
              onChange={handleChange}
              placeholder="web, frontend, bases de datos"
            />
          </div>

          <div className="estudiantes-field">
            <label htmlFor="est-estado">Estado</label>
            <select id="est-estado" name="estado" value={form.estado} onChange={handleChange}>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>

          <div className="estudiantes-form-actions">
            <button
              type="submit"
              className="estudiantes-btn estudiantes-btn--primary"
              disabled={submitting}
            >
              {submitting ? "Guardando…" : editingId ? "Guardar cambios" : "Crear estudiante"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="estudiantes-btn estudiantes-btn--ghost"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="estudiantes-list-card">
        <div className="estudiantes-list-header">
          <h2 className="estudiantes-form-title">
            Estudiantes registrados ({total})
          </h2>
          <div className="estudiantes-filters">
            <input
              type="search"
              placeholder="Buscar por nombre o correo…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar estudiantes"
            />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
        </div>

        {loadingList ? (
          <p className="estudiantes-muted">Cargando…</p>
        ) : estudiantes.length === 0 ? (
          <p className="estudiantes-muted">No hay estudiantes que coincidan con los filtros.</p>
        ) : (
          <div className="estudiantes-table-wrap">
            <table className="estudiantes-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Programa</th>
                  <th>Estado</th>
                  <th aria-label="Acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((e) => (
                  <tr key={e._id}>
                    <td>{e.nombre}</td>
                    <td>{e.correo}</td>
                    <td>{e.programaAcademico || "—"}</td>
                    <td>
                      <span
                        className={
                          e.estado === "ACTIVO"
                            ? "estudiantes-badge estudiantes-badge--ok"
                            : "estudiantes-badge estudiantes-badge--off"
                        }
                      >
                        {e.estado}
                      </span>
                    </td>
                    <td className="estudiantes-actions-cell">
                      <button
                        type="button"
                        className="estudiantes-btn estudiantes-btn--sm"
                        onClick={() => startEdit(e)}
                      >
                        Editar
                      </button>
                      {deleteConfirmId === e._id ? (
                        <span className="estudiantes-confirm">
                          <button
                            type="button"
                            className="estudiantes-btn estudiantes-btn--sm estudiantes-btn--danger"
                            onClick={() => handleDelete(e._id)}
                            disabled={deletingId === e._id}
                          >
                            {deletingId === e._id ? "…" : "Confirmar"}
                          </button>
                          <button
                            type="button"
                            className="estudiantes-btn estudiantes-btn--sm estudiantes-btn--ghost"
                            onClick={() => setDeleteConfirmId("")}
                            disabled={deletingId === e._id}
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="estudiantes-btn estudiantes-btn--sm estudiantes-btn--danger"
                          onClick={() => setDeleteConfirmId(e._id)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 ? (
          <div className="estudiantes-pagination">
            <button
              type="button"
              className="estudiantes-btn estudiantes-btn--sm estudiantes-btn--ghost"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              ← Anterior
            </button>
            <span className="estudiantes-page-info">
              Página {page} de {pages}
            </span>
            <button
              type="button"
              className="estudiantes-btn estudiantes-btn--sm estudiantes-btn--ghost"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
            >
              Siguiente →
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default GestionarEstudiantes;
