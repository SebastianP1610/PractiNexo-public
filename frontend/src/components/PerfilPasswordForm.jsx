function PerfilPasswordForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  changingPassword,
  handleChangePassword,
}) {
  return (
    <section className="perfil-card pn-fade-up pn-stagger-4" aria-labelledby="perfil-pass-heading">
      <div className="perfil-card-header">
        <h2 id="perfil-pass-heading" className="perfil-card-title">
          Cambiar contraseña
        </h2>
      </div>
      <form className="perfil-pass-form" onSubmit={handleChangePassword}>
        <label className="perfil-field" htmlFor="perfil-current-pass">
          <span className="perfil-field-label">Contraseña actual</span>
          <input
            id="perfil-current-pass"
            type="password"
            className="perfil-input"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={changingPassword}
          />
        </label>
        <label className="perfil-field" htmlFor="perfil-new-pass">
          <span className="perfil-field-label">Nueva contraseña</span>
          <input
            id="perfil-new-pass"
            type="password"
            className="perfil-input"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={changingPassword}
          />
        </label>
        <label className="perfil-field" htmlFor="perfil-confirm-pass">
          <span className="perfil-field-label">Confirmar nueva contraseña</span>
          <input
            id="perfil-confirm-pass"
            type="password"
            className="perfil-input"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={changingPassword}
          />
        </label>
        <button
          type="submit"
          className="perfil-btn perfil-btn--primary"
          disabled={changingPassword}
        >
          {changingPassword ? "Cambiando…" : "Cambiar contraseña"}
        </button>
      </form>
    </section>
  );
}

export default PerfilPasswordForm;
