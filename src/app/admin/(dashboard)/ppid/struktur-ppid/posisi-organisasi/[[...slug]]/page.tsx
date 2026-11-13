import { redirect } from 'next/navigation';
import { legacyPosisiRedirect } from '../../_com/struktur-ppid.routes';

/** URL lama tab "Posisi Organisasi" (bookmark/riwayat) → tab Jabatan yang setara. */
export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  redirect(legacyPosisiRedirect(slug));
}
