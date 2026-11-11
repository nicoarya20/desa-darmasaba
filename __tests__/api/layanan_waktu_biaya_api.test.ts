// @vitest-environment node
// API pelayanan desa (4 model): kolom opsional estimasiWaktu & biaya.
// Kontrak: aditif — body lama tanpa field baru tetap sukses dan tidak menyentuh kolom.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => {
  const model = () => ({
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  });
  return {
    pelayananSuratKeterangan: model(),
    pelayananTelunjukSaktiDesa: model(),
    pelayananPerizinanBerusaha: model(),
    pelayananPendudukNonPermanen: model(),
    fileStorage: { delete: vi.fn() },
  };
});
const minioMock = vi.hoisted(() => ({ removeObject: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/minio', () => ({ default: minioMock, MINIO_BUCKET: 'test-bucket' }));

import LayananDesa from '@/app/api/[[...slugs]]/_lib/desa/layanan';
import { PELAYANAN_BIAYA_MAX } from '@/lib/pelayanan-waktu-biaya';

type ModelKey =
  | 'pelayananSuratKeterangan'
  | 'pelayananTelunjukSaktiDesa'
  | 'pelayananPerizinanBerusaha'
  | 'pelayananPendudukNonPermanen';

interface Target {
  label: string;
  model: ModelKey;
  path: string;
  baseBody: Record<string, unknown>;
  canCreate: boolean;
}

const TARGETS: Target[] = [
  {
    label: 'surat keterangan',
    model: 'pelayananSuratKeterangan',
    path: 'pelayanansuratketerangan',
    baseBody: { name: 'Surat Usaha', deskripsi: '<p>isi</p>', imageId: 'img-1', image2Id: 'img-2' },
    canCreate: true,
  },
  {
    label: 'telunjuk sakti desa',
    model: 'pelayananTelunjukSaktiDesa',
    path: 'pelayanantelunjuksaktidesa',
    baseBody: { name: 'Akta Kelahiran', deskripsi: 'Akta', link: 'https://contoh.test/akta' },
    canCreate: true,
  },
  {
    label: 'perizinan berusaha',
    model: 'pelayananPerizinanBerusaha',
    path: 'pelayananperizinanberusaha',
    baseBody: { name: 'OSS', deskripsi: '<p>isi</p>', link: 'https://contoh.test/oss' },
    canCreate: false,
  },
  {
    label: 'penduduk non permanen',
    model: 'pelayananPendudukNonPermanen',
    path: 'pelayananpenduduknonpermanen',
    baseBody: { name: 'Non Permanen', deskripsi: '<p>isi</p>' },
    canCreate: false,
  },
];
const CREATABLE = TARGETS.filter((t) => t.canCreate);

const send = (method: string, url: string, body?: unknown) =>
  LayananDesa.handle(
    new Request(`http://localhost/layanan/${url}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );

/** Argumen `data` dari panggilan prisma.<model>.<fn> pertama. */
const dataOf = (model: ModelKey, fn: 'create' | 'update') =>
  (prismaMock[model][fn].mock.calls[0][0] as { data: Record<string, unknown> }).data;

beforeEach(() => {
  vi.clearAllMocks();
  for (const { model } of TARGETS) {
    prismaMock[model].create.mockResolvedValue({ id: 'row-1' });
    prismaMock[model].update.mockResolvedValue({ id: 'row-1' });
    prismaMock[model].findMany.mockResolvedValue([]);
    prismaMock[model].count.mockResolvedValue(0);
    prismaMock[model].findUnique.mockResolvedValue({
      id: 'row-1',
      imageId: 'img-1',
      image2Id: 'img-2',
      image: null,
      image2: null,
    });
  }
});

describe.each(CREATABLE)('POST create — $label', ({ model, path, baseBody }) => {
  it('menyimpan estimasiWaktu & biaya (trim; biaya 0 tetap 0)', async () => {
    const res = await send('POST', `${path}/create`, { ...baseBody, estimasiWaktu: ' 1 hari kerja ', biaya: 0 });
    expect(res.status).toBe(200);
    const data = dataOf(model, 'create');
    expect(data.estimasiWaktu).toBe('1 hari kerja');
    expect(data.biaya).toBe(0);
  });

  it('null disimpan sebagai null (dibedakan dari 0)', async () => {
    const res = await send('POST', `${path}/create`, { ...baseBody, estimasiWaktu: null, biaya: null });
    expect(res.status).toBe(200);
    const data = dataOf(model, 'create');
    expect(data.estimasiWaktu).toBeNull();
    expect(data.biaya).toBeNull();
  });

  it('body lama tanpa field baru tetap 200 dan tidak mengirim kolom baru ke DB', async () => {
    const res = await send('POST', `${path}/create`, baseBody);
    expect(res.status).toBe(200);
    const data = dataOf(model, 'create');
    expect('estimasiWaktu' in data).toBe(false);
    expect('biaya' in data).toBe(false);
  });

  it.each([
    ['biaya negatif', { biaya: -1 }],
    ['biaya desimal', { biaya: 1.5 }],
    ['biaya di atas batas', { biaya: PELAYANAN_BIAYA_MAX + 1 }],
    ['estimasi waktu 101 karakter', { estimasiWaktu: 'a'.repeat(101) }],
  ])('menolak %s dengan 400 dan tidak menulis ke DB', async (_label, extra) => {
    const res = await send('POST', `${path}/create`, { ...baseBody, ...extra });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(typeof json.message).toBe('string');
    expect(prismaMock[model].create).not.toHaveBeenCalled();
  });

  it('menolak tipe salah (biaya string) tanpa menulis ke DB', async () => {
    const res = await send('POST', `${path}/create`, { ...baseBody, biaya: '5000' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(prismaMock[model].create).not.toHaveBeenCalled();
  });
});

describe.each(TARGETS)('PUT update — $label', ({ model, path, baseBody }) => {
  it('menyimpan estimasiWaktu & biaya', async () => {
    const res = await send('PUT', `${path}/row-1`, { ...baseBody, estimasiWaktu: '2 hari kerja', biaya: 50000 });
    expect(res.status).toBe(200);
    const data = dataOf(model, 'update');
    expect(data.estimasiWaktu).toBe('2 hari kerja');
    expect(data.biaya).toBe(50000);
  });

  it('biaya 0 (Gratis) dan null (dikosongkan) dibedakan', async () => {
    await send('PUT', `${path}/row-1`, { ...baseBody, biaya: 0 });
    expect(dataOf(model, 'update').biaya).toBe(0);

    prismaMock[model].update.mockClear();
    await send('PUT', `${path}/row-1`, { ...baseBody, biaya: null, estimasiWaktu: null });
    const cleared = dataOf(model, 'update');
    expect(cleared.biaya).toBeNull();
    expect(cleared.estimasiWaktu).toBeNull();
  });

  it('body lama tanpa field baru → 200 dan nilai tersimpan tidak ditimpa', async () => {
    const res = await send('PUT', `${path}/row-1`, baseBody);
    expect(res.status).toBe(200);
    const data = dataOf(model, 'update');
    expect('estimasiWaktu' in data).toBe(false);
    expect('biaya' in data).toBe(false);
  });

  it.each([
    ['biaya negatif', { biaya: -5 }],
    ['biaya desimal', { biaya: 2.25 }],
    ['biaya di atas batas', { biaya: PELAYANAN_BIAYA_MAX + 1 }],
    ['estimasi waktu 101 karakter', { estimasiWaktu: 'b'.repeat(101) }],
  ])('menolak %s dengan 400 sebelum efek samping apa pun', async (_label, extra) => {
    const res = await send('PUT', `${path}/row-1`, { ...baseBody, ...extra });
    expect(res.status).toBe(400);
    expect((await res.json()).success).toBe(false);
    expect(prismaMock[model].update).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
  });
});

describe('GET — output aditif, 0 vs null tidak dikoersi', () => {
  it('find-many surat keterangan: bentuk lama utuh + field baru apa adanya', async () => {
    prismaMock.pelayananSuratKeterangan.findMany.mockResolvedValue([
      { id: 'a', name: 'Gratis', estimasiWaktu: '1 hari kerja', biaya: 0 },
      { id: 'b', name: 'Belum diisi', estimasiWaktu: null, biaya: null },
      { id: 'c', name: 'Berbayar', estimasiWaktu: '3 hari kerja', biaya: 25000 },
    ]);
    prismaMock.pelayananSuratKeterangan.count.mockResolvedValue(3);

    const res = await send('GET', 'pelayanansuratketerangan/find-many?page=1&limit=10');
    const json = await res.json();

    expect(Object.keys(json).sort()).toEqual(['data', 'limit', 'message', 'page', 'success', 'total', 'totalPages']);
    expect(json.data[0].biaya).toBe(0);
    expect(json.data[1].biaya).toBeNull();
    expect(json.data[1].estimasiWaktu).toBeNull();
    expect(json.data[2].biaya).toBe(25000);
  });

  it('find-many telunjuk sakti desa meneruskan field baru', async () => {
    prismaMock.pelayananTelunjukSaktiDesa.findMany.mockResolvedValue([
      { id: 't', name: 'Akta', estimasiWaktu: null, biaya: 0 },
    ]);
    const res = await send('GET', 'pelayanantelunjuksaktidesa/find-many');
    const json = await res.json();
    expect(json.data[0].biaya).toBe(0);
    expect(json.data[0].estimasiWaktu).toBeNull();
  });

  it.each(TARGETS)('detail $label menyertakan estimasiWaktu & biaya', async ({ model, path }) => {
    prismaMock[model].findUnique.mockResolvedValue({ id: 'row-1', estimasiWaktu: '1 hari kerja', biaya: 0 });
    const res = await send('GET', `${path}/row-1`);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.estimasiWaktu).toBe('1 hari kerja');
    expect(json.data.biaya).toBe(0);
  });
});
