const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function askDeepSeek(messages: DeepSeekMessage[]): Promise<string> {
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
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek respondió ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
