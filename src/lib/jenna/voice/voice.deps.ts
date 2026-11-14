// Wiring produksi runtime suara Jenna (server-only). Dipisah agar service/lifecycle bisa dites tanpa DB/jaringan.
import { createLimiter } from "@/lib/rate-limit";
import { chatAvailability, resolveActiveProvider, resolveVoiceProvider } from "../provider/active";
import { VOICE_STARTS_PER_IP_PER_MINUTE } from "./voice.constants";
import type { VoiceDeps, VoiceRuntime } from "./voice.context";
import { prismaVoiceRepo } from "./voice.repo";

// globalThis: satu limiter per proses, tidak ter-reset oleh HMR dev.
const globalLimiter = globalThis as typeof globalThis & { __jennaVoiceStartLimiter?: ReturnType<typeof createLimiter> };
const startLimiter = (globalLimiter.__jennaVoiceStartLimiter ??= createLimiter(VOICE_STARTS_PER_IP_PER_MINUTE, 60_000));

export async function loadVoiceRuntime(): Promise<VoiceRuntime> {
  const [active, voice] = await Promise.all([resolveActiveProvider(), resolveVoiceProvider()]);
  return { settings: active.settings, chat: chatAvailability(active), provider: "notReady" in voice ? null : voice };
}

export const defaultVoiceDeps = (): VoiceDeps => ({
  loadRuntime: loadVoiceRuntime,
  repo: prismaVoiceRepo,
  startLimiter,
  now: () => new Date(),
});
