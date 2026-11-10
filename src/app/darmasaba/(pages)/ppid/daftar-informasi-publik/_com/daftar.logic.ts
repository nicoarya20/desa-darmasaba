/** Bentuk minimal satu informasi publik dari `daftarInformasiPublik.findMany` / `findUnique`. */
export type InformasiItem = {
  id: string;
  jenisInformasi: string;
  deskripsi: string;
  tanggal?: string | Date | null;
};

/** Jumlah baris per halaman daftar (sama dengan `limit` yang dikirim ke API). */
export const DAFTAR_PAGE_SIZE = 5;

/** Jeda (ms) sebelum ketikan di kotak cari dikirim ke API. */
export const DAFTAR_SEARCH_DEBOUNCE = 1000;

export const DAFTAR_LIST_HREF = '/darmasaba/ppid/daftar-informasi-publik';

/** Rute halaman detail satu informasi publik. */
export const daftarDetailHref = (id: string) => `${DAFTAR_LIST_HREF}/${id}`;

/** Nomor urut baris lintas halaman (halaman 2 mulai dari 6 bila 5 baris per halaman). */
export function rowNumber(page: number, index: number, pageSize: number = DAFTAR_PAGE_SIZE): number {
  return (page - 1) * pageSize + index + 1;
}

/** Tanggal publikasi "21 Februari 2025"; kosong atau tidak valid → `fallback`. */
export function formatTanggal(value: string | Date | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}
