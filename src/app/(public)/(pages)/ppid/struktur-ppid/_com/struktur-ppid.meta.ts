/** Halaman bagan Struktur Organisasi PPID (daftar asal profil pegawai). */
export const STRUKTUR_PPID_HREF = '/ppid/struktur-ppid';

/** Rute profil pegawai PPID dari bagan Struktur Organisasi PPID. */
export const strukturDetailHref = (pegawaiId: string) => `${STRUKTUR_PPID_HREF}/${pegawaiId}`;
