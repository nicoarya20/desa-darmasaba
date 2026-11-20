// Kontak resmi kantor desa & identitas pengelola website: satu sumber untuk footer publik dan halaman PPID.
// Sumber data: kop "Struktur Organisasi PPID Desa Darmasaba" (Drive desa, MENU_PPID, 16 Nov 2026).
// Nomor WhatsApp layanan/PPID belum diberikan desa, jadi sengaja tidak dicantumkan (jangan isi nomor contoh).

/** Kontak resmi Kantor Perbekel Desa Darmasaba. */
export const KONTAK_DESA = {
  namaKantor: 'Kantor Perbekel Desa Darmasaba',
  alamat: 'Jl. Raya Darmasaba – Lukluk, Desa Darmasaba, Kec. Abiansemal, Kab. Badung, Bali 80352',
  telepon: '(0361) 8441518',
  email: 'ddarmasaba@gmail.com',
} as const;

/** Satu anggota tim redaksi website (nama & jabatan saja, tanpa kontak pribadi). */
export type AnggotaRedaksi = { nama: string; jabatan: string };

/**
 * Pengelola website (juknis Lomba Website Desa 2027, aspek 8.3: tim redaksi/pengelola + alamat kantor).
 * `timRedaksi` diisi sesuai SK Tim Pengelola Website setelah diterima dari desa; kosong = hanya nama lembaga.
 */
export const PENGELOLA_WEBSITE: {
  lembaga: string;
  /** Awalan `lembaga` yang ditautkan ke situs tim pengelola (permintaan user, 2026-11-20). */
  tautan: { teks: string; href: string };
  timRedaksi: readonly AnggotaRedaksi[];
} = {
  lembaga: 'Tim Pengelola Website Pemerintah Desa Darmasaba',
  tautan: { teks: 'Tim Pengelola', href: 'https://cogniti.id/' },
  timRedaksi: [],
};
