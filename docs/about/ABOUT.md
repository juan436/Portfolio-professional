# About — Portafolio Profesional de Juan Villegas

## ¿Qué es este proyecto?
Este proyecto es mucho más que un portafolio estático; es una **Aplicación Web Full Stack** diseñada para presentar la trayectoria profesional, habilidades y proyectos de Juan Villegas de una manera dinámica, interactiva y totalmente administrable.

Se aleja de los portafolios tradicionales al integrar su propio panel de administración (CMS), permitiendo que todo el contenido sea editable en tiempo real sin necesidad de tocar el código fuente después del despliegue.

## ¿Qué hace?
*   **Presentación Profesional:** Expone secciones de Hero, Sobre Mí, Experiencia, Habilidades (Principales y Secundarias), Proyectos y Contacto.
*   **Gestión Dinámica de Contenido:** Incluye un área administrativa protegida donde el dueño puede:
    *   Cambiar textos y descripciones.
    *   Añadir, editar o eliminar proyectos.
    *   Gestionar el historial de experiencia laboral.
    *   Actualizar su set de herramientas técnicas (Skills).
*   **Interacción Inteligente (WolfGuide):** Posee una mascota animada (un lobo) que guía al usuario, reacciona a la sección en la que el usuario se encuentra y proporciona mensajes contextuales traducidos.
*   **Multilenguaje Real:** Soporte completo para Español e Inglés con persistencia de preferencia de idioma.

## ¿Qué maneja?
1.  **Estado de Contenido:** Sincronización constante entre la base de datos MongoDB y la interfaz de usuario mediante una arquitectura de servicios API.
2.  **Seguridad:** Gestión de sesiones administrativas mediante JWT y cookies seguras (`httpOnly`).
3.  **Performance:** Optimización de carga mediante el modo `standalone` de Next.js y carga optimizada de imágenes y fuentes.
4.  **SEO:** Generación dinámica de sitemaps y metadatos (Open Graph, Twitter Cards) para mejorar el posicionamiento en buscadores.
