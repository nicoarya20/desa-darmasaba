/**
 * Tanggal terbit Pengumuman — re-export dari modul bersama `@/lib/tanggal-terbit` (dipakai juga oleh
 * Berita). Nama lama dipertahankan supaya pemanggil & test Pengumuman tidak berubah.
 */
export {
  formatTanggalTerbit,
  hariIniInput,
  parseTanggalTerbit,
  tanggalKeInput,
  tanggalTerbitAtauDibuat as tanggalPengumuman,
} from "./tanggal-terbit";
