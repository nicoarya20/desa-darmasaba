'use client';
import { useProgramInfo } from '../../pendidikan/_com/program-info/use-program-info';
import { LingkunganProgramInfoPage } from '../_com/program-info/LingkunganProgramInfoPage';
import { EDUKASI_LINGKUNGAN_LOADERS } from './_com/edukasi-lingkungan.source';
import { EDUKASI_LINGKUNGAN_TEXT as T } from './_com/edukasi-lingkungan.text';

/** Edukasi Lingkungan: Tujuan, Materi, dan Contoh Kegiatan dari CMS, pola halaman program di kerangka Kabar. */
export default function Page() {
  const state = useProgramInfo(EDUKASI_LINGKUNGAN_LOADERS);
  return <LingkunganProgramInfoPage title={T.title} lead={T.lead} sections={state.status === 'ready' ? state.entries : null} />;
}
