// @vitest-environment node
// Helper klien unduh ZIP Desa Anti Korupsi (publik & admin): URL, nama berkas, pesan error, alur fetch.
import { describe, it, expect, vi } from 'vitest';
import {
  fileNameFromDisposition,
  pesanGagalZip,
  unduhZipDak,
  zipUrl,
} from '@/lib/desa-anti-korupsi-zip-client';

describe('zipUrl', () => {
  it('tanpa folder → seluruh program', () => {
    expect(zipUrl('p1')).toBe('/api/landingpage/desaantikorupsi/p1/zip');
  });
  it('dengan folder id atau "umum" → query folder', () => {
    expect(zipUrl('p1', 'f 1')).toBe('/api/landingpage/desaantikorupsi/p1/zip?folder=f+1');
    expect(zipUrl('p1', 'umum')).toBe('/api/landingpage/desaantikorupsi/p1/zip?folder=umum');
  });
  it('folder null diperlakukan seperti tanpa folder', () => {
    expect(zipUrl('p1', null)).toBe('/api/landingpage/desaantikorupsi/p1/zip');
  });
});

describe('fileNameFromDisposition', () => {
  it('mengutamakan filename* UTF-8', () => {
    const h = `attachment; filename="perdes-_.zip"; filename*=UTF-8''perdes-%C3%A9.zip`;
    expect(fileNameFromDisposition(h)).toBe('perdes-é.zip');
  });
  it('fallback ke filename biasa lalu ke default', () => {
    expect(fileNameFromDisposition('attachment; filename="a.zip"')).toBe('a.zip');
    expect(fileNameFromDisposition(null)).toBe('dokumen.zip');
    expect(fileNameFromDisposition("attachment; filename*=UTF-8''%E0%A4%A")).toBe('dokumen.zip');
  });
});

describe('pesanGagalZip', () => {
  it('memakai message dari body bila ada', () => {
    expect(pesanGagalZip(413, { success: false, message: 'Terlalu besar' })).toBe('Terlalu besar');
  });
  it('pesan bawaan per status', () => {
    expect(pesanGagalZip(413, null)).toMatch(/terlalu besar/i);
    expect(pesanGagalZip(404, null)).toMatch(/tidak ditemukan/i);
    expect(pesanGagalZip(502, { foo: 1 })).toMatch(/gagal mengunduh/i);
  });
});

describe('unduhZipDak', () => {
  it('sukses: blob disimpan dengan nama dari header', async () => {
    const save = vi.fn();
    const fetchImpl = vi.fn(async () =>
      new Response(new Blob(['zip']), {
        status: 200,
        headers: { 'Content-Disposition': `attachment; filename="x.zip"; filename*=UTF-8''prog-umum.zip` },
      }),
    ) as unknown as typeof fetch;
    const res = await unduhZipDak('p1', 'umum', { fetchImpl, save });
    expect(res).toEqual({ ok: true, fileName: 'prog-umum.zip' });
    expect(fetchImpl).toHaveBeenCalledWith('/api/landingpage/desaantikorupsi/p1/zip?folder=umum');
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][1]).toBe('prog-umum.zip');
  });

  it('413: tidak menyimpan, mengembalikan pesan server', async () => {
    const save = vi.fn();
    const fetchImpl = vi.fn(async () =>
      Response.json({ success: false, message: 'Total 120 MB melebihi batas' }, { status: 413 }),
    ) as unknown as typeof fetch;
    expect(await unduhZipDak('p1', null, { fetchImpl, save })).toEqual({
      ok: false,
      message: 'Total 120 MB melebihi batas',
    });
    expect(save).not.toHaveBeenCalled();
  });

  it('jaringan gagal: pesan koneksi, tidak melempar', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('network');
    }) as unknown as typeof fetch;
    const res = await unduhZipDak('p1', null, { fetchImpl, save: vi.fn() });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toMatch(/koneksi/i);
  });
});
