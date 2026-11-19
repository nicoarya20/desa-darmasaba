// @vitest-environment node
// Sektor Unggulan Desa: "Jumlah" (value) opsional — helper, skema form admin, payload state, kontrak body API, handler, dan form admin.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  sektorUnggulanDesa: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const postMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { ekonomi: { sektourunggulandesa: { create: { post: postMock } } } } },
}));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: 's1' }),
}));
vi.mock('@/app/admin/(dashboard)/_com/createEditor', () => ({ default: () => null }));
vi.mock('@/app/admin/(dashboard)/_com/editEditor', () => ({ default: () => null }));

import SektorUnggulanDesaApi from '@/app/api/[[...slugs]]/_lib/ekonomi/sektor-unggulan-desa';
import grafikSektorUnggulan, {
  templateGrafikSektorUnggulan,
} from '@/app/admin/(dashboard)/_state/ekonomi/sektor-unggulan-desa';
import CreateSektorUnggulanDesa from '@/app/admin/(dashboard)/ekonomi/sektor-unggulan-desa/create/page';
import EditSektorUnggulanDesa from '@/app/admin/(dashboard)/ekonomi/sektor-unggulan-desa/[id]/edit/page';
import { parseSektorValueInput } from '@/lib/sektor-unggulan';

beforeEach(() => vi.clearAllMocks());

describe('parseSektorValueInput', () => {
  it('kosong/tidak valid → null (bukan 0)', () => {
    for (const raw of ['', '   ', '-', null, undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(parseSektorValueInput(raw as any)).toBeNull();
    }
  });

  it('0, desimal, dan teks sementara saat mengetik → angka', () => {
    expect(parseSektorValueInput(0)).toBe(0);
    expect(parseSektorValueInput('0')).toBe(0);
    expect(parseSektorValueInput(12.5)).toBe(12.5);
    expect(parseSektorValueInput('1.')).toBe(1);
    expect(parseSektorValueInput('1.50')).toBe(1.5);
  });
});

describe('skema form admin', () => {
  const base = { name: 'Pertanian', description: '<p>x</p>' };

  it('value null / 0 / desimal sah', () => {
    for (const value of [null, 0, 0.5, 120]) {
      expect(templateGrafikSektorUnggulan.safeParse({ ...base, value }).success).toBe(true);
    }
  });

  it('nama & deskripsi tetap wajib; NaN/Infinity ditolak', () => {
    expect(templateGrafikSektorUnggulan.safeParse({ ...base, name: '', value: null }).success).toBe(false);
    expect(templateGrafikSektorUnggulan.safeParse({ ...base, description: '', value: null }).success).toBe(false);
    expect(templateGrafikSektorUnggulan.safeParse({ ...base, value: Number.NaN }).success).toBe(false);
    expect(templateGrafikSektorUnggulan.safeParse({ ...base, value: Number.POSITIVE_INFINITY }).success).toBe(false);
  });
});

describe('state admin — payload', () => {
  it('create dengan Jumlah kosong mengirim value: null (bukan 0/NaN)', async () => {
    postMock.mockResolvedValueOnce({ status: 200, data: { data: { id: 's1' } } });
    grafikSektorUnggulan.create.form = { name: 'Pertanian', description: '<p>x</p>', value: null, satuan: '', periode: '' };
    vi.spyOn(grafikSektorUnggulan.findMany, 'load').mockResolvedValue(undefined);
    await grafikSektorUnggulan.create.create();
    expect(postMock).toHaveBeenCalledTimes(1);
    expect(postMock.mock.calls[0][0].value).toBeNull();
    // reset setelah sukses → kosong, bukan 0
    expect(grafikSektorUnggulan.create.form.value).toBeNull();
  });

  it('update dengan Jumlah kosong mengirim "value":null di body PUT', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: {} }) });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(grafikSektorUnggulan.findMany, 'load').mockResolvedValue(undefined);
    grafikSektorUnggulan.update.id = 's1';
    grafikSektorUnggulan.update.form = { name: 'Pertanian', description: '<p>x</p>', value: null, satuan: '', periode: '' };
    await grafikSektorUnggulan.update.submit();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.value).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe('kontrak body API (Elysia)', () => {
  const call = (method: 'POST' | 'PUT', body: Record<string, unknown>) =>
    SektorUnggulanDesaApi.handle(
      new Request(`http://localhost/sektourunggulandesa/${method === 'POST' ? 'create' : 's1'}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
  const base = { name: 'Pertanian', description: '<p>x</p>' };

  it('create: tanpa value dan value null → 200, disimpan null', async () => {
    prismaMock.sektorUnggulanDesa.create.mockResolvedValue({ id: 's1' });
    for (const body of [base, { ...base, value: null }]) {
      prismaMock.sektorUnggulanDesa.create.mockClear();
      const res = await call('POST', body);
      expect(res.status).toBe(200);
      expect(prismaMock.sektorUnggulanDesa.create.mock.calls[0][0].data.value).toBeNull();
    }
  });

  it('create: angka (termasuk 0 dan desimal) disimpan apa adanya; non-angka → 422', async () => {
    prismaMock.sektorUnggulanDesa.create.mockResolvedValue({ id: 's1' });
    for (const value of [0, 12.5, 90]) {
      prismaMock.sektorUnggulanDesa.create.mockClear();
      expect((await call('POST', { ...base, value })).status).toBe(200);
      expect(prismaMock.sektorUnggulanDesa.create.mock.calls[0][0].data.value).toBe(value);
    }
    expect((await call('POST', { ...base, value: 'abc' })).status).toBe(422);
  });

  it('PUT: tanpa value = tidak diubah, null = dikosongkan, angka = diisi', async () => {
    prismaMock.sektorUnggulanDesa.findUnique.mockResolvedValue({ id: 's1' });
    prismaMock.sektorUnggulanDesa.update.mockResolvedValue({ id: 's1' });

    expect((await call('PUT', base)).status).toBe(200);
    expect(prismaMock.sektorUnggulanDesa.update.mock.calls[0][0].data.value).toBeUndefined();

    prismaMock.sektorUnggulanDesa.update.mockClear();
    expect((await call('PUT', { ...base, value: null })).status).toBe(200);
    expect(prismaMock.sektorUnggulanDesa.update.mock.calls[0][0].data.value).toBeNull();

    prismaMock.sektorUnggulanDesa.update.mockClear();
    expect((await call('PUT', { ...base, value: 0 })).status).toBe(200);
    expect(prismaMock.sektorUnggulanDesa.update.mock.calls[0][0].data.value).toBe(0);
  });
});

describe('form admin (render statis)', () => {
  const render = (node: React.ReactElement) =>
    renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
  // Mantine menandai field wajib dengan tanda bintang `data-required`/`mantine-InputWrapper-required`.
  const simpanButton = (html: string) => html.slice(html.lastIndexOf('<button', html.indexOf('Simpan')), html.indexOf('Simpan'));
  const requiredCount = (html: string) => (html.match(/mantine-InputWrapper-required/g) ?? []).length;

  it('Tambah: Jumlah tidak wajib (hanya Nama), ada keterangan opsional, Simpan aktif tanpa Jumlah', () => {
    grafikSektorUnggulan.create.form = { name: 'Pertanian', description: '<p>x</p>', value: null, satuan: '', periode: '' };
    const html = render(<CreateSektorUnggulanDesa />);
    expect(html).toContain('Jumlah');
    expect(html).toContain('Opsional. Kosongkan bila sektor ini belum punya angka.');
    expect(requiredCount(html)).toBe(1);
    const simpan = simpanButton(html);
    expect(simpan).not.toBe('');
    expect(simpan).not.toContain('disabled');
  });

  it('Tambah: Simpan tetap nonaktif bila nama/deskripsi kosong', () => {
    grafikSektorUnggulan.create.form = { name: '', description: '', value: null, satuan: '', periode: '' };
    const html = render(<CreateSektorUnggulanDesa />);
    const simpan = simpanButton(html);
    expect(simpan).toContain('disabled');
  });

  it('Ubah: Jumlah tidak wajib (hanya Nama) dan ada keterangan opsional', () => {
    const html = render(<EditSektorUnggulanDesa />);
    expect(html).toContain('Opsional. Kosongkan bila sektor ini belum punya angka.');
    expect(requiredCount(html)).toBe(1);
  });
});
