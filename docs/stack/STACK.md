# Stack Tecnológico — Portafolio Profesional

Este proyecto utiliza tecnologías modernas de alto rendimiento para garantizar una experiencia de usuario fluida y una gestión de contenido eficiente.

## Core Framework
*   **Next.js 15.2 (App Router):** Framework principal para React con soporte para Server Components, Streaming y optimización de rutas.
*   **React 19:** Biblioteca base para la interfaz de usuario.
*   **TypeScript:** Lenguaje base para asegurar tipado estricto y reducir errores en tiempo de ejecución.

## Estilos y UI
*   **Tailwind CSS 3.4:** Framework de utilidades CSS para un diseño responsivo y moderno.
*   **Radix UI / shadcn/ui:** Componentes de interfaz accesibles y personalizables.
*   **Framer Motion:** Motor de animaciones para transiciones fluidas y micro-interacciones (incluyendo al WolfGuide).
*   **Lucide React:** Set de iconos vectoriales consistentes.
*   **Inter (Google Fonts):** Tipografía principal optimizada vía `next/font`.

## Backend y Base de Datos
*   **MongoDB:** Base de datos NoSQL para el almacenamiento de contenido dinámico.
*   **Mongoose:** ODM para modelar los datos y gestionar la conexión con MongoDB.
*   **JWT (jose):** Autenticación basada en tokens para el panel administrativo, optimizada para Edge Runtime.
*   **bcryptjs:** Encriptación de contraseñas de seguridad.

## Internacionalización (i18n)
*   **i18next + react-i18next:** Gestión de múltiples idiomas (Español/Inglés).
*   **i18next-browser-languagedetector:** Detección automática del idioma del navegador.

## Gestión de Formularios
*   **React Hook Form:** Manejo eficiente de formularios sin re-renders innecesarios.
*   **Zod:** Validación de esquemas de datos tanto en cliente como en servidor.

## Otros
*   **Axios:** Cliente HTTP para peticiones a la API.
*   **Recharts:** Visualización de datos y gráficos (usado en el admin dashboard).
*   **Sonner:** Notificaciones toast elegantes y rápidas.
*   **pnpm:** Gestor de paquetes eficiente y rápido.

## Infraestructura y Deploy
*   **Docker:** Containerización del proyecto con build multi-stage (`output: standalone`).
*   **Traefik:** Reverse proxy con gestión automática de certificados SSL (TLS).
*   **Node.js 22 (LTS):** Entorno de ejecución de JavaScript.
