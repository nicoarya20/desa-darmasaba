import ApiFetch from '@/lib/api-fetch';
import { readProgramInfoRecord } from '../../../pendidikan/_com/program-info/program-info.logic';
import type { ProgramInfoLoader } from '../../../pendidikan/_com/program-info/use-program-info';
import { EDUKASI_LINGKUNGAN_TEXT as T } from './edukasi-lingkungan.text';

/** Id baris tunggal CMS (seed); handler find-by-id saat ini mengabaikannya dan mengambil baris pertama. */
const CMS_ID = 'edit';

const api = ApiFetch.api.lingkungan.edukasilingkungan;

/** Bagian halaman, urutan tampil: Tujuan → Materi → Contoh Kegiatan. */
export const EDUKASI_LINGKUNGAN_LOADERS: readonly ProgramInfoLoader[] = [
  {
    key: 'tujuan',
    title: T.sections.tujuan,
    load: async () => {
      const res = await api.tujuanedukasilingkungan['find-by-id'].get({ query: { id: CMS_ID } });
      return readProgramInfoRecord('edukasi lingkungan: tujuan', res.status, res.data);
    },
  },
  {
    key: 'materi',
    title: T.sections.materi,
    load: async () => {
      const res = await api.materiedukasilingkungan['find-by-id'].get({ query: { id: CMS_ID } });
      return readProgramInfoRecord('edukasi lingkungan: materi', res.status, res.data);
    },
  },
  {
    key: 'contoh',
    title: T.sections.contoh,
    load: async () => {
      const res = await api.contohkegiatandesa['find-by-id'].get({ query: { id: CMS_ID } });
      return readProgramInfoRecord('edukasi lingkungan: contoh kegiatan', res.status, res.data);
    },
  },
];
