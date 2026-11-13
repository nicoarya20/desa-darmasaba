// @vitest-environment node
// API Laporan Publik: kronologi (create/update) & penanganan (update) disanitasi sebelum disimpan
// (BACKEND-TODO P1: XSS tersimpan, lapis server). Memakai sanitize-html asli — tidak butuh DOM.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  laporanPublik: { create: vi.fn(), update: vi.fn() },
  penangananLaporanPublik: { deleteMany: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import { sanitizeRichTextForStorage } from '@/lib/rich-text-server';
import laporanPublikCreate from '@/app/api/[[...slugs]]/_lib/keamanan/laporan-publik/create';
import laporanPublikUpdate from '@/app/api/[[...slugs]]/_lib/keamanan/laporan-publik/updt';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (body: unknown, id?: string): any => ({ body, params: id ? { id } : {}, set: { status: 200 } });

// test-only: bentuk konten sama dengan data produksi (hanya <p>)
const KONTEN_PROD = '<p>Tim mendatangi rumah pihak yang diduga melakukan pembuangan sampah liar.</p>';
const BASE = { judul: 'Sampah liar', lokasi: 'Banjar Tengah', tanggalWaktu: '2026-11-05T02:00:00.000Z' };

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.laporanPublik.create.mockImplementation(async ({ data }) => ({ id: 'lap-1', ...data }));
  prismaMock.laporanPublik.update.mockImplementation(async ({ data }) => ({ id: 'lap-1', ...data }));
});

describe('sanitizeRichTextForStorage', () => {
  it('konten format dasar (seperti data produksi) tidak berubah sama sekali', () => {
    expect(sanitizeRichTextForStorage(KONTEN_PROD)).toBe(KONTEN_PROD);
    const dasar = '<p>Satu <strong>dua</strong> <em>tiga</em> <u>empat</u><br /></p><ul><li>a</li></ul><ol><li>b</li></ol>';
    expect(sanitizeRichTextForStorage(dasar)).toBe(dasar);
  });

  it('skrip & handler event dibuang; isi <script> ikut hilang', () => {
    const out = sanitizeRichTextForStorage('<p>Ada sampah</p><img src=x onerror="alert(1)"><script>alert(2)</script>');
    expect(out).toBe('<p>Ada sampah</p>');
  });

  it('tag di luar allowlist dibuang tapi teksnya tetap; semua atribut dibuang', () => {
    expect(sanitizeRichTextForStorage('<h2>Judul</h2><p style="text-align:center" onclick="x()">Isi <a href="javascript:alert(1)">foto</a> <mark>penting</mark></p>'))
      .toBe('Judul<p>Isi foto penting</p>');
  });

  it('vektor lain: svg, iframe srcdoc, style', () => {
    const out = sanitizeRichTextForStorage('<svg onload="alert(1)"><p>a</p></svg><iframe srcdoc="<script>x</script>"></iframe><style>body{}</style>');
    expect(out).not.toMatch(/<svg|<iframe|<style|onload|srcdoc|alert/i);
  });
});

describe('POST create: kronologi publik disanitasi sebelum disimpan', () => {
  it('payload XSS tidak sampai ke database', async () => {
    await laporanPublikCreate(ctx({ ...BASE, kronologi: '<p>Halo</p><script>alert(1)</script>' }));
    expect(prismaMock.laporanPublik.create).toHaveBeenCalledWith({
      data: { ...BASE, tanggalWaktu: new Date(BASE.tanggalWaktu), kronologi: '<p>Halo</p>' },
    });
  });

  it('kronologi opsional yang tidak dikirim tetap tidak diisi', async () => {
    await laporanPublikCreate(ctx(BASE));
    expect(prismaMock.laporanPublik.create.mock.calls[0][0].data.kronologi).toBeUndefined();
  });
});

describe('PUT update: kronologi & penanganan disanitasi', () => {
  it('keduanya dibersihkan sebelum disimpan', async () => {
    await laporanPublikUpdate(ctx({
      ...BASE,
      status: 'Proses',
      kronologi: '<p onclick="x()">Kronologi</p>',
      penanganan: '<p>Ditangani</p><img src=x onerror="alert(1)">',
    }, 'lap-1'));
    const { data } = prismaMock.laporanPublik.update.mock.calls[0][0];
    expect(data.kronologi).toBe('<p>Kronologi</p>');
    expect(data.penanganan).toEqual({ create: { deskripsi: '<p>Ditangani</p>' } });
  });

  it('penanganan yang habis tersanitasi tidak dibuat (penanganan lama tetap dihapus)', async () => {
    await laporanPublikUpdate(ctx({ ...BASE, status: 'Proses', penanganan: '<script>alert(1)</script>' }, 'lap-1'));
    expect(prismaMock.penangananLaporanPublik.deleteMany).toHaveBeenCalledWith({ where: { laporanId: 'lap-1' } });
    expect(prismaMock.laporanPublik.update.mock.calls[0][0].data.penanganan).toBeUndefined();
  });
});
