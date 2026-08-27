/**
 * Cliente HTTP de la API de DeepSeek (chat completions).
 * Recibe: `askDeepSeek(messages)` para charla libre; `askDeepSeekTool(messages, tool)` para function calling.
 * Produce: `{ content, usage }` (charla) o `{ result, usage }` (tool call, `result` parseado del JSON de argumentos).
 */
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

function readUsage(data: { usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }): DeepSeekUsage {
  return {
    promptTokens: data.usage?.prompt_tokens || 0,
    completionTokens: data.usage?.completion_tokens || 0,
    totalTokens: data.usage?.total_tokens || 0,
  };
}

export interface DeepSeekReply {
  content: string;
  usage: DeepSeekUsage;
}

export async function askDeepSeek(messages: DeepSeekMessage[], maxTokens = 400): Promise<DeepSeekReply> {
  const token = process.env.TOKEN_DEEPSEEK;
  if (!token) {
    throw new Error('TOKEN_DEEPSEEK no está configurado');
  }

  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.6,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek respondió ${response.status}: ${text}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content?.trim() || '',
    usage: readUsage(data),
  };
}

export interface DeepSeekToolFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/**
 * Function calling (formato compatible OpenAI, soportado nativo por DeepSeek
 * desde V3.2). `tool_choice` fuerza que SIEMPRE devuelva la función — esto es
 * extracción, no charla, no tiene sentido dejarle la opción de no llamarla.
 * `temperature` baja (no la 0.6 del chat narrativo): es clasificación, no
 * creatividad — menos variabilidad es mejor acá, no peor.
 *
 * Nota: DeepSeek documenta un modo `strict` (beta, endpoint aparte) que
 * garantiza cumplimiento exacto del schema. No se activa todavía — requiere
 * confirmar el endpoint beta exacto contra la doc antes de prender esto en
 * producción. Sin `strict`, function calling estándar ya es confiable.
 */
export interface DeepSeekToolReply {
  result: Record<string, unknown> | null;
  usage: DeepSeekUsage;
}

export async function askDeepSeekTool(
  messages: DeepSeekMessage[],
  tool: DeepSeekToolFunction,
): Promise<DeepSeekToolReply> {
  const token = process.env.TOKEN_DEEPSEEK;
  if (!token) {
    throw new Error('TOKEN_DEEPSEEK no está configurado');
  }

  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0,
      tools: [{ type: 'function', function: tool }],
      tool_choice: { type: 'function', function: { name: tool.name } },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek respondió ${response.status}: ${text}`);
  }

  const data = await response.json();
  const usage = readUsage(data);
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  const rawArgs = toolCall?.function?.arguments;
  if (!rawArgs) return { result: null, usage };

  try {
    return { result: JSON.parse(rawArgs), usage };
  } catch {
    return { result: null, usage };
  }
}
