import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fetchEstudianteMe, updateEstudianteMe } from "../api/estudiantes";
import { ESTUDIANTE_KEY } from "../api/client";
import { getApiErrorMessage } from "../api/httpError";
import { parseStringList } from "../utils/parse";
import "./StudentProfileModal.css";

/** Modal de ficha estudiante (GET/PUT /estudiantes/me). No aplica a administradores. */

function extractDoc(res) {
  if (!res || typeof res !== "object") return null;
  if (res.data != null && typeof res.data === "object") return res.data;
  return res;
}

function pickField(doc, key) {
  const direct = doc?.[key];
  if (direct != null && direct !== "") return direct;
  const p = doc?.perfil;
  if (p && typeof p === "object" && !Array.isArray(p) && p[key] != null && p[key] !== "") {
    return p[key];
  }
  return "";
}

function pickArrayField(doc, key) {
  const direct = doc?.[key];
  if (Array.isArray(direct)) return direct;
  const p = doc?.perfil;
  if (p && typeof p === "object" && Array.isArray(p[key])) return p[key];
  return [];
}

function docToFormState(doc) {
  const hab = pickArrayField(doc, "habilidades");
  const keys = pickArrayField(doc, "palabrasClave");
  return {
    nombre: String(pickField(doc, "nombre") ?? ""),
    programaAcademico: String(pickField(doc, "programaAcademico") ?? ""),
    areaInteres: String(pickField(doc, "areaInteres") ?? ""),
    tipoOportunidadInteres: String(pickField(doc, "tipoOportunidadInteres") ?? ""),
    disponibilidad: String(pickField(doc, "disponibilidad") ?? ""),
    habilidadesText: hab.length ? hab.join(", ") : "",
    palabrasClaveText: keys.length ? keys.join(", ") : "",
  };
}

function StudentProfileModal({ open, onClose, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [doc, setDoc] = useState(null);
  const [form, setForm] = useState(() => docToFormState({}));
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    setSaveError("");
    try {
      const res = await fetchEstudianteMe();
      const next = extractDoc(res);
      if (!next || typeof next !== "object") {
        setLoadError("No se recibió el perfil del servidor.");
        setDoc(null);
        return;
      }
      setDoc(next);
      setForm(docToFormState(next));
    } catch (err) {
      setDoc(null);
      setLoadError(getApiErrorMessage(err, "No se pudo cargar tu perfil."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    if (!form.nombre.trim()) {
      setSaveError("El nombre es obligatorio.");
      return;
    }
    const body = {
      nombre: form.nombre.trim(),
      programaAcademico: form.programaAcademico.trim(),
      areaInteres: form.areaInteres.trim(),
      disponibilidad: form.disponibilidad.trim(),
      tipoOportunidadInteres:
        form.tipoOportunidadInteres === "" ? "" : form.tipoOportunidadInteres,
      habilidades: parseStringList(form.habilidadesText),
      palabrasClave: parseStringList(form.palabrasClaveText),
    };
    setSaving(true);
    try {
      const res = await updateEstudianteMe(body);
      const updated = extractDoc(res);
      if (updated && typeof updated === "object") {
        try {
          sessionStorage.setItem(ESTUDIANTE_KEY, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
        onSaved?.(updated);
      }
      onClose();
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "No se pudo guardar el perfil."));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const correoDisplay =
    doc?.correo != null && doc.correo !== ""
      ? String(doc.correo)
      : doc
        ? String(pickField(doc, "correo") || "")
        : "";

  const node = (
    <div className="spm-backdrop" role="presentation" onClick={onClose}>
      <div
        className="spm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spm-profile-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="spm-header">
          <h2 id="spm-profile-title" className="spm-title">
            Mi perfil
          </h2>
          <button type="button" className="spm-close" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="spm-body">
          {loading ? (
            <p className="spm-loading">Cargando perfil…</p>
          ) : loadError ? (
            <p className="spm-error">{loadError}</p>
          ) : doc ? (
            <>
              <form className="spm-form" onSubmit={handleSubmit}>
                <label className="spm-label" htmlFor="spm-correo">
                  Correo
                </label>
                <input
                  id="spm-correo"
                  className="spm-input spm-input--readonly"
                  type="email"
                  readOnly
                  tabIndex={-1}
                  value={correoDisplay}
                  aria-readonly="true"
                />

                <label className="spm-label" htmlFor="spm-nombre">
                  Nombre
                </label>
                <input
                  id="spm-nombre"
                  className="spm-input"
                  type="text"
                  autoComplete="name"
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  disabled={saving}
                />

                <label className="spm-label" htmlFor="spm-programa">
                  Programa académico
                </label>
                <input
                  id="spm-programa"
                  className="spm-input"
                  type="text"
                  value={form.programaAcademico}
                  onChange={(e) => setField("programaAcademico", e.target.value)}
                  disabled={saving}
                />

                <label className="spm-label" htmlFor="spm-area">
                  Área de interés
                </label>
                <input
                  id="spm-area"
                  className="spm-input"
                  type="text"
                  value={form.areaInteres}
                  onChange={(e) => setField("areaInteres", e.target.value)}
                  disabled={saving}
                />

                <label className="spm-label" htmlFor="spm-tipo">
                  Tipo de oportunidad
                </label>
                <select
                  id="spm-tipo"
                  className="spm-select"
                  value={form.tipoOportunidadInteres}
                  onChange={(e) => setField("tipoOportunidadInteres", e.target.value)}
                  disabled={saving}
                >
                  <option value="">Sin definir (limpiar)</option>
                  <option value="PRACTICA">Práctica</option>
                  <option value="SERVICIO_SOCIAL">Servicio social</option>
                </select>

                <label className="spm-label" htmlFor="spm-disp">
                  Disponibilidad
                </label>
                <input
                  id="spm-disp"
                  className="spm-input"
                  type="text"
                  value={form.disponibilidad}
                  onChange={(e) => setField("disponibilidad", e.target.value)}
                  disabled={saving}
                />

                <label className="spm-label" htmlFor="spm-hab">
                  Habilidades (separadas por coma)
                </label>
                <textarea
                  id="spm-hab"
                  className="spm-textarea"
                  rows={2}
                  value={form.habilidadesText}
                  onChange={(e) => setField("habilidadesText", e.target.value)}
                  disabled={saving}
                />

                <label className="spm-label" htmlFor="spm-keys">
                  Palabras clave (separadas por coma)
                </label>
                <textarea
                  id="spm-keys"
                  className="spm-textarea"
                  rows={2}
                  value={form.palabrasClaveText}
                  onChange={(e) => setField("palabrasClaveText", e.target.value)}
                  disabled={saving}
                />

                <p className="spm-hint">La contraseña no se modifica desde esta pantalla.</p>

                {saveError ? <p className="spm-error">{saveError}</p> : null}

                <button type="submit" className="spm-submit" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar cambios"}
                </button>
              </form>
            </>
          ) : (
            <p className="spm-muted">Sin datos.</p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

export default StudentProfileModal;
