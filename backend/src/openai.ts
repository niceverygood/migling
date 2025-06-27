import { OpenAI } from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is required but not set');
  process.exit(1);
}

export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
}); 