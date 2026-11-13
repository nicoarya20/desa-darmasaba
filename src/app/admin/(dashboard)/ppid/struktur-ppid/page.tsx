import { redirect } from 'next/navigation';
import { STRUKTUR_PPID_ROUTES } from './_com/struktur-ppid.routes';

/** Akar modul → tab Pegawai (menu admin menunjuk langsung ke tab Pegawai). */
export default function Page() {
  redirect(STRUKTUR_PPID_ROUTES.pegawai);
}
