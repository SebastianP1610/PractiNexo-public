import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../api/auth";
import {
  forgotPasswordEstudiante,
  loginEstudiante,
  registerEstudiante,
  resetPasswordEstudiante,
} from "../api/estudiantesAuth";
import { ADMIN_KEY, ESTUDIANTE_KEY, TOKEN_KEY } from "../api/client";
import { getApiErrorMessage } from "../api/httpError";
import { parseStringList } from "../utils/parse";
import RegisterForm from "../components/RegisterForm";
import { initialRegister } from "../utils/registerConstants";
import { IconAt, IconLock, IconEye } from "../utils/loginIcons";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import "./Login.css";

function formatExpiresAtLabel(value) {
  if (value == null || value === "") return "";
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  return String(value);
}

function IconGradCap() {
  return (
    <svg className="login-tab-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"
      />
    </svg>
  );
}

function IconAdmin() {
  return (
    <svg className="login-tab-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();
  const [authView, setAuthView] = useState("login");
  const [role, setRole] = useState("student");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [reg, setReg] = useState(initialRegister);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  /** null | { status: "loading" } | { status: "success", message: string } */
  const [registerDialog, setRegisterDialog] = useState(null);

  const [forgotStep, setForgotStep] = useState("request");
  const [forgotCorreo, setForgotCorreo] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotExpiresAt, setForgotExpiresAt] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPass, setResetNewPass] = useState("");
  const [resetConfirmPass, setResetConfirmPass] = useState("");
  const [showResetPass, setShowResetPass] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const resetStudentForgotState = () => {
    setForgotStep("request");
    setForgotCorreo("");
    setForgotLoading(false);
    setForgotError("");
    setForgotExpiresAt("");
    setResetToken("");
    setResetNewPass("");
    setResetConfirmPass("");
    setShowResetPass(false);
    setResetLoading(false);
    setResetError("");
    setResetSuccess("");
  };

  const goToLoginView = (prefillCorreo) => {
    setAuthView("login");
    setRegisterError("");
    setRegisterDialog(null);
    setReg(initialRegister);
    resetStudentForgotState();
    if (typeof prefillCorreo === "string" && prefillCorreo.trim()) {
      setCorreo(prefillCorreo.trim().toLowerCase());
    }
  };

  const openStudentForgot = () => {
    resetStudentForgotState();
    setForgotCorreo(correo.trim());
    setAuthView("studentForgot");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo.trim() || !password) {
      toast.error("Correo y contraseña son obligatorios");
      return;
    }

    setLoading(true);
    try {
      if (role === "student") {
        const data = await loginEstudiante(correo, password);
        sessionStorage.removeItem(ADMIN_KEY);
        sessionStorage.setItem(TOKEN_KEY, data.token);
        if (data.estudiante != null) {
          sessionStorage.setItem(ESTUDIANTE_KEY, JSON.stringify(data.estudiante));
        } else {
          sessionStorage.removeItem(ESTUDIANTE_KEY);
        }
        navigate("/inicio-estudiante", { replace: true });
        return;
      }

      const data = await login(correo.trim(), password);
      sessionStorage.removeItem(ESTUDIANTE_KEY);
      sessionStorage.setItem(TOKEN_KEY, data.token);
      sessionStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
      navigate("/admin", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (role === "student") {
        const fromApi = getApiErrorMessage(err, "");
        if (status === 401) {
          toast.error(fromApi || "Credenciales invalidas");
        } else if (status === 500) {
          toast.error(fromApi || "Error interno del servidor");
        } else {
          toast.error(fromApi || "No se pudo iniciar sesión");
        }
      } else {
        const mensaje = err?.response?.data?.mensaje;
        toast.error(
          typeof mensaje === "string"
            ? mensaje
            : "No se pudo iniciar sesión",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const regChange = (field, value) => {
    setReg((prev) => ({ ...prev, [field]: value }));
    setRegisterError("");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");

    if (!reg.nombre.trim()) {
      setRegisterError("El nombre es obligatorio.");
      return;
    }
    if (!reg.correo.trim()) {
      setRegisterError("El correo es obligatorio.");
      return;
    }
    if (!reg.password) {
      setRegisterError("La contraseña es obligatoria.");
      return;
    }
    if (reg.password !== reg.passwordConfirm) {
      setRegisterError("Las contraseñas no coinciden.");
      return;
    }

    const body = {
      nombre: reg.nombre.trim(),
      correo: reg.correo.trim().toLowerCase(),
      password: reg.password,
    };

    if (reg.programaAcademico.trim()) body.programaAcademico = reg.programaAcademico.trim();
    if (reg.areaInteres.trim()) body.areaInteres = reg.areaInteres.trim();
    if (reg.tipoOportunidadInteres) body.tipoOportunidadInteres = reg.tipoOportunidadInteres;
    if (reg.disponibilidad.trim()) body.disponibilidad = reg.disponibilidad.trim();

    const hab = parseStringList(reg.habilidadesText);
    if (hab.length) body.habilidades = hab;

    const keys = parseStringList(reg.palabrasClaveText);
    if (keys.length) body.palabrasClave = keys;

    setRegisterDialog({ status: "loading" });
    setRegisterLoading(true);
    try {
      const data = await registerEstudiante(body);
      const msg =
        typeof data?.mensaje === "string" && data.mensaje.trim()
          ? data.mensaje.trim()
          : "Cuenta creada correctamente.";
      setRegisterDialog({ status: "success", message: msg });
      setReg((prev) => ({
        ...initialRegister,
        correo: prev.correo.trim().toLowerCase(),
      }));
    } catch (err) {
      setRegisterDialog(null);
      setRegisterError(getApiErrorMessage(err, "No se pudo completar el registro."));
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotCorreo.trim()) {
      setForgotError("Indica el correo de tu cuenta.");
      return;
    }
    setForgotLoading(true);
    try {
      const data = await forgotPasswordEstudiante(forgotCorreo);
      setResetToken("");
      setForgotExpiresAt(
        data?.expiresAt != null && data.expiresAt !== ""
          ? formatExpiresAtLabel(data.expiresAt)
          : "",
      );
      setForgotStep("reset");
    } catch (err) {
      setForgotError(getApiErrorMessage(err, "No se pudo procesar la solicitud."));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    if (!resetToken.trim()) {
      setResetError(
        "No hay token de recuperación disponible. Solicita de nuevo la recuperación o usa el enlace que te enviaron por correo.",
      );
      return;
    }
    if (!resetNewPass) {
      setResetError("Escribe la nueva contraseña.");
      return;
    }
    if (resetNewPass !== resetConfirmPass) {
      setResetError("Las contraseñas no coinciden.");
      return;
    }
    setResetLoading(true);
    try {
      const data = await resetPasswordEstudiante(resetToken, resetNewPass);
      const msg =
        typeof data?.mensaje === "string" && data.mensaje.trim()
          ? data.mensaje.trim()
          : "Contraseña actualizada. Ya puedes iniciar sesión.";
      setResetSuccess(msg);
    } catch (err) {
      setResetError(getApiErrorMessage(err, "No se pudo actualizar la contraseña."));
    } finally {
      setResetLoading(false);
    }
  };

  const authCardWide = authView === "register" || authView === "studentForgot";

  return (
    <div className="login-page">
      {registerDialog ? (
        <div className="login-modal-overlay" role="presentation">
          <div
            className="login-modal"
            role={registerDialog.status === "loading" ? "status" : "alertdialog"}
            aria-modal="true"
            aria-busy={registerDialog.status === "loading"}
            aria-labelledby="register-dialog-title"
          >
            {registerDialog.status === "loading" ? (
              <>
                <div className="login-modal-spinner" aria-hidden />
                <p id="register-dialog-title" className="login-modal-title">
                  Creando tu cuenta
                </p>
                <p className="login-modal-sub">Por favor espera un momento…</p>
              </>
            ) : (
              <>
                <p id="register-dialog-title" className="login-modal-title">
                  Cuenta creada
                </p>
                <p className="login-modal-message">{registerDialog.message}</p>
                <button
                  type="button"
                  className="login-submit login-modal-accept"
                  onClick={() => goToLoginView(reg.correo)}
                >
                  Aceptar
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <header className="login-topbar">
        <Link to="/inicio-estudiante" className="login-logo">
          Practi<span className="login-logo-accent">Nexo</span>
        </Link>
        <span className="login-topbar-tag">Portal institucional seguro</span>
      </header>

      <main className="login-main">
        <div className={`login-card ${authCardWide ? "login-card--auth-wide" : ""}`}>
          {!authCardWide ? (
            <aside className="login-hero" aria-hidden>
              <div className="login-hero-overlay" />
              <div className="login-hero-content">
                <h2 className="login-hero-title">
                  Impulsando la próxima generación de líderes académicos.
                </h2>
                <p className="login-hero-text">
                  Conecta talento, instituciones y prácticas que impulsan el futuro profesional.
                </p>
                <div className="login-hero-dots">
                  <span />
                  <span className="active" />
                  <span />
                </div>
              </div>
            </aside>
          ) : null}

          <section className={`login-panel ${authCardWide ? "login-panel--auth-wide" : ""}`}>
            {authView === "register" ? (
              <RegisterForm
                reg={reg}
                regChange={regChange}
                registerLoading={registerLoading}
                registerError={registerError}
                handleRegisterSubmit={handleRegisterSubmit}
                showRegPassword={showRegPassword}
                setShowRegPassword={setShowRegPassword}
                goToLoginView={goToLoginView}
              />
            ) : authView === "studentForgot" ? (
              <ForgotPasswordForm
                forgotStep={forgotStep}
                forgotCorreo={forgotCorreo}
                setForgotCorreo={setForgotCorreo}
                forgotLoading={forgotLoading}
                forgotError={forgotError}
                setForgotError={setForgotError}
                handleForgotRequestSubmit={handleForgotRequestSubmit}
                forgotExpiresAt={forgotExpiresAt}
                resetToken={resetToken}
                setResetToken={setResetToken}
                resetNewPass={resetNewPass}
                setResetNewPass={setResetNewPass}
                resetConfirmPass={resetConfirmPass}
                setResetConfirmPass={setResetConfirmPass}
                showResetPass={showResetPass}
                setShowResetPass={setShowResetPass}
                resetLoading={resetLoading}
                resetError={resetError}
                setResetError={setResetError}
                resetSuccess={resetSuccess}
                setResetSuccess={setResetSuccess}
                handleResetPasswordSubmit={handleResetPasswordSubmit}
                goToLoginView={goToLoginView}
              />
            ) : (
              <>
                <h1 className="login-welcome">Bienvenido de nuevo</h1>
                <p className="login-sub">
                  Introduce tus credenciales para acceder a PractiNexo.
                </p>

                <div className="login-role" role="tablist" aria-label="Tipo de acceso">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={role === "student"}
                    className={`login-role-btn ${role === "student" ? "active" : ""}`}
                    onClick={() => {
                      setRole("student");
                    }}
                  >
                    <IconGradCap />
                    Estudiante
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={role === "admin"}
                    className={`login-role-btn ${role === "admin" ? "active" : ""}`}
                    onClick={() => {
                      setRole("admin");
                    }}
                  >
                    <IconAdmin />
                    Administrador
                  </button>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                  <label className="login-field-label" htmlFor="login-email">
                    Correo
                  </label>
                  <div className="login-field">
                    <IconAt />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="username"
                      placeholder={
                        role === "admin" ? "nombre@institucion.edu" : "correo@institucion.edu"
                      }
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="login-field-row">
                    <label className="login-field-label" htmlFor="login-pass">
                      Contraseña
                    </label>
                    {role === "student" ? (
                      <button type="button" className="login-forgot" onClick={openStudentForgot}>
                        ¿Olvidaste tu contraseña?
                      </button>
                    ) : (
                      <span className="login-forgot-placeholder" />
                    )}
                  </div>
                  <div className="login-field">
                    <IconLock />
                    <input
                      id="login-pass"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="login-eye-btn"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      <IconEye passwordVisible={showPassword} />
                    </button>
                  </div>

                  <button type="submit" className="login-submit" disabled={loading}>
                    {loading
                      ? "Accediendo…"
                      : role === "student"
                        ? "Ingresar como estudiante"
                        : "Acceder al portal"}
                  </button>
                </form>

                <p className="login-signup">
                  ¿Nuevo en PractiNexo?{" "}
                  <button
                    type="button"
                    className="login-inline-link"
                    onClick={() => {
                      setAuthView("register");
                      resetStudentForgotState();
                    }}
                  >
                    Crear cuenta
                  </button>
                </p>
              </>
            )}

            <div className="login-trust">
              <span className="login-trust-label">Protegido con estándares de la industria</span>
              <div className="login-trust-icons" aria-hidden>
                <svg viewBox="0 0 24 24" className="login-trust-svg">
                  <path
                    fill="currentColor"
                    d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
                  />
                </svg>
                <svg viewBox="0 0 24 24" className="login-trust-svg">
                  <path
                    fill="currentColor"
                    d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"
                  />
                </svg>
                <svg viewBox="0 0 24 24" className="login-trust-svg">
                  <path
                    fill="currentColor"
                    d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
                  />
                </svg>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="login-footer">
        <nav className="login-footer-links">
          <button type="button" className="login-footer-link-btn">
            Política de privacidad
          </button>
          <span className="login-footer-sep">·</span>
          <button type="button" className="login-footer-link-btn">
            Términos del servicio
          </button>
          <span className="login-footer-sep">·</span>
          <button type="button" className="login-footer-link-btn">
            Ayuda
          </button>
        </nav>
        <span className="login-footer-copy">© {new Date().getFullYear()} PractiNexo</span>
      </footer>
    </div>
  );
}

export default Login;
