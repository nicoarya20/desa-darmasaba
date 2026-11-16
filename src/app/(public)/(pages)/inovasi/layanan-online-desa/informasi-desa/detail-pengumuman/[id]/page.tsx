import { InformasiRedirect } from '../../../_com/informasi/InformasiRedirect';

/** Detail pengumuman lama Informasi Desa → URL detail kanonik `/pemerintahan/pengumuman/{kategori}/{id}`. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InformasiRedirect kind="pengumuman" id={id} />;
}
