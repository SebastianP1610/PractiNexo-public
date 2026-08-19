import { IconAt, IconLock, IconEye } from "../utils/loginIcons";

function RegisterForm({
  reg,
  regChange,
  registerLoading,
  registerError,
  handleRegisterSubmit,
  showRegPassword,
  setShowRegPassword,
  goToLoginView,
}) {
  return (
    <>
      <button type="button" className="login-back-link" onClick={goToLoginView}>
        ← Volver al inicio de sesión
      </button>
      <h1 className="login-welcome">Crear cuenta de estudiante</h1>
      <p className="login-sub">
        Completa los datos obligatorios. El correo se guardará en minúsculas; la contraseña
        se almacena de forma segura en el servidor.
      </p>

      <form className="login-form login-form--register" onSubmit={handleRegisterSubmit}>
        <label className="login-field-label" htmlFor="reg-nombre">
          Nombre completo *
        </label>
        <div className="login-field">
          <input
            id="reg-nombre"
            type="text"
            autoComplete="name"
            placeholder="Ej. María García"
            value={reg.nombre}
            onChange={(e) => regChange("nombre", e.target.value)}
            disabled={registerLoading}
          />
        </div>

        <label className="login-field-label" htmlFor="reg-correo">
          Correo *
        </label>
        <div className="login-field">
          <IconAt />
          <input
            id="reg-correo"
            type="email"
            autoComplete="email"
            placeholder="correo@institucion.edu"
            value={reg.correo}
            onChange={(e) => regChange("correo", e.target.value)}
            disabled={registerLoading}
          />
        </div>

        <label className="login-field-label" htmlFor="reg-pass">
          Contraseña *
        </label>
        <div className="login-field">
          <IconLock />
          <input
            id="reg-pass"
            type={showRegPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Mínimo recomendado: 8 caracteres"
            value={reg.password}
            onChange={(e) => regChange("password", e.target.value)}
            disabled={registerLoading}
          />
          <button
            type="button"
            className="login-eye-btn"
            aria-label={showRegPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowRegPassword((v) => !v)}
          >
            <IconEye passwordVisible={showRegPassword} />
          </button>
        </div>

        <label className="login-field-label" htmlFor="reg-pass2">
          Confirmar contraseña *
        </label>
        <div className="login-field">
          <IconLock />
          <input
            id="reg-pass2"
            type={showRegPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            value={reg.passwordConfirm}
            onChange={(e) => regChange("passwordConfirm", e.target.value)}
            disabled={registerLoading}
          />
        </div>

        <label className="login-field-label" htmlFor="reg-programa">
          Programa académico
        </label>
        <div className="login-field">
          <input
            id="reg-programa"
            type="text"
            placeholder="Ej. Ingeniería de sistemas"
            value={reg.programaAcademico}
            onChange={(e) => regChange("programaAcademico", e.target.value)}
            disabled={registerLoading}
          />
        </div>

        <label className="login-field-label" htmlFor="reg-area">
          Área de interés
        </label>
        <div className="login-field">
          <input
            id="reg-area"
            type="text"
            placeholder="Ej. Backend"
            value={reg.areaInteres}
            onChange={(e) => regChange("areaInteres", e.target.value)}
            disabled={registerLoading}
          />
        </div>

        <label className="login-field-label" htmlFor="reg-tipo">
          Tipo de oportunidad de interés
        </label>
        <div className="login-field login-field--select">
          <select
            id="reg-tipo"
            value={reg.tipoOportunidadInteres}
            onChange={(e) => regChange("tipoOportunidadInteres", e.target.value)}
            disabled={registerLoading}
          >
            <option value="">Sin preferencia</option>
            <option value="PRACTICA">Práctica</option>
            <option value="SERVICIO_SOCIAL">Servicio social</option>
          </select>
        </div>

        <label className="login-field-label" htmlFor="reg-disp">
          Disponibilidad
        </label>
        <div className="login-field">
          <input
            id="reg-disp"
            type="text"
            placeholder="Ej. Tiempo completo, híbrido"
            value={reg.disponibilidad}
            onChange={(e) => regChange("disponibilidad", e.target.value)}
            disabled={registerLoading}
          />
        </div>

        <label className="login-field-label" htmlFor="reg-hab">
          Habilidades (separadas por coma)
        </label>
        <div className="login-field login-field--textarea">
          <textarea
            id="reg-hab"
            rows={2}
            placeholder="Ej. Node.js, MongoDB"
            value={reg.habilidadesText}
            onChange={(e) => regChange("habilidadesText", e.target.value)}
            disabled={registerLoading}
          />
        </div>

        <label className="login-field-label" htmlFor="reg-keys">
          Palabras clave (separadas por coma)
        </label>
        <div className="login-field login-field--textarea">
          <textarea
            id="reg-keys"
            rows={2}
            placeholder="Ej. API, REST"
            value={reg.palabrasClaveText}
            onChange={(e) => regChange("palabrasClaveText", e.target.value)}
            disabled={registerLoading}
          />
        </div>

        {registerError ? <p className="login-error">{registerError}</p> : null}

        <button type="submit" className="login-submit" disabled={registerLoading}>
          {registerLoading ? "Registrando…" : "Crear cuenta"}
        </button>
      </form>

      <p className="login-signup">
        ¿Ya tienes cuenta?{" "}
        <button type="button" className="login-inline-link" onClick={goToLoginView}>
          Iniciar sesión
        </button>
      </p>
    </>
  );
}

export default RegisterForm;
