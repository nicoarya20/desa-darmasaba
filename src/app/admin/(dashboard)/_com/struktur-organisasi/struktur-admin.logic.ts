// Logika murni admin struktur organisasi (tanpa I/O): tampilan nilai kosong, validasi form pegawai,
// opsi pilihan jabatan/atasan, dan pohon bagan. Bentuk data mengikuti kontrak API struktur bersama.
import { validateParent } from '@/lib/struktur-organisasi/struktur-organisasi.hierarchy';
import { parseOptionalEmail } from '@/lib/struktur-organisasi/struktur-organisasi.normalize';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

/** Nilai form pegawai: hanya `namaLengkap` (sudah termasuk gelar) + `posisiId` wajib; foto/email/telepon opsional. */
export type PegawaiFormValues = {
  namaLengkap: string;
  imageId: string;
  email: string;
  telepon: string;
  posisiId: string;
  isActive: boolean;
};

/** Nilai form jabatan; `hierarki`/`urutan` null = belum diisi, `parentId` kosong = jabatan puncak. */
export type PosisiFormValues = {
  nama: string;
  deskripsi: string;
  hierarki: number | null;
  urutan: number | null;
  parentId: string;
  isActive: boolean;
};

/** Jabatan seperti dikirim API (field yang dipakai admin). */
export type PosisiRow = {
  id: string;
  nama: string;
  deskripsi?: string | null;
  hierarki: number;
  urutan: number | null;
  parentId: string | null;
  isActive: boolean;
  _count?: { pegawai: number };
};

/** Pegawai seperti dikirim API (field yang dipakai list/detail admin). */
export type PegawaiRow = {
  id: string;
  namaLengkap: string;
  email: string | null;
  telepon: string | null;
  isActive: boolean;
  image: { link: string } | null;
  posisi: { nama: string } | null;
};

/** Mutasi satu field form (ditulis ke proxy Valtio oleh halaman). */
export type SetField<F> = <K extends keyof F>(key: K, value: F[K]) => void;

export type SelectOption = { value: string; label: string };

/** Teks siap tampil; kosong/spasi/null → "—". */
export function tampil(value: string | null | undefined): string {
  return value && value.trim() ? value.trim() : T.empty;
}

export type PegawaiFormErrors = Partial<Record<'namaLengkap' | 'posisiId' | 'email', string>>;

/** Error per field form pegawai: nama + jabatan wajib; email hanya dicek bila diisi. */
export function pegawaiFormErrors(form: PegawaiFormValues): PegawaiFormErrors {
  const errors: PegawaiFormErrors = {};
  if (!form.namaLengkap.trim()) errors.namaLengkap = 'Nama lengkap wajib diisi';
  if (!form.posisiId.trim()) errors.posisiId = 'Jabatan wajib dipilih';
  const email = parseOptionalEmail(form.email);
  if (!email.ok) errors.email = email.message;
  return errors;
}

/** Form pegawai siap dikirim (tidak ada error). */
export function isPegawaiFormValid(form: PegawaiFormValues): boolean {
  return Object.keys(pegawaiFormErrors(form)).length === 0;
}

/** Form jabatan siap dikirim: nama terisi dan hierarki bilangan bulat ≥ 1. */
export function isPosisiFormValid(form: PosisiFormValues): boolean {
  return form.nama.trim() !== '' && form.hierarki !== null && Number.isInteger(form.hierarki) && form.hierarki >= 1;
}

/** Opsi Select jabatan untuk form pegawai (urutan mengikuti API: hierarki → urutan → nama). */
export function posisiOptions(list: readonly PosisiRow[]): SelectOption[] {
  return list.map((pos) => ({ value: pos.id, label: pos.nama }));
}

/**
 * Opsi atasan untuk jabatan `selfId` (undefined saat tambah): tanpa jabatan itu sendiri dan tanpa bawahannya
 * (memilih bawahan sebagai atasan membentuk siklus — API juga menolaknya dengan 400).
 */
export function parentOptions(list: readonly PosisiRow[], selfId?: string): SelectOption[] {
  const nodes = list.map((pos) => ({ id: pos.id, parentId: pos.parentId }));
  return list
    .filter((pos) => validateParent({ id: selfId, parentId: pos.id, nodes }).ok)
    .map((pos) => ({ value: pos.id, label: pos.nama }));
}

/** Nama atasan jabatan, "Puncak" bila tanpa atasan, "—" bila atasan tidak ada di daftar. */
export function atasanNama(pos: PosisiRow, list: readonly PosisiRow[]): string {
  if (!pos.parentId) return T.posisi.puncak;
  return list.find((item) => item.id === pos.parentId)?.nama ?? T.empty;
}

/** Alasan hapus jabatan pasti ditolak API (409): masih punya pegawai/bawahan; null bila boleh dihapus. */
export function alasanTolakHapus(pos: PosisiRow, list: readonly PosisiRow[]): string | null {
  const pegawai = pos._count?.pegawai ?? 0;
  const bawahan = list.filter((item) => item.parentId === pos.id).length;
  const alasan = [
    pegawai > 0 ? T.posisi.pegawaiCount(pegawai) : null,
    bawahan > 0 ? T.posisi.bawahanCount(bawahan) : null,
  ].filter(Boolean);
  return alasan.length > 0 ? alasan.join(' dan ') : null;
}

export type StatusFilter = 'semua' | 'aktif' | 'nonaktif';

/** Nilai filter status → parameter `isActive` API (undefined = tanpa filter). */
export function isActiveDari(filter: StatusFilter): boolean | undefined {
  return filter === 'semua' ? undefined : filter === 'aktif';
}
