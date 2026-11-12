import { redirect } from 'next/navigation';
import { STRUKTUR_PPID_ROUTES } from '../_com/struktur-ppid.routes';

/** URL lama tab "Struktur Organisasi" → tab Bagan. */
export default function Page() {
  redirect(STRUKTUR_PPID_ROUTES.bagan);
}
