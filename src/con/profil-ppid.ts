/**
 * SEMENTARA disembunyikan atas permintaan pihak desa: profil perorangan pimpinan PPID, yang tumpang tindih dengan
 * "Profil Perbekel" di /pemerintahan/profil. Berlaku di halaman publik /ppid/profil-ppid (bagian bawah halaman) dan
 * admin /admin/ppid/profil-ppid (tab "Profil Perorangan"). Kode, state, API, dan data tidak dihapus; ubah ke true
 * bila bagian ini diperlukan lagi, lalu hapus konstanta ini. Saat false, halaman publik tidak memuat datanya.
 */
export const PROFIL_PERORANGAN_PPID_TAMPIL = false;
