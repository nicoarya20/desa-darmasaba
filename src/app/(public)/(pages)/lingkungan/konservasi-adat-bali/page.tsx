'use client';
import { useProgramInfo } from '../../pendidikan/_com/program-info/use-program-info';
import { LingkunganProgramInfoPage } from '../_com/program-info/LingkunganProgramInfoPage';
import { KONSERVASI_ADAT_BALI_LOADERS } from './_com/konservasi-adat-bali.source';
import { KONSERVASI_ADAT_BALI_TEXT as T } from './_com/konservasi-adat-bali.text';

/** Konservasi Adat Bali: Filosofi Tri Hita Karana, Nilai, dan Bentuk Konservasi dari CMS, pola halaman program. */
export default function Page() {
  const state = useProgramInfo(KONSERVASI_ADAT_BALI_LOADERS);
  return <LingkunganProgramInfoPage title={T.title} lead={T.lead} sections={state.status === 'ready' ? state.entries : null} />;
}
