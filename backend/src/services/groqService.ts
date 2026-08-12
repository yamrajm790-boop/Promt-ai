import axios from 'axios';
import { env } from '../config/env';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callGroq(messages: GroqMessage[], maxTokens?: number): Promise<string> {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: env.GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens || parseInt(env.MAX_OUTPUT_TOKENS),
        response_format: { type: 'json_object' }, // if model supports
      },
      {
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('Groq API error:', error.response?.data || error.message);
    throw new Error('AI service temporarily unavailable');
  }
}
