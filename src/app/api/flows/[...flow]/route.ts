import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { NextRequest } from 'next/server';
import { createNextApiHandler } from '@genkit-ai/next';

import '@/ai';

export const ai = genkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

const handler = createNextApiHandler({
  ai,
});

export async function POST(req: NextRequest) {
  return handler(req);
}
