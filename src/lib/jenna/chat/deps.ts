// Wiring produksi chat Jenna publik (server-only). Dipisah dari chat.service.ts agar service bisa dites tanpa DB.
import { getKnowledgeSnapshot } from "../knowledge/snapshot";
import { getVisiblePublicRoutes } from "../knowledge/sitemap";
import { jennaGlobalMinuteLimiter, jennaIpMinuteLimiter, jennaSessionMinuteLimiter } from "../limits";
import { resolveActiveProvider } from "../provider/active";
import { JENNA_TOOLS } from "../tools";
import { defaultVoiceDeps } from "../voice/voice.deps";
import { isVoiceSessionLive } from "../voice/voice.lifecycle";
import { createConcurrencyGate, type ChatDeps, type ConcurrencyGate } from "./chat.service";
import { prismaChatRepo } from "./conversation.repo";
import { executeWithTools } from "./executor-loop";

// globalThis: satu gerbang per proses, tidak ter-reset oleh HMR dev.
const globalGate = globalThis as typeof globalThis & { __jennaChatConcurrency?: ConcurrencyGate };
const concurrency = (globalGate.__jennaChatConcurrency ??= createConcurrencyGate());

export const defaultChatDeps = (): ChatDeps => ({
  resolveProvider: () => resolveActiveProvider(),
  repo: prismaChatRepo,
  limiters: { ip: jennaIpMinuteLimiter, session: jennaSessionMinuteLimiter, global: jennaGlobalMinuteLimiter },
  concurrency,
  getSnapshot: getKnowledgeSnapshot,
  getRoutes: getVisiblePublicRoutes,
  tools: JENNA_TOOLS,
  execute: executeWithTools,
  isVoiceSessionLive: (sessionHash, id) => isVoiceSessionLive(sessionHash, id, defaultVoiceDeps()),
  now: () => new Date(),
});
