import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategorias } from "../api/categorias";
import { fetchDependencias } from "../api/dependencias";
import { getApiErrorMessage } from "../api/httpError";
import {
  createOferta,
  deleteOferta,
  fetchOfertaById,
  fetchOfertas,
  updateOferta,
} from "../api/ofertas";
import toast from "react-hot-toast";
import "./CrearOferta.css";

const initialForm = {
  titulo: "",
  descripcion: "",
  tipoOportunidad: "",
  contacto: "",
  dependenciaId: "",
  categoriaId: "",
  requisitos: "",
  palabrasClave: "",
  fechaCierre: "",
  estadoVigencia: "ACTIVA",
  programaAcademico: "",
  areaInteres: "",
  disponibilidad: "",
};

function buildPayload(form) {
  const payload = {
    titulo: form.titulo.trim(),
    descripcion: form.descripcion.trim(),
    tipoOportunidad: form.tipoOportunidad,
    contacto: form.contacto.trim(),
    dependenciaId: form.dependenciaId,
    categoriaId: form.categoriaId,
  };

  if (form.requisitos.trim()) {
    payload.requisitos = form.requisitos.trim();
  }
  if (form.palabrasClave.trim()) {
    payload.palabrasClave = form.palabrasClave.trim();
  }
  if (form.fechaCierre) {
    const d = new Date(form.fechaCierre);
    payload.fechaCierre = Number.isNaN(d.getTime())
      ? form.fechaCierre
      : d.toISOString();
  }
  if (form.estadoVigencia && form.estadoVigencia !== "ACTIVA") {
    payload.estadoVigencia = form.estadoVigencia;
  }
  if (form.programaAcademico.trim()) {
    payload.programaAcademico = form.programaAcademico.trim();
  }
  if (form.areaInteres.trim()) {
    payload.areaInteres = form.areaInteres.trim();
  }
  if (form.disponibilidad.trim()) {
    payload.disponibilidad = form.disponibilidad.trim();
  }

  return payload;
}

function textToStringArray(text) {
  if (!text || !String(text).trim()) return [];
  return String(text)
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildUpdatePayload(form) {
  const payload = {
    titulo: form.titulo.trim(),
    descripcion: form.descripcion.trim(),
    tipoOportunidad: form.tipoOportunidad,
    contacto: form.contacto.trim(),
    dependenciaId: form.dependenciaId,
    categoriaId: form.categoriaId,
    requisitos: textToStringArray(form.requisitos),
    palabrasClave: textToStringArray(form.palabrasClave),
    programaAcademico: form.programaAcademico.trim(),
    areaInteres: form.areaInteres.trim(),
    disponibilidad: form.disponibilidad.trim(),
    estadoVigencia: form.estadoVigencia,
  };

  if (form.fechaCierre) {
    const d = new Date(form.fechaCierre);
    payload.fechaCierre = Number.isNaN(d.getTime())
      ? null
      : d.toISOString();
  } else {
    payload.fechaCierre = null;
  }

  return payload;
}

function toDatetimeLocalValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function mapOfertaToForm(o) {
  const depId =
    typeof o.dependenciaId === "object" && o.dependenciaId?._id
      ? o.dependenciaId._id
      : o.dependenciaId ?? "";
  const catId =
    typeof o.categoriaId === "object" && o.categoriaId?._id
      ? o.categoriaId._id
      : o.categoriaId ?? "";
  const req = Array.isArray(o.requisitos)
    ? o.requisitos.join("\n")
    : o.requisitos
      ? String(o.requisitos)
      : "";
  const pal = Array.isArray(o.palabrasClave)
    ? o.palabrasClave.join(", ")
    : o.palabrasClave
      ? String(o.palabrasClave)
      : "";

  return {
    titulo: o.titulo ?? "",
    descripcion: o.descripcion ?? "",
    tipoOportunidad: o.tipoOportunidad ?? "",
    contacto: o.contacto ?? "",
    dependenciaId: String(depId),
    categoriaId: String(catId),
    requisitos: req,
    palabrasClave: pal,
    fechaCierre: toDatetimeLocalValue(o.fechaCierre),
    estadoVigencia: o.estadoVigencia ?? "ACTIVA",
    programaAcademico: o.programaAcademico ?? "",
    areaInteres: o.areaInteres ?? "",
    disponibilidad: o.disponibilidad ?? "",
  };
}

function CrearOferta() {
  const [form, setForm] = useState(initialForm);
  const [dependencias, setDependencias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ofertasPreview, setOfertasPreview] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [searchParams] = useSearchParams();

  const loadDatos = useCallback(async () => {
    setLoadError("");
    setLoadingInitial(true);

    const [rDeps, rCats, rOf] = await Promise.allSettled([
      fetchDependencias(),
      fetchCategorias(),
      fetchOfertas(),
    ]);

    if (rDeps.status === "fulfilled" && Array.isArray(rDeps.value)) {
      setDependencias(rDeps.value);
    } else {
      setDependencias([]);
    }
    if (rCats.status === "fulfilled" && Array.isArray(rCats.value)) {
      setCategorias(rCats.value);
    } else {
      setCategorias([]);
    }
    if (rOf.status === "fulfilled" && Array.isArray(rOf.value)) {
      setOfertasPreview(rOf.value.slice(0, 10));
    } else {
      setOfertasPreview([]);
    }

    const fallos = [];
    if (rDeps.status === "rejected") fallos.push("dependencias");
    if (rCats.status === "rejected") fallos.push("categorías");
    if (rOf.status === "rejected") fallos.push("ofertas");
    if (fallos.length) {
      setLoadError(
        `No se pudo cargar: ${fallos.join(", ")}. Comprueba el backend (GET /api/...).`,
      );
    }

    setLoadingInitial(false);
  }, []);

  useEffect(() => {
    loadDatos();
  }, [loadDatos]);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || editingId) return;
    let cancelled = false;
    (async () => {
      setLoadingEdit(true);
      try {
        const full = await fetchOfertaById(editId);
        if (cancelled) return;
        setEditingId(full._id);
        setForm(mapOfertaToForm(full));
      } catch (err) {
        if (cancelled) return;
        toast.error(getApiErrorMessage(err, "No se pudo cargar la oferta para editar."));
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...initialForm });
    setSubmitError("");
  };

  const startEdit = async (o) => {
    setLoadingEdit(true);
    try {
      const full = await fetchOfertaById(o._id);
      setEditingId(full._id);
      setForm(mapOfertaToForm(full));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo cargar la oferta para editar."));
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDelete = async (o) => {
    setDeletingId(o._id);
    try {
      const res = await deleteOferta(o._id);
      toast.success(res?.mensaje || "Oferta eliminada correctamente.");
      if (editingId === o._id) cancelEdit();
      await loadDatos();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo eliminar la oferta."));
    } finally {
      setDeletingId("");
      setDeleteConfirmId("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposFaltantes = [];
    if (!form.titulo.trim()) camposFaltantes.push("título");
    if (!form.descripcion.trim()) camposFaltantes.push("descripción");
    if (!form.tipoOportunidad) camposFaltantes.push("tipo de oportunidad");
    if (!form.contacto.trim()) camposFaltantes.push("contacto");
    if (!form.dependenciaId) camposFaltantes.push("dependencia");
    if (!form.categoriaId) camposFaltantes.push("categoría");

    const fail = (msg) => {
      setSubmitError(msg);
      toast.error(msg);
    };

    if (camposFaltantes.length) {
      fail(`Faltan campos obligatorios: ${camposFaltantes.join(", ")}.`);
      return;
    }
    if (form.titulo.trim().length < 5) {
      fail("El título debe tener al menos 5 caracteres.");
      return;
    }
    if (form.descripcion.trim().length < 20) {
      fail("La descripción debe tener al menos 20 caracteres.");
      return;
    }

    const contactoTrim = form.contacto.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[\d\s\-+()]{7,20}$/;
    const contactoInvalido = contactoTrim.includes("@")
      ? !emailRe.test(contactoTrim)
      : !phoneRe.test(contactoTrim);
    if (contactoInvalido) {
      fail("El contacto no es un correo ni teléfono válido.");
      return;
    }

    if (!editingId && form.fechaCierre) {
      const d = new Date(form.fechaCierre);
      if (!Number.isNaN(d.getTime()) && d.getTime() < Date.now()) {
        fail("La fecha de cierre no puede ser anterior a la fecha actual.");
        return;
      }
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      if (editingId) {
        const res = await updateOferta(editingId, buildUpdatePayload(form));
        toast.success(res?.mensaje || "Oferta actualizada correctamente.");
        setEditingId(null);
        setForm({ ...initialForm });
      } else {
        const res = await createOferta(buildPayload(form));
        toast.success(res?.mensaje || "Oferta creada correctamente.");
        setForm({ ...initialForm });
      }
      await loadDatos();
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        editingId
          ? "No se pudo actualizar la oferta."
          : "No se pudo crear la oferta. Revisa el token y los datos.",
      );
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="oferta-crear-page">
      <header className="oferta-crear-header">
        <div>
          <h1 className="oferta-crear-title">
            {editingId ? "Editar oferta" : "Crear oferta"}
          </h1>
          {editingId ? (
            <p className="oferta-crear-sub">Editando oferta (id: {editingId})</p>
          ) : null}
        </div>
      </header>

      {loadError ? <p className="oferta-crear-banner oferta-crear-banner--warn">{loadError}</p> : null}

      <div className="oferta-crear-layout">
        <form className="oferta-crear-form" onSubmit={handleSubmit}>
          {loadingEdit ? (
            <p className="oferta-crear-banner oferta-crear-banner--warn">Cargando oferta…</p>
          ) : null}

          <div className="oferta-crear-grid2">
            <label className="oferta-field">
              <span>Título *</span>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ej. Práctica en desarrollo web"
                disabled={submitting}
              />
            </label>
            <label className="oferta-field">
              <span>Tipo de oportunidad *</span>
              <select
                name="tipoOportunidad"
                value={form.tipoOportunidad}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">Selecciona…</option>
                <option value="PRACTICA">PRACTICA</option>
                <option value="SERVICIO_SOCIAL">SERVICIO_SOCIAL</option>
              </select>
            </label>
          </div>

          <label className="oferta-field">
            <span>Descripción *</span>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={4}
              placeholder="Describe la oportunidad"
              disabled={submitting}
            />
          </label>

          <div className="oferta-crear-grid2">
            <label className="oferta-field">
              <span>Dependencia *</span>
              <select
                name="dependenciaId"
                value={form.dependenciaId}
                onChange={handleChange}
                disabled={submitting || loadingInitial || !dependencias.length}
              >
                <option value="">
                  {loadingInitial
                    ? "Cargando…"
                    : dependencias.length
                      ? "Selecciona"
                      : "Sin dependencias — créalas en Maestras"}
                </option>
                {dependencias.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="oferta-field">
              <span>Categoría *</span>
              <select
                name="categoriaId"
                value={form.categoriaId}
                onChange={handleChange}
                disabled={submitting || loadingInitial || !categorias.length}
              >
                <option value="">
                  {loadingInitial
                    ? "Cargando…"
                    : categorias.length
                      ? "Selecciona"
                      : "Sin categorías — créalas en Maestras"}
                </option>
                {categorias.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="oferta-field">
            <span>Contacto *</span>
            <input
              name="contacto"
              type="text"
              value={form.contacto}
              onChange={handleChange}
              placeholder="rrhh@empresa.com o teléfono"
              disabled={submitting}
            />
          </label>

          <label className="oferta-field">
            <span>Requisitos (opcional)</span>
            <textarea
              name="requisitos"
              value={form.requisitos}
              onChange={handleChange}
              rows={3}
              placeholder={
                editingId
                  ? "En edición se envía como lista: separa por comas, ; o saltos de línea."
                  : "Al crear: texto; el backend normaliza. Al editar (PUT): se convierte a array antes de enviar."
              }
              disabled={submitting}
            />
          </label>

          <label className="oferta-field">
            <span>Palabras clave (opcional)</span>
            <input
              name="palabrasClave"
              value={form.palabrasClave}
              onChange={handleChange}
              placeholder="Ej. biblioteca, inventario, Excel"
              disabled={submitting}
            />
          </label>

          <div className="oferta-crear-grid3">
            <label className="oferta-field">
              <span>Programa académico</span>
              <input
                name="programaAcademico"
                value={form.programaAcademico}
                onChange={handleChange}
                disabled={submitting}
              />
            </label>
            <label className="oferta-field">
              <span>Área de interés</span>
              <input
                name="areaInteres"
                value={form.areaInteres}
                onChange={handleChange}
                disabled={submitting}
              />
            </label>
            <label className="oferta-field">
              <span>Disponibilidad</span>
              <input
                name="disponibilidad"
                value={form.disponibilidad}
                onChange={handleChange}
                disabled={submitting}
              />
            </label>
          </div>

          <div className="oferta-crear-grid2">
            <label className="oferta-field">
              <span>Fecha de cierre (opcional)</span>
              <input
                name="fechaCierre"
                type="datetime-local"
                value={form.fechaCierre}
                onChange={handleChange}
                disabled={submitting}
              />
            </label>
            <label className="oferta-field">
              <span>Estado de vigencia</span>
              <select
                name="estadoVigencia"
                value={form.estadoVigencia}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="ACTIVA">ACTIVA</option>
                <option value="INACTIVA">INACTIVA</option>
                <option value="CERRADA">CERRADA</option>
                <option value="VENCIDA">VENCIDA</option>
              </select>
            </label>
          </div>

          {submitError ? (
            <p className="oferta-crear-banner oferta-crear-banner--err" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="oferta-crear-form-actions">
            <button
              type="submit"
              className="oferta-crear-submit"
              disabled={submitting || loadingEdit}
            >
              {submitting
                ? editingId
                  ? "Guardando…"
                  : "Publicando…"
                : editingId
                  ? "Guardar cambios"
                  : "Publicar oferta"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="oferta-crear-cancel"
                onClick={cancelEdit}
                disabled={submitting}
              >
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>

        <aside className="oferta-crear-aside">
          <h2>Últimas ofertas</h2>
          <button
            type="button"
            className="oferta-crear-refresh"
            onClick={loadDatos}
            disabled={loadingInitial}
          >
            Refrescar listado
          </button>
          <ul className="oferta-crear-list">
            {loadingInitial && ofertasPreview.length === 0 ? (
              <li className="oferta-crear-list-empty">Cargando…</li>
            ) : ofertasPreview.length === 0 ? (
              <li className="oferta-crear-list-empty">No hay ofertas.</li>
            ) : (
              ofertasPreview.map((o) => (
                <li key={o._id}>
                  <div className="oferta-crear-list-row">
                    <div>
                      <strong>{o.titulo}</strong>
                      <span className="oferta-crear-list-meta">
                        {o.tipoOportunidad}
                        {typeof o.dependenciaId === "object" && o.dependenciaId?.nombre
                          ? ` · ${o.dependenciaId.nombre}`
                          : ""}
                      </span>
                    </div>
                    <div className="oferta-crear-list-btns">
                      <button
                        type="button"
                        className="oferta-crear-list-btn"
                        onClick={() => startEdit(o)}
                        disabled={loadingEdit || submitting}
                      >
                        Editar
                      </button>
                      {deleteConfirmId === o._id ? (
                        <button
                          type="button"
                          className="oferta-crear-list-btn oferta-crear-list-btn--danger"
                          onClick={() => handleDelete(o)}
                          disabled={!!deletingId}
                        >
                          {deletingId === o._id ? "Eliminando…" : "¿Confirmar?"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="oferta-crear-list-btn oferta-crear-list-btn--danger"
                          onClick={() => setDeleteConfirmId(o._id)}
                          disabled={submitting}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                  {deleteConfirmId === o._id && deletingId !== o._id ? (
                    <div className="oferta-crear-delete-confirm">
                      <span>¿Eliminar "{o.titulo}"?</span>
                      <button
                        type="button"
                        className="oferta-crear-list-btn"
                        onClick={() => setDeleteConfirmId("")}
                      >
                        No
                      </button>
                    </div>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default CrearOferta;