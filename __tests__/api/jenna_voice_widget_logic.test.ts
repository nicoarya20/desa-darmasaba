// @vitest-environment node
// Logika murni mode suara widget: deteksi dukungan browser, kalimat/angka lisan, pengirim jawaban,
// hitung mundur & idle, level mic, pemetaan galat API. Tanpa jaringan dan WebRTC.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VOICE_COPY } from '@/app/(public)/_com/jenna/voice/voice-copy';
import { COMMENTARY_MAX_CHARS, createAnswerSender } from '@/app/(public)/_com/jenna/voice/voice-answer-sender';
import {
  closeVoiceSession,
  heartbeatVoiceSession,
  parseHeartbeatResponse,
  parseStartResponse,
  startVoiceSession,
  toVoiceApiError,
  VOICE_GENERIC_MESSAGE,
  VOICE_OFFLINE_MESSAGE,
  VoiceApiError,
} from '@/app/(public)/_com/jenna/voice/voice-api';
import { isVoiceSupported } from '@/app/(public)/_com/jenna/voice/voice-devices';
import {
  formatClock,
  formatMinutesLeft,
  isIdleTimeout,
  isLocallyExpired,
  micLevelFromRms,
  projectBeat,
  sessionSecondsLeft,
  voiceErrorMessage,
  voiceStopMessage,
} from '@/app/(public)/_com/jenna/voice/voice-logic';
import { isSettled } from '@/app/(public)/_com/jenna/voice/voice-settle';
import { createSentenceStream, splitSentences } from '@/app/(public)/_com/jenna/voice/voice-sentences';
import { formatSpokenNumbers } from '@/app/(public)/_com/jenna/voice/voice-spoken-numbers';
import { chunkText, stripMarkdown } from '@/app/(public)/_com/jenna/voice/voice-text';
import { toSpokenPiece } from '@/app/(public)/_com/jenna/voice/voice-controller';

const SESSION_ID = 'abcdefghij0123456789ab';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('isVoiceSupported', () => {
  const full = () => ({
    isSecureContext: true,
    RTCPeerConnection: function RTCPeerConnection() {},
    navigator: { mediaDevices: { getUserMedia: () => Promise.resolve() } },
  });

  it('butuh secure context, RTCPeerConnection, dan getUserMedia sekaligus', () => {
    expect(isVoiceSupported(full() as never)).toBe(true);
    expect(isVoiceSupported({ ...full(), isSecureContext: false } as never)).toBe(false);
    expect(isVoiceSupported({ ...full(), RTCPeerConnection: undefined } as never)).toBe(false);
    expect(isVoiceSupported({ ...full(), navigator: {} } as never)).toBe(false);
    expect(isVoiceSupported({ ...full(), navigator: { mediaDevices: {} } } as never)).toBe(false);
  });

  it('tanpa window (SSR) → false', () => {
    expect(isVoiceSupported(undefined)).toBe(false);
  });
});

describe('teks lisan', () => {
  it('kalimat dipecah dari aliran delta dan sisa di-flush', () => {
    const s = createSentenceStream();
    expect(s.push('Kantor desa buka jam delapan pagi. Tut')).toEqual(['Kantor desa buka jam delapan pagi.']);
    expect(s.push('up jam tiga sore')).toEqual([]);
    expect(s.flush()).toEqual(['Tutup jam tiga sore']);
  });

  it('splitSentences memecah teks utuh', () => {
    expect(splitSentences('Syaratnya membawa KTP asli. Lalu isi formulir di loket.')).toEqual([
      'Syaratnya membawa KTP asli.',
      'Lalu isi formulir di loket.',
    ]);
  });

  it('angka rupiah besar diringkas, angka kecil/tahun tidak disentuh', () => {
    expect(formatSpokenNumbers('Dana desa Rp 940.248.688 tahun 2024.')).toBe('Dana desa sekitar 940,2 juta rupiah tahun 2024.');
    expect(formatSpokenNumbers('Biaya Rp 2.000.000 saja.')).toBe('Biaya 2 juta rupiah saja.');
    expect(formatSpokenNumbers('Ada 1.250 warga.')).toBe('Ada 1.250 warga.');
  });

  it('markdown dibuang sebelum dibacakan', () => {
    expect(toSpokenPiece('**Penting:** bawa [KTP](/syarat).')).toBe(stripMarkdown('**Penting:** bawa [KTP](/syarat).'));
    expect(toSpokenPiece('**Penting** sekali')).not.toContain('*');
  });

  it('chunkText tidak melewati batas', () => {
    const chunks = chunkText('kata '.repeat(800), COMMENTARY_MAX_CHARS);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(COMMENTARY_MAX_CHARS);
  });
});

describe('createAnswerSender', () => {
  it('kirim per kalimat selagi mengalir, sisanya saat finish', () => {
    const sent: string[] = [];
    const sender = createAnswerSender({ send: (c) => sent.push(c), isCancelled: () => false });
    sender.delta('Kantor desa buka jam delapan pagi. Tutup');
    expect(sent).toEqual(['Kantor desa buka jam delapan pagi.']);
    sender.delta(' jam tiga sore.');
    expect(sender.finish('Kantor desa buka jam delapan pagi. Tutup jam tiga sore.')).toBe(2);
    expect(sent).toEqual(['Kantor desa buka jam delapan pagi.', 'Tutup jam tiga sore.']);
  });

  it('tanpa delta: jawaban final dipecah; transform diterapkan', () => {
    const sent: string[] = [];
    const sender = createAnswerSender({ send: (c) => sent.push(c), isCancelled: () => false, transform: (p) => p.toUpperCase() });
    sender.finish('Syaratnya membawa KTP asli. Lalu isi formulir di loket.');
    expect(sent).toEqual(['SYARATNYA MEMBAWA KTP ASLI.', 'LALU ISI FORMULIR DI LOKET.']);
  });

  it('teks sebelum tool dibuang; batal = tidak ada kiriman lagi', () => {
    const sent: string[] = [];
    let cancelled = false;
    const sender = createAnswerSender({ send: (c) => sent.push(c), isCancelled: () => cancelled });
    sender.delta('Sebentar, saya cari');
    sender.toolStarted();
    sender.delta('Agenda bulan ini ada tiga kegiatan. ');
    expect(sent).toEqual(['Agenda bulan ini ada tiga kegiatan.']);
    cancelled = true;
    sender.delta('Pertama gotong royong di balai. ');
    sender.finish('x');
    expect(sent).toHaveLength(1);
  });
});

describe('waktu sesi', () => {
  const beat = { elapsedSeconds: 100, maxSeconds: 300, remainingTodaySeconds: 50 };

  it('hitung mundur lokal dari heartbeat terakhir', () => {
    expect(sessionSecondsLeft(beat)).toBe(200);
    expect(projectBeat(beat, 10.7)).toEqual({ elapsedSeconds: 110, maxSeconds: 300, remainingTodaySeconds: 40 });
    expect(projectBeat(beat, -5)).toEqual(beat);
    expect(isLocallyExpired(projectBeat(beat, 49))).toBe(false);
    expect(isLocallyExpired(projectBeat(beat, 50))).toBe(true);
    expect(isLocallyExpired({ elapsedSeconds: 300, maxSeconds: 300, remainingTodaySeconds: 999 })).toBe(true);
  });

  it('format jam & menit', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(125.9)).toBe('2:05');
    expect(formatClock(-3)).toBe('0:00');
    expect(formatMinutesLeft(59)).toBe('59 detik');
    expect(formatMinutesLeft(179)).toBe('2 menit');
  });

  it('idle hanya saat siap/mendengarkan', () => {
    expect(isIdleTimeout('ready', 0, 60_000, 60)).toBe(true);
    expect(isIdleTimeout('listening', 0, 59_999, 60)).toBe(false);
    expect(isIdleTimeout('answering', 0, 600_000, 60)).toBe(false);
    expect(isIdleTimeout('connecting', 0, 600_000, 60)).toBe(false);
    expect(isIdleTimeout('ready', 0, 600_000, 0)).toBe(false);
  });

  it('settle: minimal tunggu lalu hening, dengan batas keras', () => {
    const cfg = { minWaitMs: 1500, quietMs: 1200, maxWaitMs: 60_000, pollMs: 250 };
    expect(isSettled(0, Number.NEGATIVE_INFINITY, 1000, cfg)).toBe(false);
    expect(isSettled(0, Number.NEGATIVE_INFINITY, 1500, cfg)).toBe(true);
    expect(isSettled(0, 2000, 3000, cfg)).toBe(false);
    expect(isSettled(0, 59_999, 60_000, cfg)).toBe(true);
  });

  it('level mic bertingkat 0,1', () => {
    expect(micLevelFromRms(0)).toBe(0);
    expect(micLevelFromRms(Number.NaN)).toBe(0);
    expect(micLevelFromRms(0.01)).toBe(0.1);
    expect(micLevelFromRms(1)).toBe(1);
  });
});

describe('pesan galat', () => {
  it('galat mikrofon → kalimat ramah', () => {
    expect(voiceErrorMessage(new DOMException('x', 'NotAllowedError'))).toBe(VOICE_COPY.errors.micDenied);
    expect(voiceErrorMessage(new DOMException('x', 'NotFoundError'))).toBe(VOICE_COPY.errors.micMissing);
    expect(voiceErrorMessage(new DOMException('x', 'NotReadableError'))).toBe(VOICE_COPY.errors.micBusy);
    expect(voiceErrorMessage(new Error('boom'))).toBe(VOICE_COPY.errors.failed);
  });

  it('galat server ditampilkan apa adanya; jaringan putus → pesan koneksi', () => {
    expect(voiceErrorMessage(new VoiceApiError('Kuota habis.', 429, 'VOICE_QUOTA_EXHAUSTED'))).toBe('Kuota habis.');
    expect(voiceErrorMessage(new VoiceApiError(VOICE_OFFLINE_MESSAGE, null))).toBe(VOICE_COPY.errors.connectionLost);
  });

  it('alasan berhenti dari server', () => {
    expect(voiceStopMessage('quota')).toBe(VOICE_COPY.ended.quota);
    expect(voiceStopMessage('max_duration')).toBe(VOICE_COPY.ended.maxDuration);
    expect(voiceStopMessage('ended')).toBe(VOICE_COPY.ended.closed);
  });

  it('toVoiceApiError: kode dikenal, retryAfter dari body atau header', () => {
    const a = toVoiceApiError(429, { success: false, code: 'VOICE_RATE_LIMITED', message: 'Tunggu dulu.', retryAfterSec: 4.2 });
    expect([a.message, a.status, a.code, a.retryAfterSec]).toEqual(['Tunggu dulu.', 429, 'VOICE_RATE_LIMITED', 5]);
    const b = toVoiceApiError(503, { code: 'ANEH' }, '7');
    expect([b.message, b.code, b.retryAfterSec]).toEqual([VOICE_GENERIC_MESSAGE, null, 7]);
    expect(toVoiceApiError(500, 'bukan objek').message).toBe(VOICE_GENERIC_MESSAGE);
  });
});

describe('parse respons', () => {
  const start = { sessionId: SESSION_ID, sdp: 'v=0', maxSeconds: 300, idleOffSeconds: 60, remainingTodaySeconds: 900 };

  it('start valid diterima, bentuk asing ditolak', () => {
    expect(parseStartResponse(start)).toEqual(start);
    expect(() => parseStartResponse({ ...start, sessionId: 'BAD' })).toThrow(VoiceApiError);
    expect(() => parseStartResponse({ ...start, sdp: '' })).toThrow(VoiceApiError);
    expect(() => parseStartResponse({ ...start, maxSeconds: -1 })).toThrow(VoiceApiError);
  });

  it('heartbeat: stop harus salah satu nilai kontrak', () => {
    const beat = { elapsedSeconds: 1, maxSeconds: 300, remainingTodaySeconds: 899, stop: null };
    expect(parseHeartbeatResponse(beat)).toEqual(beat);
    expect(parseHeartbeatResponse({ ...beat, stop: 'quota' }).stop).toBe('quota');
    expect(() => parseHeartbeatResponse({ ...beat, stop: 'lain' })).toThrow(VoiceApiError);
  });
});

describe('klien REST suara (fetch tiruan)', () => {
  const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

  it('start mengirim consent:true; close memakai keepalive', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ sessionId: SESSION_ID, sdp: 'v=0', maxSeconds: 300, idleOffSeconds: 60, remainingTodaySeconds: 900 }))
      .mockResolvedValueOnce(json({ billedSeconds: 42 }));
    vi.stubGlobal('fetch', fetchMock);

    await startVoiceSession('offer-sdp');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/jenna/voice/session');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ sdp: 'offer-sdp', consent: true });

    await expect(closeVoiceSession(SESSION_ID, 'pagehide')).resolves.toEqual({ billedSeconds: 42 });
    expect(fetchMock.mock.calls[1][0]).toBe(`/api/jenna/voice/session/${SESSION_ID}/close`);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'POST', keepalive: true });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ reason: 'pagehide' });
  });

  it('respons gagal → VoiceApiError dengan pesan server; fetch putus → status null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(json({ success: false, code: 'VOICE_SESSION_ENDED', message: 'Sesi suara sudah berakhir.' }, 409))
        .mockRejectedValueOnce(new TypeError('Failed to fetch')),
    );
    await expect(heartbeatVoiceSession(SESSION_ID)).rejects.toMatchObject({
      status: 409,
      code: 'VOICE_SESSION_ENDED',
      message: 'Sesi suara sudah berakhir.',
    });
    await expect(heartbeatVoiceSession(SESSION_ID)).rejects.toMatchObject({ status: null, message: VOICE_OFFLINE_MESSAGE });
  });
});
