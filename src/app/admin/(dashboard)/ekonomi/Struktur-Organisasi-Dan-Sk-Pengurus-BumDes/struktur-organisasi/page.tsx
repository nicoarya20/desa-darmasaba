import { redirect } from 'next/navigation';
import { STRUKTUR_BUMDES_ROUTES } from '../_com/struktur-bumdes.routes';

/** URL lama tab "Struktur Organisasi" → tab Bagan. */
export default function Page() {
  redirect(STRUKTUR_BUMDES_ROUTES.bagan);
}
