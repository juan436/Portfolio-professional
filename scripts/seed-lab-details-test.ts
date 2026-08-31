
import dbConnect from '../lib/db/conection'
import Project from '../models/project.model'

const testExperiments = [
  {
    title: '[TEST] Generador de Recetas con IA',
    description:
      'Prueba de UI — idea de un generador de recetas a partir de ingredientes sueltos usando un LLM.',
    category: 'laboratory',
    tags: ['Next.js', 'OpenAI API'],
    sector: 'Prueba visual del carrusel — no es un experimento real',
    labDetails: {
      status: 'completed',
      motivation: 'Dato de prueba: ver si un modelo simple genera recetas coherentes a partir de ingredientes sueltos.',
      testing: [{ kind: 'paragraph', text: 'Dato de prueba: prompt con restricciones nutricionales básicas.' }],
      learnings: [{ kind: 'paragraph', text: 'Dato de prueba: funciona bien con ingredientes comunes, falla con combinaciones raras.' }],
      nextStep: 'Dato de prueba: pulir el prompt antes de considerar producción.',
      timeInvested: 'Dato de prueba',
    },
  },
  {
    title: '[TEST] Extensión para Resumir PDFs',
    description:
      'Prueba de UI — idea de una extensión de navegador para resumir PDFs largos.',
    category: 'laboratory',
    tags: ['Chrome Extension', 'API de resumen'],
    sector: 'Prueba visual del carrusel — no es un experimento real',
    labDetails: {
      status: 'discontinued',
      motivation: 'Dato de prueba: evaluar si valía la pena un resumidor de PDFs en el navegador.',
      testing: [{ kind: 'paragraph', text: 'Dato de prueba: extracción de texto + llamada a API de resumen.' }],
      learnings: [{ kind: 'paragraph', text: 'Dato de prueba: ya existen herramientas gratuitas similares, sin diferencial claro.' }],
      nextStep: 'Dato de prueba: descontinuado, no se sigue desarrollando.',
      timeInvested: 'Dato de prueba',
    },
  },
]

async function seed() {
  try {
    await dbConnect()

    for (const exp of testExperiments) {
      const existing = await Project.findOne({ title: exp.title, category: 'laboratory' })
      if (existing) {
        await Project.updateOne({ _id: existing._id }, { $set: exp })
        console.log(`Actualizado (TEST): ${exp.title}`)
      } else {
        await Project.create(exp)
        console.log(`Creado (TEST): ${exp.title}`)
      }
    }

    process.exit(0)
  } catch (error) {
    console.error('Error poblando datos de prueba:', error)
    process.exit(1)
  }
}

seed()
