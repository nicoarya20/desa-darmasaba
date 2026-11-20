// Identitas pengelola website untuk footer publik. Kontak resmi kantor desa (nama, alamat, telepon, email, WhatsApp dan jam layanan
// opsional) bukan lagi konstanta: diedit admin di Profil Desa > Kontak Desa dan dibaca dari API (src/lib/kontak-desa.ts). Nomor SK dan
// anggota Tim Pengelola juga dari CMS (Profil Desa > Tim Redaksi, src/lib/tim-pengelola.ts), bukan dari berkas ini.

/**
 * Pengelola website (juknis Lomba Website Desa 2027, aspek 8.3: tim redaksi/pengelola + alamat kantor).
 * Hanya nama lembaga dan tautannya yang tetap di kode.
 */
export const PENGELOLA_WEBSITE: {
  lembaga: string;
  /** Awalan `lembaga` yang ditautkan ke situs tim pengelola (permintaan user, 2026-11-20). */
  tautan: { teks: string; href: string };
} = {
  lembaga: 'Tim Pengelola Website Pemerintah Desa Darmasaba',
  tautan: { teks: 'Tim Pengelola', href: 'https://cogniti.id/' },
};
