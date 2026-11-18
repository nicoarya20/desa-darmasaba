import sanitizeHtml from "sanitize-html";
import { htmlToPlainText } from "./rich-text";

/**
 * Jadikan tanggapan admin teks polos sebelum disimpan: tag dibuang (isi `<script>`/`<style>` ikut hilang),
 * entitas didekode, spasi dirapikan, dan sisa `<`/`>` dihapus supaya tak ada sintaks HTML yang bisa tersimpan.
 * String kosong berarti tanggapan dihapus.
 */
export function sanitizeTanggapan(raw: string): string {
  const tanpaTag = sanitizeHtml(raw, { allowedTags: [], allowedAttributes: {} });
  return htmlToPlainText(tanpaTag).replace(/[<>]/g, "").trim();
}
