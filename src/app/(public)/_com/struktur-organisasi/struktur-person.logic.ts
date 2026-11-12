import { STRUKTUR_DETAIL_TEXT as T } from './struktur.text';

/** Profil satu pegawai sebagaimana dikirim sumber (`pegawai/:id`); field opsional boleh kosong. */
export type StrukturDetailData = {
  namaLengkap: string;
  gelarAkademik?: string | null;
  image?: { link?: string | null } | null;
  posisi?: { nama: string } | null;
  email?: string | null;
  telepon?: string | null;
  alamat?: string | null;
  tanggalMasuk?: string | Date | null;
  isActive: boolean;
};

/** Pemuat profil per id: `null` = tidak ditemukan; melempar = gagal dimuat. */
export type StrukturDetailLoader = (id: string) => Promise<StrukturDetailData | null>;

/** Inisial avatar: huruf pertama kata pertama + kata terakhir ("Ni Wayan Sari" → "NS"); nama kosong → "". */
export function initialsOf(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((word) => word.match(/\p{L}/u)?.[0])
    .filter((letter): letter is string => Boolean(letter));
  if (letters.length === 0) return '';
  const pick = letters.length === 1 ? letters : [letters[0], letters[letters.length - 1]];
  return pick.join('').toLocaleUpperCase('id');
}

/** Nama tampil: nama lengkap + gelar (bila ada). */
export function displayName(data: Pick<StrukturDetailData, 'namaLengkap' | 'gelarAkademik'>): string {
  const gelar = data.gelarAkademik?.trim();
  return gelar ? `${data.namaLengkap.trim()}, ${gelar}` : data.namaLengkap.trim();
}

/** Tanggal masuk dalam format Indonesia ("05 Januari 2024"); kosong/tidak valid → null. */
export function formatTanggalMasuk(value: StrukturDetailData['tanggalMasuk']): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Satu baris info profil. */
export type DetailRow = { key: string; label: string; value: string; multiline?: boolean };

/** Baris info yang berisi saja — email/telepon/alamat/tanggal masuk kosong tidak ditampilkan. */
export function detailRows(data: StrukturDetailData): DetailRow[] {
  const rows: (DetailRow | null)[] = [
    textRow('email', T.email, data.email),
    textRow('telepon', T.telepon, data.telepon),
    textRow('alamat', T.alamat, data.alamat, true),
    textRow('tanggalMasuk', T.tanggalMasuk, formatTanggalMasuk(data.tanggalMasuk)),
  ];
  return rows.filter((row): row is DetailRow => row !== null);
}

function textRow(key: string, label: string, value: string | null | undefined, multiline = false): DetailRow | null {
  const text = value?.trim();
  return text ? { key, label, value: text, multiline } : null;
}
