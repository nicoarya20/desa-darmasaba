import type { JumlahTahun, RekapAlamat } from '@/lib/program-kemiskinan/penerima-rekap';

/** Program Kemiskinan di halaman detail publik, dengan jumlah penerima per tahun (terbaru dulu). */
export type ProgramPublik = {
  id: string;
  slug: string | null;
  nama: string;
  deskripsi: string;
  icon: string;
  tahun: JumlahTahun[];
};

/** Penerima di halaman publik — hanya nama, alamat, dan tahun. */
export type PenerimaPublik = { nama: string; alamat: string; tahun: number };

/** Satu halaman daftar penerima publik. */
export type HalamanPenerima = { data: PenerimaPublik[]; page: number; totalPages: number; total: number };

/** Rekap penerima per alamat pada satu tahun. */
export type RekapPublik = RekapAlamat & { tahun: number };

/** Status muat data publik; `notFound` = program tidak ada / nonaktif. */
export type MuatState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'notFound' }
  | { status: 'error' };
