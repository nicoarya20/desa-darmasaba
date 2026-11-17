import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import { STRUKTUR_VARS } from '@/app/(public)/_com/struktur-organisasi/struktur.meta';
import type { CSSProperties } from 'react';

/** Rute halaman BUMDes (path lama dipertahankan: navbar, cari global, admin). */
export const BUMDES_BASE_HREF = '/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes';

/** Jangkar bagian Struktur Pengurus (tautan balik dari profil pengurus). */
export const PENGURUS_ANCHOR = 'pengurus';

/** Batas muat unit usaha sekaligus (= MAX_PAGE_LIMIT API BUMDes); jumlah unit desa jauh di bawahnya. */
export const UNIT_USAHA_FETCH_LIMIT = 100;

/** Variabel CSS halaman: warna brand Kabar + gradasi kartu bagan struktur bersama. */
export const BUMDES_VARS = { ...KABAR_BRAND_VARS, ...STRUKTUR_VARS } as CSSProperties;
