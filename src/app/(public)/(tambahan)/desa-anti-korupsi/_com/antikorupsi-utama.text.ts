import type { AntiKorupsiUtamaRingkasan } from '../_lib/antikorupsi-utama.logic';

/** Label khusus halaman utama Desa Anti Korupsi (judul, lead, kosong, memuat diambil dari teks beranda). */
export const AK_UTAMA_TEXT = {
  ringkasan: ({ kategori, indikator, dokumen }: AntiKorupsiUtamaRingkasan) =>
    `${kategori} kategori · ${indikator} indikator · ${dokumen} dokumen`,
} as const;
