// seed-certificates.ts
// Contenido REAL, extraído directamente de los PDFs de certificados en
// cursos-y-certificados/CERTIFICADOS (fechas, instructores/emisores y URLs de
// verificación tal cual figuran en cada documento). La imagen es la primera
// página real del PDF, convertida a PNG (public/images/certificates/).
// `learned`/`applied` son un borrador inicial a ajustar por el usuario — para
// los Cisco, `learned` resume las capacidades oficiales listadas en el propio
// certificado; para el resto, se redactó a partir del título/contenido del curso.

import dbConnect from '../lib/db/conection';
import Certificate from '../models/certificate.model';

const certificates = [
  {
    title: 'Fundamentos de Programación',
    issuer: 'CADI F1 - Academia de Software',
    category: 'Programación',
    date: new Date('2020-01-28'),
    duration: '160 horas',
    image: '/images/certificates/fundamentos-programacion.png',
    techStack: ['Lógica de Programación', 'POO', 'Git', 'HTML5', 'CSS3'],
    learned:
      'Las bases de la lógica de programación (4 niveles) y la programación orientada a objetos, control de versiones con Git, y los primeros pasos en HTML5/CSS3 — el punto de partida antes de especializarme en un stack.',
  },
  {
    title: 'Responsive Web Design',
    issuer: 'freeCodeCamp',
    category: 'Frontend',
    date: new Date('2020-08-25'),
    duration: '~300 horas',
    credentialUrl: 'https://freecodecamp.org/certification/fcc027cd426-e78e-47e7-8b97-472040d2573d/responsive-web-design',
    image: '/images/certificates/responsive-web-design.png',
    techStack: ['HTML5', 'CSS3', 'Flexbox', 'CSS Grid', 'Diseño responsive'],
    learned:
      'Diseño web responsive de verdad — Flexbox, Grid y buenas prácticas de CSS, con proyectos prácticos evaluados, no solo teoría.',
    applied:
      'Es la base de cómo armo layouts responsive en todos mis proyectos con Tailwind CSS.',
  },
  {
    title: 'SQL - Curso completo de Bases de Datos - de 0 a Avanzado',
    issuer: 'Udemy',
    category: 'Bases de Datos',
    date: new Date('2021-09-28'),
    duration: '22 horas',
    credentialUrl: 'https://ude.my/UC-b2e174ad-5161-49e8-89b3-1418db824bca',
    image: '/images/certificates/sql-bases-de-datos.png',
    techStack: ['SQL', 'Bases de datos relacionales'],
    learned:
      'SQL de cero a avanzado: consultas, joins, subconsultas y normalización — la base que uso hoy en proyectos con PostgreSQL o MySQL.',
    applied: 'Es el SQL que uso a diario al diseñar y consultar bases de datos relacionales en mis proyectos.',
  },
  {
    title: 'Introducción a Amazon Web Services (AWS)',
    issuer: 'Udemy',
    category: 'Cloud',
    date: new Date('2021-10-31'),
    duration: '6.5 horas',
    credentialUrl: 'https://ude.my/UC-fa19d013-b96a-4934-a896-4c20b651c18f',
    image: '/images/certificates/aws-udemy.png',
    techStack: ['AWS', 'Cloud Computing'],
    learned:
      'Los servicios base de AWS (EC2, S3, IAM) y cómo pensar infraestructura en la nube.',
    applied:
      'Referencia al comparar contra mi setup actual — hoy despliego con VPS propio + Docker + Traefik en vez de servicios gestionados de AWS.',
  },
  {
    title: 'CCNA: Introducción a Redes',
    issuer: 'Cisco Networking Academy',
    category: 'Redes',
    date: new Date('2022-09-14'),
    image: '/images/certificates/ccna-introduccion-redes.png',
    techStack: ['Ethernet', 'IPv4/IPv6', 'Switching', 'Routing básico'],
    learned:
      'Configurar switches y routers para dar acceso a recursos de red locales y remotos, crear esquemas de direccionamiento IPv4/IPv6, y aplicar buenas prácticas de seguridad en una red pequeña.',
    applied: 'Base directa para entender y documentar cómo se comunican los contenedores en las redes Docker de mis proyectos.',
  },
  {
    title: 'CCNA: Switching, Routing and Wireless Essentials',
    issuer: 'Cisco Networking Academy',
    category: 'Redes',
    date: new Date('2022-12-12'),
    image: '/images/certificates/ccna-switching-routing.png',
    techStack: ['VLAN', 'STP', 'EtherChannel', 'WLAN', 'Routing estático'],
    learned:
      'Configurar VLANs y enrutamiento entre ellas, redundancia con STP/EtherChannel, seguridad de switches y WLAN, y enrutamiento estático IPv4/IPv6.',
  },
  {
    title: 'CCNA: Redes Empresariales, Seguridad y Automatización',
    issuer: 'Cisco Networking Academy',
    category: 'Redes',
    date: new Date('2023-10-31'),
    image: '/images/certificates/ccna-redes-empresariales.png',
    techStack: ['OSPF', 'ACL', 'NAT', 'QoS', 'Automatización de redes'],
    learned:
      'OSPFv2 de área única, ACLs para filtrar tráfico y asegurar acceso administrativo, NAT para escalabilidad de IPv4, y una primera mirada a virtualización y automatización de redes.',
    applied: 'Se traduce directo al hardening y diseño de red que aplico en el VPS donde corren mis proyectos (Traefik, reglas de acceso).',
  },
  {
    title: 'Desarrollo Web Completo con HTML5, CSS3, JS AJAX PHP y MySQL',
    issuer: 'Udemy',
    category: 'Full Stack',
    date: new Date('2023-11-06'),
    duration: '82.5 horas',
    credentialUrl: 'https://ude.my/UC-2616dbcc-8a04-40fe-9032-5113663f1e20',
    image: '/images/certificates/desarrollo-web-completo.png',
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'AJAX', 'PHP', 'MySQL'],
    learned:
      'Un stack completo de desarrollo web clásico: PHP + MySQL en el backend, AJAX para comunicación asíncrona sin recargar la página.',
  },
  {
    title: 'Maestría en JavaScript: Desde Principiante Hasta Experto',
    issuer: 'Udemy',
    category: 'Programación',
    date: new Date('2025-01-16'),
    duration: '12.5 horas',
    credentialUrl: 'https://ude.my/UC-546adfe9-5b82-4a88-b32a-93934ed0d62b',
    image: '/images/certificates/maestria-javascript.png',
    techStack: [
      'JavaScript',
      'ES6+',
      'Closures',
      'Prototipos y herencia',
      'this y contexto',
      'Promesas',
      'Async/Await',
      'Event Loop',
      'DOM',
      'Fetch API',
      'Módulos ES6',
      'Programación funcional',
    ],
    learned:
      'JavaScript a fondo, desde fundamentos hasta conceptos avanzados: closures y scope léxico, prototipos y herencia prototípica, el binding de "this" según el contexto de llamada, y cómo funciona realmente el Event Loop (call stack, microtasks vs macrotasks) para entender por qué el código asíncrono se ejecuta en el orden que se ejecuta. También manejo de promesas y async/await, manipulación del DOM sin frameworks, consumo de APIs con Fetch, y las características modernas de ES6+ (destructuring, spread/rest, módulos, arrow functions) que hoy uso sin pensar pero que en su momento no tenía del todo claras.',
    applied:
      'Es el refuerzo directo del JavaScript que uso todos los días en Node.js (backend) y React/Next.js (frontend). Entender bien el Event Loop y las microtasks me ha servido para debuggear bugs de concurrencia y race conditions en llamadas async que antes resolvía "a prueba y error". Las características de ES6+ (destructuring, módulos, arrow functions) las uso en cada archivo que escribo, y entender prototipos/herencia ayuda a leer código de librerías de terceros sin que se sienta como magia.',
  },
]

async function seed() {
  try {
    await dbConnect()

    for (const cert of certificates) {
      const existing = await Certificate.findOne({ title: cert.title, issuer: cert.issuer })
      if (existing) {
        await Certificate.updateOne({ _id: existing._id }, { $set: cert })
        console.log(`Actualizado: ${cert.title}`)
      } else {
        await Certificate.create(cert)
        console.log(`Creado: ${cert.title}`)
      }
    }

    process.exit(0)
  } catch (error) {
    console.error('Error poblando certificados:', error)
    process.exit(1)
  }
}

seed()
