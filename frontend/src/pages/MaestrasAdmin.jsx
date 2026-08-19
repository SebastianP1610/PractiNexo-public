import { useCallback, useEffect, useState } from "react";
import {
  createCategoria,
  deleteCategoria,
  fetchCategorias,
  updateCategoria,
} from "../api/categorias";
import {
  createDependencia,
  deleteDependencia,
  fetchDependencias,
  updateDependencia,
} from "../api/dependencias";
import { getApiErrorMessage } from "../api/httpError";
import toast from "react-hot-toast";
import "./MaestrasAdmin.css";

const emptyDependencia = {
  nombre: "",
  descripcion: "",
  correoContacto: "",
  telefonoContacto: "",
  ubicacion: "",
  estado: "ACTIVA",
};

const emptyCategoria = {
  nombre: "",
  descripcion: "",
  estado: "ACTIVA",
};

function MaestrasAdmin() {
  const [tab, setTab] = useState("dependencias");

  const [dependencias, setDependencias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [depForm, setDepForm] = useState(emptyDependencia);
  const [editingDepId, setEditingDepId] = useState(null);
  const [depSubmitting, setDepSubmitting] = useState(false);

  const [catForm, setCatForm] = useState(emptyCategoria);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catSubmitting, setCatSubmitting] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadDependencias = useCallback(async () => {
    try {
      const data = await fetchDependencias();
      setDependencias(Array.isArray(data) ? data : []);
    } catch (e) {
      setListError(getApiErrorMessage(e, "No se pudieron cargar las dependencias."));
      setDependencias([]);
    }
  }, []);

  const loadCategorias = useCallback(async () => {
    try {
      const data = await fetchCategorias();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (e) {
      setListError(getApiErrorMessage(e, "No se pudieron cargar las categorías."));
      setCategorias([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setListError("");
    setLoadingList(true);
    await Promise.all([loadDependencias(), loadCategorias()]);
    setLoadingList(false);
  }, [loadDependencias, loadCategorias]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const depChange = (e) => {
    const { name, value } = e.target;
    setDepForm((p) => ({ ...p, [name]: value }));
    setSubmitError("");
  };

  const catChange = (e) => {
    const { name, value } = e.target;
    setCatForm((p) => ({ ...p, [name]: value }));
    setSubmitError("");
  };

  const resetDepForm = () => {
    setDepForm(emptyDependencia);
    setEditingDepId(null);
    setSubmitError("");
  };

  const resetCatForm = () => {
    setCatForm(emptyCategoria);
    setEditingCatId(null);
    setSubmitError("");
  };

  const startEditDep = (d) => {
    setEditingDepId(d._id);
    setDepForm({
      nombre: d.nombre ?? "",
      descripcion: d.descripcion ?? "",
      correoContacto: d.correoContacto ?? "",
      telefonoContacto: d.telefonoContacto ?? "",
      ubicacion: d.ubicacion ?? "",
      estado: d.estado === "INACTIVA" ? "INACTIVA" : "ACTIVA",
    });
  };

  const startEditCat = (c) => {
    setEditingCatId(c._id);
    setCatForm({
      nombre: c.nombre ?? "",
      descripcion: c.descripcion ?? "",
      estado: c.estado === "INACTIVA" ? "INACTIVA" : "ACTIVA",
    });
  };

  const submitDependencia = async (e) => {
    e.preventDefault();
    if (!depForm.nombre.trim()) {
      setSubmitError("El nombre es obligatorio.");
      toast.error("El nombre es obligatorio.");
      return;
    }

    const body = {
      nombre: depForm.nombre.trim(),
      descripcion: depForm.descripcion.trim(),
      correoContacto: depForm.correoContacto.trim(),
      telefonoContacto: depForm.telefonoContacto.trim(),
      ubicacion: depForm.ubicacion.trim(),
      estado: depForm.estado,
    };

    setDepSubmitting(true);
    setSubmitError("");
    try {
      if (editingDepId) {
        await updateDependencia(editingDepId, body);
        toast.success("Dependencia actualizada correctamente.");
      } else {
        await createDependencia(body);
        toast.success("Dependencia creada correctamente.");
      }
      resetDepForm();
      await loadDependencias();
    } catch (err) {
      const msg = getApiErrorMessage(err, "No se pudo guardar la dependencia.");
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setDepSubmitting(false);
    }
  };

  const submitCategoria = async (e) => {
    e.preventDefault();
    if (!catForm.nombre.trim()) {
      setSubmitError("El nombre es obligatorio.");
      toast.error("El nombre es obligatorio.");
      return;
    }

    const body = {
      nombre: catForm.nombre.trim(),
      descripcion: catForm.descripcion.trim(),
      estado: catForm.estado,
    };

    setCatSubmitting(true);
    setSubmitError("");
    try {
      if (editingCatId) {
        await updateCategoria(editingCatId, body);
        toast.success("Categoría actualizada correctamente.");
      } else {
        await createCategoria(body);
        toast.success("Categoría creada correctamente.");
      }
      resetCatForm();
      await loadCategorias();
    } catch (err) {
      const msg = getApiErrorMessage(err, "No se pudo guardar la categoría.");
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleDelete = async (id, nombre, type) => {
    setDeletingId(id);
    try {
      if (type === "dep") {
        await deleteDependencia(id);
        toast.success("Dependencia eliminada correctamente.");
        await loadDependencias();
        if (editingDepId === id) resetDepForm();
      } else {
        await deleteCategoria(id);
        toast.success("Categoría eliminada correctamente.");
        await loadCategorias();
        if (editingCatId === id) resetCatForm();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo eliminar."));
    } finally {
      setDeletingId("");
      setDeleteConfirmId("");
    }
  };

  return (
    <div className="maestras-page">
      <header className="maestras-header">
        <div>
          <h1 className="maestras-title">Maestras: dependencias y categorías</h1>
        </div>
      </header>

      {listError ? <p className="maestras-banner maestras-banner--warn">{listError}</p> : null}

      {submitError ? (
        <p className="maestras-banner maestras-banner--err" role="alert">{submitError}</p>
      ) : null}

      <nav className="maestras-tabs" aria-label="Secciones">
        <button
          type="button"
          className={tab === "dependencias" ? "active" : ""}
          onClick={() => setTab("dependencias")}
        >
          Dependencias
        </button>
        <button
          type="button"
          className={tab === "categorias" ? "active" : ""}
          onClick={() => setTab("categorias")}
        >
          Categorías
        </button>
        <button
          type="button"
          className="maestras-tab-refresh"
          onClick={refreshAll}
          disabled={loadingList}
        >
          Actualizar listas
        </button>
      </nav>

      {tab === "dependencias" ? (
        <div className="maestras-panel">
          <section className="maestras-form-card">
            <h2>{editingDepId ? "Editar dependencia" : "Nueva dependencia"}</h2>
            <form onSubmit={submitDependencia} className="maestras-form">
              <label>
                Nombre *
                <input name="nombre" value={depForm.nombre} onChange={depChange} required />
              </label>
              <label>
                Descripción
                <textarea name="descripcion" value={depForm.descripcion} onChange={depChange} rows={2} />
              </label>
              <div className="maestras-form-row">
                <label>
                  Correo contacto
                  <input name="correoContacto" type="email" value={depForm.correoContacto} onChange={depChange} />
                </label>
                <label>
                  Teléfono
                  <input name="telefonoContacto" value={depForm.telefonoContacto} onChange={depChange} />
                </label>
              </div>
              <label>
                Ubicación
                <input name="ubicacion" value={depForm.ubicacion} onChange={depChange} />
              </label>
              <label>
                Estado
                <select name="estado" value={depForm.estado} onChange={depChange}>
                  <option value="ACTIVA">ACTIVA</option>
                  <option value="INACTIVA">INACTIVA</option>
                </select>
              </label>
              <div className="maestras-form-actions">
                <button type="submit" className="maestras-btn maestras-btn--primary" disabled={depSubmitting}>
                  {depSubmitting ? "Guardando…" : editingDepId ? "Actualizar" : "Crear"}
                </button>
                {editingDepId ? (
                  <button type="button" className="maestras-btn maestras-btn--ghost" onClick={resetDepForm}>
                    Cancelar edición
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="maestras-table-card">
            <h2>Listado dependencias</h2>
            {loadingList ? (
              <p className="maestras-muted">Cargando…</p>
            ) : (
              <div className="maestras-table-wrap">
                <table className="maestras-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Ubicación</th>
                      <th>Estado</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {dependencias.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="maestras-muted">
                          No hay dependencias registradas.
                        </td>
                      </tr>
                    ) : (
                      dependencias.map((d) => (
                        <tr key={d._id}>
                          <td>{d.nombre}</td>
                          <td>{d.correoContacto || "—"}</td>
                          <td>{d.telefonoContacto || "—"}</td>
                          <td>{d.ubicacion || "—"}</td>
                          <td>{d.estado}</td>
                          <td className="maestras-actions">
                            {deleteConfirmId === d._id ? (
                              <span className="maestras-delete-inline">
                                <span className="maestras-delete-text">¿Eliminar?</span>
                                <button
                                  type="button"
                                  className="maestras-btn-sm danger"
                                  onClick={() => handleDelete(d._id, d.nombre, "dep")}
                                  disabled={!!deletingId}
                                >
                                  {deletingId === d._id ? "…" : "Sí"}
                                </button>
                                <button
                                  type="button"
                                  className="maestras-btn-sm"
                                  onClick={() => setDeleteConfirmId("")}
                                >
                                  No
                                </button>
                              </span>
                            ) : (
                              <>
                                <button type="button" className="maestras-btn-sm" onClick={() => startEditDep(d)}>
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  className="maestras-btn-sm danger"
                                  onClick={() => setDeleteConfirmId(d._id)}
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="maestras-panel">
          <section className="maestras-form-card">
            <h2>{editingCatId ? "Editar categoría" : "Nueva categoría"}</h2>
            <form onSubmit={submitCategoria} className="maestras-form">
              <label>
                Nombre *
                <input name="nombre" value={catForm.nombre} onChange={catChange} required />
              </label>
              <label>
                Descripción
                <textarea name="descripcion" value={catForm.descripcion} onChange={catChange} rows={2} />
              </label>
              <label>
                Estado
                <select name="estado" value={catForm.estado} onChange={catChange}>
                  <option value="ACTIVA">ACTIVA</option>
                  <option value="INACTIVA">INACTIVA</option>
                </select>
              </label>
              <div className="maestras-form-actions">
                <button type="submit" className="maestras-btn maestras-btn--primary" disabled={catSubmitting}>
                  {catSubmitting ? "Guardando…" : editingCatId ? "Actualizar" : "Crear"}
                </button>
                {editingCatId ? (
                  <button type="button" className="maestras-btn maestras-btn--ghost" onClick={resetCatForm}>
                    Cancelar edición
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="maestras-table-card">
            <h2>Listado categorías</h2>
            {loadingList ? (
              <p className="maestras-muted">Cargando…</p>
            ) : (
              <div className="maestras-table-wrap">
                <table className="maestras-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="maestras-muted">
                          No hay categorías registradas.
                        </td>
                      </tr>
                    ) : (
                      categorias.map((c) => (
                        <tr key={c._id}>
                          <td>{c.nombre}</td>
                          <td>{c.descripcion || "—"}</td>
                          <td>{c.estado}</td>
                          <td className="maestras-actions">
                            {deleteConfirmId === c._id ? (
                              <span className="maestras-delete-inline">
                                <span className="maestras-delete-text">¿Eliminar?</span>
                                <button
                                  type="button"
                                  className="maestras-btn-sm danger"
                                  onClick={() => handleDelete(c._id, c.nombre, "cat")}
                                  disabled={!!deletingId}
                                >
                                  {deletingId === c._id ? "…" : "Sí"}
                                </button>
                                <button
                                  type="button"
                                  className="maestras-btn-sm"
                                  onClick={() => setDeleteConfirmId("")}
                                >
                                  No
                                </button>
                              </span>
                            ) : (
                              <>
                                <button type="button" className="maestras-btn-sm" onClick={() => startEditCat(c)}>
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  className="maestras-btn-sm danger"
                                  onClick={() => setDeleteConfirmId(c._id)}
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default MaestrasAdmin;