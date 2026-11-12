import type { StrukturAdminConfig } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.config';
import stateStrukturPerangkat from '@/app/admin/(dashboard)/_state/desa/struktur-perangkat';
import { STRUKTUR_PERANGKAT_ROUTES } from './struktur-perangkat.routes';
import { STRUKTUR_PERANGKAT_ADMIN_TEXT } from './struktur-perangkat.text';

/** Konfigurasi halaman admin bersama untuk Struktur Perangkat Desa. */
export const STRUKTUR_PERANGKAT_ADMIN: StrukturAdminConfig = {
  state: stateStrukturPerangkat,
  routes: STRUKTUR_PERANGKAT_ROUTES,
  text: STRUKTUR_PERANGKAT_ADMIN_TEXT,
};
