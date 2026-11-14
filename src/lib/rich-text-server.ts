/**
 * Sanitasi teks kaya di server (saat simpan), pasangan `sanitizeRichText` (render, butuh DOM) di `rich-text.ts`.
 * Allowlist tag sama persis dengan tampilan, tanpa atribut — yang tersimpan = yang tampil.
 * Tag lain dibuang tapi teksnya dipertahankan; isi `<script>`/`<style>` dibuang seluruhnya.
 */
import sanitizeHtml from "sanitize-html";
import { RICH_TEXT_TAGS } from "./rich-text";

/** Bersihkan HTML kiriman (mis. form publik) sebelum disimpan ke database. */
export function sanitizeRichTextForStorage(html: string): string {
  return sanitizeHtml(html, { allowedTags: RICH_TEXT_TAGS, allowedAttributes: {} });
}
