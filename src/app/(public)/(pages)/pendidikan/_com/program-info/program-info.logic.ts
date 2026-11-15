import { sanitizeRichText } from '@/lib/rich-text';
import { parsePlainListItems } from '../../../ppid/_com/cms-list.logic';

/** Satu entitas CMS halaman program (find-by-id): judul bagian + isi HTML editor admin. */
export type ProgramInfoRecord = { judul: string; deskripsi: string };

/** Hasil muat satu bagian; `html` null = CMS kosong, `failed` = permintaan gagal. */
export type ProgramInfoEntry = { key: string; title: string; html: string | null; failed: boolean };

/** Satu butir daftar; `term` = istilah sebelum titik dua ("Lokasi: Balai Desa" → "Lokasi"). */
export type ProgramInfoItem = { term: string | null; text: string };

export type ProgramInfoContent =
  | { kind: 'list'; items: ProgramInfoItem[] }
  | { kind: 'html'; html: string }
  | { kind: 'empty' };

/** Istilah terpanjang yang masih dianggap label (lebih panjang = kalimat biasa yang kebetulan bertitik dua). */
export const TERM_MAX_LENGTH = 40;

type FindByIdBody = { success?: boolean; message?: string; data?: unknown } | null | undefined;

/** Validasi respons find-by-id; gagal → Error berkonteks sumber + status, data kosong → `null`. */
export function readProgramInfoRecord(source: string, status: number, body: unknown): ProgramInfoRecord | null {
  const res = body as FindByIdBody;
  if (status !== 200 || !res?.success) {
    throw new Error(`find-by-id ${source} gagal (HTTP ${status}): ${res?.message ?? 'respons tidak valid'}`);
  }
  if (res.data == null) return null;
  const data = res.data as Partial<ProgramInfoRecord>;
  return { judul: typeof data.judul === 'string' ? data.judul : '', deskripsi: typeof data.deskripsi === 'string' ? data.deskripsi : '' };
}

/** Pisahkan "Istilah: keterangan" bila bagian depan pendek dan tanpa tanda baca kalimat; selain itu utuh. */
export function splitTerm(text: string): ProgramInfoItem {
  const at = text.indexOf(': ');
  if (at <= 0) return { term: null, text };
  const term = text.slice(0, at).trim();
  const rest = text.slice(at + 2).trim();
  if (!term || !rest || term.length > TERM_MAX_LENGTH || /[.,;!?]/.test(term)) return { term: null, text };
  return { term, text: rest };
}

/**
 * Isi bagian dari HTML CMS: satu daftar teks polos → butir (istilah dipisah); selain itu HTML yang sudah
 * disaring; kosong (`<p></p>`, null, atau tersaring habis) → `empty`. `sanitize` bisa diganti di test.
 */
export function toProgramInfoContent(
  html: string | null | undefined,
  sanitize: (html: string) => string = sanitizeRichText,
): ProgramInfoContent {
  if (!html?.trim()) return { kind: 'empty' };
  const items = parsePlainListItems(html);
  if (items) return { kind: 'list', items: items.map(splitTerm) };
  const clean = sanitize(html);
  return clean ? { kind: 'html', html: clean } : { kind: 'empty' };
}

/** Bagian tanpa isi yang bisa ditampilkan (bukan gagal, tanpa render kustom, CMS kosong). */
export function isEmptyEntry(entry: ProgramInfoEntry & { content?: unknown }, sanitize?: (html: string) => string): boolean {
  return !entry.failed && entry.content === undefined && toProgramInfoContent(entry.html, sanitize).kind === 'empty';
}

/** Keadaan halaman: semua bagian gagal / semua kosong → satu kalimat; selain itu tiap bagian tampil. */
export function programInfoOverall(
  sections: readonly (ProgramInfoEntry & { content?: unknown })[],
  sanitize?: (html: string) => string,
): 'error' | 'empty' | 'sections' {
  if (sections.length > 0 && sections.every((s) => s.failed)) return 'error';
  if (sections.every((s) => isEmptyEntry(s, sanitize))) return 'empty';
  return 'sections';
}
