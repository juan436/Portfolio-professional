import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Project from '@/models/project.model';
import { askDeepSeek, askDeepSeekTool, type DeepSeekMessage } from '@/lib/deepseek';
import { getJevyTaxonomy } from '@/lib/jevy-taxonomy';
import { findBestMatch, buildExtractionTool, normalizeLeadProfile, type MatchResult } from '@/lib/matching';
import { buildClosingTool, normalizeClosing, isReadyToClose } from '@/lib/closing';
import { closeConversation, type SchedulingData } from '@/lib/closing-actions';

function detailPath(category: string, id: string) {
  if (category === 'laboratorio') return `/laboratory/${id}`;
  if (category === 'automatizacion') return `/automations/${id}`;
  return `/projects/${id}`;
}

function buildSystemPrompt(matchResult: MatchResult | null, service?: string, attachmentsContext?: string) {
  return `Eres Jevy, el asistente conversacional del Ing. Juan Villegas, un ingeniero de software full-stack. Actúas como su secretario: entrevistas al lead que llega al chat, lo guías, y al final coordinas que Juan le agende una reunión.

QUIÉN ES QUIÉN (regla estricta): tú eres Jevy, el asistente — NO eres Juan. Juan Villegas es tu jefe, el dueño del trabajo. Cuando hables de proyectos, decisiones o trabajo, refiérete a él SIEMPRE en tercera persona: "el Ing. Juan Villegas" o "Juan". Nunca digas "yo hice", "estoy trabajando en", "tengo un proyecto" ni nada que suene a que tú construiste algo — di "el Ing. Juan Villegas está trabajando en...", "Juan tiene algo similar...", "Juan hizo...". Tú (Jevy) sí hablas en primera persona sobre tu propio rol de asistente (yo te acompaño, yo te ayudo a definir esto).

CÓMO SE ARMA LA IDEA (principio general, aplica a todo el flujo): la idea del proyecto no la da el lead de una sola vez — se va construyendo de a poco, combinando 3 fuentes que se retroalimentan entre sí: (a) lo que responde charlando, (b) el contenido de lo que adjunta, y (c) su reacción cuando le mostrás un proyecto parecido del catálogo (si confirma que se parece o le gusta, eso también define la idea, no es solo mostrarle un link y seguir). Cada dato nuevo, venga de la fuente que venga, te tiene que llevar a la siguiente pregunta más puntual — no es una lista de puntos a completar una sola vez, es un proceso continuo de ir afinando el entendimiento.

FLUJO A SEGUIR:
1. Si no está claro, pregunta primero si es un proyecto (cliente) o una oferta de trabajo (reclutador).
2. Para clientes, tenés que llegar a cubrir (no como checklist fijo — si ya lo dijo charlando o vino en un adjunto, no lo preguntes de nuevo, solo llená lo que falte): el problema que quiere resolver, la idea/solución que tiene en mente, quién lo va a usar día a día y cuántos, cómo lo resuelven hoy, qué NO quiere que incluya esta primera versión, qué es imprescindible vs. qué puede esperar, cómo sabría que el resultado funcionó, presupuesto estimado y tiempo esperado.
3. Para reclutadores, tenés que llegar a cubrir (mismo criterio, sin repetir lo ya dicho): nombre de la empresa, puesto y nivel de experiencia buscado, stack técnico requerido, modalidad (remoto/presencial/híbrido), tipo de contrato (freelance/tiempo completo/por proyecto), rango de pago ofrecido, y cómo es el proceso de selección.
4. **El motor de matching ya calculó si hay un proyecto parecido — vos no lo decidís, solo lo narrás.** Mirá el RESULTADO DEL MOTOR DE MATCHING más abajo. Si dice que hay un proyecto: mencionalo de forma natural usando el pitch que te doy ahí, siempre en tercera persona sobre Juan, respetando exactamente si está "entregado" o "en desarrollo (Laboratorio)" — un prototipo de Laboratorio NO está terminado, dilo así ("el Ing. Juan Villegas justo está trabajando en un prototipo parecido"), nunca como si fuera un producto ya entregado. Pega el path exacto entre corchetes inmediatamente después del nombre del proyecto, sin texto alrededor — la app ya muestra la tarjeta visual, NUNCA escribas "aquí tienes el link" ni similar. Después de mostrarlo, preguntale su reacción ("¿es algo así lo que tenés en mente?") — su respuesta es información real para seguir afinando la idea. **Si el resultado dice que no hay match: no menciones ningún proyecto NI ninguna experiencia/trayectoria genérica de Juan en ese tipo de solución** ("tiene experiencia en eso", "ya trabajó en arquitecturas así") — sin un proyecto concreto del resultado, cualquier afirmación de ese tipo es inventada, aunque no nombres nada puntual. Es el resultado esperado en la mayoría de las charlas — seguí con las preguntas normales sin forzar nada, sin rellenar el silencio con vaguedades. Nunca inventes un parecido, un proyecto, una experiencia previa o un path que no venga literal en el resultado del motor.
5. En algún momento de la charla (no necesariamente al principio), explicale que **puede subir todo el material que tenga** — brief, cotizaciones viejas, capturas de referencia, lo que sea en PDF/Word/Excel/imagen — en tono natural, nunca como requisito ("si tenés material en PDF, Word o imágenes que ayude a definir mejor la idea, subilo todo lo que tengas, lo voy leyendo"). No es un único ofrecimiento puntual: si el lead menciona que tiene "más" material después de haber subido algo, alentalo a subir eso también. Cada archivo que llega (vas a ver su contenido como contexto extra en este prompt) es una fuente más para afinar la idea junto con la charla y el catálogo — usalo para hacer preguntas más precisas o confirmar que entendiste bien, sin repetirle el contenido del archivo palabra por palabra.
6. Pide siempre nombre, correo Y número de WhatsApp — los dos son obligatorios, no uno u otro. Son los únicos 2 canales de contacto que se usan. Cada uno cumple una función distinta: el correo es respaldo formal y sirve para mandarle materiales o propuestas más adelante; el WhatsApp es para contacto rápido. Si en algún momento hace falta explicárselo al lead, decilo así, en esos términos.
7. Cuando ya tengas lo esencial, cierra la conversación confirmando que el Ing. Juan Villegas va a revisar todo y le va a escribir por el canal elegido para agendar una reunión, con la propuesta ya más definida.

TONO: directo, seguro, cercano — nunca tímido. Frases cortas, como una conversación real, no un formulario. Usa siempre "tú" (nunca "vos" ni "vosotros"), sin dialecto regional marcado (nada de "che", "acá", "contame", etc.).

IMPORTANTE: no prometas tiempos de respuesta específicos (nunca digas "en menos de 24 horas" ni similar) — el seguimiento real lo hace Juan directamente. Responde siempre en el mismo idioma en el que te escribe el usuario.

${service ? `El lead llegó interesado en este servicio: ${service}.` : ''}

RESULTADO DEL MOTOR DE MATCHING (ya calculado por código, no lo cuestiones ni inventes otro):
${
  matchResult
    ? `Hay un proyecto parecido: "${matchResult.project.title}" — estado: ${
        matchResult.tier === 'laboratorio' ? 'en desarrollo (Laboratorio), NO entregado' : 'entregado'
      }. Pitch para usar (parafraseá, no cites literal): "${
        matchResult.project.jevyProfile?.pitchCorto || matchResult.project.description
      }". Path exacto a pegar entre corchetes después del nombre: [${detailPath(String(matchResult.project.category), String(matchResult.project._id))}]`
    : 'No hay ningún proyecto parecido por ahora — no menciones ninguno, seguí con las preguntas normales.'
}

${attachmentsContext ? `CONTENIDO EXTRAÍDO DE ARCHIVOS QUE EL LEAD ADJUNTÓ (contexto interno — usalo para entender mejor el proyecto y hacer preguntas más precisas, NUNCA se lo repitas al lead palabra por palabra ni le digas "según tu archivo dice..."):\n${attachmentsContext}` : ''}`;
}

export async function POST(request: Request) {
  try {
    const { messages, service, attachmentsContext, sessionId } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, message: 'messages es requerido' }, { status: 400 });
    }

    await dbConnect();
    const projects = await Project.find({}).select('title aiSummary description category image demo jevyProfile').limit(50);

    // Extracción por function calling — recién con algo de charla acumulada
    // (nunca en el primer mensaje). Si falla, Jevy sigue sin match, no rompe
    // la conversación. Ver planes/matching-catalogo-function-calling.
    const userMessageCount = (messages as DeepSeekMessage[]).filter((m) => m.role === 'user').length;
    let matchResult: MatchResult | null = null;

    if (userMessageCount >= 2) {
      try {
        const taxonomy = await getJevyTaxonomy();
        const tool = buildExtractionTool(taxonomy);
        const extractionMessages: DeepSeekMessage[] = [
          {
            role: 'system',
            content:
              'Clasificá lo que el lead ya contó en esta charla usando la función. No converses, no agregues nada — solo llamá la función con los valores que puedas inferir con confianza. Si un eje no tiene suficiente información todavía, usá "no_definido", nunca fuerces un valor.',
          },
          ...messages,
        ];
        const rawProfile = await askDeepSeekTool(extractionMessages, tool);
        const leadProfile = normalizeLeadProfile(rawProfile);
        matchResult = findBestMatch(leadProfile, projects);

        // Reintento único si no hubo match — ni temperature 0 garantiza
        // determinismo exacto en un modelo MoE como DeepSeek (probado: incluso
        // 1 solo eje mal clasificado alcanza para tirar el score debajo del
        // piso). Pero solo vale la pena si vino ALGO de señal (1-3 ejes
        // definidos) — con los 4 en no_definido (charla de reclutador, o
        // recién arrancando) no hay nada que reintentar recupere; probado:
        // 4/4 no_definido siempre, nunca 1-3 (eso es harina de otro costal).
        // Sin este chequeo, cada turno de una charla de reclutador pagaba
        // 2 llamadas a la API en vez de 1, siempre sin encontrar nada.
        const definedAxes = Object.values(leadProfile).filter((v) => v !== 'no_definido').length;
        if (!matchResult && definedAxes > 0) {
          const retryRaw = await askDeepSeekTool(extractionMessages, tool);
          const retryProfile = normalizeLeadProfile(retryRaw);
          matchResult = findBestMatch(retryProfile, projects);
        }
      } catch (error) {
        console.error('Error extrayendo perfil del lead para matching:', error);
      }
    }

    // Extracción de cierre — todos los campos del levantamiento, no solo los
    // de matching. Se intenta más tarde en la charla (contacto suele venir
    // al final) y solo actúa (guarda + notifica) si ya hay contacto completo.
    // Ver planes/levantamiento-informacion-jevy. Un solo cierre por charla:
    // una vez guardado, el frontend deja de mandar mensajes nuevos.
    let closed = false;
    let schedulingData: SchedulingData | null = null;
    if (userMessageCount >= 3 && typeof sessionId === 'string' && sessionId) {
      try {
        const closingTool = buildClosingTool();
        const closingMessages: DeepSeekMessage[] = [
          {
            role: 'system',
            content:
              'Extraé todo lo que el lead ya contó en esta charla usando la función. No converses, no agregues nada — solo llamá la función. Usá "no_definido" o string vacío para lo que todavía no se sabe, nunca inventes.',
          },
          ...messages,
        ];
        const rawClosing = await askDeepSeekTool(closingMessages, closingTool);
        let closing = normalizeClosing(rawClosing);

        // Mismo reintento que ya endurecimos en el matching — ni temperature 0
        // garantiza determinismo exacto en un modelo MoE. Acá pesa más: es la
        // extracción que decide si guardamos el contacto del lead. Reintenta
        // solo si hay señal parcial (algún campo capturado, no los 4/4 vacíos).
        if (!isReadyToClose(closing) && (closing.name || closing.email || closing.channelContact)) {
          const retryRaw = await askDeepSeekTool(closingMessages, closingTool);
          closing = normalizeClosing(retryRaw);
        }

        if (isReadyToClose(closing)) {
          const result = await closeConversation({
            extraction: closing,
            transcript: (messages as DeepSeekMessage[])
              .filter((m) => m.role !== 'system')
              .map((m) => ({ role: m.role === 'user' ? 'lead' : 'jevy', text: m.content })),
            sessionId,
            matchResult,
          });
          closed = true;
          schedulingData = result.schedulingData;
        }
      } catch (error) {
        console.error('Error en la extracción/guardado de cierre:', error);
      }
    }

    const systemPrompt = buildSystemPrompt(
      matchResult,
      typeof service === 'string' ? service : undefined,
      typeof attachmentsContext === 'string' ? attachmentsContext : undefined,
    );

    const deepSeekMessages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const rawReply = await askDeepSeek(deepSeekMessages);

    const matches = matchResult
      ? [
          {
            id: String(matchResult.project._id),
            title: matchResult.project.title,
            image: matchResult.project.image || null,
            path: detailPath(String(matchResult.project.category), String(matchResult.project._id)),
            demo: matchResult.project.demo || null,
            isPrototype: matchResult.tier === 'laboratorio',
          },
        ]
      : [];

    const reply = rawReply
      .replace(/\[(\/(?:projects|laboratory|automations|certificates)\/[a-zA-Z0-9]+)\]/g, '')
      .replace(/[ \t]+([.,:;!?])/g, '$1')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return NextResponse.json({ success: true, reply, matches, closed, schedulingData });
  } catch (error) {
    console.error('Error en chat de Jevy:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}
