# PractiNexo

Plataforma web académica para centralizar ofertas de prácticas profesionales y servicio social del **Politécnico Colombiano Jaime Isaza Cadavid**. Proyecto Integrador (FTG).

> ⚠️ **Versión de portafolio.** Este repositorio es una copia sanitizada del proyecto original (sin credenciales, datos personales ni historial interno). El código fuente aquí publicado es idéntico al de la versión de desarrollo.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Axios |
| Backend | Node.js, Express 5, Mongoose 9, JWT |
| Base de datos | MongoDB (Atlas o local con Docker) |
| Tests backend | Vitest 4 |
| Tests frontend | Playwright, Newman |
| Notificaciones | react-hot-toast |

---

## Setup local

```bash
# 1. Clonar
git clone <repo>
cd PractiNexo-public

# 2. Backend
cd backend
cp .env.example .env        # definir JWT_SECRET y ADMIN_PASSWORD seguros
npm install
npm run seed:admin          # crear admin inicial
npm start                   # http://localhost:4500

# 3. Frontend (desarrollo)
cd frontend
npm install
npm run dev                 # http://localhost:5173

# O bien: build producción servido por backend
npm run build               # genera frontend/dist/
# npm start en backend ya sirve el build en http://localhost:4500
```

---

## Credenciales de prueba

El admin inicial se crea con el script de seed usando las variables `ADMIN_*` definidas en `backend/.env` (ver `backend/.env.example`). No se publican credenciales por defecto; define tu propio password seguro antes de ejecutar el seed.

| Rol | Correo (ejemplo) | Password |
|---|---|---|
| Admin | admin@practinexo.local | definido por ti en `ADMIN_PASSWORD` |
| Estudiante | (registrarse en /login) | — |

---

## Rutas del frontend

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Inicio (landing) | Público |
| `/inicio-estudiante` | Inicio | Público |
| `/login` | Login (admin/estudiante + registro) | Público |
| `/ofertas` | Catálogo de ofertas | Público |
| `/ofertas/:id` | Detalle de oferta | Público |
| `/sugerencias` | Matching de perfil | Público |
| `/mis-postulaciones` | Mis postulaciones | Estudiante (auth) |
| `/admin` | Dashboard admin | Admin (auth) |
| `/admin/maestras` | Gestionar dependencias/categorías | Admin (auth) |
| `/admin/crear-oferta` | CRUD de ofertas | Admin (auth) |

---

## Funcionalidades principales

- **Catálogo de ofertas** con filtros por tipo, programa académico, dependencia y palabras clave
- **Matching por reglas** (v2): compara perfil del estudiante con ofertas usando Jaccard similarity, con normalización Unicode, stop words y coincidencia parcial de keywords
- **Postulación** a ofertas desde el detalle
- **Registro y autenticación** de estudiantes con recuperación de contraseña
- **Panel admin** para CRUD de ofertas, dependencias y categorías

---

## Matching Engine (v2)

El motor de matching (`backend/src/services/matchingEngine.js`) es 100% puro (sin dependencias de BD) y evalúa 6 criterios:

| Criterio | Peso | Cómo funciona |
|---|---|---|
| Programa académico | 25 | Jaccard similarity sobre palabras, sin acentos |
| Área de interés | 25 | Jaccard similarity sobre palabras, sin acentos |
| Tipo de oportunidad | 20 | Coincidencia exacta |
| Disponibilidad | 5 | Coincidencia exacta |
| Keywords + Habilidades | 15 | Proporcional: fusiona `palabrasClave` y `habilidades` del estudiante |
| Requisitos | 10 | Proporcional contra requisitos de la oferta |

El frontend muestra un desglose visual de qué palabras coincidieron en cada criterio.

---

## Testing

```bash
# Backend (vitest)
cd backend && npm test

# Frontend E2E (Playwright) — requiere servidores corriendo
cd frontend && npm run test:e2e

# API tests (Newman)
cd frontend && npm run test:api

# Suite completa
cd frontend && npm run test:qa
```

---

## Estructura del proyecto

```
PractiNexo/
├── backend/
│   ├── src/
│   │   ├── controllers/    Lógica de endpoints
│   │   ├── services/       Lógica de negocio + matchingEngine.js
│   │   ├── models/         Schemas de Mongoose
│   │   ├── routes/         Definiciones de rutas
│   │   ├── middlewares/    Auth + roles
│   │   ├── utils/          Helpers
│   │   └── app.js          Punto de entrada
│   └── tests/
└── frontend/
    ├── src/
    │   ├── pages/          Componentes de página
    │   ├── components/     Componentes reutilizables (ErrorBoundary, AppFooter, MatchingOfferCard, etc.)
    │   ├── utils/          Helpers compartidos (format, session, parse, matching)
    │   ├── api/            Clientes HTTP (Axios)
    │   └── index.css       Estilos globales
    └── tests/
```

---

## Variables de entorno

Ver `.env.example` en `backend/`. Variables principales:

- `PORT` — Puerto del backend (default 4500)
- `MONGODB_URI` — Conexión a MongoDB
- `JWT_SECRET` — Clave para firmar tokens (generar con `crypto.randomBytes(32)`)
- `JWT_EXPIRES_IN` — Expiración del token (default 24h)
- `CORS_ORIGINS` — Orígenes permitidos (default `http://localhost:5173`)
- `ADMIN_*` — Credenciales del admin inicial (seed)

---

## Autores

Proyecto desarrollado por el equipo de Proyecto Integrador (FTG) del Politécnico Colombiano Jaime Isaza Cadavid. Agradecimientos a todos los integrantes que contribuyeron al código, pruebas y documentación.

## Licencia

Este proyecto se publica bajo la licencia MIT. Ver archivo [LICENSE](LICENSE).
