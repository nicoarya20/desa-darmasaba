// @vitest-environment node
// Source halaman program CMS menu Lingkungan (Edukasi Lingkungan, Konservasi Adat Bali): 3 loader per halaman memanggil
// find-by-id endpoint lingkungan masing-masing (id "edit"), urutan tampil tetap, galat dilempar berkonteks.
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Res = { status: number; data: unknown };

const h = vi.hoisted(() => {
  const calls: string[] = [];
  const responses = new Map<string, { status: number; data: unknown }>();
  const ep = (name: string) => ({
    'find-by-id': {
      get: async ({ query }: { query: { id: string } }) => {
        calls.push(`${name}?id=${query.id}`);
        return responses.get(name) ?? { status: 200, data: { success: true, data: { judul: `Judul ${name}`, deskripsi: '<p>isi</p>' } } };
      },
    },
  });
  return { calls, responses, ep };
});

vi.mock('dompurify', () => ({ default: { sanitize: (html: string) => html } }));
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      lingkungan: {
        edukasilingkungan: {
          tujuanedukasilingkungan: h.ep('tujuanedukasilingkungan'),
          materiedukasilingkungan: h.ep('materiedukasilingkungan'),
          contohkegiatandesa: h.ep('contohkegiatandesa'),
        },
        konservasiadatbali: {
          filosofitrihitakarana: h.ep('filosofitrihitakarana'),
          nilaikonservasiadatbali: h.ep('nilaikonservasiadatbali'),
          bentukkonservasiberdasarkanadat: h.ep('bentukkonservasiberdasarkanadat'),
        },
      },
    },
  },
}));

import { EDUKASI_LINGKUNGAN_LOADERS } from '@/app/(public)/(pages)/lingkungan/edukasi-lingkungan/_com/edukasi-lingkungan.source';
import { KONSERVASI_ADAT_BALI_LOADERS } from '@/app/(public)/(pages)/lingkungan/konservasi-adat-bali/_com/konservasi-adat-bali.source';

const respond = (name: string, res: Res) => h.responses.set(name, res);

const CASES = [
  {
    page: 'Edukasi Lingkungan',
    loaders: EDUKASI_LINGKUNGAN_LOADERS,
    keys: ['tujuan', 'materi', 'contoh'],
    endpoints: ['tujuanedukasilingkungan', 'materiedukasilingkungan', 'contohkegiatandesa'],
    context: 'edukasi lingkungan: tujuan',
  },
  {
    page: 'Konservasi Adat Bali',
    loaders: KONSERVASI_ADAT_BALI_LOADERS,
    keys: ['filosofi', 'nilai', 'bentuk'],
    endpoints: ['filosofitrihitakarana', 'nilaikonservasiadatbali', 'bentukkonservasiberdasarkanadat'],
    context: 'konservasi adat bali: filosofi tri hita karana',
  },
] as const;

describe.each(CASES)('$page source', ({ loaders, keys, endpoints, context }) => {
  beforeEach(() => {
    h.calls.length = 0;
    h.responses.clear();
  });

  it('tiga bagian dengan urutan tampil tetap dan label cadangan terisi', () => {
    expect(loaders.map((l) => l.key)).toEqual(keys);
    loaders.forEach((l) => expect(l.title.trim().length).toBeGreaterThan(0));
  });

  it('tiap loader memanggil find-by-id endpointnya sendiri dengan id "edit" lalu mengembalikan judul + deskripsi', async () => {
    const records = await Promise.all(loaders.map((l) => l.load()));
    expect(h.calls).toEqual(endpoints.map((e) => `${e}?id=edit`));
    expect(records).toEqual(endpoints.map((e) => ({ judul: `Judul ${e}`, deskripsi: '<p>isi</p>' })));
  });

  it('data null → null (CMS kosong), bukan galat', async () => {
    respond(endpoints[1], { status: 200, data: { success: true, data: null } });
    await expect(loaders[1].load()).resolves.toBeNull();
  });

  it('HTTP gagal atau success:false → Error berkonteks bagian + status', async () => {
    respond(endpoints[0], { status: 500, data: { success: false, message: 'db mati' } });
    await expect(loaders[0].load()).rejects.toThrow(`find-by-id ${context} gagal (HTTP 500): db mati`);

    respond(endpoints[0], { status: 200, data: { success: false, message: 'Record not found' } });
    await expect(loaders[0].load()).rejects.toThrow(/gagal \(HTTP 200\): Record not found/);
  });
});
