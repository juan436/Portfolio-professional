/**
 * Actualiza la ficha `portafolio-profesional` con lo hecho en agosto-septiembre 2026
 * (migración LibreTranslate -> LLM, ISR, Cloudflare R2, Blog, SEO en 4 idiomas) y
 * setea los enlaces "Visitar sitio" / "Demo" en spaceshare, kisstheplan y
 * gestion-compras-multisucursal (campo demoKind nuevo).
 *
 * Idempotente: los items de arrays se reemplazan por titulo.
 *
 *   node scripts/update-portfolio-ficha-and-demos.mjs
 */
import mongoose from "mongoose";

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolioNew";

const NUEVAS_DECISIONES = [
  {
    title: "Traducción automática del contenido con un LLM",
    description:
      "El contenido que se carga desde el panel se traduce de español a inglés, francés e italiano al guardarse, llamando a un modelo de lenguaje desde una ruta interna del servidor. Migrado desde un servicio de traducción autoalojado que se dejó de usar.",
  },
  {
    title: "Renderizado híbrido con ISR",
    description:
      "El sitio público no se renderiza en cada visita ni se prerenderiza entero en el build, que corre sin acceso a la base de datos. Cada página se genera en la primera visita, queda cacheada y se regenera en segundo plano cada hora. El idioma sale de la URL, con un layout raíz por idioma y otro aparte para el panel.",
  },
  {
    title: "Medios en almacenamiento de objetos (Cloudflare R2)",
    description:
      "Las imágenes de los proyectos y del sitio se suben desde el panel a un bucket S3-compatible en el plan gratuito de Cloudflare, convertidas a WebP. El servidor de la aplicación no guarda archivos subidos en su disco.",
  },
];

const NUEVO_UI_BLOG = {
  title: "Blog",
  icon: "learn",
  description:
    "Artículos técnicos con resaltado de sintaxis, tiempo de lectura, posts relacionados y feed RSS. Cada artículo tiene su propia página y datos estructurados de tipo artículo.",
};

const NUEVO_SEO_I18N = {
  title: "Indexable en los cuatro idiomas",
  description:
    "Cada idioma vive en su propia dirección y el sitio le declara a Google que son versiones del mismo contenido con hreflang. El mapa del sitio lista las cuatro versiones de cada página.",
};

const NUEVA_DESC =
  "Portafolio profesional propio: contenido multi-idioma que se traduce solo al guardar, panel de administración a medida, y optimización para buscadores en los cuatro idiomas. No depende de ningún CMS de terceros y está desplegado en infraestructura propia con Docker y Traefik.";

function upsertByTitle(arr, nuevos) {
  const titulos = new Set(nuevos.map((n) => n.title));
  return [...(arr || []).filter((x) => !titulos.has(x.title)), ...nuevos];
}

async function main() {
  await mongoose.connect(URI);
  const P = mongoose.connection.collection("projects");

  // --- ficha portafolio-profesional ---
  const ficha = await P.findOne({ slug: "portafolio-profesional" });
  if (!ficha) throw new Error("No existe portafolio-profesional");

  const infra = (ficha.techStack?.infra || []).filter((x) => x !== "LibreTranslate");
  if (!infra.includes("Cloudflare R2")) infra.push("Cloudflare R2");

  const tags = [...(ficha.tags || [])];
  if (!tags.includes("Cloudflare R2")) tags.push("Cloudflare R2");

  const decisiones = upsertByTitle(
    (ficha.technicalDecisions || []).filter(
      (d) => d.title !== "Traducción automática sin servicio de terceros",
    ),
    NUEVAS_DECISIONES,
  );

  const ui = upsertByTitle(ficha.uiStructure || [], [NUEVO_UI_BLOG]);
  // Blog va después de Certificaciones
  const idxCert = ui.findIndex((x) => x.title === "Certificaciones");
  if (idxCert !== -1) {
    const blog = ui.pop();
    ui.splice(idxCert + 1, 0, blog);
  }

  const seo = upsertByTitle(ficha.seoDiscoverability || [], [NUEVO_SEO_I18N]);

  await P.updateOne(
    { _id: ficha._id },
    {
      $set: {
        description: NUEVA_DESC,
        tags,
        "techStack.infra": infra,
        technicalDecisions: decisiones,
        uiStructure: ui,
        seoDiscoverability: seo,
      },
    },
  );
  console.log("portafolio-profesional: actualizada");
  console.log("  infra:", infra.join(", "));
  console.log("  decisiones:", decisiones.length, "| ui:", ui.length, "| seo:", seo.length);

  // --- enlaces de demo / sitio ---
  const enlaces = [
    { slug: "spaceshare", demo: "https://space-share.jvserver.com/", demoKind: "site" },
    { slug: "kisstheplan", demo: "https://kisstheplan.com/", demoKind: "site" },
    { slug: "gestion-compras-multisucursal", demoKind: "demo" },
  ];
  for (const e of enlaces) {
    const set = { demoKind: e.demoKind };
    if (e.demo) set.demo = e.demo;
    const r = await P.updateOne({ slug: e.slug }, { $set: set });
    console.log(`  ${e.slug}: matched ${r.matchedCount}, modified ${r.modifiedCount} -> ${JSON.stringify(set)}`);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
