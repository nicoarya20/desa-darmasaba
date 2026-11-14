// Mode suara widget publik (satu sesi per tab): persetujuan mikrofon, start dalam gesture, heartbeat ke server,
// hitung mundur lokal, mati saat hening / halaman ditinggal, tutup. Server tetap sumber kebenaran batas dan kuota.
import { VOICE_HEARTBEAT_INTERVAL_MS, type VoiceClientEndReason } from "@/lib/jenna/voice/voice-types";
import { proxy } from "valtio";
import { JennaChatError } from "./jenna.api";
import jennaState, { type JennaSendContext } from "./jenna.state";
import { closeVoiceSession, heartbeatVoiceSession, VoiceApiError } from "./voice/voice-api";
import { createVoiceController, type VoiceController, type VoiceControllerEvents } from "./voice/voice-controller";
import { VOICE_COPY } from "./voice/voice-copy";
import {
  isIdleTimeout,
  isLocallyExpired,
  projectBeat,
  type VoiceBeat,
  type VoiceStatus,
  voiceErrorMessage,
  voiceStopMessage,
} from "./voice/voice-logic";

export const VOICE_CONSENT_KEY = "jenna:voice-consent:v1";
const TICK_MS = 1000;
/** Halaman tersembunyi selama ini (pindah tab/aplikasi) → sesi ditutup. */
export const VOICE_HIDDEN_CLOSE_MS = 30_000;
/** Heartbeat gagal (jaringan / 5xx) berturut-turut sebanyak ini → sesi diakhiri. */
const MAX_BEAT_FAILURES = 3;

let getSendContext: (() => JennaSendContext) | null = null;
let controller: VoiceController | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let tickTimer: ReturnType<typeof setInterval> | null = null;
let hiddenTimer: ReturnType<typeof setTimeout> | null = null;
let hiddenAt: number | null = null;
let idleOffSeconds = 0;
let lastActivity = 0;
let beatInFlight = false;
let beatFailures = 0;
/** Naik tiap sesi berakhir: event dari sesi lama (mis. diakhiri saat menyambung) diabaikan. */
let generation = 0;

const initial = () => ({
  status: "off" as VoiceStatus,
  sessionId: null as string | null,
  /** Transkrip ucapan pengunjung yang sedang berjalan. */
  transcript: "",
  beat: null as VoiceBeat | null,
  /** Epoch ms heartbeat terakhir diterima, dasar hitung mundur lokal. */
  beatAt: 0,
  now: 0,
  micLevel: 0,
  /** Pesan satu kali (galat atau sesi berakhir). */
  notice: null as string | null,
  consentOpen: false,
});

function hasStoredConsent(): boolean {
  try {
    return localStorage.getItem(VOICE_CONSENT_KEY) === "1";
  } catch {
    return false; // localStorage diblokir: tanya lagi; server tetap butuh consent per sesi.
  }
}

function storeConsent() {
  try {
    localStorage.setItem(VOICE_CONSENT_KEY, "1");
  } catch {
    // Hanya kenyamanan agar tidak ditanya ulang; tanpa penyimpanan, persetujuan diminta tiap sesi.
  }
}

const touch = () => {
  lastActivity = Date.now();
};

function resetVoice(notice: string | null) {
  Object.assign(voiceState, initial(), { notice });
}

function teardown() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (tickTimer) clearInterval(tickTimer);
  if (hiddenTimer) clearTimeout(hiddenTimer);
  heartbeatTimer = null;
  tickTimer = null;
  hiddenTimer = null;
  hiddenAt = null;
  beatFailures = 0;
  window.removeEventListener("pagehide", onPageHide);
  document.removeEventListener("visibilitychange", onVisibilityChange);
}

function closeQuietly(id: string, reason: VoiceClientEndReason) {
  closeVoiceSession(id, reason).catch((err: unknown) => {
    // Tidak fatal: sweeper server menutup sesi setelah heartbeat basi.
    console.warn("[jenna-voice] gagal menutup sesi", (err as Error).message);
  });
}

/** Akhiri sesi; `reason` null berarti server sudah menutupnya (tidak perlu dikabari). */
export function endVoice(reason: VoiceClientEndReason | null, notice: string | null) {
  if (voiceState.status === "off") return;
  generation += 1;
  const id = voiceState.sessionId;
  controller?.stop();
  controller = null;
  teardown();
  resetVoice(notice);
  if (id && reason) closeQuietly(id, reason);
}

function onPageHide() {
  endVoice("pagehide", null);
}

function onVisibilityChange() {
  if (document.visibilityState === "hidden") {
    hiddenAt = Date.now();
    if (hiddenTimer) clearTimeout(hiddenTimer);
    hiddenTimer = setTimeout(() => endVoice("pagehide", VOICE_COPY.ended.hidden), VOICE_HIDDEN_CLOSE_MS);
    return;
  }
  // Timer bisa dibekukan browser HP di latar belakang: cek ulang lamanya saat kembali terlihat.
  const away = hiddenAt === null ? 0 : Date.now() - hiddenAt;
  if (hiddenTimer) clearTimeout(hiddenTimer);
  hiddenTimer = null;
  hiddenAt = null;
  if (away >= VOICE_HIDDEN_CLOSE_MS) endVoice("pagehide", VOICE_COPY.ended.hidden);
}

async function heartbeat() {
  const id = voiceState.sessionId;
  if (!id || beatInFlight) return;
  beatInFlight = true;
  try {
    const beat = await heartbeatVoiceSession(id);
    if (voiceState.sessionId !== id) return;
    beatFailures = 0;
    voiceState.beat = {
      elapsedSeconds: beat.elapsedSeconds,
      maxSeconds: beat.maxSeconds,
      remainingTodaySeconds: beat.remainingTodaySeconds,
    };
    voiceState.beatAt = Date.now();
    if (beat.stop) endVoice(null, voiceStopMessage(beat.stop));
  } catch (err) {
    if (voiceState.sessionId !== id) return;
    // Jaringan putus / galat server sesaat: coba lagi di detak berikutnya, menyerah setelah beberapa kali.
    const transient = err instanceof VoiceApiError && (err.status === null || err.status >= 500);
    if (transient && ++beatFailures < MAX_BEAT_FAILURES) return;
    if (transient) endVoice("error", VOICE_COPY.errors.connectionLost);
    else endVoice(null, voiceErrorMessage(err));
  } finally {
    beatInFlight = false;
  }
}

function tick() {
  const now = Date.now();
  voiceState.now = now;
  if (isIdleTimeout(voiceState.status, lastActivity, now, idleOffSeconds)) {
    endVoice("idle", voiceStopMessage("idle"));
    return;
  }
  const { beat, beatAt } = voiceState;
  // Waktu habis menurut hitungan lokal: minta keputusan server sekarang.
  if (beat && isLocallyExpired(projectBeat(beat, (now - beatAt) / 1000))) void heartbeat();
}

const ask: VoiceControllerEvents["ask"] = async (question, handlers, signal) => {
  const id = voiceState.sessionId;
  if (!id || !getSendContext) throw new DOMException("Sesi suara belum siap", "AbortError");
  try {
    return await jennaState.askVoice(question, getSendContext(), { voiceSessionId: id, signal, ...handlers });
  } catch (err) {
    // Server menolak karena sesi sudah mati: putus juga di sisi klien (pesan server sudah Indonesia).
    if (err instanceof JennaChatError && err.code === "voice_session_ended" && voiceState.sessionId === id) {
      endVoice(null, err.message);
    }
    throw err;
  }
};

/** Harus dipanggil sinkron dari handler klik (izin mikrofon & audio di HP terikat gesture). */
function startVoice() {
  if (voiceState.status !== "off" || !getSendContext) return;
  const gen = generation;
  const live = () => gen === generation;
  let serverSessionId: string | null = null;
  resetVoice(null);
  voiceState.status = "connecting";
  voiceState.now = Date.now();
  window.addEventListener("pagehide", onPageHide);
  document.addEventListener("visibilitychange", onVisibilityChange);

  createVoiceController({
    emptyCommentary: VOICE_COPY.commentary.empty,
    failureCommentary: VOICE_COPY.commentary.failed,
    events: {
      status(s) {
        if (!live()) return;
        voiceState.status = s;
        touch();
      },
      session(start) {
        serverSessionId = start.sessionId;
        if (!live()) return;
        voiceState.sessionId = start.sessionId;
        voiceState.beat = { elapsedSeconds: 0, maxSeconds: start.maxSeconds, remainingTodaySeconds: start.remainingTodaySeconds };
        voiceState.beatAt = Date.now();
        idleOffSeconds = start.idleOffSeconds;
      },
      transcript(text) {
        if (live()) voiceState.transcript = text;
      },
      activity: touch,
      micLevel(level) {
        if (live()) voiceState.micLevel = level;
      },
      lost() {
        if (live()) endVoice("error", VOICE_COPY.errors.connectionLost);
      },
      ask,
    },
  }).then(
    (created) => {
      if (!live()) {
        // Diakhiri pengunjung selagi menyambung.
        created.stop();
        if (serverSessionId) closeQuietly(serverSessionId, "user");
        return;
      }
      controller = created;
      touch();
      heartbeatTimer = setInterval(() => void heartbeat(), VOICE_HEARTBEAT_INTERVAL_MS);
      tickTimer = setInterval(tick, TICK_MS);
    },
    (err: unknown) => {
      // Sesi server sudah dibuat tetapi WebRTC gagal: tutup agar kunci sesi dan menit tidak tertahan.
      if (serverSessionId) closeQuietly(serverSessionId, "error");
      if (!live()) return;
      if (!(err instanceof VoiceApiError) && !(err instanceof DOMException)) console.error("[jenna-voice] gagal memulai", err);
      teardown();
      resetVoice(voiceErrorMessage(err));
    },
  );
}

/** Konteks kirim (halaman sekarang + honeypot) terbaru dari panel; rute bisa berubah selama sesi. */
export function bindVoiceContext(get: (() => JennaSendContext) | null) {
  getSendContext = get;
}

/** Tombol mikrofon: minta persetujuan dulu bila belum pernah disetujui di browser ini. */
function requestStart() {
  if (voiceState.status !== "off" || voiceState.consentOpen) return;
  if (hasStoredConsent()) startVoice();
  else voiceState.consentOpen = true;
}

function acceptConsent() {
  voiceState.consentOpen = false;
  storeConsent();
  startVoice();
}

function declineConsent() {
  voiceState.consentOpen = false;
}

function stop() {
  endVoice("user", null);
}

/** Panel ditutup: akhiri sesi dan buang dialog persetujuan. */
function shutdown() {
  endVoice("user", null);
  voiceState.consentOpen = false;
}

function dismissNotice() {
  voiceState.notice = null;
}

const voiceState = proxy({
  ...initial(),
  requestStart,
  acceptConsent,
  declineConsent,
  stop,
  shutdown,
  dismissNotice,
});

export default voiceState;
