/**
 * Sanitasi teks kaya di server (saat simpan), pasangan `sanitizeRichText` (render, butuh DOM) di `rich-text.ts`.
 * Allowlist tag sama persis dengan tampilan, tanpa atribut — yang tersimpan = yang tampil.
 * Tag lain dibuang tapi teksnya dipertahankan; isi `<script>`/`<style>` dibuang seluruhnya.
 */
import sanitizeHtml from "sanitize-html";
import { htmlToPlainText, RICH_TEXT_TAGS } from "./rich-text";

/** Bersihkan HTML kiriman (mis. form publik) sebelum disimpan ke database. */
export function sanitizeRichTextForStorage(html: string): string {
  return sanitizeHtml(html, { allowedTags: RICH_TEXT_TAGS, allowedAttributes: {} });
}

/**
 * Tag konten artikel dari editor admin (tiptap StarterKit): teks dasar + judul bagian, garis pemisah, kutipan,
 * coret, dan tautan. Dipakai halaman detail yang dirender di server (DOMPurify `sanitizeRichText` butuh DOM).
 */
export const ARTICLE_TAGS = [...RICH_TEXT_TAGS, "h2", "h3", "h4", "hr", "blockquote", "s", "a"];

/** Bersihkan HTML editor admin untuk dirender di server; string kosong bila tak ada isi teks. */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html || htmlToPlainText(html) === "") return "";
  return sanitizeHtml(html, {
    allowedTags: ARTICLE_TAGS,
    // target/rel diizinkan karena diisi transformTags di bawah (nilai admin ditimpa).
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    // Tautan keluar dari isi admin dibuka di tab baru tanpa akses ke window pembuka.
    transformTags: { a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }) },
  });
}
