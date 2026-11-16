import type { VoiceSessionStartResponse } from "@/lib/jenna/voice/voice-types";
import { createAnswerSender } from "./voice-answer-sender";
import { startVoiceSession } from "./voice-api";
import {
  createAnswerAudio,
  createAudioContext,
  createLevelMeter,
  type LevelMeter,
  openMic,
  releaseAnswerAudio,
  stopStream,
} from "./voice-devices";
import { micLevelFromRms, type VoiceStatus } from "./voice-logic";
import { openPeer, type Peer } from "./voice-peer";
import { createSettleWatcher } from "./voice-settle";
import { formatSpokenNumbers } from "./voice-spoken-numbers";
import { stripMarkdown } from "./voice-text";

// Satu sesi mode suara: mikrofon → gateway live (WebRTC, SDP lewat server). Model suara mendelegasikan tiap
// pertanyaan; klien menanyakannya ke Jenna lewat jalur chat teks lalu mengirim jawabannya per kalimat
// (`session.commentary.append`). Ucapan baru saat menjawab = barge-in: giliran chat dibatalkan.

export interface VoiceAskHandlers {
  onStatus?: () => void;
  onDelta?: (text: string) => void;
}

export interface VoiceControllerEvents {
  status(status: VoiceStatus): void;
  /** Sesi server dibuat (SDP answer diterima), sebelum data channel terbuka. */
  session(start: VoiceSessionStartResponse): void;
  /** Transkrip ucapan pengunjung yang sedang berjalan ("" = kosong lagi). */
  transcript(text: string): void;
  /** Ada percakapan (ucapan atau jawaban), untuk timer mati otomatis saat hening. */
  activity(): void;
  /** Level mikrofon 0..1, hanya saat tingkatnya berubah. */
  micLevel(level: number): void;
  /** Koneksi live putus di luar kendali pengunjung. */
  lost(): void;
  /** Tanyakan ke Jenna; mengembalikan teks jawaban final. Ditolak saat dibatalkan. */
  ask(question: string, handlers: VoiceAskHandlers, signal: AbortSignal): Promise<string>;
}

export interface VoiceControllerOptions {
  events: VoiceControllerEvents;
  /** Dikirim ke model suara bila Jenna gagal menjawab atau ucapan tak terbaca. */
  failureCommentary: string;
  emptyCommentary: string;
}

export interface VoiceController {
  stop(): void;
}

/** Tunggu transkrip setelah delegasi dibuat (event delegasi tidak memuat ucapan). */
const TRANSCRIPT_WAIT_MS = 2000;
const TRANSCRIPT_POLL_MS = 100;
/** Tunggu `session.started` setelah data channel terbuka sebelum dianggap siap. */
const STARTED_FALLBACK_MS = 3000;
/** RMS audio jawaban yang dianggap terdengar. */
const REMOTE_AUDIBLE_RMS = 0.01;
/** Suara yang dipotong baru dilepas setelah audio jawaban hening selama ini (antrean lamanya habis). */
const SILENCE_RELEASE_QUIET_MS = 900;
/** Ucapan pengunjung dianggap menyela bila audio jawaban terdengar dalam rentang ini. */
const RECENTLY_AUDIBLE_MS = 1500;
/** Kembali "Siap bicara" setelah jawaban terkirim dan audio jawaban hening. */
const PANEL_SETTLE = { minWaitMs: 1500, quietMs: 1200, maxWaitMs: 60_000, pollMs: 250 };

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const isAbort = (err: unknown) => err instanceof DOMException && err.name === "AbortError";

/** Bentuk teks yang dibacakan: tanpa markdown, angka besar diringkas. */
export const toSpokenPiece = (piece: string): string => formatSpokenNumbers(stripMarkdown(piece));

/**
 * Harus dipanggil sinkron dari handler klik: audio jawaban, AudioContext, dan getUserMedia dibuka sebelum
 * `await` pertama agar browser HP menghitungnya sebagai gesture.
 */
export async function createVoiceController(opts: VoiceControllerOptions): Promise<VoiceController> {
  const { events } = opts;
  const remote = createAnswerAudio();
  const audioCtx = createAudioContext();
  let mic: MediaStream;
  try {
    mic = await openMic();
  } catch (err) {
    releaseAnswerAudio(remote);
    void audioCtx?.close().catch(() => undefined);
    throw err;
  }

  const settle = createSettleWatcher(() => performance.now(), PANEL_SETTLE);
  const meters: LevelMeter[] = [];
  let peer: Peer | null = null;
  let closed = false;
  let started = false;
  let utterance = "";
  let answering: AbortController | null = null;
  let micLevel = 0;
  // Suara dibisukan lokal sejak disela; antrean audio di sisi gateway tidak bisa dibatalkan dari klien.
  let silenced = false;
  let silencedAt = 0;
  let lastHeardAt = Number.NEGATIVE_INFINITY;
  // Diisi setelah peer terbuka; `stop()` bisa terpanggil lebih dulu (gagal menyambung).
  let startedTimer: ReturnType<typeof setTimeout> | undefined = undefined;

  const setStatus = (s: VoiceStatus) => {
    if (!closed) events.status(s);
  };

  const commentary = (delegationId: string, content: string) =>
    peer?.send({
      type: "session.commentary.append",
      event_id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      delegation_id: delegationId,
      content,
    });

  const silence = () => {
    silenced = true;
    silencedAt = performance.now();
    remote.muted = true;
  };

  const bargeIn = () => {
    const wasAudible = performance.now() - lastHeardAt < RECENTLY_AUDIBLE_MS;
    if (answering || wasAudible) silence();
    if (!answering) return;
    answering.abort();
    answering = null;
    settle.stopAll();
  };

  const takeUtterance = async () => {
    const until = performance.now() + TRANSCRIPT_WAIT_MS;
    while (!utterance.trim() && performance.now() < until && !closed) {
      await sleep(TRANSCRIPT_POLL_MS);
    }
    const text = utterance.trim();
    utterance = "";
    events.transcript("");
    return text;
  };

  const delegate = async (delegationId: string) => {
    const question = await takeUtterance();
    if (closed) return;
    if (!question) {
      commentary(delegationId, opts.emptyCommentary);
      setStatus("ready");
      return;
    }
    bargeIn();
    const turn = new AbortController();
    answering = turn;
    setStatus("answering");
    const sender = createAnswerSender({
      send: (content) => commentary(delegationId, content),
      isCancelled: () => turn.signal.aborted || closed,
      transform: toSpokenPiece,
    });
    try {
      const answer = await events.ask(
        question,
        {
          onStatus: () => sender.toolStarted(),
          onDelta: (text) => {
            sender.delta(text);
            events.activity();
          },
        },
        turn.signal,
      );
      sender.finish(answer);
      settle.wait(performance.now(), () => {
        if (answering !== turn) return;
        answering = null;
        setStatus("ready");
      });
    } catch (err) {
      sender.cancel();
      // Barge-in sudah mengganti giliran (status "Mendengarkan"); selain itu kembali siap.
      if (answering !== turn || closed) return;
      answering = null;
      if (!isAbort(err)) commentary(delegationId, opts.failureCommentary);
      setStatus("ready");
    }
  };

  const onEvent = (event: Record<string, unknown>) => {
    const type = String(event.type ?? "");
    if (type === "session.started") {
      started = true;
      setStatus("ready");
    } else if (type === "session.input_transcript.delta") {
      bargeIn();
      utterance += String(event.delta ?? "");
      events.transcript(utterance);
      events.activity();
      setStatus("listening");
    } else if (type === "session.output_transcript.delta") {
      events.activity();
    } else if (type === "session.delegation.created") {
      const id = (event.delegation as { id?: unknown } | undefined)?.id;
      if (typeof id === "string") void delegate(id);
    } else if (type === "session.closed") {
      if (!closed) events.lost();
    }
  };

  const stop = () => {
    if (closed) return;
    closed = true;
    clearTimeout(startedTimer);
    answering?.abort();
    answering = null;
    settle.stopAll();
    for (const m of meters) m.stop();
    peer?.close();
    stopStream(mic);
    releaseAnswerAudio(remote);
    void audioCtx?.close().catch(() => undefined);
  };

  if (audioCtx) {
    meters.push(
      createLevelMeter(audioCtx, mic, (rms) => {
        const level = micLevelFromRms(rms);
        if (level === micLevel || closed) return;
        micLevel = level;
        events.micLevel(level);
      }),
    );
  }

  try {
    peer = await openPeer({
      mic,
      exchange: async (offer) => {
        const start = await startVoiceSession(offer);
        events.session(start);
        return start.sdp;
      },
      onEvent,
      onClose: () => {
        if (!closed) events.lost();
      },
      onRemoteStream: (stream) => {
        remote.srcObject = stream;
        // Pemutaran sudah dibuka dalam gesture; bila tetap diblokir, jawaban tetap tampil sebagai teks.
        remote.play().catch((err: unknown) => {
          console.warn("[jenna-voice] audio jawaban diblokir", (err as Error).name);
        });
        if (!audioCtx) return;
        meters.push(
          createLevelMeter(audioCtx, stream, (rms, now) => {
            if (rms > REMOTE_AUDIBLE_RMS) {
              lastHeardAt = now;
              settle.heard(now);
            } else if (
              silenced &&
              now - lastHeardAt >= SILENCE_RELEASE_QUIET_MS &&
              now - silencedAt >= SILENCE_RELEASE_QUIET_MS
            ) {
              silenced = false;
              remote.muted = false;
            }
          }),
        );
      },
    });
  } catch (err) {
    stop();
    throw err;
  }

  startedTimer = setTimeout(() => {
    if (!started) setStatus("ready");
  }, STARTED_FALLBACK_MS);

  return { stop };
}
