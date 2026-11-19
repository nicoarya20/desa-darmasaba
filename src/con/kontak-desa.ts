// Identitas pengelola website untuk footer publik. Kontak resmi kantor desa (nama, alamat, telepon, email) bukan lagi
// konstanta: diedit admin di Profil Desa > Kontak Desa dan dibaca dari API (src/lib/kontak-desa.ts).

/** Satu anggota tim redaksi website (nama & jabatan saja, tanpa kontak pribadi). */
export type AnggotaRedaksi = { nama: string; jabatan: string };

/**
 * Pengelola website (juknis Lomba Website Desa 2027, aspek 8.3: tim redaksi/pengelola + alamat kantor).
 * `timRedaksi` diisi sesuai SK Tim Pengelola Website setelah diterima dari desa; kosong = hanya nama lembaga.
 */
export const PENGELOLA_WEBSITE: { lembaga: string; timRedaksi: readonly AnggotaRedaksi[] } = {
  lembaga: 'Tim Pengelola Website Pemerintah Desa Darmasaba',
  timRedaksi: [],
};
