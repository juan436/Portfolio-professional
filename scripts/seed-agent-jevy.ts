import mongoose from 'mongoose';
import Project from '../models/project.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolioNew';

// Primer caso real de la categoría 'agente' (ver plan en el vault:
// portfolio: planes/seccion-agentes-work). Jevy es el propio agente
// conversacional de este sitio (components/contact/jevy-chat.tsx +
// app/api/contact/chat/route.ts), ya en producción — no una demo.
// EN/FR/IT con posicionamiento Europa, mismo criterio que el resto de la
// identidad (ver juan-villegas-ing: identidad/plan-de-accion, 2026-08-17).

const jevyAgent = {
  title: 'Jevy',
  description:
    'Agente conversacional que entrevista al lead, hace matching con el catálogo real de proyectos, agenda citas reales en Google Calendar y notifica por WhatsApp y correo — de punta a punta, sin pasos manuales. Es el propio asistente de este sitio, en producción real.',
  category: 'agente' as const,
  subtype: 'Agente conversacional',
  tags: ['DeepSeek', 'Next.js', 'n8n', 'MongoDB', 'WhatsApp'],
  agentDetails: {
    icon: 'jevy',
    useCase:
      'Entrevista a cada visitante de /contact — cliente o reclutador — extrae el problema real, el alcance y el presupuesto, sugiere un proyecto parecido del catálogo cuando corresponde, y cierra agendando una reunión real en el calendario disponible.',
    capabilities: [
      'Conversación con function calling — decide qué preguntar según lo que ya sabe',
      'Matching estructurado contra el catálogo real de proyectos',
      'Extrae contacto, presupuesto y alcance sin formulario',
      'Agenda citas reales en Google Calendar, con Meet automático',
      'Notifica por WhatsApp y correo en el momento, sin intervención manual',
      'Genera un informe en PDF del levantamiento para el dueño del sitio',
    ],
    channels: ['WhatsApp', 'Web'],
    tools: ['DeepSeek', 'Next.js', 'n8n', 'MongoDB', 'Google Calendar'],
    setupTime: 'Depende del negocio — este caso completo (chat + agenda + notificaciones) tomó semanas de iteración real',
    liveDemo: 'jevy-chat' as const,
  },
  // Nomenclatura propia del motor de matching (lib/matching.ts), separada de
  // category/subtype de arriba — sin esto, Jevy nunca puede salir como match
  // para un lead que describe querer un agente/bot conversacional.
  jevyProfile: {
    categoria: 'agente',
    subtype: 'bot_conversacional',
    problemaCore: 'atencion_cliente_multicanal',
    sector: 'equipo_interno',
    pitchCorto: 'Agente conversacional que entrevista, hace matching y agenda citas reales — el propio asistente de este sitio, funcionando en producción.',
  },
  translations: {
    en: {
      title: 'Jevy',
      description:
        "A conversational agent that interviews the lead, matches the real project catalog, books real Google Calendar meetings and notifies via WhatsApp and email — end to end, no manual steps. It's this very site's own assistant, running in production.",
      subtype: 'Conversational agent',
      useCase:
        'Interviews every /contact visitor — client or recruiter — extracts the real problem, scope and budget, suggests a similar project from the catalog when relevant, and closes by booking a real meeting on the available calendar.',
      capabilities: [
        'Function-calling conversation — decides what to ask based on what it already knows',
        'Structured matching against the real project catalog',
        'Extracts contact, budget and scope without a form',
        'Books real Google Calendar meetings, with automatic Meet',
        'Notifies via WhatsApp and email instantly, no manual step',
        'Generates a PDF discovery report for the site owner',
      ],
      channels: ['WhatsApp', 'Web'],
      tools: ['DeepSeek', 'Next.js', 'n8n', 'MongoDB', 'Google Calendar'],
      setupTime: 'Depends on the business — this full case (chat + scheduling + notifications) took weeks of real iteration',
    },
    fr: {
      title: 'Jevy',
      description:
        "Un agent conversationnel qui interviewe le lead, fait correspondre le catalogue de projets réels, réserve de vrais rendez-vous Google Calendar et notifie par WhatsApp et email — de bout en bout, sans étape manuelle. C'est l'assistant de ce site lui-même, en production réelle.",
      subtype: 'Agent conversationnel',
      useCase:
        "Interviewe chaque visiteur de /contact — client ou recruteur — extrait le vrai problème, le périmètre et le budget, suggère un projet similaire du catalogue quand pertinent, et conclut en réservant une vraie réunion sur le calendrier disponible.",
      capabilities: [
        'Conversation avec function calling — décide quoi demander selon ce qu\'il sait déjà',
        'Correspondance structurée avec le vrai catalogue de projets',
        'Extrait contact, budget et périmètre sans formulaire',
        'Réserve de vrais rendez-vous Google Calendar, avec Meet automatique',
        'Notifie par WhatsApp et email instantanément, sans intervention manuelle',
        'Génère un rapport PDF de découverte pour le propriétaire du site',
      ],
      channels: ['WhatsApp', 'Web'],
      tools: ['DeepSeek', 'Next.js', 'n8n', 'MongoDB', 'Google Calendar'],
      setupTime: "Selon l'entreprise — ce cas complet (chat + planification + notifications) a pris des semaines d'itération réelle",
    },
    it: {
      title: 'Jevy',
      description:
        "Un agente conversazionale che intervista il lead, fa il matching con il catalogo reale di progetti, prenota vere riunioni su Google Calendar e notifica via WhatsApp ed email — end-to-end, senza passaggi manuali. È l'assistente di questo stesso sito, in produzione reale.",
      subtype: 'Agente conversazionale',
      useCase:
        "Intervista ogni visitatore di /contact — cliente o recruiter — estrae il problema reale, l'ambito e il budget, suggerisce un progetto simile dal catalogo quando pertinente, e chiude prenotando una vera riunione sul calendario disponibile.",
      capabilities: [
        'Conversazione con function calling — decide cosa chiedere in base a ciò che sa già',
        'Matching strutturato contro il catalogo reale di progetti',
        'Estrae contatto, budget e ambito senza un modulo',
        'Prenota vere riunioni su Google Calendar, con Meet automatico',
        'Notifica via WhatsApp ed email istantaneamente, senza intervento manuale',
        'Genera un report PDF del rilevamento per il proprietario del sito',
      ],
      channels: ['WhatsApp', 'Web'],
      tools: ['DeepSeek', 'Next.js', 'n8n', 'MongoDB', 'Google Calendar'],
      setupTime: 'Dipende dal business — questo caso completo (chat + agenda + notifiche) ha richiesto settimane di iterazione reale',
    },
  },
};

async function run() {
  await mongoose.connect(MONGODB_URI);

  const existing = await Project.findOne({ title: jevyAgent.title, category: 'agente' });
  if (existing) {
    Object.assign(existing, jevyAgent);
    await existing.save();
    console.log('Actualizado: Jevy (agente) —', existing._id);
  } else {
    const created = await Project.create(jevyAgent);
    console.log('Creado: Jevy (agente) —', created._id);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
