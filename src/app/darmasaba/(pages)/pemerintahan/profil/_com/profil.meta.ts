import colors from '@/con/colors';
import type { CSSProperties } from 'react';
import { STRUKTUR_VARS } from '../../../ppid/struktur-ppid/_com/struktur.meta';

/** ID baris tunggal (singleton) section Profil Desa di CMS — sama dengan yang dipakai form admin. */
export const PROFIL_CMS_ID = 'edit';

/** Jumlah perbekel terdahulu yang dimuat sekaligus — default API 10 akan memotong perbekel ke-11 dst. */
export const RIWAYAT_PERBEKEL_LIMIT = 50;

export const LOGO_DESA_SRC = '/darmasaba-icon.png';
export const MASKOT_ICON_SRC = '/pudak-icon.png';
export const PERBEKEL_FALLBACK_SRC = '/perbekel.png';

/**
 * Nama & jabatan perbekel aktif. Model `ProfilPerbekel` belum punya kolom nama, jadi masih tertulis di kode.
 * TODO(profil-perbekel): ambil dari CMS setelah backend menambah kolom nama — perlu rekan backend.
 */
export const PERBEKEL_NAME = 'I.B. Surya Prabhawa Manuaba, S.H., M.H., NL.P.';
export const PERBEKEL_ROLE = 'Perbekel Desa Darmasaba';

/**
 * Peta Google Maps Kantor Perbekel — dipakai section Letak & Batas Wilayah bila admin belum mengisi peta wilayah.
 * Embed publik tempat (bukan kredensial); pindah ke CMS/env bila lokasi kantor berubah.
 */
export const KANTOR_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15780.3751228292!2d115.19559210934409!3d-8.586981700000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23eb932812c81%3A0x5b5ac2759cc5fe4b!2sKantor%20Perbekel%20Darmasaba!5e0!3m2!1sid!2sid!4v1741922475983!5m2!1sid!2sid';

/** Rute profil pegawai dari bagan Struktur Perangkat Desa. */
export const strukturPerangkatHref = (pegawaiId: string) =>
  `/darmasaba/pemerintahan/profil/struktur-perangkat-desa/${pegawaiId}`;

/** Variabel CSS halaman: latar kartu terang (dibaca kartu Profil & Visi Misi) + gradasi kartu bagan. */
export const PROFIL_VARS = { '--vm-card': colors['white-trans-1'], ...STRUKTUR_VARS } as CSSProperties;
