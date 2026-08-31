/**
 * Reescribe la colección `experiences` (sesión 2026-08-31).
 *
 * La sección "Experiencia laboral" del sitio tenía redundancias: clientes
 * freelance por proyecto (Airtable, Auditoría, Gestión de Compras) mezclados
 * con el empleo real, y SAE / PCRacing duplicados. Según la decisión del vault
 * `juan-villegas-ing` (identidad/experiencia-laboral), acá solo va empleo
 * continuo o pasantía; lo freelance-por-proyecto vive en "Proyectos".
 *
 * Queda: Policlínica San Javier del Arca (actual) + PCRacing (cerrado jul-2026)
 * + SAE (pasantía). Traducciones en/fr/it por DeepSeek.
 *
 * Backup del estado previo: scripts/_backups/experiences-2026-08-31.json
 *
 * Uso: pnpm dlx tsx --env-file=.env scripts/rework-experience-2026-08-31.ts [--go]
 */
import dbConnect from "../lib/db/conection"
import Experience from "../models/experience.model"
import { translateAndAddToObject } from "../lib/translate"

const GO = process.argv.includes("--go")

// docs a borrar (semilla vieja + freelance que ya son fichas de Proyecto)
const DELETE_IDS = [
  "685b6667ae467a4aa48b1fb6", // SAE (duplicado viejo)
  "685b6711ae467a4aa48b1fc5", // Workana / Airtable
  "685d489ffdae2cbd4e8aa85c", // Workana / Auditoría financiera
  "685d4e90fdae2cbd4e8aa86f", // PCRACING (duplicado viejo)
  "690539c7426ceb59abce8e91", // Grupoinolite
]

// docs curados que se conservan y se reescriben
const PCRACING_ID = "6a82b3bee5cc1661ff04b32c"
const SAE_ID = "6a82b3bee5cc1661ff04b32e"

const policlinica = {
  position: "Desarrollador Full Stack",
  company: "Policlínica San Javier del Arca",
  period: "Feb 2026 – Presente",
  location: "Remoto",
  skills: ["TypeScript", "Node.js", "Express", "Next.js", "React", "MongoDB", "DeepSeek", "JWT", "Docker", "Traefik"],
  description:
    "Relación continua por contrato de proyecto. Construí dos sistemas para la operación de la clínica. " +
    "System Inbox automatiza la facturación: lee las facturas que emiten las clínicas en distintos formatos, " +
    "las procesa con un pipeline de inteligencia artificial en dos pasos y las traduce al esquema fiscal que " +
    "exige el proveedor de facturación electrónica. Un middleware de auditoría valida la coherencia entre base " +
    "gravable, IVA y totales antes de emitir, y cada serie fiscal se resuelve con su propia estrategia, así que " +
    "sumar una serie nueva no afecta a las demás. Mediexpert es el sistema de administración de venta y postventa " +
    "de equipos médicos: tres perfiles con paneles independientes (administración, vendedor y comprador de salud), " +
    "seguimiento de cada equipo por serial con su garantía y comprador asignado, y un flujo de validación de pagos " +
    "con comprobante y estados de negocio explícitos. Los dos corren en contenedores Docker con Traefik.",
}

const pcracing = {
  position: "Desarrollador Full Stack",
  company: "PCRacing.pro",
  period: "Dic 2024 – Jul 2026",
  location: "Madrid, España",
  skills: ["Next.js", "Prisma", "PostgreSQL", "Node.js", "Express.js", "TypeScript", "MongoDB", "WooCommerce", "Docker", "Git"],
  description:
    "Tienda de hardware y equipos de PC con e-commerce sobre WooCommerce. Trabajé en tres frentes. En postventa, " +
    "extendí un sistema Next.js con Prisma y PostgreSQL que ya estaba en producción, agregando dos módulos completos " +
    "de garantías y devoluciones, con validaciones de integridad y generación automática del PDF de reclamo con doble " +
    "código QR. En sincronización de catálogo, levanté un microservicio en Node, Express y TypeScript que mantiene " +
    "stock, precio y disponibilidad al día contra el proveedor externo y los publica en WooCommerce, con tareas " +
    "programadas escalonadas, reintentos con tope, un motor de precios propio con margen por rango e IVA por país, y " +
    "descripciones de producto generadas con IA. Corre desatendido y avisa por Telegram. En envíos, diseñé un sistema " +
    "basado en microservicios con patrón Factory e interfaz común de transportista, preparado para sumar couriers sin " +
    "tocar el núcleo e integrado con el ERP interno de la empresa. También monté la tienda para Portugal en WordPress " +
    "con contenido traducido y dominio propio, y un bot de WhatsApp que informa al cliente el estado de su pedido. " +
    "Todo dockerizado.",
}

const sae = {
  position: "Programador de Sistema Horario (Pasantía)",
  company: "SAE",
  period: "Jun 2024 – Oct 2025",
  location: "Barquisimeto, Venezuela",
  skills: ["Next.js", "JavaScript", "MongoDB", "ExcelJS"],
  description:
    "Pasantía de Ingeniería. Desarrollé la API REST de un sistema de planificación académica: siete módulos CRUD para " +
    "horarios, ciclos, cursos, asignaturas, aulas y profesores, más un algoritmo que arma los horarios respetando " +
    "restricciones institucionales, disponibilidad docente y carga semanal, sin solapamientos. Sumé reportes en Excel " +
    "y PDF por sección.",
}

async function withTranslations(data: Record<string, any>) {
  return translateAndAddToObject(data, "es", ["en", "fr", "it"], ["position", "description", "location"])
}

async function run() {
  await dbConnect()

  const before = await Experience.find({}, { company: 1, period: 1 }).lean()
  console.log("ANTES:", before.map((e: any) => `${e.company} (${e.period})`).join(" · "))

  if (!GO) {
    console.log("\n[dry-run] Se borrarían:", DELETE_IDS.length, "docs")
    console.log("[dry-run] Se reescribirían: PCRacing, SAE. Se crearía: Policlínica San Javier del Arca")
    console.log("[dry-run] Corré con --go")
    return
  }

  const del = await Experience.deleteMany({ _id: { $in: DELETE_IDS } })
  console.log(`\nBorrados: ${del.deletedCount}`)

  const [pcT, saeT, poliT] = await Promise.all([withTranslations(pcracing), withTranslations(sae), withTranslations(policlinica)])

  await Experience.updateOne({ _id: PCRACING_ID }, { $set: pcT })
  console.log("PCRacing reescrito")
  await Experience.updateOne({ _id: SAE_ID }, { $set: saeT })
  console.log("SAE reescrito")

  const existingPoli = await Experience.findOne({ company: policlinica.company })
  if (existingPoli) {
    await Experience.updateOne({ _id: existingPoli._id }, { $set: poliT })
    console.log("Policlínica actualizada")
  } else {
    await Experience.create(poliT)
    console.log("Policlínica creada")
  }

  const after = await Experience.find({}).sort({ createdAt: 1 }).lean()
  console.log("\nDESPUÉS:")
  after.forEach((e: any) => {
    console.log(`- ${e.company} | ${e.position} | ${e.period}`)
    console.log(`  ES: ${e.description.slice(0, 90)}...`)
    console.log(`  EN: ${(e.translations?.en?.description || "FALTA").slice(0, 90)}...`)
  })
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
