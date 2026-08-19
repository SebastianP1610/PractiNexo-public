import { IconAt, IconLock, IconEye } from "../utils/loginIcons";

function ForgotPasswordForm({
  forgotStep,
  forgotCorreo,
  setForgotCorreo,
  forgotLoading,
  forgotError,
  setForgotError,
  handleForgotRequestSubmit,
  forgotExpiresAt,
  resetToken,
  setResetToken,
  resetNewPass,
  setResetNewPass,
  resetConfirmPass,
  setResetConfirmPass,
  showResetPass,
  setShowResetPass,
  resetLoading,
  resetError,
  setResetError,
  resetSuccess,
  setResetSuccess,
  handleResetPasswordSubmit,
  goToLoginView,
}) {
  return (
    <>
      <button type="button" className="login-back-link" onClick={goToLoginView}>
        ← Volver al inicio de sesión
      </button>
      <h1 className="login-welcome">Recuperar contraseña</h1>
      {forgotStep === "request" ? (
        <p className="login-sub">
          Escribe el correo de tu cuenta de estudiante activa para continuar.
        </p>
      ) : null}

      {forgotStep === "request" ? (
        <form className="login-form login-form--forgot" onSubmit={handleForgotRequestSubmit}>
          <label className="login-field-label" htmlFor="forgot-correo">
            Correo
          </label>
          <div className="login-field">
            <IconAt />
            <input
              id="forgot-correo"
              type="email"
              autoComplete="email"
              placeholder="correo@institucion.edu"
              value={forgotCorreo}
              onChange={(e) => {
                setForgotCorreo(e.target.value);
                setForgotError("");
              }}
              disabled={forgotLoading}
            />
          </div>
          {forgotError ? <p className="login-error">{forgotError}</p> : null}
          <button type="submit" className="login-submit" disabled={forgotLoading}>
            {forgotLoading ? "Enviando…" : "Solicitar recuperación"}
          </button>
        </form>
      ) : (
        <form className="login-form login-form--forgot" onSubmit={handleResetPasswordSubmit}>
          <p className="login-forgot-token-line" role="status">
            {forgotExpiresAt
              ? `Se ha enviado un enlace de recuperacion a tu correo. Valido hasta ${forgotExpiresAt}.`
              : "Se ha enviado un enlace de recuperacion a tu correo."}
          </p>
          <p className="login-forgot-dev-hint">
            En desarrollo, el token se muestra en la consola del backend.
          </p>
          <label className="login-field-label" htmlFor="reset-token">
            Token de recuperacion
          </label>
          <div className="login-field">
            <input
              id="reset-token"
              type="text"
              autoComplete="off"
              placeholder="Pega aqui el token recibido"
              value={resetToken}
              onChange={(e) => {
                setResetToken(e.target.value);
                setResetError("");
                setResetSuccess("");
              }}
              disabled={resetLoading || Boolean(resetSuccess)}
            />
          </div>
          <label className="login-field-label" htmlFor="reset-new-pass">
            Nueva contraseña
          </label>
          <div className="login-field">
            <IconLock />
            <input
              id="reset-new-pass"
              type={showResetPass ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Nueva contraseña"
              value={resetNewPass}
              onChange={(e) => {
                setResetNewPass(e.target.value);
                setResetError("");
                setResetSuccess("");
              }}
              disabled={resetLoading || Boolean(resetSuccess)}
            />
            <button
              type="button"
              className="login-eye-btn"
              aria-label={showResetPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowResetPass((v) => !v)}
              disabled={Boolean(resetSuccess)}
            >
              <IconEye passwordVisible={showResetPass} />
            </button>
          </div>
          <label className="login-field-label" htmlFor="reset-confirm-pass">
            Confirmar contraseña
          </label>
          <div className="login-field">
            <IconLock />
            <input
              id="reset-confirm-pass"
              type={showResetPass ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repite la nueva contraseña"
              value={resetConfirmPass}
              onChange={(e) => {
                setResetConfirmPass(e.target.value);
                setResetError("");
                setResetSuccess("");
              }}
              disabled={resetLoading || Boolean(resetSuccess)}
            />
          </div>
          {resetError ? <p className="login-error">{resetError}</p> : null}
          {resetSuccess ? <p className="login-success">{resetSuccess}</p> : null}
          {!resetSuccess ? (
            <button type="submit" className="login-submit" disabled={resetLoading}>
              {resetLoading ? "Guardando…" : "Restablecer contraseña"}
            </button>
          ) : (
            <button type="button" className="login-submit" onClick={goToLoginView}>
              Ir al inicio de sesión
            </button>
          )}
        </form>
      )}
    </>
  );
}

export default ForgotPasswordForm;
