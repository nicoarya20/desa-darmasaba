// Aturan unduh ZIP dokumen Desa Anti Korupsi — fungsi murni (nama entri, sanitasi, dedupe, batas
// ukuran). I/O (Prisma, MinIO, AdmZip) ada di handler API `/:id/zip`.
import { fileExtension } from "./desa-anti-korupsi-dokumen";
import { formatUkuran } from "./desa-anti-korupsi-sort";

/** Batas default total ukuran isi ZIP (100 MB); override lewat env `DAK_ZIP_MAX_BYTES`. */
export const DAK_ZIP_DEFAULT_MAX_BYTES = 100 * 1024 * 1024;
const ENTRY_NAME_MAX_LENGTH = 150;
const FALLBACK_NAME = "dokumen";

/** Batas ukuran ZIP efektif: `DAK_ZIP_MAX_BYTES` (bilangan bulat positif) atau default 100 MB. */
export function dakZipMaxBytes(raw: string | undefined = process.env.DAK_ZIP_MAX_BYTES): number {
  const n = Number(raw);
  return raw && Number.isSafeInteger(n) && n > 0 ? n : DAK_ZIP_DEFAULT_MAX_BYTES;
}

/** Slug ASCII huruf kecil untuk nama berkas ZIP ("Program Ā 2025" → "program-a-2025"). */
export function slugify(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  return slug || FALLBACK_NAME;
}

/**
 * Nama entri/folder aman di dalam ZIP: tanpa pemisah path (cegah traversal `../`), tanpa karakter
 * kontrol / terlarang Windows (diganti `_`), tanpa titik/spasi di tepi, panjang dibatasi (ekstensi
 * dipertahankan). Kosong → "dokumen".
 */
export function sanitizeEntryName(name: string): string {
  let clean = name
    .replace(/\s+/g, " ") // tab/baris baru → spasi dulu, sisa karakter kontrol dibuang
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/^[\s.]+|[\s.]+$/g, "");
  if (clean.length > ENTRY_NAME_MAX_LENGTH) {
    const dot = clean.lastIndexOf(".");
    const ext = dot > 0 && clean.length - dot <= 10 ? clean.slice(dot) : "";
    clean = clean.slice(0, ENTRY_NAME_MAX_LENGTH - ext.length).trimEnd() + ext;
  }
  return clean || FALLBACK_NAME;
}

/** Beri akhiran " (2)", " (3)", … sebelum ekstensi bila nama sudah dipakai (tanpa beda kapital); catat ke `used`. */
export function dedupeName(name: string, used: Set<string>): string {
  const dot = name.lastIndexOf(".");
  const [base, ext] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ""];
  let candidate = name;
  for (let n = 2; used.has(candidate.toLowerCase()); n += 1) candidate = `${base} (${n})${ext}`;
  used.add(candidate.toLowerCase());
  return candidate;
}

/** Nama berkas dalam ZIP: judul dokumen + ekstensi berkas asli (judul kosong → nama berkas asli). */
export function entryFileName(judul: string, realName: string): string {
  const title = judul.trim();
  if (!title) return sanitizeEntryName(realName);
  const ext = fileExtension(realName, null);
  const suffix = ext !== "-" && !title.toLowerCase().endsWith(`.${ext.toLowerCase()}`) ? `.${ext.toLowerCase()}` : "";
  return sanitizeEntryName(`${title}${suffix}`);
}

/** Dokumen yang akan masuk ZIP; `folderNama` null = langsung di akar arsip. */
export type ZipDokumen<F> = { judul: string; folderNama: string | null; file: F & { realName: string } };
export type ZipEntry<F> = { path: string; file: F & { realName: string } };

/** Path entri unik per folder (`<Folder>/<nama>`); nama folder ikut disanitasi & di-dedupe. */
export function planZipEntries<F>(dokumen: readonly ZipDokumen<F>[]): ZipEntry<F>[] {
  const folderDirs = new Map<string, string>();
  const usedDirs = new Set<string>();
  const usedNames = new Map<string, Set<string>>();

  return dokumen.map((d) => {
    let dir = "";
    if (d.folderNama !== null) {
      dir = folderDirs.get(d.folderNama) ?? dedupeName(sanitizeEntryName(d.folderNama), usedDirs);
      folderDirs.set(d.folderNama, dir);
    }
    const used = usedNames.get(dir) ?? new Set<string>();
    usedNames.set(dir, used);
    const name = dedupeName(entryFileName(d.judul, d.file.realName), used);
    return { path: dir ? `${dir}/${name}` : name, file: d.file };
  });
}

/** Pesan 413 bila total ukuran melebihi batas; null = masih dalam batas. */
export function zipLimitError(totalBytes: number, maxBytes: number): string | null {
  if (totalBytes <= maxBytes) return null;
  return `Ukuran total dokumen (${formatUkuran(totalBytes)}) melebihi batas unduhan ZIP (${formatUkuran(maxBytes)}). Silakan unduh per dokumen.`;
}

/** Nama berkas ZIP: slug program, ditambah "-<slug folder>" bila hanya satu folder. */
export function zipFileName(programName: string, folderNama?: string | null): string {
  return `${slugify(programName)}${folderNama ? `-${slugify(folderNama)}` : ""}.zip`;
}

/** Header Content-Disposition attachment dengan nama ter-encode RFC 5987 (+ fallback ASCII). */
export function attachmentDisposition(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(fileName).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
