import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GROQ_API_KEY: z.string().min(1),
  GROQ_MODEL: z.string().default('llama-3.1-8b-instant'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  MAX_INPUT_LENGTH: z.string().default('5000'),
  MAX_OUTPUT_TOKENS: z.string().default('8000'),
});

export const env = envSchema.parse(process.env);
