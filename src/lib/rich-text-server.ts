/**
 * Sanitasi teks kaya di server (saat simpan), pasangan `sanitizeRichText` (render, butuh DOM) di `rich-text.ts`.
 * Allowlist tag sama persis dengan tampilan, tanpa atribut — yang tersimpan = yang tampil.
 * Tag lain dibuang tapi teksnya dipertahankan; isi `<script>`/`<style>` dibuang seluruhnya.
 */
import sanitizeHtml from "sanitize-html";
import { isGambarSisipanSrc } from "./gambar-sisipan";
import { htmlToPlainText, RICH_TEXT_TAGS } from "./rich-text";

/** Bersihkan HTML kiriman (mis. form publik) sebelum disimpan ke database. */
export function sanitizeRichTextForStorage(html: string): string {
  return sanitizeHtml(html, { allowedTags: RICH_TEXT_TAGS, allowedAttributes: {} });
}

/**
 * Tag konten artikel dari editor admin (tiptap StarterKit + gambar sisipan): teks dasar + judul bagian, garis
 * pemisah, kutipan, coret, tautan, dan gambar dari penyimpanan sendiri. Dipakai halaman detail yang dirender di
 * server (DOMPurify `sanitizeRichText` butuh DOM).
 */
export const ARTICLE_TAGS = [...RICH_TEXT_TAGS, "h2", "h3", "h4", "hr", "blockquote", "s", "a", "img"];

/** Opsi render artikel; `imageAlt` = teks alt gambar sisipan yang alt-nya kosong (mis. nama program). */
export type ArticleHtmlOptions = { imageAlt?: string };

/** Bersihkan HTML editor admin untuk dirender di server; string kosong bila tak ada isi teks. */
export function sanitizeArticleHtml(html: string | null | undefined, options: ArticleHtmlOptions = {}): string {
  if (!html || htmlToPlainText(html) === "") return "";
  return sanitizeHtml(html, {
    allowedTags: ARTICLE_TAGS,
    // target/rel & loading/decoding diizinkan karena diisi transformTags di bawah (nilai admin ditimpa).
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "loading", "decoding"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      // Tautan keluar dari isi admin dibuka di tab baru tanpa akses ke window pembuka.
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          src: attribs.src ?? "",
          alt: attribs.alt?.trim() || options.imageAlt || "",
          loading: "lazy",
          decoding: "async",
        },
      }),
    },
    // Hanya gambar dari penyimpanan sendiri (`/api/img/<nama>`); src luar/data:/javascript: dibuang seluruhnya.
    exclusiveFilter: (frame) => frame.tag === "img" && !isGambarSisipanSrc(frame.attribs.src),
  });
}
