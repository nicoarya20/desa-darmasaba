import { createSentenceStream, splitSentences } from "./voice-sentences";
import { chunkText } from "./voice-text";

// Pengirim jawaban Jenna ke GPT-Live untuk satu delegasi: tiap kalimat dikirim begitu lengkap selagi
// jawaban masih ditulis. Setelah `cancel()` atau `isCancelled()` bernilai true, sisa kalimat tidak dikirim.

/** Batas aman satu `commentary.append` dalam karakter. */
export const COMMENTARY_MAX_CHARS = 1400;

export interface AnswerSenderOptions {
  send(content: string): void;
  isCancelled(): boolean;
  /** Ubah tiap potongan sebelum dikirim (markdown dibuang, angka diringkas). */
  transform?(piece: string): string;
}

export interface AnswerSender {
  delta(text: string): void;
  /** Jenna memanggil tool: teks yang mengalir sebelumnya bukan jawaban final. */
  toolStarted(): void;
  /** Jawaban final; kirim sisanya. Mengembalikan jumlah potongan terkirim. */
  finish(finalText: string): number;
  cancel(): void;
  readonly sentCount: number;
}

export function createAnswerSender(opts: AnswerSenderOptions): AnswerSender {
  const stream = createSentenceStream();
  let cancelled = false;
  let sent = 0;

  const stopped = () => {
    if (cancelled || opts.isCancelled()) cancelled = true;
    return cancelled;
  };

  const dispatch = (pieces: string[]) => {
    for (const piece of pieces) {
      if (stopped()) return;
      const text = opts.transform ? opts.transform(piece) : piece;
      for (const content of chunkText(text, COMMENTARY_MAX_CHARS)) {
        if (stopped()) return;
        opts.send(content);
        sent++;
      }
    }
  };

  return {
    delta(text) {
      dispatch(stream.push(text));
    },
    toolStarted() {
      stream.reset();
    },
    finish(finalText) {
      if (sent === 0) {
        stream.reset();
        dispatch(splitSentences(finalText));
      } else {
        dispatch(stream.flush());
      }
      return sent;
    },
    cancel() {
      cancelled = true;
    },
    get sentCount() {
      return sent;
    },
  };
}
