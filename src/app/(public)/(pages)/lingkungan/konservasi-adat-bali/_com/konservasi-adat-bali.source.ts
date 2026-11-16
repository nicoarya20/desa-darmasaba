import ApiFetch from '@/lib/api-fetch';
import { readProgramInfoRecord } from '../../../pendidikan/_com/program-info/program-info.logic';
import type { ProgramInfoLoader } from '../../../pendidikan/_com/program-info/use-program-info';
import { KONSERVASI_ADAT_BALI_TEXT as T } from './konservasi-adat-bali.text';

/** Id baris tunggal CMS (seed); handler find-by-id saat ini mengabaikannya dan mengambil baris pertama. */
const CMS_ID = 'edit';

const api = ApiFetch.api.lingkungan.konservasiadatbali;

/** Bagian halaman, urutan tampil: Filosofi Tri Hita Karana → Nilai Konservasi → Bentuk Konservasi. */
export const KONSERVASI_ADAT_BALI_LOADERS: readonly ProgramInfoLoader[] = [
  {
    key: 'filosofi',
    title: T.sections.filosofi,
    load: async () => {
      const res = await api.filosofitrihitakarana['find-by-id'].get({ query: { id: CMS_ID } });
      return readProgramInfoRecord('konservasi adat bali: filosofi tri hita karana', res.status, res.data);
    },
  },
  {
    key: 'nilai',
    title: T.sections.nilai,
    load: async () => {
      const res = await api.nilaikonservasiadatbali['find-by-id'].get({ query: { id: CMS_ID } });
      return readProgramInfoRecord('konservasi adat bali: nilai konservasi', res.status, res.data);
    },
  },
  {
    key: 'bentuk',
    title: T.sections.bentuk,
    load: async () => {
      const res = await api.bentukkonservasiberdasarkanadat['find-by-id'].get({ query: { id: CMS_ID } });
      return readProgramInfoRecord('konservasi adat bali: bentuk konservasi', res.status, res.data);
    },
  },
];
