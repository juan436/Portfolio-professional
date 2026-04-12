# Arquitectura Detallada del Sistema

Este documento explica la estructura, convenciones y lógica detrás del funcionamiento de este portafolio.

## 1. Estructura de Carpetas

La arquitectura sigue el patrón de **Next.js App Router** con una separación clara de responsabilidades:

### `/app` (Rutas y Lógica de Página)
*   **`/admin`:** Contiene la interfaz del panel de administración (Dashboard, Login, Managers).
*   **`/api`:** Endpoints del backend (API Routes) organizados por recurso (auth, content, projects, etc.).
*   **`/projects`:** Páginas dinámicas para la visualización detallada de proyectos individuales.
*   **`layout.tsx`:** Layout raíz que inyecta los Providers globales (Tema, Idioma, Contenido).
*   **`page.tsx`:** La "One Page" principal que ensambla todas las secciones del portafolio.

### `/components` (Interfaz de Usuario)
Dividido en subcarpetas lógicas:
*   **`/ui`:** Componentes base reciclables (botones, inputs, tablas) basados en Radix UI.
*   **`/hero`, `/about`, `/projects`, etc.** Componentes específicos de cada sección del portafolio.
*   **`/wolf`:** Lógica y assets de la mascota animada WolfGuide.
*   **`/admin`:** Componentes exclusivos para el panel de gestión.

### `/services` (Capa de Datos y Lógica de Negocio)
*   **`/api`:** Servicios que realizan llamadas Fetch/Axios a nuestras propias API Routes.
*   **`/client`:** Servicios específicos del cliente como Auth, Email y traducciones.

### `/contexts` (Gestión de Estado)
*   **`content`:** Utiliza un patrón de **Slices** para manejar el estado del contenido dinámico (similar a Redux pero con Context API).
*   **`language-context`:** Maneja el estado global del idioma.

### `/models` (Base de Datos)
*   Definiciones de esquemas de **Mongoose** (User, Project, Skill, Experience, Content). Esto asegura que los datos en MongoDB sigan una estructura predecible.

### `/middleware` (Seguridad de Borde)
*   Controla el acceso a rutas protegidas (`/admin/*`) y valida los tokens JWT en las peticiones de escritura de la API.

---

## 2. Arquitectura del Backend

El backend está integrado en Next.js mediante **API Routes**. No hay un servidor Express separado, lo que facilita el despliegue.

*   **Conexión DB:** Se gestiona en `lib/db/connection.ts` usando el patrón de conexión cacheada para evitar saturar MongoDB en entornos serverless/edge.
*   **Seguridad y Auth:**
    *   Las contraseñas se hashean con saltos de 10 niveles usando `bcryptjs`.
    *   La sesión genera un JWT firmado con una clave secreta (`SECRET_KEY`).
    *   El token se almacena en una cookie `httpOnly` para prevenir ataques XSS.
*   **Validación:** Se usa **Zod** para validar que los datos que llegan por POST/PUT sean correctos antes de guardarlos en la base de datos.

---

## 3. Convenciones de Código

*   **TypeScript Estricto:** Se evitan los tipos `any`. Cada interfaz de datos está definida en su modelo o en archivos de tipos.
*   **Componentes de Cliente vs Servidor:** Se usa `"use client"` de forma estratégica solo donde hay interactividad (Framer Motion, Hooks) para maximizar la velocidad de carga inicial.
*   **Naming:**
    *   Componentes en **PascalCase** (`Navbar.tsx`).
    *   Hooks en **camelCase** empezando por `use` (`useLanguage.ts`).
    *   Archivos de rutas en Next.js siempre como `page.tsx` o `route.ts`.
*   **Alias de Rutas:** Se usa `@/` para referenciar la raíz del proyecto, evitando rutas relativas largas como `../../../components`.

---

## 4. Middleware y Services

### Middleware (`middleware.ts`)
Es el guardián del sitio. Realiza dos funciones críticas:
1.  **Redirección de UI:** Si un usuario no logueado intenta entrar a `/admin`, lo manda al login.
2.  **Protección de API:** Bloquea peticiones de escritura (`POST`, `PUT`, `DELETE`) en endpoints sensibles si no hay un JWT válido. Esto evita que terceros modifiquen el contenido del portafolio.

### Servicios (`services/`)
Actúan como intermediarios. En lugar de hacer `fetch` directamente en los componentes, estos llaman a funciones en `services`. Esto permite cambiar la lógica de la API en un solo lugar sin romper la interfaz.

---

## 5. El Corazón del Proyecto: ContentProvider

El contenido del portafolio no está hardcodeado. Al cargar la app:
1.  El `ContentProvider` hace una petición inicial a `/api/content`.
2.  Los datos se distribuyen a través de contextos a todas las secciones.
3.  Si se cambia algo en el panel administrativo, el `ContentProvider` se actualiza y los cambios se reflejan instantáneamente en todo el sitio sin recargar la página.
