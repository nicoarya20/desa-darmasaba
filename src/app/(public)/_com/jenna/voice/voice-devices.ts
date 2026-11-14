// Akses mikrofon, audio jawaban, pengukur level, dan cek dukungan browser untuk mode suara.

const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

/** Bagian `window` yang menentukan dukungan (dipisah agar bisa diuji tanpa browser). */
export interface VoiceSupportEnv {
  isSecureContext?: boolean;
  RTCPeerConnection?: unknown;
  navigator?: { mediaDevices?: { getUserMedia?: unknown } };
}

/** Semua browser (termasuk HP) yang punya secure context, WebRTC, dan getUserMedia. */
export function isVoiceSupported(env: VoiceSupportEnv | undefined = typeof window === "undefined" ? undefined : window): boolean {
  if (!env) return false;
  return (
    env.isSecureContext === true &&
    typeof env.RTCPeerConnection === "function" &&
    typeof env.navigator?.mediaDevices?.getUserMedia === "function"
  );
}

/** Wajib dipanggil langsung dari handler klik (sebelum `await` apa pun) agar dihitung sebagai gesture. */
export function openMic(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return Promise.reject(new DOMException("Mikrofon tidak tersedia", "NotFoundError"));
  }
  return navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS });
}

export function stopStream(stream: MediaStream | null): void {
  for (const track of stream?.getTracks() ?? []) track.stop();
}

/**
 * `<audio autoplay playsinline>` untuk suara jawaban. `play()` dipanggil di sini, masih di dalam gesture,
 * agar iOS/Android mengizinkan pemutaran saat stream WebRTC tiba belakangan.
 */
export function createAnswerAudio(): HTMLAudioElement {
  const audio = document.createElement("audio");
  audio.autoplay = true;
  audio.setAttribute("playsinline", "");
  audio.hidden = true;
  document.body.appendChild(audio);
  audio.play().catch(() => {
    // Belum ada sumber: penolakan di sini wajar; tujuan panggilan hanya membuka izin putar dalam gesture.
  });
  return audio;
}

export function releaseAnswerAudio(audio: HTMLAudioElement): void {
  audio.pause();
  audio.srcObject = null;
  audio.remove();
}

/** AudioContext dibuat dan di-resume dalam gesture (iOS memulainya `suspended` bila di luar gesture). */
export function createAudioContext(): AudioContext | null {
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  void ctx.resume().catch(() => undefined);
  return ctx;
}

const LEVEL_SAMPLE_MS = 50;

export interface LevelMeter {
  stop(): void;
}

/** Ukur RMS stream tiap 50 ms. */
export function createLevelMeter(
  ctx: AudioContext,
  stream: MediaStream,
  onSample: (rms: number, nowMs: number) => void,
): LevelMeter {
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  const source = ctx.createMediaStreamSource(stream);
  source.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  const timer = setInterval(() => {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += v * v;
    onSample(Math.sqrt(sum / buf.length), performance.now());
  }, LEVEL_SAMPLE_MS);
  return {
    stop() {
      clearInterval(timer);
      source.disconnect();
    },
  };
}
