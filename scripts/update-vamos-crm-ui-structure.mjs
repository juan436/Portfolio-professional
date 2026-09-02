/**
 * Agrega a la ficha web `vamos-crm` (sección "Estructura y funcionalidad" / uiStructure)
 * 3 módulos de configuración que no estaban descritos: alta de modelos de IA + consultas
 * externas (con el porqué), etiquetas/filtros dinámicos, y segmentación por tipo de usuario
 * (con el porqué). Idempotente: reemplaza los items por título, los inserta antes del
 * cross-link a la ficha de API.
 *
 *   node scripts/update-vamos-crm-ui-structure.mjs
 */
import mongoose from "mongoose";

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolioNew";

const NUEVOS = [
  {
    title: "Configuración de la IA desde el panel",
    icon: "sliders",
    description:
      "El modelo que responde se da de alta desde el panel, con su proveedor, sus credenciales y el prompt de cada perfil. Ahí mismo se definen las consultas externas que la IA puede usar para traer un dato real, como el estado de un viaje o el saldo de un usuario, en vez de contestar algo genérico. Esa información la controla la empresa y no el CRM, así que las consultas se configuran sin volver a desplegar.",
  },
  {
    title: "Etiquetas y filtros que se arman solos",
    icon: "layout",
    description:
      "Cada etiqueta apunta a una columna real de datos y el sistema genera las opciones del filtro de la bandeja con los valores que ya existen, sin programar un filtro nuevo cada vez.",
  },
  {
    title: "Segmentación por tipo de usuario",
    icon: "team",
    description:
      "En una app de movilidad la misma persona puede ser pasajero, conductor o las dos cosas, y lo que aplica en cada caso cambia. El tipo de usuario decide qué respuestas rápidas se ofrecen y qué conocimiento usa la IA en esa conversación.",
  },
];

const NUEVOS_TITULOS = new Set(NUEVOS.map((n) => n.title));

async function main() {
  await mongoose.connect(URI);
  const Projects = mongoose.connection.collection("projects");

  const doc = await Projects.findOne({ slug: "vamos-crm" });
  if (!doc) throw new Error("No existe el proyecto slug=vamos-crm");

  const actuales = (doc.uiStructure || []).filter((s) => !NUEVOS_TITULOS.has(s.title));

  const idxCrossLink = actuales.findIndex((s) => s.href);
  const pos = idxCrossLink === -1 ? actuales.length : idxCrossLink;
  const final = [...actuales.slice(0, pos), ...NUEVOS, ...actuales.slice(pos)];

  await Projects.updateOne({ _id: doc._id }, { $set: { uiStructure: final } });

  console.log(`uiStructure actualizada: ${final.length} items`);
  for (const s of final) console.log(`  - ${s.title}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
