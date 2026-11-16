import { permanentRedirect } from 'next/navigation';
import { gotongRoyongDetailHref } from '../../_com/gotong-royong.meta';

/** URL lama detail (`/lingkungan/gotong-royong/{kategori}/{id}`) → detail Kegiatan Desa dengan id yang sama. */
export default async function Page({ params }: { params: Promise<{ kategori: string; id: string }> }) {
  const { id } = await params;
  permanentRedirect(gotongRoyongDetailHref(id));
}
