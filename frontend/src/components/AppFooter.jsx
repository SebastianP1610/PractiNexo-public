import "./AppFooter.css";

const LINKS = [
  "Política de privacidad",
  "Términos del servicio",
  "Aliados",
  "Soporte",
];

function AppFooter({ compact = false, brandLabel = "PractiNexo" }) {
  const year = new Date().getFullYear();
  return (
    <footer className={`app-footer${compact ? " app-footer--compact" : ""}`}>
      <div className="app-footer-inner">
        <div className="app-footer-brand">
          <strong>{brandLabel}</strong>
          <p>© {year} {brandLabel}</p>
        </div>
        <nav className="app-footer-links" aria-label="Enlaces de pie">
          {LINKS.map((label) => (
            <button key={label} type="button" className="app-footer-link-btn">
              {label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default AppFooter;
