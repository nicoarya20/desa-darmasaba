import { parsePlainListItems } from "../../../ppid/_com/cms-list.logic";
import { htmlToPlainText } from "@/lib/rich-text";

/** Satu jenis program: nama (tanpa nomor ketikan admin) + butir keterangan di bawahnya. */
export type JenisProgramItem = { nama: string; keterangan: string[] };
/** Isi bagian Jenis Program yang sudah diurai: paragraf pengantar lalu daftar program. */
export type JenisProgram = { pengantar: string[]; items: JenisProgramItem[] };

type Block = { kind: "p"; html: string } | { kind: "list"; html: string };

/** Blok tingkat atas: satu paragraf atau satu daftar utuh (backreference memastikan tag penutup sejenis). */
const BLOCK = /^\s*(?:<p\b[^>]*>([\s\S]*?)<\/p>|(<(ul|ol)\b[^>]*>[\s\S]*?<\/\3>))/i;
/** Isi paragraf yang tidak bisa diwakili teks polos: tautan, gambar, tabel, atau blok lain yang terselip. */
const RICH_CONTENT = /<(a|img|table|ul|ol|h\d|div)\b/i;
/** Nomor yang diketik admin di depan nama ("1) ", "2. ", "3 - "); urutan dibawa `<ol>`, bukan teks. */
const LEADING_NUMBER = /^\d+\s*[).:-]\s*/;

function splitBlocks(html: string): Block[] | null {
  const blocks: Block[] = [];
  let rest = html;
  while (rest.trim()) {
    const m = BLOCK.exec(rest);
    if (!m) return null;
    blocks.push(m[2] ? { kind: "list", html: m[2] } : { kind: "p", html: m[1] });
    rest = rest.slice(m[0].length);
  }
  return blocks;
}

/**
 * Mengurai HTML editor CMS "Jenis Program" berpola `<p>pengantar</p>` lalu berulang `<p>1) Nama</p><ul><li>keterangan</li></ul>`.
 * Paragraf yang langsung diikuti daftar = nama program; paragraf sebelum program pertama = pengantar; paragraf tanpa daftar
 * setelah program pertama = program tanpa keterangan. Mengembalikan `null` bila isinya tidak berpola ini (daftar tanpa
 * nama, tautan/gambar, tag lain) — pemanggil lalu merender HTML yang sudah dibersihkan apa adanya.
 */
export function parseJenisProgram(html: string | null | undefined): JenisProgram | null {
  if (!html) return null;
  const blocks = splitBlocks(html);
  if (!blocks) return null;

  const pengantar: string[] = [];
  const items: JenisProgramItem[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.kind === "list") return null; // daftar tanpa paragraf nama di atasnya
    if (RICH_CONTENT.test(block.html)) return null;
    const text = htmlToPlainText(block.html);
    if (!text) continue; // `<p></p>` kosong dari editor

    const next = blocks[i + 1];
    if (next?.kind === "list") {
      const keterangan = parsePlainListItems(next.html);
      if (!keterangan) return null;
      items.push({ nama: text.replace(LEADING_NUMBER, ""), keterangan });
      i++;
    } else if (items.length === 0) {
      pengantar.push(text);
    } else {
      items.push({ nama: text.replace(LEADING_NUMBER, ""), keterangan: [] });
    }
  }
  return items.length > 0 ? { pengantar, items } : null;
}
