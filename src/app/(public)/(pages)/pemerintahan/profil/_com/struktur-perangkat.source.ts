import {
  loadPegawaiPpidDetail,
  strukturPpidSource,
} from '../../../ppid/struktur-ppid/_com/struktur-ppid.source';

/*
 * Sumber Struktur Perangkat Desa. Untuk sementara masih data PPID; ganti kedua baris di bawah dengan adapter
 * state Perangkat Desa (`/api/desa/strukturperangkat`) — section, halaman bagan, dan halaman profil ikut.
 */

/** Sumber bagan Struktur Perangkat Desa. */
export const strukturPerangkatSource = strukturPpidSource;

/** Pemuat profil pegawai untuk `/pemerintahan/profil/struktur-perangkat-desa/[id]`. */
export const loadPerangkatDetail = loadPegawaiPpidDetail;
