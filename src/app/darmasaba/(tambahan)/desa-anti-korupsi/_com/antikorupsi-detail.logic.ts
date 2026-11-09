/** Helper murni halaman detail Desa Anti Korupsi: baris indikator + info dokumen (surat PDF) tiap indikator. */
import {
  splitIndicatorNumber,
  toSentenceCase,
} from '@/app/darmasaba/_com/main-page/desaantikorupsi/desaantikorupsi.logic';

/** Bentuk minimal `FileStorage` yang dibaca halaman ini (relasi opsional `DesaAntiKorupsi.file`). */
export type AntiKorupsiFile = {
  link?: string | null;
  mimeType?: string | null;
  realName?: string | null;
  name?: string | null;
};

/** Bentuk minimal item `desaAntikorupsi.findMany` yang dibaca halaman detail. */
export type AntiKorupsiDetailApiItem = {
  id: string;
  name: string;
  kategori?: { name?: string | null } | null;
  file?: AntiKorupsiFile | null;
};

export type AntiKorupsiDokumen = {
  href: string;
  /** Label jenis file untuk tombol, mis. "PDF", "DOCX", atau "dokumen" bila tak dikenali. */
  type: string;
};

export type AntiKorupsiDokumenRow = {
  id: string;
  number: string | null;
  text: string;
  /** null = surat belum diunggah admin; baris tampil sebagai tempat kosong "Dokumen belum tersedia". */
  dokumen: AntiKorupsiDokumen | null;
};

/** Tautan relatif satu-garis-miring (`/api/fileStorage/...`) atau http(s); selain itu (mis. `javascript:`) ditolak. */
const SAFE_HREF = /^(https?:\/\/|\/(?!\/))/i;
const FILE_EXTENSION = /\.([a-z0-9]{1,5})$/i;
const UNKNOWN_TYPE = 'dokumen';

/** Href aman untuk membuka file, atau null bila link kosong/tidak aman. */
export function documentHref(link: string | null | undefined): string | null {
  const href = link?.trim();
  return href && SAFE_HREF.test(href) ? href : null;
}

/** Jenis file untuk label tombol: PDF dari mimeType, selain itu ekstensi nama file (huruf kapital). */
export function documentType(file: AntiKorupsiFile): string {
  if (file.mimeType?.toLowerCase() === 'application/pdf') return 'PDF';
  const ext = FILE_EXTENSION.exec(file.realName ?? file.name ?? '');
  return ext ? ext[1].toUpperCase() : UNKNOWN_TYPE;
}

/** Info dokumen satu indikator, atau null bila belum ada file yang bisa dibuka. */
export function toDokumen(file: AntiKorupsiFile | null | undefined): AntiKorupsiDokumen | null {
  if (!file) return null;
  const href = documentHref(file.link);
  return href ? { href, type: documentType(file) } : null;
}

/** Ubah item API jadi baris tampilan: nomor dipisah, teks sentence case, info dokumen. */
export function toDokumenRows(items: readonly AntiKorupsiDetailApiItem[]): AntiKorupsiDokumenRow[] {
  return items.map((item) => {
    const { number, text } = splitIndicatorNumber(item.name);
    return { id: item.id, number, text: toSentenceCase(text), dokumen: toDokumen(item.file) };
  });
}

/** Daftar nama kategori (nama asli dari DB) sesuai urutan kemunculan pertama di data. */
export function kategoriNames(items: readonly AntiKorupsiDetailApiItem[]): string[] {
  const names = items.map((item) => item.kategori?.name).filter((name): name is string => Boolean(name));
  return [...new Set(names)];
}

/** Jumlah indikator per nama kategori (untuk angka di pil kategori). */
export function countByKategori(items: readonly AntiKorupsiDetailApiItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const name = item.kategori?.name;
    if (name) counts[name] = (counts[name] ?? 0) + 1;
  }
  return counts;
}

/** Jumlah baris yang dokumennya sudah tersedia. */
export function countDokumen(rows: readonly AntiKorupsiDokumenRow[]): number {
  return rows.filter((row) => row.dokumen !== null).length;
}
