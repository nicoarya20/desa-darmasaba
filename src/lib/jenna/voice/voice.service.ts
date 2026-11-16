// Mulai sesi suara publik: gerbang (murah → mahal), kunci satu-sesi per sessionHash, kuota detik, lalu relay SDP.
// Start yang gagal tidak ditagih. Heartbeat/tutup ada di voice.lifecycle.ts.
import { secondsUntilJakartaMidnight } from "../limits";
import { VOICE_MESSAGES } from "./voice.constants";
import {
  closeAndHangup,
  fail,
  hangupGateway,
  remainingToday,
  voiceUnavailable,
  type VoiceDeps,
  type VoiceIdentity,
  type VoiceResult,
} from "./voice.context";
import { buildLiveInstructions } from "./voice.instructions";
import { isStaleSession, settleStaleSession } from "./voice.quota";
import { hashSafetyIdentifier, openLiveSession, parseOfferSdp } from "./voice.relay";
import type { VoiceSessionStartResponse } from "./voice-types";

const retrySec = (ms: number) => Math.max(1, Math.ceil(ms / 1000));

export async function startVoiceSession(
  who: VoiceIdentity,
  body: { sdp: string; consent: boolean },
  deps: VoiceDeps,
): Promise<VoiceResult<VoiceSessionStartResponse>> {
  // 1–2. Chat aktif & siap, suara aktif, kuota global > 0, provider suara siap.
  const rt = await deps.loadRuntime();
  const unavailable = voiceUnavailable(rt);
  if (unavailable) return unavailable;
  const { settings, provider } = rt;
  if (!provider) return fail(409, "VOICE_NOT_READY", VOICE_MESSAGES.notReady); // Sudah dijamin voiceUnavailable.

  // 3–4. Persetujuan mikrofon dan bentuk SDP.
  if (body.consent !== true) return fail(403, "VOICE_CONSENT_REQUIRED", VOICE_MESSAGES.consentRequired);
  const sdp = parseOfferSdp(body.sdp);
  if (!sdp.ok) return fail(422, "VOICE_INVALID_INPUT", sdp.error);

  // 5. Batas mulai per IP per menit (in-memory, 1 instance).
  const now = deps.now();
  const hit = deps.startLimiter.check(who.ipHash, undefined, now.getTime());
  if (!hit.allowed) return fail(429, "VOICE_RATE_LIMITED", VOICE_MESSAGES.rateLimited, retrySec(hit.retryAfterMs));

  // 6–7. Lepas sesi basi milik sesi ini (tab ditutup / jaringan putus); sisanya = sesi hidup di tab lain.
  let hasLive = false;
  for (const row of await deps.repo.findOpenSessions({ sessionHash: who.sessionHash })) {
    if (isStaleSession(row, now)) await closeAndHangup(deps, rt, row, settleStaleSession(row));
    else hasLive = true;
  }
  if (hasLive) return fail(409, "VOICE_SESSION_ACTIVE", VOICE_MESSAGES.sessionActive);

  // 8. Sisa detik hari ini (sesi, IP, global — termasuk sesi yang sedang berjalan).
  const remaining = await remainingToday(deps, settings, who, now);
  if (remaining <= 0) {
    return fail(429, "VOICE_QUOTA_EXHAUSTED", VOICE_MESSAGES.quotaExhausted, secondsUntilJakartaMidnight(now));
  }

  // 9–10. Dua tab menekan "mulai" bersamaan: keduanya lolos cek di atas; setelah insert yang tertua menang.
  const maxSeconds = settings.voiceSessionMaxMinutes * 60;
  const row = await deps.repo.createSession({ sessionHash: who.sessionHash, ipHash: who.ipHash, maxSeconds, now });
  const [winner] = await deps.repo.findOpenSessions({ sessionHash: who.sessionHash });
  if (winner && winner.id !== row.id) {
    await closeAndHangup(deps, rt, row, { endedAt: now, billedSeconds: 0, endReason: "duplicate" });
    return fail(409, "VOICE_SESSION_ACTIVE", VOICE_MESSAGES.sessionActive);
  }

  // 11. Relay SDP. Kredensial hanya dari slot suara; tidak pernah jatuh ke provider teks.
  const live = await openLiveSession({
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKey,
    safetyId: hashSafetyIdentifier(who.sessionHash),
    sdp: sdp.value,
    model: provider.model,
    instructions: buildLiveInstructions(settings.assistantName),
    voice: settings.voiceName || null,
    fetchImpl: deps.fetchImpl,
  });
  if (!live.ok) {
    console.warn("[jenna-voice] gateway gagal membuka sesi", { sessionId: row.id, upstreamStatus: live.upstreamStatus });
    await closeAndHangup(deps, rt, row, { endedAt: now, billedSeconds: 0, endReason: "start_failed" });
    return fail(live.status, live.invalid ? "VOICE_INVALID_INPUT" : "VOICE_UPSTREAM_FAILED", live.error);
  }

  // 12. Aktifkan. Bila baris sudah ditutup selama relay (sweeper/close), sesi gateway yang baru dibuka diputus.
  if (!(await deps.repo.activateSession(row.id, live.value.sessionId, deps.now()))) {
    await hangupGateway(deps, rt, row.id, live.value.sessionId);
    return fail(409, "VOICE_SESSION_ENDED", VOICE_MESSAGES.ended);
  }
  return {
    ok: true,
    value: {
      sessionId: row.id,
      sdp: live.value.sdp,
      maxSeconds,
      idleOffSeconds: settings.voiceIdleOffSeconds,
      remainingTodaySeconds: remaining,
    },
  };
}
