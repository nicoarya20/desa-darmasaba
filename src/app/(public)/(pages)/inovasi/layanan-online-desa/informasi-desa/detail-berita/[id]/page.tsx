import { InformasiRedirect } from '../../../_com/informasi/InformasiRedirect';

/** Detail berita lama Informasi Desa → URL detail kanonik `/pemerintahan/berita/{kategori}/{id}`. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InformasiRedirect kind="berita" id={id} />;
}
