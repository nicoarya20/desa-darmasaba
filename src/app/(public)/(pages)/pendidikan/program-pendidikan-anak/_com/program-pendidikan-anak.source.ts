import ApiFetch from '@/lib/api-fetch';
import { readProgramInfoRecord } from '../../_com/program-info/program-info.logic';
import type { ProgramInfoLoader } from '../../_com/program-info/use-program-info';
import { PROGRAM_PENDIDIKAN_ANAK_TEXT as T } from './program-pendidikan-anak.text';

/** Id baris tunggal CMS (seed); handler find-by-id saat ini mengabaikannya dan mengambil baris pertama. */
const CMS_ID = 'edit';

const api = ApiFetch.api.pendidikan.programpendidikananak;

/** Bagian halaman, urutan tampil: Tujuan Program → Program Unggulan. */
export const PROGRAM_PENDIDIKAN_ANAK_LOADERS: readonly ProgramInfoLoader[] = [
  {
    key: 'tujuan',
    title: T.sections.tujuan,
    load: async () => {
      const res = await api.tujuanprogram['find-by-id'].get({ query: { id: CMS_ID } });
      return readProgramInfoRecord('program pendidikan anak: tujuan program', res.status, res.data);
    },
  },
  {
    key: 'unggulan',
    title: T.sections.unggulan,
    load: async () => {
      const res = await api.programunggulan['find-by-id'].get({ query: { id: CMS_ID } });
      return readProgramInfoRecord('program pendidikan anak: program unggulan', res.status, res.data);
    },
  },
];
