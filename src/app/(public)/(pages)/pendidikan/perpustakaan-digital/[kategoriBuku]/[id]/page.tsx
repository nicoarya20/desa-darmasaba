import { BukuDetail } from '../../_com/detail/BukuDetail';

/** `/pendidikan/perpustakaan-digital/{kategori}/{id}`: detail buku (segmen kategori hanya penanda, dibaca id). */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BukuDetail id={id} />;
}
