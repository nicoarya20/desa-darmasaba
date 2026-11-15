'use client';
import { ProgramInfoPage, type ProgramInfoSectionView } from '../../_com/program-info/ProgramInfoPage';
import type { ProgramInfoEntry } from '../../_com/program-info/program-info.logic';
import { useProgramInfo } from '../../_com/program-info/use-program-info';
import { JenisProgramList } from './JenisProgramList';
import { parseJenisProgram } from './jenis-program.logic';
import { JENIS_PROGRAM_KEY, PENDIDIKAN_NON_FORMAL_LOADERS } from './pendidikan-non-formal.source';
import { PENDIDIKAN_NON_FORMAL_TEXT } from './pendidikan-non-formal.text';

/**
 * Bagian Jenis Program diberi isi khusus (daftar bernomor) hanya bila HTML-nya berpola nama + keterangan;
 * selain itu, dan untuk bagian gagal/kosong, modul program-info yang merender (prosa bersih atau teks status).
 */
export function toSectionView(entry: ProgramInfoEntry): ProgramInfoSectionView {
  if (entry.key !== JENIS_PROGRAM_KEY || entry.failed) return entry;
  const data = parseJenisProgram(entry.html);
  return data ? { ...entry, content: <JenisProgramList data={data} /> } : entry;
}

/** Halaman Pendidikan Non Formal: kerangka bersama program-info dengan tiga bagian CMS. */
export function PendidikanNonFormalPage() {
  const state = useProgramInfo(PENDIDIKAN_NON_FORMAL_LOADERS);
  return (
    <ProgramInfoPage
      title={PENDIDIKAN_NON_FORMAL_TEXT.title}
      lead={PENDIDIKAN_NON_FORMAL_TEXT.lead}
      sections={state.status === 'ready' ? state.entries.map(toSectionView) : null}
    />
  );
}
