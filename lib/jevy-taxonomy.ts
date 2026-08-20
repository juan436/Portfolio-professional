import dbConnect from '@/lib/db/conection';
import JevyTaxonomyModel, { type IJevyTaxonomyEntry } from '@/models/jevy-taxonomy.model';

/**
 * Vocabulario de matching de Jevy — semillas (`JEVY_*_SEED`) + acceso a la
 * versión vigente en Mongo, con caché de 5 min.
 * Recibe: nada.
 * Produce: `getJevyTaxonomy()` (4 listas categorias/subtypes/problemasCore/sectores,
 * de Mongo o semilla si el doc no tiene datos) y `invalidateJevyTaxonomyCache()`.
 */
// Semilla inicial del vocabulario de Jevy — se carga a Mongo una sola vez
// (scripts/seed-jevy-taxonomy.ts). Desde ahí, la colección manda: agregar un
// valor nuevo es editar el documento, no tocar código ni redeployar.
//
// `no_definido` es válido en los 4 ejes: Jevy nunca fuerza una clasificación
// insegura, y el motor de scoring no penaliza un eje que vino así.
//
// Semilla real tomada de los 11 proyectos verificados en juan-villegas-ing
// (2026-08-12) — no es una lista cerrada para siempre, crece con el catálogo.

export const JEVY_CATEGORIAS_SEED: IJevyTaxonomyEntry[] = [
  { value: 'web', label: 'Solución web', definicion: 'Sistema o app con un panel que alguien ABRE y USA activamente para gestionar algo (ver pedidos, cargar datos, revisar reportes). DEFAULT para casi cualquier pedido de un negocio, aunque el lead no diga "panel" — el silencio sobre eso NO significa que sea infra_backend NI automatizacion' },
  { value: 'mobile', label: 'Mobile', definicion: 'Aplicación móvil nativa o híbrida' },
  { value: 'infra_backend', label: 'Infra / Backend', definicion: 'SOLO infraestructura o servicios técnicos donde NINGÚN usuario de negocio interactúa con una interfaz — monitoreo de servidores, integraciones entre sistemas, procesamiento en segundo plano. Si alguien (dueño, empleado, cliente) va a ver/usar/gestionar algo, es "web", no esto' },
  { value: 'automatizacion', label: 'Automatización', definicion: 'Reacciona SOLA a un evento/disparador (llega un mensaje, un pedido nuevo, una hora programada) y hace su trabajo sin que nadie abra ni opere nada activamente — ni un panel de gestión ni un chat con un bot cuentan como "alguien operando algo", son el disparador o el canal, no uso activo de un sistema. Diferencia clave con "web": en "web" alguien entra y usa un sistema; en "automatizacion" el proceso corre solo, reaccionando' },
  { value: 'agente', label: 'Agente de IA', definicion: 'El lead pide algo que RAZONA y DECIDE de forma dinámica, interpretando contexto — no sigue un camino fijo de pasos. Incluye tanto agentes conversacionales (un bot que conversa con un usuario/cliente final y decide qué preguntar o hacer) como agentes que procesan información y deciden sin conversar con nadie (leen, clasifican, extraen datos de documentos y deciden qué hacer con ellos). Diferencia clave con "automatizacion": la automatización reacciona sola a un trigger con un camino fijo predefinido; un agente interpreta y decide dinámicamente, haya o no conversación de por medio. Diferencia con "web": no es un panel que alguien opera activamente' },
  {
    value: 'laboratorio',
    label: 'Laboratorio',
    definicion: 'ESTADO, no tipo de solución: proyecto en desarrollo/experimental, no entregado todavía. Ningún lead lo pide así — solo se usa para clasificar el catálogo.',
  },
  { value: 'no_definido', label: 'Sin definir', definicion: 'La charla no dio suficiente información para clasificar este eje' },
];

export const JEVY_SUBTYPES_SEED: IJevyTaxonomyEntry[] = [
  { value: 'crm', label: 'CRM', definicion: 'Sistema para gestionar la relación y comunicación con clientes/leads' },
  { value: 'marketplace', label: 'Marketplace', definicion: 'Plataforma que intermedia entre oferentes y compradores de un bien o servicio' },
  { value: 'saas_multitenant', label: 'SaaS multi-tenant', definicion: 'Software como servicio con múltiples clientes/organizaciones aislados en la misma plataforma' },
  { value: 'saas_colaborativo', label: 'SaaS colaborativo', definicion: 'Software como servicio centrado en que varios usuarios trabajen juntos sobre el mismo recurso' },
  { value: 'sistema_multirol_b2b2c', label: 'Sistema multi-rol B2B2C', definicion: 'Sistema con roles separados (ej. admin/vendedor/cliente final) y dashboards distintos por rol' },
  { value: 'sistema_gestion_interna', label: 'Sistema de gestión interna', definicion: 'Sistema para administrar operaciones internas de un negocio (inventario, sucursales, compras)' },
  { value: 'sistema_facturacion_documentos', label: 'Facturación / documentos', definicion: 'Sistema centrado en generar, procesar o clasificar documentos y facturas' },
  { value: 'herramienta_interna_ia', label: 'Herramienta interna con IA', definicion: 'Herramienta de productividad/conocimiento para un equipo, con IA integrada' },
  { value: 'app_finanzas_personales', label: 'App de finanzas personales', definicion: 'Aplicación para que una persona gestione sus propias finanzas' },
  { value: 'sistema_agendamiento', label: 'Sistema de agendamiento', definicion: 'Sistema para coordinar/agendar citas u horarios, evitando choques' },
  { value: 'bot_conversacional', label: 'Bot conversacional', definicion: 'Bot que conversa directamente con el usuario final (atención, ventas, soporte)' },
  { value: 'flujo_automatizado', label: 'Flujo automatizado', definicion: 'Automatización que corre en segundo plano, sin que nadie le hable directamente' },
  { value: 'bot_analisis_datos', label: 'Bot de análisis de datos', definicion: 'Bot/herramienta que analiza datos y sugiere una acción, sin ejecutarla' },
  { value: 'no_definido', label: 'Sin definir', definicion: 'La charla no dio suficiente información para clasificar este eje' },
];

export const JEVY_PROBLEMAS_CORE_SEED: IJevyTaxonomyEntry[] = [
  { value: 'atencion_cliente_multicanal', label: 'Atención al cliente multicanal', definicion: 'Centralizar atención a clientes por varios canales (WhatsApp, chat, etc.), con o sin IA' },
  { value: 'gestion_ventas_postventa', label: 'Gestión de ventas y postventa', definicion: 'Administrar el ciclo de venta: procesar pedidos/órdenes, validar stock, seguimiento posterior (garantías, pagos, entregas). Incluye "dejar listo para facturar" como paso final — el foco es la ORDEN/VENTA, no el documento en sí' },
  { value: 'gestion_conocimiento_equipo', label: 'Gestión de conocimiento de equipo', definicion: 'Memoria/contexto compartido para que un equipo no pierda información ni la reinvente' },
  { value: 'intermediacion_pagos', label: 'Intermediación y pagos', definicion: 'Conectar dos partes de un mercado y procesar el pago entre ellas' },
  { value: 'gestion_eventos_colaboracion', label: 'Gestión de eventos y colaboración', definicion: 'Planificar un evento o proyecto con varias personas colaborando sobre el mismo recurso' },
  { value: 'auditoria_cumplimiento', label: 'Auditoría y cumplimiento', definicion: 'Revisar, documentar o certificar que algo cumple una norma o proceso' },
  { value: 'sincronizacion_offline_inventario', label: 'Sincronización offline / inventario', definicion: 'Gestionar inventario o datos que deben funcionar sin conexión y sincronizarse después' },
  { value: 'automatizacion_documentos_fiscales', label: 'Automatización de documentos fiscales', definicion: 'El documento fiscal/legal EN SÍ es el foco (clasificar facturas recibidas, aplicar reglas tributarias, series fiscales) — NO uses esto solo porque una venta termine en factura, eso es gestion_ventas_postventa' },
  { value: 'gestion_financiera_personal', label: 'Gestión financiera personal', definicion: 'Ayudar a una persona (no una empresa) a organizar sus propias finanzas' },
  { value: 'logistica_postventa', label: 'Logística y postventa', definicion: 'Coordinar stock, envíos o servicio posterior a la venta' },
  { value: 'agendamiento_citas', label: 'Agendamiento de citas', definicion: 'Coordinar y agendar horarios/citas, evitando choques' },
  { value: 'analisis_predictivo', label: 'Análisis predictivo', definicion: 'Analizar datos históricos para predecir o sugerir una tendencia futura' },
  { value: 'gestion_contenido_marketing', label: 'Gestión de contenido / marketing', definicion: 'Crear, programar o publicar contenido de marketing (redes sociales, campañas)' },
  { value: 'no_definido', label: 'Sin definir', definicion: 'La charla no dio suficiente información para clasificar este eje' },
];

export const JEVY_SECTORES_SEED: IJevyTaxonomyEntry[] = [
  { value: 'ride_sharing', label: 'Ride-sharing', definicion: 'Transporte de personas bajo demanda' },
  { value: 'equipos_medicos', label: 'Equipos médicos', definicion: 'Venta o gestión de equipos/insumos médicos' },
  { value: 'ferreteria_retail', label: 'Ferretería / retail', definicion: 'Comercio minorista de productos físicos' },
  { value: 'auditoria_contable', label: 'Auditoría contable', definicion: 'Servicios de auditoría o contabilidad' },
  { value: 'almacenamiento_espacios', label: 'Almacenamiento / espacios', definicion: 'Arriendo o intermediación de espacios físicos' },
  { value: 'bodas_eventos', label: 'Bodas y eventos', definicion: 'Planificación de bodas u otros eventos' },
  { value: 'clinicas_salud', label: 'Clínicas y salud', definicion: 'Consultorios, clínicas o servicios de salud' },
  { value: 'consumidor_final', label: 'Consumidor final (B2C genérico)', definicion: 'Producto dirigido a personas individuales, sin rubro específico' },
  { value: 'hardware_tecnologia', label: 'Hardware / tecnología', definicion: 'Venta o soporte de hardware y tecnología' },
  { value: 'equipo_interno', label: 'Equipo interno', definicion: 'Uso interno del propio equipo de desarrollo, sin cliente externo' },
  { value: 'trading_finanzas', label: 'Trading / mercados financieros', definicion: 'Inversores o traders individuales operando en mercados financieros' },
  { value: 'comunidad_energia', label: 'Comunidad / servicios de energía', definicion: 'Personas afectadas por o interesadas en el servicio eléctrico de su zona' },
  { value: 'comercio_retail', label: 'Comercio / retail general', definicion: 'Negocios que venden productos por catálogo, tienda física o redes sociales' },
  { value: 'no_definido', label: 'Sin definir', definicion: 'La charla no dio suficiente información para clasificar este eje' },
];

interface CachedTaxonomy {
  categorias: IJevyTaxonomyEntry[];
  subtypes: IJevyTaxonomyEntry[];
  problemasCore: IJevyTaxonomyEntry[];
  sectores: IJevyTaxonomyEntry[];
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min — balance entre "editable sin redeploy" y no pegarle a Mongo cada mensaje
let cache: { data: CachedTaxonomy; expiresAt: number } | null = null;

export async function getJevyTaxonomy(): Promise<CachedTaxonomy> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  await dbConnect();
  const doc = await JevyTaxonomyModel.findOne({}).lean<CachedTaxonomy>();

  const data: CachedTaxonomy = doc
    ? {
        categorias: doc.categorias?.length ? doc.categorias : JEVY_CATEGORIAS_SEED,
        subtypes: doc.subtypes?.length ? doc.subtypes : JEVY_SUBTYPES_SEED,
        problemasCore: doc.problemasCore?.length ? doc.problemasCore : JEVY_PROBLEMAS_CORE_SEED,
        sectores: doc.sectores?.length ? doc.sectores : JEVY_SECTORES_SEED,
      }
    : {
        categorias: JEVY_CATEGORIAS_SEED,
        subtypes: JEVY_SUBTYPES_SEED,
        problemasCore: JEVY_PROBLEMAS_CORE_SEED,
        sectores: JEVY_SECTORES_SEED,
      };

  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  return data;
}

export function invalidateJevyTaxonomyCache() {
  cache = null;
}
