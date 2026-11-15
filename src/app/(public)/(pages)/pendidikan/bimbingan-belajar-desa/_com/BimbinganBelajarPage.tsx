'use client';
import type { ProgramInfoEntry } from '../../_com/program-info/program-info.logic';
import { ProgramInfoPage } from '../../_com/program-info/ProgramInfoPage';
import { useProgramInfo } from '../../_com/program-info/use-program-info';
import { splitInfoPraktis } from './bimbingan.logic';
import { BIMBINGAN_LOADERS } from './bimbingan.source';
import { BIMBINGAN_TEXT as T } from './bimbingan.text';
import { InfoPraktis } from './InfoPraktis';

/** Isi halaman dari entri CMS (`null` = memuat): panel info praktis di slot `before`, sisanya bagian berlabel. */
export function BimbinganBelajarContent({ entries }: { entries: readonly ProgramInfoEntry[] | null }) {
  const view = entries ? splitInfoPraktis(entries) : null;
  return (
    <ProgramInfoPage
      title={T.title}
      lead={T.lead}
      sections={view ? view.sections : null}
      before={view?.info ? <InfoPraktis data={view.info} /> : undefined}
    />
  );
}

/** Halaman Bimbingan Belajar Desa: muat tiga isian CMS lalu tampilkan. */
export function BimbinganBelajarPage() {
  const state = useProgramInfo(BIMBINGAN_LOADERS);
  return <BimbinganBelajarContent entries={state.status === 'ready' ? state.entries : null} />;
}
