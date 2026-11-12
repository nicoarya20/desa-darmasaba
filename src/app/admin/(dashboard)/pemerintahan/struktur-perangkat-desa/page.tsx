import { redirect } from 'next/navigation';
import { STRUKTUR_PERANGKAT_ROUTES } from './_com/struktur-perangkat.routes';

/** Akar modul → tab Pegawai (menu admin menunjuk langsung ke tab Pegawai). */
export default function Page() {
  redirect(STRUKTUR_PERANGKAT_ROUTES.pegawai);
}
