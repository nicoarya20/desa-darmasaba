import type { Metadata } from 'next';
import { ProgramKemiskinanDetail } from '../_com/detail/ProgramKemiskinanDetail';

/**
 * Halaman ini memuat nama + alamat warga penerima bantuan. `noindex` supaya daftar itu tidak masuk hasil
 * mesin pencari (tetap bisa dibuka warga lewat menu); tautan tetap diikuti (`follow`).
 */
export const metadata: Metadata = {
  title: 'Penerima Program Pengentasan Kemiskinan',
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

/** `/ekonomi/program-kemiskinan/{slug}`: detail program + penerima per tahun (segmen = slug atau id). */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProgramKemiskinanDetail programKey={slug} />;
}
