import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createPrograma,
  deletePrograma,
  fetchProgramas,
  updatePrograma,
} from "../api/programas";
import { getApiErrorMessage } from "../api/httpError";
import "./GestionarProgramas.css";

const NIVELES = [
  { value: "TECNICA", label: "Técnica" },
  { value: "TECNOLOGIA", label: "Tecnología" },
  { value: "PROFESIONAL", label: "Profesional" },
];

const emptyPrograma = {
  nombre: "",
  codigo: "",
  nivelAcademico: "PROFESIONAL",
  facultad: "",
  descripcion: "",
  estado: "ACTIVO",
};

function GestionarProgramas() {
  const [programas, setProgramas] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState(emptyPrograma);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadProgramas = useCallback(async () => {
    try {
      const data = await fetchProgramas();
      setProgramas(Array.isArray(data) ? data : []);
    } catch (e) {
      setListError(getApiErrorMessage(e, "No se pudieron cargar los programas académicos."));
      setProgramas([]);
    }
  }, []);

  const refresh = useCallback(async () => {
    setListError("");
    setLoadingList(true);
    await loadProgramas();
    setLoadingList(false);
  }, [loadProgramas]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setSubmitError("");
  };

  const resetForm = () => {
    setForm(emptyPrograma);
    setEditingId(null);
    setSubmitError("");
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      nombre: p.nombre ?? "",
      codigo: p.codigo ?? "",
      nivelAcademico: p.nivelAcademico ?? "PROFESIONAL",
      facultad: p.facultad ?? "",
      descripcion: p.descripcion ?? "",
      estado: p.estado === "INACTIVO" ? "INACTIVO" : "ACTIVO",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      setSubmitError("El nombre es obligatorio.");
      toast.error("El nombre es obligatorio.");
      return;
    }

    const body = {
      nombre: form.nombre.trim(),
      codigo: form.codigo.trim(),
      nivelAcademico: form.nivelAcademico,
      facultad: form.facultad.trim(),
      descripcion: form.descripcion.trim(),
      estado: form.estado,
    };

    setSubmitting(true);
    setSubmitError("");
    try {
      if (editingId) {
        await updatePrograma(editingId, body);
        toast.success("Programa académico actualizado correctamente.");
      } else {
        await createPrograma(body);
        toast.success("Programa académico creado correctamente.");
      }
      resetForm();
      await loadProgramas();
    } catch (err) {
      const msg = getApiErrorMessage(err, "No se pudo guardar el programa académico.");
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deletePrograma(id);
      toast.success("Programa académico eliminado correctamente.");
      await loadProgramas();
      if (editingId === id) resetForm();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo eliminar el programa académico."));
    } finally {
      setDeletingId("");
      setDeleteConfirmId("");
    }
  };

  return (
    <div className="programas-page">
      <header className="programas-header">
        <div>
          <h1 className="programas-title">Programas académicos</h1>
          <p className="programas-sub">
            Catálogo maestro de programas usados en ofertas y perfiles de estudiante.
          </p>
        </div>
      </header>

      {listError ? <p className="programas-banner programas-banner--warn">{listError}</p> : null}
      {submitError ? (
        <p className="programas-banner programas-banner--err" role="alert">
          {submitError}
        </p>
      ) : null}

      <section className="programas-form-card">
        <h2 className="programas-form-title">
          {editingId ? "Editar programa académico" : "Nuevo programa académico"}
        </h2>

        <form className="programas-form" onSubmit={submit} noValidate>
          <div className="programas-field">
            <label htmlFor="prog-nombre">Nombre *</label>
            <input
              id="prog-nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ingeniería de Sistemas"
              maxLength={120}
            />
          </div>

          <div className="programas-field">
            <label htmlFor="prog-codigo">Código</label>
            <input
              id="prog-codigo"
              name="codigo"
              type="text"
              value={form.codigo}
              onChange={handleChange}
              placeholder="IS-01"
              maxLength={20}
            />
          </div>

          <div className="programas-field">
            <label htmlFor="prog-nivel">Nivel académico</label>
            <select
              id="prog-nivel"
              name="nivelAcademico"
              value={form.nivelAcademico}
              onChange={handleChange}
            >
              {NIVELES.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          <div className="programas-field">
            <label htmlFor="prog-facultad">Facultad</label>
            <input
              id="prog-facultad"
              name="facultad"
              type="text"
              value={form.facultad}
              onChange={handleChange}
              placeholder="Facultad de Ingeniería"
            />
          </div>

          <div className="programas-field programas-field--wide">
            <label htmlFor="prog-desc">Descripción</label>
            <textarea
              id="prog-desc"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={2}
              placeholder="Descripción breve del programa"
            />
          </div>

          <div className="programas-field">
            <label htmlFor="prog-estado">Estado</label>
            <select id="prog-estado" name="estado" value={form.estado} onChange={handleChange}>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>

          <div className="programas-form-actions">
            <button type="submit" className="programas-btn programas-btn--primary" disabled={submitting}>
              {submitting ? "Guardando…" : editingId ? "Guardar cambios" : "Crear programa"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="programas-btn programas-btn--ghost"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="programas-list-card">
        <h2 className="programas-form-title">
          Programas registrados ({programas.length})
        </h2>

        {loadingList ? (
          <p className="programas-muted">Cargando…</p>
        ) : programas.length === 0 ? (
          <p className="programas-muted">Aún no hay programas académicos registrados.</p>
        ) : (
          <div className="programas-table-wrap">
            <table className="programas-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Nivel</th>
                  <th>Facultad</th>
                  <th>Estado</th>
                  <th aria-label="Acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {programas.map((p) => (
                  <tr key={p._id}>
                    <td>{p.nombre}</td>
                    <td>{p.codigo || "—"}</td>
                    <td>{p.nivelAcademico || "—"}</td>
                    <td>{p.facultad || "—"}</td>
                    <td>
                      <span
                        className={
                          p.estado === "ACTIVO"
                            ? "programas-badge programas-badge--ok"
                            : "programas-badge programas-badge--off"
                        }
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="programas-actions-cell">
                      <button
                        type="button"
                        className="programas-btn programas-btn--sm"
                        onClick={() => startEdit(p)}
                      >
                        Editar
                      </button>
                      {deleteConfirmId === p._id ? (
                        <span className="programas-confirm">
                          <button
                            type="button"
                            className="programas-btn programas-btn--sm programas-btn--danger"
                            onClick={() => handleDelete(p._id)}
                            disabled={deletingId === p._id}
                          >
                            {deletingId === p._id ? "…" : "Confirmar"}
                          </button>
                          <button
                            type="button"
                            className="programas-btn programas-btn--sm programas-btn--ghost"
                            onClick={() => setDeleteConfirmId("")}
                            disabled={deletingId === p._id}
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="programas-btn programas-btn--sm programas-btn--danger"
                          onClick={() => setDeleteConfirmId(p._id)}
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
      </section>
    </div>
  );
}

export default GestionarProgramas;
