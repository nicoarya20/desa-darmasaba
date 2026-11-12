import type { StrukturAdminConfig } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.config';
import stateStrukturPpid from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid';
import { STRUKTUR_PPID_ROUTES } from './struktur-ppid.routes';
import { STRUKTUR_PPID_ADMIN_TEXT } from './struktur-ppid.text';

/** Konfigurasi halaman admin bersama untuk Struktur PPID. */
export const STRUKTUR_PPID_ADMIN: StrukturAdminConfig = {
  state: stateStrukturPpid,
  routes: STRUKTUR_PPID_ROUTES,
  text: STRUKTUR_PPID_ADMIN_TEXT,
};
