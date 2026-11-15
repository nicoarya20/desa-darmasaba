import ApiFetch from '@/lib/api-fetch';
import { readProgramInfoRecord } from '../../_com/program-info/program-info.logic';
import type { ProgramInfoLoader } from '../../_com/program-info/use-program-info';
import { LOKASI_KEY } from './bimbingan.logic';
import { BIMBINGAN_TEXT } from './bimbingan.text';

/** Id baris tunggal tiap isian (seed + form admin memakai "edit"). */
const RECORD_ID = 'edit';
const api = ApiFetch.api.pendidikan.bimbinganbelajardesa;
const T = BIMBINGAN_TEXT.sections;

/** Tiga isian CMS Bimbingan Belajar, urut tampil (konstanta modul = referensi stabil untuk `useProgramInfo`). */
export const BIMBINGAN_LOADERS: readonly ProgramInfoLoader[] = [
  {
    key: 'tujuan',
    title: T.tujuan,
    load: async () => {
      const res = await api.tujuanprogram['find-by-id'].get({ query: { id: RECORD_ID } });
      return readProgramInfoRecord('bimbingan belajar: tujuan program', res.status, res.data);
    },
  },
  {
    key: LOKASI_KEY,
    title: T.lokasi,
    load: async () => {
      const res = await api.lokasidanjadwal['find-by-id'].get({ query: { id: RECORD_ID } });
      return readProgramInfoRecord('bimbingan belajar: lokasi dan jadwal', res.status, res.data);
    },
  },
  {
    key: 'fasilitas',
    title: T.fasilitas,
    load: async () => {
      const res = await api.fasilitasyangdisediakan['find-by-id'].get({ query: { id: RECORD_ID } });
      return readProgramInfoRecord('bimbingan belajar: fasilitas', res.status, res.data);
    },
  },
];
