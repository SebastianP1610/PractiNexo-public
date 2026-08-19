import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  fetchEstudianteMe,
  updateEstudianteMe,
  uploadFotoPerfil,
  deleteFotoPerfil,
  uploadHojaVida,
  deleteHojaVida,
  downloadMiHojaVida,
  changePassword,
} from "../api/estudiantes";
import { ESTUDIANTE_KEY } from "../api/client";
import { getApiErrorMessage } from "../api/httpError";
import { readStudentSession } from "../utils/session";
import { formatearFechaLarga } from "../utils/format";
import { descargarBlob } from "../utils/download";
import StudentHeader from "../components/StudentHeader";
import StudentProfileModal from "../components/StudentProfileModal";
import PerfilPasswordForm from "../components/PerfilPasswordForm";
import AppFooter from "../components/AppFooter";
import "./PerfilEstudiante.css";
import "./OfertasEstudiante.css";

const UPLOADS_BASE =
  (import.meta.env.VITE_API_URL ?? "http://localhost:4500/api").replace(/\/api$/, "") +
  "/uploads/";

function fotoUrl(relativePath) {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  return UPLOADS_BASE + relativePath;
}

function extractDoc(res) {
  if (!res || typeof res !== "object") return null;
  if (res.data != null && typeof res.data === "object") return res.data;
  return res;
}

function PerfilEstudiante() {
  const isLoggedIn = readStudentSession();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [biografia, setBiografia] = useState("");
  const [telefono, setTelefono] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portafolio, setPortafolio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fotoInputRef = useRef(null);

  const [uploadingCV, setUploadingCV] = useState(false);
  const [downloadingCV, setDownloadingCV] = useState(false);
  const cvInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const loadPerfil = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetchEstudianteMe();
      const d = extractDoc(res);
      if (!d || typeof d !== "object") {
        setLoadError("No se recibió el perfil del servidor.");
        setDoc(null);
        return;
      }
      setDoc(d);
      setBiografia(d.biografia || "");
      setTelefono(d.telefono || "");
      setGithub(d.redesSociales?.github || "");
      setLinkedin(d.redesSociales?.linkedin || "");
      setPortafolio(d.redesSociales?.portafolio || "");
    } catch (err) {
      setDoc(null);
      setLoadError(getApiErrorMessage(err, "No se pudo cargar tu perfil."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    loadPerfil();
  }, [isLoggedIn, loadPerfil]);

  const updateSessionDoc = (updated) => {
    if (!updated) return;
    setDoc(updated);
    setBiografia(updated.biografia || "");
    setTelefono(updated.telefono || "");
    setGithub(updated.redesSociales?.github || "");
    setLinkedin(updated.redesSociales?.linkedin || "");
    setPortafolio(updated.redesSociales?.portafolio || "");
    try {
      sessionStorage.setItem(ESTUDIANTE_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const body = {
        biografia: biografia.trim().slice(0, 500),
        telefono: telefono.trim(),
        redesSociales: {
          github: github.trim(),
          linkedin: linkedin.trim(),
          portafolio: portafolio.trim(),
        },
      };
      const res = await updateEstudianteMe(body);
      const updated = extractDoc(res);
      updateSessionDoc(updated);
      toast.success("Perfil actualizado correctamente.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo guardar el perfil."));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFoto(true);
    try {
      const res = await uploadFotoPerfil(file);
      const d = extractDoc(res);
      const updated = { ...doc, fotoPerfil: d?.fotoPerfil || "" };
      updateSessionDoc(updated);
      toast.success("Foto de perfil actualizada.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo subir la foto."));
    } finally {
      setUploadingFoto(false);
      if (fotoInputRef.current) fotoInputRef.current.value = "";
    }
  };

  const handleDeleteFoto = async () => {
    setUploadingFoto(true);
    try {
      const res = await deleteFotoPerfil();
      const d = extractDoc(res);
      const updated = { ...doc, fotoPerfil: d?.fotoPerfil || "" };
      updateSessionDoc(updated);
      toast.success("Foto de perfil eliminada.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo eliminar la foto."));
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleCVChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCV(true);
    try {
      const res = await uploadHojaVida(file);
      const d = extractDoc(res);
      const updated = {
        ...doc,
        hojaVida: d?.hojaVida || "",
        hojaVidaNombre: d?.hojaVidaNombre || "",
      };
      updateSessionDoc(updated);
      toast.success("Hoja de vida subida correctamente.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo subir la hoja de vida."));
    } finally {
      setUploadingCV(false);
      if (cvInputRef.current) cvInputRef.current.value = "";
    }
  };

  const handleDeleteCV = async () => {
    setUploadingCV(true);
    try {
      await deleteHojaVida();
      const updated = {
        ...doc,
        hojaVida: "",
        hojaVidaNombre: "",
      };
      updateSessionDoc(updated);
      toast.success("Hoja de vida eliminada.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo eliminar la hoja de vida."));
    } finally {
      setUploadingCV(false);
    }
  };

  const handleDownloadCV = async () => {
    setDownloadingCV(true);
    try {
      const blob = await downloadMiHojaVida();
      descargarBlob(blob, doc.hojaVidaNombre || "hoja-de-vida.pdf");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo descargar la hoja de vida."));
    } finally {
      setDownloadingCV(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Todos los campos de contraseña son obligatorios.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo cambiar la contraseña."));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleProfileModalSaved = (updated) => {
    if (updated) {
      updateSessionDoc(updated);
    }
  };

  if (loading) {
    return (
      <div className="perfil-page">
        <StudentHeader />
        <main className="perfil-main">
          <div className="perfil-loading">Cargando perfil…</div>
        </main>
        <AppFooter brandLabel="PractiNexo" />
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <StudentHeader />

      <main className="perfil-main">
        {!isLoggedIn ? (
          <section className="perfil-login-prompt">
            <div className="perfil-login-prompt-card pn-fade-up">
              <span className="perfil-login-icon material-symbols-outlined">person_off</span>
              <h2>Debes iniciar sesión</h2>
              <p>Accede con tu cuenta de estudiante para ver y editar tu perfil.</p>
              <Link to="/login" className="perfil-btn perfil-btn--primary">
                Iniciar sesión
              </Link>
            </div>
          </section>
        ) : loadError ? (
          <section className="perfil-error-section">
            <div className="perfil-error-card">
              <p>{loadError}</p>
              <button type="button" className="perfil-btn perfil-btn--outline" onClick={loadPerfil}>
                Reintentar
              </button>
            </div>
          </section>
        ) : doc ? (
          <>
            <section className="perfil-hero" aria-label="Cabecera del perfil">
              <div className="perfil-hero-inner">
                <div className="perfil-avatar-wrap">
                  <div
                    className={`perfil-avatar ${uploadingFoto ? "perfil-avatar--uploading" : ""}`}
                    onClick={() => !uploadingFoto && fotoInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Cambiar foto de perfil"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fotoInputRef.current?.click();
                      }
                    }}
                  >
                    {doc.fotoPerfil ? (
                      <img
                        src={fotoUrl(doc.fotoPerfil)}
                        alt={`Foto de perfil de ${doc.nombre}`}
                        className="perfil-avatar-img"
                      />
                    ) : (
                      <span className="perfil-avatar-placeholder material-symbols-outlined">
                        person
                      </span>
                    )}
                    <div className="perfil-avatar-overlay">
                      <span className="material-symbols-outlined">photo_camera</span>
                    </div>
                  </div>
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="perfil-file-input"
                    onChange={handleFotoChange}
                    aria-hidden="true"
                  />
                  {doc.fotoPerfil ? (
                    <button
                      type="button"
                      className="perfil-avatar-remove"
                      onClick={handleDeleteFoto}
                      disabled={uploadingFoto}
                    >
                      Quitar foto
                    </button>
                  ) : null}
                </div>
                <div className="perfil-hero-info">
                  <h1 className="perfil-hero-name">{doc.nombre}</h1>
                  <p className="perfil-hero-email">{doc.correo}</p>
                  {doc.fechaRegistro ? (
                    <p className="perfil-hero-joined">
                      Miembro desde {formatearFechaLarga(doc.fechaRegistro)}
                    </p>
                  ) : null}
                  {doc.telefono ? (
                    <p className="perfil-hero-phone">{doc.telefono}</p>
                  ) : null}
                </div>
              </div>
            </section>

            <div className="perfil-grid">
              <section className="perfil-card pn-fade-up" aria-labelledby="perfil-bio-heading">
                <div className="perfil-card-header">
                  <h2 id="perfil-bio-heading" className="perfil-card-title">
                    Presentación
                  </h2>
                  <span className="perfil-char-count">
                    {biografia.length}/500
                  </span>
                </div>
                <textarea
                  className="perfil-textarea"
                  rows={4}
                  placeholder="Cuéntanos sobre ti, tu experiencia y metas profesionales…"
                  value={biografia}
                  maxLength={500}
                  onChange={(e) => setBiografia(e.target.value)}
                  disabled={savingProfile}
                />
              </section>

              <section className="perfil-card pn-fade-up pn-stagger-1" aria-labelledby="perfil-redes-heading">
                <div className="perfil-card-header">
                  <h2 id="perfil-redes-heading" className="perfil-card-title">
                    Redes y enlaces
                  </h2>
                </div>
                <div className="perfil-redes-grid">
                  <label className="perfil-redes-field">
                    <span className="perfil-redes-icon">◉</span>
                    <span className="perfil-redes-label">GitHub</span>
                    <input
                      type="url"
                      className="perfil-input"
                      placeholder="https://github.com/tuusuario"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      disabled={savingProfile}
                    />
                  </label>
                  <label className="perfil-redes-field">
                    <span className="perfil-redes-icon">in</span>
                    <span className="perfil-redes-label">LinkedIn</span>
                    <input
                      type="url"
                      className="perfil-input"
                      placeholder="https://linkedin.com/in/tuusuario"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      disabled={savingProfile}
                    />
                  </label>
                  <label className="perfil-redes-field">
                    <span className="perfil-redes-icon">🌐</span>
                    <span className="perfil-redes-label">Portafolio</span>
                    <input
                      type="url"
                      className="perfil-input"
                      placeholder="https://tuportafolio.com"
                      value={portafolio}
                      onChange={(e) => setPortafolio(e.target.value)}
                      disabled={savingProfile}
                    />
                  </label>
                </div>
              </section>

              <section className="perfil-card pn-fade-up pn-stagger-1" aria-labelledby="perfil-tel-heading">
                <div className="perfil-card-header">
                  <h2 id="perfil-tel-heading" className="perfil-card-title">
                    Teléfono
                  </h2>
                </div>
                <input
                  type="tel"
                  className="perfil-input"
                  placeholder="+57 300 000 0000"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={savingProfile}
                />
              </section>

              <div className="perfil-save-row pn-fade-up pn-stagger-2">
                <button
                  type="button"
                  className="perfil-btn perfil-btn--primary"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? "Guardando…" : "Guardar cambios del perfil"}
                </button>
              </div>

              <section className="perfil-card pn-fade-up pn-stagger-2" aria-labelledby="perfil-acad-heading">
                <div className="perfil-card-header">
                  <h2 id="perfil-acad-heading" className="perfil-card-title">
                    Información académica
                  </h2>
                  <button
                    type="button"
                    className="perfil-btn perfil-btn--small"
                    onClick={() => setProfileModalOpen(true)}
                  >
                    Editar
                  </button>
                </div>
                <dl className="perfil-dl">
                  <div className="perfil-dl-row">
                    <dt>Programa académico</dt>
                    <dd>{doc.programaAcademico || "—"}</dd>
                  </div>
                  <div className="perfil-dl-row">
                    <dt>Área de interés</dt>
                    <dd>{doc.areaInteres || "—"}</dd>
                  </div>
                  <div className="perfil-dl-row">
                    <dt>Tipo de oportunidad</dt>
                    <dd>
                      {doc.tipoOportunidadInteres === "PRACTICA"
                        ? "Práctica"
                        : doc.tipoOportunidadInteres === "SERVICIO_SOCIAL"
                          ? "Servicio social"
                          : "—"}
                    </dd>
                  </div>
                  <div className="perfil-dl-row">
                    <dt>Disponibilidad</dt>
                    <dd>{doc.disponibilidad || "—"}</dd>
                  </div>
                  <div className="perfil-dl-row">
                    <dt>Habilidades</dt>
                    <dd>
                      {doc.habilidades?.length
                        ? doc.habilidades.join(", ")
                        : "—"}
                    </dd>
                  </div>
                  <div className="perfil-dl-row">
                    <dt>Palabras clave</dt>
                    <dd>
                      {doc.palabrasClave?.length
                        ? doc.palabrasClave.join(", ")
                        : "—"}
                    </dd>
                  </div>
                </dl>
                <StudentProfileModal
                  open={profileModalOpen}
                  onClose={() => setProfileModalOpen(false)}
                  onSaved={handleProfileModalSaved}
                />
              </section>

              <section className="perfil-card pn-fade-up pn-stagger-3" aria-labelledby="perfil-cv-heading">
                <div className="perfil-card-header">
                  <h2 id="perfil-cv-heading" className="perfil-card-title">
                    Hoja de vida
                  </h2>
                </div>
                <div className="perfil-cv-body">
                  {doc.hojaVida ? (
                    <div className="perfil-cv-file">
                      <span className="material-symbols-outlined perfil-cv-icon">description</span>
                      <div className="perfil-cv-info">
                        <span className="perfil-cv-name">{doc.hojaVidaNombre || "Hoja de vida"}</span>
                        <span className="perfil-cv-type">PDF</span>
                      </div>
                      <div className="perfil-cv-actions">
                        <button
                          type="button"
                          className="perfil-btn perfil-btn--small"
                          onClick={handleDownloadCV}
                          disabled={downloadingCV}
                        >
                          {downloadingCV ? "Descargando…" : "Descargar"}
                        </button>
                        <button
                          type="button"
                          className="perfil-btn perfil-btn--small perfil-btn--danger"
                          onClick={handleDeleteCV}
                          disabled={uploadingCV}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="perfil-cv-empty">No has subido tu hoja de vida aún.</p>
                  )}
                  <label className="perfil-btn perfil-btn--outline perfil-cv-upload-btn">
                    {uploadingCV ? "Subiendo…" : doc.hojaVida ? "Reemplazar hoja de vida" : "Subir hoja de vida (PDF)"}
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept=".pdf"
                      className="perfil-file-input"
                      onChange={handleCVChange}
                      disabled={uploadingCV}
                    />
                  </label>
                </div>
              </section>

              <PerfilPasswordForm
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                changingPassword={changingPassword}
                handleChangePassword={handleChangePassword}
              />
            </div>
          </>
        ) : (
          <section className="perfil-error-section">
            <div className="perfil-error-card">
              <p>No se encontró información de perfil.</p>
              <button type="button" className="perfil-btn perfil-btn--outline" onClick={loadPerfil}>
                Reintentar
              </button>
            </div>
          </section>
        )}
      </main>

      <AppFooter brandLabel="PractiNexo" />
    </div>
  );
}

export default PerfilEstudiante;
