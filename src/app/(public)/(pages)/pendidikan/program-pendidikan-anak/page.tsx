'use client';
import { ProgramInfoPage } from '../_com/program-info/ProgramInfoPage';
import { useProgramInfo } from '../_com/program-info/use-program-info';
import { PROGRAM_PENDIDIKAN_ANAK_LOADERS } from './_com/program-pendidikan-anak.source';
import { PROGRAM_PENDIDIKAN_ANAK_TEXT as T } from './_com/program-pendidikan-anak.text';

/** Program Pendidikan Anak: Tujuan Program dan Program Unggulan dari CMS, pola halaman program Pendidikan. */
export default function Page() {
  const state = useProgramInfo(PROGRAM_PENDIDIKAN_ANAK_LOADERS);
  return <ProgramInfoPage title={T.title} lead={T.lead} sections={state.status === 'ready' ? state.entries : null} />;
}
