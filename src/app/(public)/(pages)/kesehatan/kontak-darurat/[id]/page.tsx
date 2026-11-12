'use client';
import { useParams } from 'next/navigation';
import { KontakDaruratDetail } from '../_com/detail/KontakDaruratDetail';

/** Halaman detail satu kontak darurat kesehatan (`/kesehatan/kontak-darurat/{id}`). */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <KontakDaruratDetail id={params.id} />;
}
