// @vitest-environment node
// SOP layanan (Juknis lomba 3.1): Surat Keterangan & Telunjuk Sakti Desa menerima PDF SOP opsional (sopFileId →
// FileStorage), API mengirim `sopFile`, dan halaman publik menampilkan "Unduh SOP (PDF)" hanya bila ada berkas.
// jsdom rusak di repo ini → markup via renderToStaticMarkup; prisma & penghapus berkas di-mock.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

const { prismaMock, removeStoredFileMock } = vi.hoisted(() => {
  const model = () => ({ create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), update: vi.fn() });
  return {
    prismaMock: {
      pelayananSuratKeterangan: model(),
      pelayananTelunjukSaktiDesa: model(),
      fileStorage: { findUnique: vi.fn() },
    },
    removeStoredFileMock: vi.fn(),
  };
});
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/minio', () => ({ default: {}, MINIO_BUCKET: 'test-bucket' }));
vi.mock('@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile', () => ({ default: removeStoredFileMock }));

import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import LayananDesa from '@/app/api/[[...slugs]]/_lib/desa/layanan';
import { LayananDetailBody } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/detail/LayananDetail';
import type { LayananDetailData } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/detail/use-layanan-detail';
import { SopLink } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/SopLink';
import PelayananTelunjukSaktiDesa from '@/app/(public)/(pages)/pemerintahan/layanan/_com/pelayananTelunjukSaktiDesa';
import { LAYANAN_TEXT } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/layanan.text';

type ModelKey = 'pelayananSuratKeterangan' | 'pelayananTelunjukSaktiDesa';

const TARGETS: Array<{ label: string; model: ModelKey; path: string; baseBody: Record<string, unknown> }> = [
  { label: 'surat keterangan', model: 'pelayananSuratKeterangan', path: 'pelayanansuratketerangan',
    baseBody: { name: 'Surat Usaha', deskripsi: '<p>isi</p>', imageId: 'img-1', image2Id: 'img-2' } },
  { label: 'telunjuk sakti desa', model: 'pelayananTelunjukSaktiDesa', path: 'pelayanantelunjuksaktidesa',
    baseBody: { name: 'Akta Kelahiran', deskripsi: 'Akta', link: 'https://contoh.test/akta' } },
];

const send = (method: string, url: string, body?: unknown) =>
  LayananDesa.handle(
    new Request(`http://localhost/layanan/${url}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
const dataOf = (model: ModelKey, fn: 'create' | 'update') =>
  (prismaMock[model][fn].mock.calls[0][0] as { data: Record<string, unknown> }).data;

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.fileStorage.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) =>
    where.id.startsWith('ada-') ? { id: where.id } : null,
  );
  for (const { model } of TARGETS) {
    prismaMock[model].create.mockResolvedValue({ id: 'row-1' });
    prismaMock[model].update.mockResolvedValue({ id: 'row-1' });
    prismaMock[model].findMany.mockResolvedValue([]);
    prismaMock[model].count.mockResolvedValue(0);
    prismaMock[model].findUnique.mockResolvedValue({
      id: 'row-1', imageId: 'img-1', image2Id: 'img-2', image: null, image2: null,
      sopFileId: 'ada-lama', sopFile: { id: 'ada-lama', link: '/lama.pdf', realName: 'lama.pdf' },
    });
  }
});

describe.each(TARGETS)('API — $label', ({ model, path, baseBody }) => {
  it('create menyimpan sopFileId yang ada di FileStorage', async () => {
    const res = await send('POST', `${path}/create`, { ...baseBody, sopFileId: 'ada-1' });
    expect(res.status).toBe(200);
    expect(dataOf(model, 'create').sopFileId).toBe('ada-1');
  });

  it('create menolak sopFileId yang tidak ada (400) tanpa menulis ke DB', async () => {
    const res = await send('POST', `${path}/create`, { ...baseBody, sopFileId: 'hantu-1' });
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/SOP/);
    expect(prismaMock[model].create).not.toHaveBeenCalled();
  });

  it('create tanpa sopFileId tidak mengirim kolom itu; null atau "" disimpan null', async () => {
    await send('POST', `${path}/create`, baseBody);
    expect('sopFileId' in dataOf(model, 'create')).toBe(false);
    expect(prismaMock.fileStorage.findUnique).not.toHaveBeenCalled();

    prismaMock[model].create.mockClear();
    await send('POST', `${path}/create`, { ...baseBody, sopFileId: '' });
    expect(dataOf(model, 'create').sopFileId).toBeNull();
    prismaMock[model].create.mockClear();
    await send('POST', `${path}/create`, { ...baseBody, sopFileId: null });
    expect(dataOf(model, 'create').sopFileId).toBeNull();
  });

  it('update mengganti SOP dan membuang berkas lama dari penyimpanan', async () => {
    const res = await send('PUT', `${path}/row-1`, { ...baseBody, sopFileId: 'ada-baru' });
    expect(res.status).toBe(200);
    expect(dataOf(model, 'update').sopFileId).toBe('ada-baru');
    expect(removeStoredFileMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'ada-lama' }), expect.any(String));
  });

  it('update dengan SOP yang sama atau tanpa field sopFileId tidak menyentuh berkas', async () => {
    await send('PUT', `${path}/row-1`, { ...baseBody, sopFileId: 'ada-lama' });
    expect(removeStoredFileMock).not.toHaveBeenCalled();

    prismaMock[model].update.mockClear();
    await send('PUT', `${path}/row-1`, baseBody);
    expect('sopFileId' in dataOf(model, 'update')).toBe(false);
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it('update menghapus tautan SOP bila sopFileId null', async () => {
    await send('PUT', `${path}/row-1`, { ...baseBody, sopFileId: null });
    expect(dataOf(model, 'update').sopFileId).toBeNull();
    expect(removeStoredFileMock).toHaveBeenCalledTimes(1);
  });

  it('update menolak sopFileId yang tidak ada (400)', async () => {
    const res = await send('PUT', `${path}/row-1`, { ...baseBody, sopFileId: 'hantu-1' });
    expect(res.status).toBe(400);
    expect(prismaMock[model].update).not.toHaveBeenCalled();
  });

  it('find-many dan findUnique menyertakan sopFile (id, link, realName saja)', async () => {
    await send('GET', `${path}/find-many`);
    await send('GET', `${path}/row-1`);
    const selects = [
      prismaMock[model].findMany.mock.calls[0][0].include.sopFile.select,
      prismaMock[model].findUnique.mock.calls[0][0].include.sopFile.select,
    ];
    for (const select of selects) expect(select).toEqual({ id: true, link: true, realName: true });
  });
});

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;
const SOP_LABEL = LAYANAN_TEXT.sop.label;
const sop = { id: 'f1', link: 'https://files.example.test/sop.pdf', realName: 'sop.pdf' }; // test-only

/** Kedalaman <a> terdalam di markup; 1 berarti tidak ada tautan bersarang. */
const maxAnchorDepth = (html: string) => {
  let depth = 0;
  let max = 0;
  for (const tag of html.match(/<a[\s>]|<\/a>/g) ?? []) {
    depth += tag === '</a>' ? -1 : 1;
    max = Math.max(max, depth);
  }
  return max;
};

describe('SSR publik — tautan SOP', () => {
  it('SopLink: tautan tab baru ke berkas dengan label "Unduh SOP (PDF)"', () => {
    const html = render(<SopLink file={sop} />);
    expect(SOP_LABEL).toBe('Unduh SOP (PDF)');
    expect(html).toContain(`href="${sop.link}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain(`data-text="${SOP_LABEL}"`);
  });

  it('Telunjuk Sakti: tautan SOP hanya pada layanan yang punya berkas, tidak bersarang di tautan baris', () => {
    const item = { name: 'x', deskripsi: 'Petunjuk', link: 'www.test.com', estimasiWaktu: null, biaya: null };
    stateLayananDesa.pelayananTelunjukSaktiDesa.findMany.loading = false;
    stateLayananDesa.pelayananTelunjukSaktiDesa.findMany.data = [
      { ...item, id: 't1', name: 'Akta Kematian', sopFile: sop },
      { ...item, id: 't2', name: 'Akta Kelahiran', sopFile: null },
      { ...item, id: 't3', name: 'Kartu Keluarga' },
    ];
    const html = render(<PelayananTelunjukSaktiDesa />);
    expect(count(html, SOP_LABEL)).toBe(2); // data-text + isi label dari satu tautan
    expect(count(html, `href="${sop.link}"`)).toBe(1);
    expect(count(html, '<a ')).toBe(4); // 3 baris + 1 tautan SOP
    expect(maxAnchorDepth(html)).toBe(1);
    expect(html).toContain('href="https://www.test.com"');
  });

  it('Telunjuk Sakti tanpa satu pun berkas SOP: tampil seperti sebelumnya', () => {
    stateLayananDesa.pelayananTelunjukSaktiDesa.findMany.loading = false;
    stateLayananDesa.pelayananTelunjukSaktiDesa.findMany.data = [
      { id: 't1', name: 'Akta Kematian', deskripsi: 'Petunjuk', link: 'www.test.com', estimasiWaktu: null, biaya: null },
    ];
    const html = render(<PelayananTelunjukSaktiDesa />);
    expect(html).not.toContain(SOP_LABEL);
    expect(count(html, '<a ')).toBe(1);
  });

  it('detail Surat Keterangan: tautan SOP hanya bila ada berkas', () => {
    const base: LayananDetailData = { id: 's1', name: 'Surat Usaha', deskripsi: '<p>isi</p>', estimasiWaktu: null, biaya: null };
    const dengan = render(<LayananDetailBody data={{ ...base, sopFile: sop }} onAjukan={() => {}} waTersedia />);
    expect(dengan).toContain(`href="${sop.link}"`);
    expect(count(dengan, `data-text="${SOP_LABEL}"`)).toBe(1);

    const tanpa = render(<LayananDetailBody data={base} onAjukan={() => {}} waTersedia />);
    expect(tanpa).not.toContain(SOP_LABEL);
    expect(render(<LayananDetailBody data={{ ...base, sopFile: null }} onAjukan={() => {}} waTersedia />)).not.toContain(SOP_LABEL);
  });
});
