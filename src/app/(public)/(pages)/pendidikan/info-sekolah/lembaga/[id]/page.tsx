import { LembagaDetailPage } from '../../_com/lembaga-detail/LembagaDetailPage';

/** Detail satu sekolah: foto, profil, alamat/kontak/medsos, lokasi, struktur (opsional), foto kegiatan. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LembagaDetailPage id={id} />;
}
