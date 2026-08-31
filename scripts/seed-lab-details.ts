
import dbConnect from '../lib/db/conection';
import Project from '../models/project.model';

const experiments = [
  {
    title: 'Predictor de Cortes de Luz',
    description:
      'Idea en etapa temprana: estimar la probabilidad de corte eléctrico por zona en Venezuela combinando reportes ciudadanos con patrones históricos.',
    category: 'laboratory',
    tags: ['Next.js', 'Node.js', 'PostgreSQL'],
    sector: 'Comunidades afectadas por cortes eléctricos en Venezuela',
    techStack: {
      frontend: ['Next.js', 'Tailwind CSS'],
      backend: ['Node.js', 'Express'],
      database: ['PostgreSQL'],
    },
    labDetails: {
      status: 'testing',
      motivation:
        'Frustración personal con los cortes sin aviso y curiosidad por ver si un modelo simple, alimentado por reportes de la comunidad, puede anticipar patrones por zona sin depender de datos oficiales.',
      testing: [
        {
          kind: 'paragraph',
          text: 'La idea central es cruzar reportes ciudadanos en tiempo real con el historial de cortes por sector, para estimar una probabilidad simple (no una predicción exacta).',
        },
        {
          kind: 'steps',
          items: [
            'Formulario propio de reporte ciudadano (zona, hora, duración)',
            'Acumulación de historial por zona para detectar patrones recurrentes',
            'Cálculo de probabilidad básica por franja horaria y sector',
          ],
        },
      ],
      learnings: [
        {
          kind: 'paragraph',
          text: 'No existe una fuente oficial abierta de datos eléctricos en Venezuela, así que cualquier modelo depende 100% de reportes voluntarios — eso introduce sesgo geográfico fuerte (zonas con más usuarios activos reportan más, no necesariamente donde hay más cortes).',
        },
      ],
      comparison:
        'Se descartó hacer scraping de redes sociales (Twitter/X) como fuente principal por el ruido y la dificultad de verificar ubicación real del reporte; se optó por un formulario propio, más lento de poblar pero confiable.',
      limitations: [
        'Cobertura desigual: zonas con pocos usuarios activos no generan suficientes reportes para estimar nada',
        'No sustituye datos oficiales de la empresa eléctrica, que no están disponibles públicamente',
        'La probabilidad calculada es orientativa, no una predicción validada estadísticamente',
      ],
      nextStep:
        'Validar con reportes reales durante unas semanas antes de decidir si el modelo aporta algo útil o si el experimento se queda en aprendizaje.',
      timeInvested: 'En curso — dedicación de fines de semana, ~2 semanas hasta ahora',
    },
  },
  {
    title: 'Bot de Trading (Análisis Automático)',
    description:
      'Idea en etapa temprana: bot que analiza una señal de mercado y sugiere una acción (comprar/mantener/vender) siguiendo reglas simples, sin ejecutar operaciones reales.',
    category: 'laboratory',
    tags: ['Node.js', 'API de mercado', 'Reglas técnicas'],
    sector: 'Traders individuales que quieren automatizar el análisis, no la ejecución',
    techStack: {
      backend: ['Node.js', 'Express'],
      infra: ['Cron job'],
    },
    labDetails: {
      status: 'testing',
      motivation:
        'Curiosidad por ver si un set simple de reglas técnicas (medias móviles, volumen) puede dar una señal consistente sin necesidad de un modelo de machine learning complejo.',
      testing: [
        {
          kind: 'paragraph',
          text: 'El bot recibe un precio actual y lo pasa por una cadena de reglas técnicas antes de sugerir una acción — nunca ejecuta la operación, solo sugiere.',
        },
      ],
      learnings: [
        {
          kind: 'paragraph',
          text: 'Las reglas técnicas simples generan muchas señales falsas en mercados laterales (sin tendencia clara) — el reto no es calcular el indicador, es decidir cuándo ignorarlo.',
        },
      ],
      comparison:
        'Se descartó conectar una API de ejecución real de entrada — el riesgo de un bug ejecutando operaciones reales no se justifica en etapa de experimento.',
      limitations: [
        'Reglas técnicas simples, sin backtesting histórico todavía',
        'No ejecuta operaciones reales, solo sugiere',
        'No considera noticias ni eventos externos, solo precio y volumen',
      ],
      nextStep: 'Hacer backtesting con datos históricos antes de confiar en las señales que da.',
      timeInvested: 'En curso — dedicación de fines de semana, ~1 semana hasta ahora',
      flow: {
        steps: [
          'Recibe el precio actual del activo',
          'Calcula la media móvil de las últimas sesiones',
          'Compara precio vs. media y volumen reciente',
          'Sugiere: comprar, mantener o vender',
        ],
        demoPlaceholder: 'Ej: BTC a $43,200',
        demoOutputTemplate:
          'Señal para "{input}": mantener posición — tendencia lateral, sin volumen suficiente para confirmar (mock, sin datos reales de mercado).',
      },
    },
  },
]

async function seed() {
  try {
    await dbConnect()

    for (const exp of experiments) {
      const existing = await Project.findOne({ title: exp.title, category: 'laboratory' })
      if (existing) {
        await Project.updateOne({ _id: existing._id }, { $set: exp })
        console.log(`Actualizado: ${exp.title}`)
      } else {
        await Project.create(exp)
        console.log(`Creado: ${exp.title}`)
      }
    }

    process.exit(0)
  } catch (error) {
    console.error('Error poblando experimentos de laboratorio:', error)
    process.exit(1)
  }
}

seed()
