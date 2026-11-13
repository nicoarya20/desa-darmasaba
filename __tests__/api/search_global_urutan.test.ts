// @vitest-environment node
// Mengunci kesejajaran blok GLOBAL SEARCH di `findMany.ts`: daftar destructuring `Promise.all` harus sejajar dengan
// urutan panggilan prisma. Tiap delegate (di-mock) mengembalikan satu baris ber-id `<model>-1`, lalu setiap hasil
// harus berlabel `type` milik modelnya — pergeseran satu nama saja membuat label (dan tautan pencarian) salah.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, delegates } = vi.hoisted(() => {
  const delegates: Record<string, { findMany: ReturnType<typeof vi.fn> }> = {};
  const barisPenanda = (model: string) =>
    model === 'pegawaiBumDes'
      ? { id: `${model}-1`, namaLengkap: 'Penanda', posisi: { nama: 'Jabatan' } }
      : { id: `${model}-1` };
  const prismaMock = new Proxy(delegates, {
    get(target, key: string) {
      target[key] ??= { findMany: vi.fn().mockResolvedValue([barisPenanda(key)]) };
      return target[key];
    },
  });
  return { prismaMock, delegates };
});
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import searchFindMany from '@/app/api/[[...slugs]]/_lib/search/findMany';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (query: Record<string, string>): any => ({ query, params: {}, set: { status: 200 } });

/** Model prisma yang label `type`-nya berbeda dari nama modelnya; model lain berlabel sama (abaikan huruf besar). */
const ALIAS_TYPE: Record<string, string> = {
  formulirPermohonanKeberatan: 'permohonaninformasikeberatanpublik',
  indeksKepuasanMasyarakat: 'ikm',
  perbekelDariMasaKeMasa: 'perbekeldarmasaba',
  potensiDesa: 'potensi',
  menuTipsKeamanan: 'tipsKeamanan',
  lowonganPekerjaan: 'lowonganKerjaLokal',
  pegawaiBumDes: 'strukturOrganisasi',
  grafikMenganggurBerdasarkanUsia: 'jumlahPendudukUsiaKerjaYangMenganggurUsia',
  grafikMenganggurBerdasarkanPendidikan: 'jumlahPendudukUsiaKerjaYangMenganggurPendidikan',
  grafikJumlahPendudukMiskin: 'jumlahPendudukMiskin',
  dataDemografiPekerjaan: 'demografiPekerjaan',
  kegiatanDesa: 'gotongRoyong',
};
const expectedType = (model: string) => (ALIAS_TYPE[model] ?? model).toLowerCase();

type Item = { id: string; type: string } & Record<string, unknown>;
const globalSearch = async () => ((await searchFindMany(ctx({ query: 'darmasaba' }))) as { data: Item[] }).data;
const modelOf = (item: Item) => item.id.replace(/-1$/, '');

beforeEach(() => {
  for (const key of Object.keys(delegates)) delete delegates[key];
});

describe('global search — label type sejajar dengan model sumber', () => {
  it('setiap hasil berlabel type milik modelnya sendiri', async () => {
    const data = await globalSearch();

    const salah = data
      .filter((item) => item.type.toLowerCase() !== expectedType(modelOf(item)))
      .map((item) => `${modelOf(item)} → ${item.type}`);
    expect(salah).toEqual([]);
  });

  it('memuat tepat satu hasil per modul (jumlah nama = jumlah panggilan)', async () => {
    const data = await globalSearch();
    const models = data.map(modelOf);

    expect(new Set(models).size).toBe(models.length);
    expect(models.sort()).toEqual(Object.keys(delegates).sort());
    expect(models.length).toBe(88);
  });

  it('dokter, tarif layanan, dan pegawai BUMDes berlabel type yang benar', async () => {
    const data = await globalSearch();
    const byId = (id: string) => data.find((item) => item.id === id);

    expect(byId('dokterdanTenagaMedis-1')?.type).toBe('dokterdanTenagaMedis');
    expect(byId('tarifDanLayanan-1')?.type).toBe('tarifDanLayanan');
    expect(byId('jadwalKegiatan-1')?.type).toBe('jadwalKegiatan');
    expect(byId('pegawaiBumDes-1')).toEqual({
      type: 'strukturOrganisasi',
      id: 'pegawaiBumDes-1',
      name: 'Penanda',
      jabatan: 'Jabatan',
    });
  });
});
