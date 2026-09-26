# PractiNexo

Plataforma web académica para centralizar ofertas de prácticas profesionales y servicio social del **Politécnico Colombiano Jaime Isaza Cadavid**. Proyecto Integrador (FTG).

> ⚠️ **Versión de portafolio.** Este repositorio es una copia sanitizada del proyecto original (sin credenciales, datos personales ni historial interno). El código fuente aquí publicado es idéntico al de la versión de desarrollo.

**Contenido:** [Stack](#stack-tecnológico) · [Requisitos](#requisitos-previos) · [Instalación](#instalación-y-configuración) · [Variables de entorno](#variables-de-entorno) · [Rutas](#rutas-del-frontend) · [API](#rutas-principales-de-la-api) · [Funcionalidades](#funcionalidades-principales) · [Testing](#testing) · [Manual de usuario](#manual-de-usuario) · [Troubleshooting](#solución-de-problemas)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Axios |
| Backend | Node.js 22, Express 5, Mongoose 9, JWT |
| Base de datos | MongoDB (Atlas o local con Docker) |
| Tests backend | Vitest 4 (unit + integración con mongodb-memory-server), coverage con `@vitest/coverage-v8` |
| Tests frontend | Playwright, Newman |
| Notificaciones | react-hot-toast |

---

## Requisitos previos

| Requisito | Versión mínima | Verificación |
|---|---|---|
| Node.js | 22.x | `node -v` |
| npm | 10.x | `npm -v` |
| MongoDB | 7.0 (contenedor Docker o Atlas) | `mongosh --version` |
| Git | 2.x | `git --version` |
| Docker | *(opcional)* para MongoDB local | `docker -v` |

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone <repo>
cd PractiNexo-public
```

### 2. Base de datos (MongoDB local con Docker)

```bash
docker compose up -d          # MongoDB en 127.0.0.1:27017
docker compose ps             # debe mostrar "Up" (healthy)
```

Alternativa: usar un cluster de **MongoDB Atlas** y colocar su URI en `backend/.env` (`MONGODB_URI`).

### 3. Backend

```bash
cd backend
cp .env.example .env        # definir JWT_SECRET y ADMIN_PASSWORD seguros
npm install                 # si falla con "edgesOut": npm install --legacy-peer-deps
npm run seed:admin          # crea el administrador inicial con las variables ADMIN_*
npm run dev                 # desarrollo con nodemon → http://localhost:4500
# o: npm start              # producción
```

Verificación: `GET http://localhost:4500/api/health` debe responder `{"mensaje":"API de PractiNexo operativa"}`.

### 4. Frontend (desarrollo)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173 (consume la API en :4500, CORS habilitado)
```

### 5. Build de producción

```bash
cd frontend && npm run build    # genera frontend/dist/
cd ../backend && npm start      # el backend sirve frontend/dist/ y la API en http://localhost:4500
```

---

## Variables de entorno

Tomar `backend/.env.example` como plantilla (`cp .env.example .env`). `.env` nunca se commitea (está en `.gitignore`); en producción usar variables de entorno del sistema.

| Variable | Ejemplo | Descripción |
|---|---|---|
| `PORT` | `4500` | Puerto del backend |
| `MONGODB_URI` | `mongodb://localhost:27017/practinexo` | URI de conexión a MongoDB (Atlas o local) |
| `JWT_SECRET` | *(generar con `crypto.randomBytes(32)`)* | Clave secreta para firmar tokens |
| `JWT_EXPIRES_IN` | `24h` | Vigencia del token |
| `CORS_ORIGINS` | `http://localhost:5173` | Orígenes permitidos (separados por coma) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Ventana del rate limiter (15 min) |
| `RATE_LIMIT_MAX` | `500` | Máximo de peticiones por ventana |
| `ADMIN_NOMBRE` | `Admin Inicial` | Nombre del admin sembrado |
| `ADMIN_CORREO` | `admin@practinexo.local` | Correo del admin sembrado |
| `ADMIN_PASSWORD` | *(definir uno seguro)* | Contraseña del admin sembrado |
| `ADMIN_ROL` | `SUPER_ADMIN` | Rol del admin sembrado |

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
| `/perfil` | Perfil de estudiante (foto, hoja de vida, contraseña) | Estudiante (auth) |
| `/admin` | Dashboard admin | Admin (auth) |
| `/admin/ofertas` | CRUD de ofertas (listado y estados) | Admin (auth) |
| `/admin/crear-oferta` | Crear/editar oferta | Admin (auth) |
| `/admin/postulaciones` | Revisión de postulaciones | Admin (auth) |
| `/admin/maestras` | Dependencias y categorías | Admin (auth) |
| `/admin/programas` | **Programas académicos (maestro)** | Admin (auth) |
| `/admin/estudiantes` | **Gestión de estudiantes (maestro)** | Admin (auth) |
| `/admin/reporte-ofertas` | **Reporte de ofertas + exportación** | Admin (auth) |
| `/admin/reporte-postulaciones` | **Reporte de postulaciones + exportación** | Admin (auth) |

---

## Rutas principales de la API

```
# Autenticación
POST   /api/auth/login                         Login admin (JWT)
POST   /api/estudiantes-auth/register          Registro de estudiante
POST   /api/estudiantes-auth/login             Login de estudiante
POST   /api/estudiantes-auth/forgot-password   Recuperación de contraseña

# Estudiante autenticado
GET    /api/estudiantes/me                     Perfil
PUT    /api/estudiantes/me                     Editar perfil
GET    /api/estudiantes/me/sugerencias         Matching con perfil guardado
POST   /api/postulaciones                      Postularse a una oferta
GET    /api/postulaciones/mis                  Mis postulaciones

# Catálogos (lectura pública / escritura admin)
GET    /api/ofertas · /api/dependencias · /api/categorias · /api/programas
POST|PUT|DELETE  /api/ofertas, /api/dependencias, /api/categorias, /api/programas   [ADMIN]

# Gestión de estudiantes (admin)
GET|POST    /api/admin/estudiantes
GET|PUT|DELETE  /api/admin/estudiantes/:id

# Reportes (admin)
GET    /api/reportes/ofertas                   Estadísticas por estado/tipo/dependencia
GET    /api/reportes/ofertas/csv               Exportación CSV
GET    /api/reportes/postulaciones             Estadísticas por estado/estudiante/oferta
GET    /api/reportes/postulaciones/csv         Exportación CSV

# Matching
POST   /api/matching/sugerencias               Sugerencias con perfil anónimo
```

Todas las rutas `/api/admin/*` y `/api/reportes/*` exigen JWT con rol `ADMIN` o `SUPER_ADMIN`.

---

## Funcionalidades principales

- **Catálogo de ofertas** con filtros por tipo, programa académico, dependencia y palabras clave
- **Matching por reglas** (v2): compara perfil del estudiante con ofertas usando Jaccard similarity, con normalización Unicode, stop words y coincidencia parcial de keywords
- **Postulación** a ofertas desde el detalle, con estados y cancelación
- **Registro y autenticación** de estudiantes con recuperación de contraseña
- **Panel admin** con 5 pantallas maestras: ofertas, dependencias, categorías, **programas académicos** y **gestión de estudiantes**
- **Programas académicos** como catálogo maestro: alimenta el desplegable de Crear Oferta y el filtro del catálogo de estudiantes (validación de nombre 5–120, código único, niveles Técnica/Tecnología/Profesional)
- **Gestión de estudiantes** desde admin: crear, editar, activar/desactivar, eliminar, búsqueda por nombre/correo, filtros y paginación — sin exponer contraseñas (`passwordHash` nunca sale en respuestas)
- **Reporte de ofertas**: KPIs y gráficos por estado de vigencia, tipo de oportunidad y ranking de dependencias, con exportación a CSV
- **Reporte de postulaciones**: KPIs, tasa de aceptación, gráficos por estado, top estudiantes y top ofertas, con exportación a CSV

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
# Backend — unitarios (lógica pura: matching, validadores, engines de reporte)
cd backend && npm run test:unit

# Backend — integración (services con MongoDB en memoria; NO requiere BD externa)
cd backend && npm run test:integration

# Ambas suites
cd backend && npm run test:all

# Cobertura de código (reporte en backend/coverage/)
cd backend && npm run test:coverage

# Lint
cd backend && npm run lint

# Frontend E2E (Playwright) — requiere servidores corriendo
cd frontend && npm run test:e2e

# API tests (Newman)
cd frontend && npm run test:api

# Suite completa de frontend
cd frontend && npm run test:qa
```

**Resultado esperado (backend):**

| Suite | Archivos | Tests |
|---|---|---|
| Unitaria | 7 | 121 |
| Integración | 4 | 28 |

Organización de las pruebas:

```
backend/
├── vitest.config.js                 Runner unitario + coverage
├── vitest.integration.config.js     Runner de integración (mongodb-memory-server)
└── tests/
    ├── helpers/mongo.js             Setup/teardown de la BD en memoria
    ├── matchingEngine.test.js       Matching (lógica pura)
    ├── postulacionService.test.js   Transiciones de estado
    ├── uploadPath.test.js           Seguridad de rutas de archivos
    ├── programaAcademicoValidators.test.js      Validadores de programas (TDD)
    ├── estudianteAdminValidators.test.js        Validadores de estudiantes (TDD)
    ├── reporteOfertasEngine.test.js             Motor de cálculo de ofertas (TDD)
    ├── reportePostulacionesEngine.test.js       Motor de cálculo de postulaciones (TDD)
    └── *.integration.test.js        Services con MongoDB en memoria (TDD)
```

Los tests de integración usan `*.integration.test.js` y se excluyen del runner unitario por configuración. Los módulos de lógica pura (validadores y engines de reportes) alcanzan **100% de cobertura de statements**.

---

## Manual de usuario

Guía completa de uso final (estudiante y administrador): **[Documentacion/Manual-Usuario.md](Documentacion/Manual-Usuario.md)**.

Incluye: registro e inicio de sesión, catálogo y filtros, matching, postulaciones, perfil, y el uso de las pantallas de administración (programas académicos, gestión de estudiantes y reportes con exportación).

---

## Estructura del proyecto

```
PractiNexo/
├── backend/
│   ├── src/
│   │   ├── controllers/    Lógica de endpoints
│   │   ├── services/       Lógica de negocio + matchingEngine.js + engines de reportes
│   │   ├── models/         Schemas de Mongoose
│   │   ├── routes/         Definiciones de rutas
│   │   ├── middlewares/    Auth + roles
│   │   ├── utils/          Helpers (reporteHelpers, uploadPath, …)
│   │   └── app.js          Punto de entrada
│   ├── tests/              Unit + integración (Vitest)
│   ├── vitest.config.js
│   ├── vitest.integration.config.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/          Componentes de página
│   │   ├── components/     Componentes reutilizables (ErrorBoundary, AppFooter, MatchingOfferCard, etc.)
│   │   ├── utils/          Helpers compartidos (format, session, parse, matching)
│   │   ├── api/            Clientes HTTP (Axios)
│   │   └── index.css       Estilos globales
│   └── tests/              E2E (Playwright) + API (Newman)
├── Documentacion/
│   └── Manual-Usuario.md
└── docker-compose.yml      MongoDB local
```

---

## Solución de problemas

| Problema | Solución |
|---|---|
| `ECONNREFUSED ::1:27017` | MongoDB no está corriendo: `docker compose up -d` o revisar `MONGODB_URI` |
| `Demasiadas solicitudes` (429) | Rate limiter: verificar `RATE_LIMIT_MAX=500` en `.env` y reiniciar el backend |
| `npm` falla con `Cannot read properties of null (reading 'edgesOut')` | `npm install --legacy-peer-deps` |
| Puerto 4500 ocupado | Liberar el proceso o cambiar `PORT` en `.env` |
| Playwright no encuentra navegador | `cd frontend && npm run test:e2e:install` |
| Error de CORS | Agregar el origen a `CORS_ORIGINS` en `.env` |

---

## Autores

Proyecto desarrollado por el equipo de Proyecto Integrador (FTG) del Politécnico Colombiano Jaime Isaza Cadavid. Agradecimientos a todos los integrantes que contribuyeron al código, pruebas y documentación.

## Licencia

Este proyecto se publica bajo la licencia MIT. Ver archivo [LICENSE](LICENSE).
