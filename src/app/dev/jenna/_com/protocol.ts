import type { JennaChatProtocol } from '@/lib/jenna/types';

export const PROTOCOL_LABEL: Record<JennaChatProtocol, string> = {
  openai: 'OpenAI-compatible',
  anthropic: 'Anthropic',
};
