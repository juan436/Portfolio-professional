
import dbConnect from '../lib/db/conection';
import Project from '../models/project.model';

const automations = [
  {
    title: 'Bot de Atención al Cliente',
    description: 'Respuestas y soporte automatizado, disponible todo el día.',
    category: 'automation',
    subtype: 'Bot conversacional',
    tags: ['n8n', 'WhatsApp Business API', 'LLM (GPT/Claude)'],
    automationDetails: {
      icon: 'customer-service',
      useCase:
        'Pensado para negocios que reciben muchas consultas repetidas (horarios, precios, disponibilidad) y no dan abasto respondiendo uno por uno. Se integra a WhatsApp o al chat del sitio y responde al instante, escalando a un humano solo cuando hace falta criterio.',
      tools: ['n8n', 'WhatsApp Business API', 'LLM (GPT/Claude)'],
      channels: ['WhatsApp', 'Web'],
      setupTime: '3-5 días hábiles',
      flow: {
        steps: [
          'Cliente escribe (WhatsApp/Web)',
          'IA interpreta y responde',
          'Escala a un humano si hace falta',
        ],
        demoPlaceholder: 'Ej: ¿Tienen envíos a domicilio?',
        demoOutputTemplate: '🤖 IA responde: recibí tu mensaje "{input}" — te confirmo la info o te paso con un asesor.',
      },
    },
    translations: {
      en: {
        title: 'Customer Service Bot',
        description: 'Automated replies and support, available around the clock.',
        useCase:
          "Built for businesses that get a lot of repeat questions (hours, prices, availability) and can't keep up answering each one by hand. It plugs into WhatsApp or the site chat and replies instantly, escalating to a human only when judgment is needed.",
        tools: ['n8n', 'WhatsApp Business API', 'LLM (GPT/Claude)'],
        channels: ['WhatsApp', 'Web'],
        setupTime: '3-5 business days',
        subtype: 'Conversational bot',
        steps: [
          'Customer writes (WhatsApp/Web)',
          'AI interprets and replies',
          'Escalates to a human when needed',
        ],
        demoPlaceholder: 'e.g. Do you offer home delivery?',
        demoOutputTemplate: '🤖 AI replies: got your message "{input}" — confirming the info or connecting you with an agent.',
      },
      fr: {
        title: 'Bot de Service Client',
        description: 'Réponses et support automatisés, disponibles à toute heure.',
        useCase:
          "Conçu pour les entreprises qui reçoivent beaucoup de questions répétitives (horaires, prix, disponibilité) et ne peuvent pas répondre à chacune manuellement. Il se connecte à WhatsApp ou au chat du site et répond instantanément, en escaladant vers un humain seulement quand un jugement est nécessaire.",
        tools: ['n8n', 'WhatsApp Business API', 'LLM (GPT/Claude)'],
        channels: ['WhatsApp', 'Web'],
        setupTime: '3-5 jours ouvrés',
        subtype: 'Bot conversationnel',
        steps: [
          "Le client écrit (WhatsApp/Web)",
          "L'IA interprète et répond",
          'Escalade vers un humain si nécessaire',
        ],
        demoPlaceholder: 'Ex : Livrez-vous à domicile ?',
        demoOutputTemplate: '🤖 L\'IA répond : message reçu "{input}" — je confirme l\'info ou vous mets en relation avec un agent.',
      },
      it: {
        title: 'Bot di Assistenza Clienti',
        description: 'Risposte e supporto automatizzati, disponibili tutto il giorno.',
        useCase:
          "Pensato per attività che ricevono molte domande ripetitive (orari, prezzi, disponibilità) e non riescono a rispondere una per una. Si collega a WhatsApp o alla chat del sito e risponde all'istante, passando a un operatore umano solo quando serve valutazione.",
        tools: ['n8n', 'WhatsApp Business API', 'LLM (GPT/Claude)'],
        channels: ['WhatsApp', 'Web'],
        setupTime: '3-5 giorni lavorativi',
        subtype: 'Bot conversazionale',
        steps: [
          'Il cliente scrive (WhatsApp/Web)',
          "L'IA interpreta e risponde",
          'Passa a un operatore umano se necessario',
        ],
        demoPlaceholder: 'Es: Fate consegne a domicilio?',
        demoOutputTemplate: '🤖 L\'IA risponde: ricevuto il tuo messaggio "{input}" — confermo l\'informazione o ti metto in contatto con un operatore.',
      },
    },
  },
  {
    title: 'Procesador de Ventas',
    description: 'De pedido a orden confirmada, sin intervención manual.',
    category: 'automation',
    subtype: 'Flujo automatizado',
    tags: ['n8n', 'API de inventario', 'WhatsApp/Web'],
    automationDetails: {
      icon: 'sales',
      useCase:
        'Para quien vende por catálogo o redes y procesa pedidos a mano (anotar, verificar stock, armar la orden). El bot toma el pedido, valida contra el inventario y deja todo listo para facturar — sin planillas ni copiar y pegar.',
      tools: ['n8n', 'API de inventario', 'WhatsApp/Web'],
      channels: ['WhatsApp', 'Web'],
      setupTime: '1 semana',
      flow: {
        steps: ['Pedido recibido', 'Valida stock y datos', 'Genera orden y notifica'],
        demoPlaceholder: 'Ej: Quiero 2 unidades del producto X',
        demoOutputTemplate: '✅ Pedido registrado: "{input}" — orden generada y notificación enviada.',
      },
    },
    translations: {
      en: {
        title: 'Sales Processor',
        description: 'From order to confirmed sale, no manual steps.',
        useCase:
          'For anyone selling through a catalog or social media who processes orders by hand (writing them down, checking stock, building the order). The bot takes the order, validates it against inventory, and leaves it ready to invoice — no spreadsheets, no copy-pasting.',
        tools: ['n8n', 'Inventory API', 'WhatsApp/Web'],
        channels: ['WhatsApp', 'Web'],
        setupTime: '1 week',
        subtype: 'Automated flow',
        steps: ['Order received', 'Validates stock and data', 'Generates order and notifies'],
        demoPlaceholder: 'e.g. I want 2 units of product X',
        demoOutputTemplate: '✅ Order registered: "{input}" — order generated and notification sent.',
      },
      fr: {
        title: 'Processeur de Ventes',
        description: 'De la commande à la vente confirmée, sans intervention manuelle.',
        useCase:
          'Pour ceux qui vendent via un catalogue ou les réseaux sociaux et traitent les commandes à la main (les noter, vérifier le stock, préparer la commande). Le bot prend la commande, la valide par rapport au stock et la laisse prête à facturer — sans tableurs ni copier-coller.',
        tools: ['n8n', "API d'inventaire", 'WhatsApp/Web'],
        channels: ['WhatsApp', 'Web'],
        setupTime: '1 semaine',
        subtype: 'Flux automatisé',
        steps: ['Commande reçue', 'Valide le stock et les données', 'Génère la commande et notifie'],
        demoPlaceholder: 'Ex : Je veux 2 unités du produit X',
        demoOutputTemplate: '✅ Commande enregistrée : "{input}" — commande générée et notification envoyée.',
      },
      it: {
        title: 'Processore di Vendite',
        description: "Dall'ordine alla vendita confermata, senza intervento manuale.",
        useCase:
          "Per chi vende tramite catalogo o social e gestisce gli ordini a mano (annotare, controllare lo stock, preparare l'ordine). Il bot prende l'ordine, lo verifica rispetto al magazzino e lo lascia pronto per la fatturazione — senza fogli di calcolo né copia-incolla.",
        tools: ['n8n', 'API di magazzino', 'WhatsApp/Web'],
        channels: ['WhatsApp', 'Web'],
        setupTime: '1 settimana',
        subtype: 'Flusso automatizzato',
        steps: ['Ordine ricevuto', 'Verifica stock e dati', "Genera l'ordine e notifica"],
        demoPlaceholder: 'Es: Voglio 2 unità del prodotto X',
        demoOutputTemplate: '✅ Ordine registrato: "{input}" — ordine generato e notifica inviata.',
      },
    },
  },
  {
    title: 'Publicación en Redes Sociales',
    description: 'Contenido preparado y publicado sin fricción.',
    category: 'automation',
    subtype: 'Flujo automatizado',
    tags: ['n8n', 'Meta Graph API', 'IA generativa (copy)'],
    automationDetails: {
      icon: 'social',
      useCase:
        'Para marcas que publican seguido pero pierden tiempo armando y subiendo cada post a mano. Se prepara el contenido, la IA ajusta el formato por red y se publica solo, según el calendario definido.',
      tools: ['n8n', 'Meta Graph API', 'IA generativa (copy)'],
      channels: ['Instagram', 'Facebook'],
      setupTime: '3-5 días hábiles',
      flow: {
        steps: ['Contenido preparado', 'IA ajusta copy y formato', 'Publica según el calendario'],
        demoPlaceholder: 'Ej: Foto nueva colección de verano',
        demoOutputTemplate: '📅 Publicación programada: "{input}" — lista para salir según el calendario.',
      },
    },
    translations: {
      en: {
        title: 'Social Media Publisher',
        description: 'Content prepared and published without friction.',
        useCase:
          'For brands that post often but lose time building and uploading every post by hand. Content gets prepared, AI adjusts the format per network, and it publishes itself according to the defined schedule.',
        tools: ['n8n', 'Meta Graph API', 'Generative AI (copy)'],
        channels: ['Instagram', 'Facebook'],
        setupTime: '3-5 business days',
        subtype: 'Automated flow',
        steps: ['Content prepared', 'AI adjusts copy and format', 'Publishes on the defined calendar'],
        demoPlaceholder: 'e.g. New summer collection photo',
        demoOutputTemplate: '📅 Post scheduled: "{input}" — ready to go out per the calendar.',
      },
      fr: {
        title: 'Publication sur les Réseaux Sociaux',
        description: 'Contenu préparé et publié sans friction.',
        useCase:
          "Pour les marques qui publient souvent mais perdent du temps à préparer et publier chaque post à la main. Le contenu est préparé, l'IA ajuste le format par réseau, et la publication se fait seule selon le calendrier défini.",
        tools: ['n8n', 'Meta Graph API', 'IA générative (copy)'],
        channels: ['Instagram', 'Facebook'],
        setupTime: '3-5 jours ouvrés',
        subtype: 'Flux automatisé',
        steps: ['Contenu préparé', "L'IA ajuste le texte et le format", 'Publie selon le calendrier défini'],
        demoPlaceholder: 'Ex : Photo nouvelle collection été',
        demoOutputTemplate: '📅 Publication programmée : "{input}" — prête à sortir selon le calendrier.',
      },
      it: {
        title: 'Pubblicazione sui Social',
        description: 'Contenuto preparato e pubblicato senza attrito.',
        useCase:
          "Per i brand che pubblicano spesso ma perdono tempo a preparare e caricare ogni post a mano. Il contenuto viene preparato, l'IA adatta il formato per ogni social e la pubblicazione avviene da sola secondo il calendario definito.",
        tools: ['n8n', 'Meta Graph API', 'IA generativa (copy)'],
        channels: ['Instagram', 'Facebook'],
        setupTime: '3-5 giorni lavorativi',
        subtype: 'Flusso automatizzato',
        steps: ['Contenuto preparato', "L'IA adatta testo e formato", 'Pubblica secondo il calendario'],
        demoPlaceholder: 'Es: Foto nuova collezione estiva',
        demoOutputTemplate: '📅 Pubblicazione programmata: "{input}" — pronta per uscire secondo il calendario.',
      },
    },
  },
]

async function seed() {
  try {
    await dbConnect()

    for (const item of automations) {
      const existing = await Project.findOne({ title: item.title, category: 'automation' })
      if (existing) {
        await Project.updateOne({ _id: existing._id }, { $set: item })
        console.log(`Actualizado: ${item.title}`)
      } else {
        await Project.create(item)
        console.log(`Creado: ${item.title}`)
      }
    }

    process.exit(0)
  } catch (error) {
    console.error('Error poblando automatizaciones:', error)
    process.exit(1)
  }
}

seed()
