# Manual de Usuario — PractiNexo

**Versión:** 2.0 (incluye Programas Académicos, Gestión de Estudiantes y Reportes)
**Fecha:** 2026-09-21

> Plataforma de ofertas de prácticas profesionales y servicio social del Politécnico Colombiano Jaime Isaza Cadavid.

---

## Parte 1 — Usuario estudiante

### 1.1 Registro

1. Entra a la aplicación y presiona **Regístrate**.
2. Completa nombre, correo institucional y contraseña (mínimo 6 caracteres).
3. Confirma la contraseña y presiona **Crear cuenta**.
4. Tu cuenta se crea con estado ACTIVO y puedes iniciar sesión de inmediato.

**Errores posibles:**
- *"Ya existe un estudiante con ese correo"* → usa otro correo o inicia sesión.
- *"La contraseña debe tener al menos 6 caracteres"* → alarga la contraseña.
- *"Se requiere un correo electrónico válido"* → corrige el formato (ej: `usuario@correo.com`).

### 1.2 Inicio de sesión

1. En **Correo** y **Contraseña** ingresa tus credenciales.
2. Presiona **Iniciar sesión** → serás redirigido al inicio de estudiante.
3. Si los datos son incorrectos verás un mensaje de error (notificación toast); tu sesión no se abre.

### 1.3 Navegación (menú superior)

| Opción | Qué hace |
|---|---|
| **Ofertas** | Catálogo de oportunidades con filtros |
| **Sugerencias** | Matching de ofertas según tu perfil |
| **Mis postulaciones** | Estado de tus postulaciones |
| **Perfil** | Tu información personal y documentos |

### 1.4 Buscar ofertas (Ofertas)

1. En la barra lateral izquierda puedes filtrar por:
   - **Palabras clave** (búsqueda libre, se actualiza automáticamente)
   - **Tipo de oferta:** Todos / Práctica / Servicio social
   - **Dependencia:** desplegable con las dependencias registradas
   - **Programa académico:** lista derivada del catálogo maestro de programas
2. Los resultados muestran tarjetas de ofertas; presiona **Ver detalle** para la información completa.
3. **Limpiar filtros** restablece la búsqueda.

### 1.5 Sugerencias de matching (Sugerencias)

1. Completa tu perfil: programa académico, área de interés, tipo de oportunidad, disponibilidad, habilidades y palabras clave.
2. Presiona **Obtener sugerencias**.
3. Recibirás ofertas ordenadas por puntaje de coincidencia (0–100), indicando qué criterios coincidieron (programa, área, tipo, palabras clave, etc.).

### 1.6 Postularse a una oferta

1. Abre el detalle de una oferta **ACTIVA**.
2. Presiona **Postularme** y escribe una observación opcional.
3. Tu postulación queda en estado **PENDIENTE** y aparece en **Mis postulaciones**.

Restricciones:
- Solo puedes postularte **una vez** por oferta.
- No puedes postularte a ofertas **INACTIVAS** o **vencidas**.
- Puedes **cancelar** una postulación mientras esté en PENDIENTE o EN_REVISIÓN.

### 1.7 Perfil

- **Editar perfil:** biografía, teléfono, redes sociales.
- **Foto de perfil:** sube una imagen desde tu perfil.
- **Hoja de vida:** sube un PDF/DOC; puedes descargarlo o eliminarlo.
- **Cambiar contraseña:** requiere tu contraseña actual; la nueva debe tener mínimo 6 caracteres.
- **Recuperar contraseña:** desde el login, usa **Olvidé mi contraseña**; recibirás un enlace para restablecerla.

---

## Parte 2 — Usuario administrador

### 2.1 Ingreso

1. En el login, cambia el rol a **Administrador**.
2. Ingresa correo y contraseña de admin → accedes al **Panel de administración** (barra lateral izquierda).

### 2.2 Panel (Dashboard)

Muestra accesos rápidos a todos los módulos: Ofertas, Crear oferta, Postulaciones, Maestras, **Programas académicos**, **Estudiantes**, **Reporte de ofertas** y **Reporte de postulaciones**.

### 2.3 Módulos preexistentes

| Módulo | Funciones |
|---|---|
| **Ofertas** | Listar, editar, eliminar y cambiar estado de ofertas (incluidas vencidas) |
| **Crear oferta** | Formulario completo: título (mín. 5 caracteres), descripción (mín. 20), tipo, contacto, dependencia, categoría, requisitos, palabras clave, fecha de cierre, **programa académico (desplegable del catálogo)**, área de interés y disponibilidad |
| **Postulaciones** | Filtrar por estado/estudiante/oferta, ver detalle, descargar hoja de vida, aceptar o rechazar con observación |
| **Maestras** | Pestañas de **Dependencias** y **Categorías**: crear, editar, eliminar |

### 2.4 Programas académicos (NUEVO)

Ruta: `/admin/programas`

Gestiona el catálogo maestro de programas que usan las ofertas y los perfiles.

**Crear un programa:**
1. Presiona **Nuevo programa académico** (formulario superior).
2. Ingresa **Nombre** (obligatorio, 5–120 caracteres).
3. Opcional: **Código** (formato alfanumérico, ej. `IS-01`), **Nivel académico** (Técnica/Tecnología/Profesional; por defecto Profesional), **Facultad**, **Descripción** y **Estado**.
4. Presiona **Crear programa** → aparece en la tabla.

**Editar / Eliminar:**
- **Editar** → modifica los campos y **Guardar cambios**.
- **Eliminar** → confirma en la acción de dos pasos.

**Reglas:**
- Nombre duplicado o código duplicado → error *"Ya existe un programa académico con ese nombre o código"*.
- Los programas con estado **INACTIVO** no aparecen en el desplegable de **Crear oferta**.

### 2.5 Gestión de estudiantes (NUEVO)

Ruta: `/admin/estudiantes`

Gestiona las cuentas de estudiantes desde el panel admin.

**Crear un estudiante:**
1. Completa **Nombre** (mín. 3 caracteres), **Correo** (formato válido) y **Contraseña** (mín. 6 caracteres).
2. Opcional: programa académico, área de interés, tipo de oportunidad, disponibilidad, habilidades y palabras clave (separadas por coma).
3. Selecciona **Estado** (ACTIVO por defecto) y presiona **Crear estudiante**.

**Buscar y filtrar (tabla):**
- Búsqueda libre por **nombre o correo**.
- Filtro por **estado** (Activo/Inactivo).
- **Paginación** de 20 estudiantes por página.

**Editar:**
- Presiona **Editar**; para conservar la contraseña deja el campo vacío.
- Puedes cambiar nombre, correo, estado y datos del perfil.

**Eliminar:** acción de dos pasos con confirmación.

**Seguridad:** el sistema nunca muestra ni expone la contraseña (`passwordHash`); solo se envía al crearla o cambiarla explícitamente.

### 2.6 Reporte de ofertas (NUEVO)

Ruta: `/admin/reporte-ofertas`

- **KPIs:** total de ofertas, ofertas activas, prácticas y servicio social.
- **Gráfico por estado de vigencia:** ACTIVA / INACTIVA / CERRADA / VENCIDA.
- **Gráfico por tipo de oportunidad:** PRACTICA / SERVICIO_SOCIAL.
- **Ranking por dependencia:** ordenado de mayor a menor cantidad de ofertas.
- Las ofertas sin dependencia aparecen como *"Sin dependencia"*.
- **Exportar CSV:** descarga un archivo `reporte-ofertas.csv` con formato `Titulo;Estado;Tipo;Dependencia` (un renglón por oferta).

### 2.7 Reporte de postulaciones (NUEVO)

Ruta: `/admin/reporte-postulaciones`

- **KPIs:** total de postulaciones, pendientes, aceptadas y **tasa de aceptación** (% de ACEPTADAS sobre el total).
- **Gráfico por estado:** PENDIENTE / EN_REVISIÓN / ACEPTADA / RECHAZADA / CANCELADA.
- **Top estudiantes:** ranking de estudiantes con más postulaciones (top 10).
- **Top ofertas:** ranking de ofertas con más postulaciones (top 10).
- **Exportar CSV:** descarga `reporte-postulaciones.csv` con formato `Estudiante;Oferta;Estado`.

---

## Parte 3 — Notas generales

| Tema | Comportamiento |
|---|---|
| Notificaciones | Los mensajes de éxito/error aparecen como **toast** en la esquina superior derecha |
| Sesión | Caduca según `JWT_EXPIRES_IN` (24h por defecto); al expirar te redirige al login |
| Rate limit | Máximo 500 peticiones cada 15 minutos; al superarlo verás *"Demasiadas solicitudes"* |
| Roles | Solo ADMIN/SUPER_ADMIN accede a rutas `/admin/*` y `/api/reportes/*`; solo ESTUDIANTE a `/api/estudiantes/me/*` |
| Compatibilidad | Ofertas anteriores con programas fuera del catálogo se muestran marcados como *(no está en el catálogo)* |
