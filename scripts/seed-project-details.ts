// seed-project-details.ts
// Mock/placeholder para los campos nuevos de detalle de proyecto (images, techStack, challenge, technicalDecisions,
// duration, sector). techStack se deriva de los tags reales (no es mock). challenge.solution reutiliza la
// descripción real ya escrita del proyecto. challenge.problem, technicalDecisions, duration y sector son
// placeholder explícito, a reemplazar con contenido real más adelante (ver consideraciones/testimonio-mock-en-mongo,
// mismo patrón).

const SUBTYPE_BY_TITLE: Record<string, string> = {
  'Portafolio Profesional': 'Landing Admin',
  'Realty Edition': 'Ecommerce',
  'DevWebUcla': 'Sistema',
  'Ferretería – Gestión de Pedidos (MVP)': 'Sistema',
  'System-date': 'Sistema',
}

type WorkProcessBlock = { kind: 'paragraph'; text: string } | { kind: 'steps'; items: string[] }

const WORK_PROCESS_BY_TITLE: Record<string, WorkProcessBlock[]> = {
  'System-date': [
    {
      kind: 'paragraph',
      text: 'Metodología iterativa, con entregas cortas y feedback del cliente en cada una — sin esperar al final para validar que el rumbo era el correcto.',
    },
    {
      kind: 'steps',
      items: [
        'Levantamiento de requerimientos con el cliente',
        'Diseño técnico documentado antes de escribir código',
        'Desarrollo por fases: backend (NestJS) y frontend (Next.js) como repos separados, cada uno validado antes de integrar',
      ],
    },
    {
      kind: 'paragraph',
      text: 'Cada proyecto tiene su propio "cerebro" — un vault de memoria asistido por IA que documenta arquitectura, decisiones técnicas y aprendizajes entre sesiones de trabajo, para que el contexto no se pierda ni una feature nueva reintroduzca un problema ya resuelto antes.',
    },
  ],
}

const SECTOR_BY_TITLE: Record<string, string> = {
  'FreePBX Dockerizada': 'Telecomunicaciones',
  'Portafolio Profesional': 'Devs y reclutadores',
  'Realty Edition': 'Bienes raíces',
  'DevWebUcla': 'Educación',
  'Servicio Traefik': 'Infraestructura & DevOps',
  'Servicio Cadvisor': 'Infraestructura & DevOps',
  'Servicio Nagios': 'Infraestructura & DevOps',
  'Servicio Netdata': 'Infraestructura & DevOps',
  'Ferretería – Gestión de Pedidos (MVP)': 'Retail / Ferretería',
  'System-date': 'Salud — clínicas y consultorios médicos',
}

const DURATION_BY_TITLE: Record<string, string> = {
  'System-date': '3 meses de desarrollo + 1 mes de testing',
}

// Placeholder explícito por proyecto — a reemplazar con contenido real dictado por el usuario.
const INFRA_DETAILS_BY_TITLE: Record<string, { uptime?: string; capacity?: string; monitoring?: string[]; backupStrategy?: string; costOptimized?: string }> = {
  'FreePBX Dockerizada': {
    uptime: '99.5% uptime en los últimos 3 meses',
    capacity: 'Hasta 50 llamadas concurrentes',
    monitoring: ['Nagios', 'Netdata', 'cAdvisor'],
    backupStrategy: 'Backup diario de volúmenes + snapshot semanal',
  },
  'Servicio Traefik': {
    uptime: '99.9% uptime',
    capacity: 'Enruta el tráfico de todos los servicios del VPS',
    monitoring: ['Netdata', 'cAdvisor'],
    backupStrategy: 'Configuración versionada, redeploy en minutos',
  },
  'Servicio Cadvisor': {
    uptime: '99.5% uptime',
    monitoring: ['Netdata'],
    costOptimized: 'Contenedor liviano, sin costo adicional de licencia',
  },
  'Servicio Nagios': {
    uptime: '99.5% uptime',
    capacity: 'Monitorea todos los servicios del VPS',
  },
  'Servicio Netdata': {
    uptime: '99.5% uptime',
    capacity: 'Métricas en tiempo real de todos los contenedores',
  },
}

const SYSTEM_DETAILS_BY_TITLE: Record<string, { timeSaved?: string; usersManaged?: string; capacity?: string; integrations?: string[]; reportsGenerated?: string }> = {
  'Portafolio Profesional': {
    timeSaved: 'Contenido editable desde el panel admin, sin tocar código ni redeploy',
    usersManaged: '1 administrador (dueño del sitio)',
    integrations: ['Traducción automática (LibreTranslate)'],
  },
  'DevWebUcla': {
    timeSaved: 'Elimina el registro manual de solicitudes en papel',
    usersManaged: 'Estudiantes y personal administrativo',
    capacity: 'Procesa hasta 200 solicitudes simultáneas',
    integrations: ['Backend propio (PHP/Apache)'],
    reportsGenerated: 'Reportes de solicitudes por departamento',
  },
  'Ferretería – Gestión de Pedidos (MVP)': {
    timeSaved: 'Reduce el tiempo de armado de pedidos frente al proceso manual',
    usersManaged: '1 rol operativo (recepción de pedidos)',
    capacity: 'Procesa hasta 50 pedidos por día',
    integrations: ['Inventario (IndexDB local)'],
  },
  'System-date': {
    timeSaved: 'Elimina la coordinación manual de citas por teléfono',
    usersManaged: 'Pacientes y personal médico',
    capacity: 'Agenda hasta 40 citas por día, por profesional',
    reportsGenerated: 'Agenda diaria por profesional',
  },
}

const ECOMMERCE_DETAILS_BY_TITLE: Record<string, { paymentGateway?: string[]; checkoutFlow?: string; inventory?: string; capacity?: string; performanceSeo?: string; paymentMethods?: string[] }> = {
  'Realty Edition': {
    checkoutFlow: 'Flujo de WooCommerce estándar, adaptado al catálogo del cliente',
    inventory: 'Gestionado desde WordPress/WooCommerce',
    capacity: 'Catálogo de hasta 500 propiedades activas',
    performanceSeo: 'SEO on-page configurado (metadatos, sitemap)',
  },
}
import dbConnect from '../lib/db/conection';
import Project from '../models/project.model';

const TAG_CATEGORY: Record<string, 'frontend' | 'backend' | 'database' | 'infra'> = {
  'next.js': 'frontend',
  'react': 'frontend',
  'react.js': 'frontend',
  'typescript': 'frontend',
  'tailwind css': 'frontend',
  'tailwindcss': 'frontend',
  'javascript': 'frontend',
  'html5/css3': 'frontend',
  'wordpress': 'frontend',
  'woocommerce': 'frontend',
  'node.js': 'backend',
  'nest.js': 'backend',
  'php': 'backend',
  'gulp.js': 'backend',
  'mongodb': 'database',
  'mysql': 'database',
  'mariadb': 'database',
  'indexdb': 'database',
  'docker': 'infra',
  'docker-compose': 'infra',
  'traefik': 'infra',
  'vps': 'infra',
  'linux': 'infra',
  'apache': 'infra',
  'freepbx': 'infra',
  'asterisk': 'infra',
  'iax2/sip': 'infra',
  'nagios': 'infra',
  'cadvisor': 'infra',
  'netdata': 'infra',
  'libretranslate': 'infra',
  'i18next': 'infra',
  'seo': 'infra',
  'saas': 'infra',
}

function buildTechStack(tags: string[] = []) {
  const stack: Record<'frontend' | 'backend' | 'database' | 'infra', string[]> = {
    frontend: [], backend: [], database: [], infra: []
  }
  for (const tag of tags) {
    const category = TAG_CATEGORY[tag.toLowerCase()]
    if (category) stack[category].push(tag)
  }
  return stack
}

async function seed() {
  await dbConnect()

  const projects = await Project.find({ category: { $in: ['systems', 'backend'] } })
  console.log(`Encontrados ${projects.length} proyectos (systems + backend).`)

  for (const project of projects as any[]) {
    const isInfra = project.category === 'backend'

    const images = project.images && project.images.length > 0
      ? project.images
      : project.image ? [project.image] : []

    const techStack = buildTechStack(project.tags || [])

    const problem = isInfra
      ? `Levantar "${project.title}" como un servicio autocontenido, reproducible y seguro dentro de la infraestructura del VPS, sin fricción con los demás servicios ya desplegados.`
      : `Construir "${project.title}" con una arquitectura escalable y mantenible, priorizando experiencia de usuario y tiempos de carga.`

    const solution = project.description

    const technicalDecisions = [
      {
        title: 'Cómo se construyó',
        description: `Stack real: ${(project.tags || []).join(', ')}. Detalle de arquitectura, patrón de datos e infraestructura en construcción — se ampliará con contenido verificado por proyecto.`
      },
      {
        title: 'Control de versiones',
        description: 'Desarrollo versionado con Git, commits atómicos por feature — historial completo disponible en el repositorio.'
      },
      {
        title: isInfra ? 'Despliegue' : 'Estructura del código',
        description: isInfra
          ? 'Contenedores separados por servicio, configuración reproducible vía Docker Compose, sin pasos manuales en el servidor.'
          : 'Separación por capas (presentación, lógica, datos), pensada para que un nuevo feature no obligue a tocar módulos ya probados.'
      }
    ]

    project.images = images
    project.techStack = techStack
    project.challenge = { problem, solution }
    project.technicalDecisions = technicalDecisions
    project.duration = DURATION_BY_TITLE[project.title] || (isInfra ? '2 semanas' : '4 semanas')
    project.sector = SECTOR_BY_TITLE[project.title] || (isInfra ? 'Infraestructura & DevOps' : 'General')
    project.role = 'Desarrollador único — diseño, implementación y despliegue de principio a fin'
    project.workProcess = WORK_PROCESS_BY_TITLE[project.title] || (isInfra
      ? [{
          kind: 'steps' as const,
          items: [
            'Configuración iterativa en ambiente de staging antes de tocar producción',
            'Validación de cada servicio antes de moverlo a producción',
            'Documentación de cada decisión de infraestructura sobre la marcha',
          ],
        }]
      : [{
          kind: 'steps' as const,
          items: [
            'Kickoff para levantar requerimientos con el cliente',
            'Entregas parciales con feedback antes de la versión final',
            'Comunicación async, sin reuniones fijas',
          ],
        }])
    if (SUBTYPE_BY_TITLE[project.title]) {
      project.subtype = SUBTYPE_BY_TITLE[project.title]
    }

    if (INFRA_DETAILS_BY_TITLE[project.title]) {
      project.infraDetails = INFRA_DETAILS_BY_TITLE[project.title]
    }
    if (SYSTEM_DETAILS_BY_TITLE[project.title]) {
      project.systemDetails = SYSTEM_DETAILS_BY_TITLE[project.title]
    }
    if (ECOMMERCE_DETAILS_BY_TITLE[project.title]) {
      project.ecommerceDetails = ECOMMERCE_DETAILS_BY_TITLE[project.title]
    }

    await project.save()
    console.log(`✔ ${project.title}`)
  }

  // Admin Money AI: recategorizado de laboratory a mobile (es el único proyecto React Native real).
  // image original ("/images/lab/lab-finance.png") no existe físicamente en public/ — reemplazada
  // por placeholders de prueba, igual que el resto del contenido de este bloque.
  const mobileProject = await Project.findOne({ title: 'Admin Money AI' }) as any
  if (mobileProject) {
    mobileProject.category = 'mobile'
    mobileProject.image = '/placeholder.svg?height=800&width=400'
    mobileProject.images = [
      '/placeholder.svg?height=800&width=400',
      '/placeholder.svg?height=800&width=400',
      '/placeholder.svg?height=800&width=400',
    ]
    mobileProject.techStack = {
      frontend: ['React Native'],
      backend: ['NestJS'],
      database: [],
      infra: [],
    }
    mobileProject.challenge = {
      problem: 'Dar visibilidad y control del gasto personal sin depender de hojas de cálculo manuales, con predicción de gastos futuros.',
      solution: mobileProject.description,
    }
    mobileProject.technicalDecisions = [
      {
        title: 'Cómo se construyó',
        description: 'App React Native consumiendo una API NestJS propia; el módulo de predicción de gastos corre como servicio de IA separado del backend transaccional.',
      },
    ]
    mobileProject.duration = '6 semanas'
    mobileProject.sector = 'Finanzas personales'
    mobileProject.role = 'Desarrollador único — app, API y modelo de predicción de gastos'
    mobileProject.workProcess = [
      {
        kind: 'paragraph',
        text: 'Proyecto propio, sin cliente externo — el proceso fue más flexible que en un encargo, pero igual de disciplinado en la validación de cada parte.',
      },
      {
        kind: 'steps',
        items: [
          'Prototipo funcional primero, sin proceso formal',
          'Iteraciones cortas sobre el modelo de predicción',
        ],
      },
    ]
    mobileProject.securityHardening = [
      'Autenticación biométrica en el dispositivo',
      'Datos financieros cifrados en reposo',
    ]
    mobileProject.mobileDetails = {
      platforms: ['iOS', 'Android'],
      storeStatus: 'No publicada en stores (uso interno/demo)',
      offlineSupport: 'No implementado',
      pushNotifications: 'No implementado',
      loadPerformance: 'Carga inicial <2s en dispositivo de gama media',
    }
    await mobileProject.save()
    console.log('✔ Admin Money AI (recategorizado a mobile)')
  }

  console.log('Listo.')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Error poblando detalles de proyecto:', error)
  process.exit(1)
})
