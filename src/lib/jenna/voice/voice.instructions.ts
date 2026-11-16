import { sanitizeInline } from "../prompt";
import { VOICE_INSTRUCTIONS_MAX } from "./voice.constants";

/**
 * Instruksi sesi GPT-Live. Model suara hanya mengucapkan; isi jawaban datang dari chat teks Jenna
 * (lewat delegasi klien), jadi instruksinya sempit dan tidak memuat pengetahuan desa.
 */
export function buildLiveInstructions(assistantName: string): string {
  const name = sanitizeInline(assistantName, 40) || "Jenna";
  const text =
    `Anda adalah ${name}, suara asisten Desa Darmasaba. Berbicaralah dalam bahasa Indonesia yang sopan, ramah, dan singkat. ` +
    "Delegasikan setiap pertanyaan, lalu ucapkan jawaban yang diterima apa adanya. " +
    "Jangan menambah, mengurangi, atau mengarang isi jawaban.";
  return text.slice(0, VOICE_INSTRUCTIONS_MAX);
}
