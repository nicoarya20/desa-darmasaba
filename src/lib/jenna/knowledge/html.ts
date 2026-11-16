import { htmlToPlainText } from "@/lib/rich-text";

export const CLIP_MARK = "…";

/** HTML konten admin → teks polos satu baris; isi `<script>`/`<style>` dan komentar ikut dibuang. */
export function htmlToKnowledgeText(html: string | null | undefined): string {
  if (!html) return "";
  return htmlToPlainText(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " "),
  );
}

/** Potong teks ke `max` karakter (penanda `…` termasuk dalam batas). */
export function clipText(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - CLIP_MARK.length)).trimEnd() + CLIP_MARK;
}
