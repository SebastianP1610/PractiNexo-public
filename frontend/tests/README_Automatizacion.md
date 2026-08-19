# Automatizacion de pruebas - PractiNexo

Este paquete ejecuta pruebas automatizadas sobre el entorno local y genera evidencias validas para anexar al IEEE 829.

## 1) Cobertura automatizada

### E2E (Playwright)
- `CP-01-08` acceso a ruta admin sin sesion
- `CP-01-01` login admin correcto
- `CP-01-02` login admin con contrasena incorrecta
- `CP-01-STU` login estudiante correcto/incorrecto
- `CP-02-02` navegacion panel admin
- `CP-03-01` crear oferta
- `CP-04-01` editar oferta
- `CP-05-02` eliminar oferta
- `CP-06-01` listado publico
- `CP-08-01` filtro por palabra clave
- `CP-08-02` filtro por tipo
- `CP-07-01` ver detalle de oferta
- `CP-11-UI` generar sugerencias en UI
- `CP-POST-01` estudiante ve mis postulaciones

### API (Newman/Postman)
- `CP-14-01` GET ofertas activas
- `CP-14-02` login admin
- `CP-01-06` validar-token sin token
- `CP-01-07` validar-token con token invalido
- `CP-14-03` GET dependencias con token admin
- `CP-14-04` GET categorias con token admin
- `CP-11-01` POST matching/sugerencias
- `CP-14-05` ruta inexistente 404
- `CP-14-STU-01` login estudiante
- `CP-14-STU-02` GET perfil estudiante
- `CP-14-STU-03` GET postulaciones estudiante

## 2) Configuracion local

### 2.1 Credenciales E2E
1. Copiar `frontend/.env.e2e.example` a `frontend/.env.e2e`
2. Completar valores reales.

### 2.2 Environment Newman
Usar una de estas dos opciones:
- **Recomendada (CLI):** no editar archivo y pasar credenciales por variables de entorno.
- **Alternativa:** editar `frontend/tests/api/practinexo.postman_environment.json`.

## 3) Ejecucion

Desde `frontend/`:

```bash
npm install
npm run test:e2e:install
npm run test:api
npm run test:e2e
```

Suite completa:

```bash
npm run test:qa
```

## 4) Evidencias generadas

Se guardan en `evidencias/`:
- `evidencias/playwright-html/index.html`
- `evidencias/playwright-junit.xml`
- `evidencias/playwright-report.json`
- `evidencias/newman-report-<timestamp>.html`
- `evidencias/newman-report-<timestamp>.json`
- `evidencias/newman-report-<timestamp>.xml`

Estas evidencias son anexables al informe IEEE 829 y trazables por ID de caso.

## 5) Trazabilidad sugerida para la matriz

Agregar columnas:
- `Automatizado (Si/No)`
- `Tipo (E2E/API)`
- `ID Script`
- `Ruta evidencia`

Ejemplo:
- `CP-01-01 | Si | E2E | auth.spec.js | evidencias/playwright-html/index.html`

## 6) Configuracion local

Para ejecutar contra el entorno local, ajusta `E2E_BASE_URL` y `E2E_API_BASE_URL` en `frontend/.env.e2e` a `http://localhost:5173` y `http://localhost:4500/api` respectivamente.
