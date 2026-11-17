import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProgramInovasiPublik } from '@/lib/program-inovasi.server';
import { sanitizeArticleHtml } from '@/lib/rich-text-server';
import { ProgramInovasiDetail } from '../_com/detail/ProgramInovasiDetail';
import { programInovasiMetadata, toProgramInovasiDetailView } from '../_com/detail/program-inovasi-detail.logic';
import { PROGRAM_INOVASI_DETAIL_TEXT } from '../_com/program-inovasi.text';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const program = await getProgramInovasiPublik(id);
  return program ? programInovasiMetadata(program) : { title: PROGRAM_INOVASI_DETAIL_TEXT.notFoundTitle };
}

/** Detail Program Inovasi dirender di server (SEO); tidak ada / nonaktif → 404. */
export default async function Page({ params }: Props) {
  const { id } = await params;
  const program = await getProgramInovasiPublik(id);
  if (!program) notFound();
  return <ProgramInovasiDetail data={toProgramInovasiDetailView(program, sanitizeArticleHtml(program.description))} />;
}
