import type { StrukturAdminConfig } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.config';
import stateStrukturBumdes from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi';
import { STRUKTUR_BUMDES_ROUTES } from './struktur-bumdes.routes';
import { STRUKTUR_BUMDES_ADMIN_TEXT } from './struktur-bumdes.text';

/** Konfigurasi halaman admin bersama untuk Struktur BUMDes. */
export const STRUKTUR_BUMDES_ADMIN: StrukturAdminConfig = {
  state: stateStrukturBumdes,
  routes: STRUKTUR_BUMDES_ROUTES,
  text: STRUKTUR_BUMDES_ADMIN_TEXT,
};
