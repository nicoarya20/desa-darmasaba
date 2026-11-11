// @vitest-environment node
// Galeri dokumentasi Program Inovasi: uploader admin (thumbnail + hitungan), galeri publik
// (tidak dirender bila kosong), dan logika media form (batas, urutan upload, logo opsional).
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), warn: vi.fn() } }));

import { DokumentasiUploader } from '@/app/admin/(dashboard)/landing-page/profil/program-inovasi/_com/DokumentasiUploader';
import { LogoDropzone } from '@/app/admin/(dashboard)/landing-page/profil/program-inovasi/_com/LogoDropzone';
import {
  kumpulkanImageIds,
  labelJumlahDokumentasi,
  resolveLogoId,
  tambahDokumentasi,
  type DokumentasiItem,
} from '@/app/admin/(dashboard)/landing-page/profil/program-inovasi/_lib/dokumentasi.logic';
import { DokumentasiGaleri } from '@/app/(public)/(tambahan)/program-inovasi/[id]/_com/DokumentasiGaleri';

const render = (ui: React.ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const count = (html: string, attr: string) => html.split(attr).length - 1;

// test-only: item galeri tersimpan
const tersimpan = (n: number): DokumentasiItem[] =>
  Array.from({ length: n }, (_, i) => ({ key: `g${i}`, id: `g${i}`, preview: `/api/img/g${i}.webp` }));
const fileBaru = (name: string): DokumentasiItem => ({ key: `new-${name}`, preview: `blob:${name}`, file: new File(['x'], name) });

describe('DokumentasiUploader', () => {
  it('merender satu thumbnail per gambar dan hitungan jumlah/maks', () => {
    const html = render(<DokumentasiUploader items={tersimpan(3)} max={20} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(count(html, 'data-dokumentasi-thumb')).toBe(3);
    expect(count(html, 'aria-label="Hapus dokumentasi')).toBe(3);
    expect(html).toContain('Dokumentasi Program');
    expect(html).toMatch(/3<!-- -->\/<!-- -->20<!-- --> gambar|3\/20 gambar/);
  });

  it('tanpa gambar tidak ada thumbnail; batas tercapai menampilkan pesan', () => {
    expect(count(render(<DokumentasiUploader items={[]} max={20} onAdd={vi.fn()} onRemove={vi.fn()} />), 'data-dokumentasi-thumb')).toBe(0);
    expect(render(<DokumentasiUploader items={tersimpan(2)} max={2} onAdd={vi.fn()} onRemove={vi.fn()} />)).toContain('Batas 2 gambar tercapai');
  });
});

describe('LogoDropzone', () => {
  it('berlabel opsional dan hanya merender preview bila ada', () => {
    expect(render(<LogoDropzone preview={null} onSelect={vi.fn()} onRemove={vi.fn()} />)).toContain('Logo/Gambar Program (opsional)');
    expect(render(<LogoDropzone preview={null} onSelect={vi.fn()} onRemove={vi.fn()} />)).not.toContain('Preview logo program');
    expect(render(<LogoDropzone preview="/api/img/logo.webp" onSelect={vi.fn()} onRemove={vi.fn()} />)).toContain('Hapus logo program');
  });
});

describe('DokumentasiGaleri (publik)', () => {
  it('tidak merender section bila kosong / null', () => {
    expect(render(<DokumentasiGaleri images={[]} />)).not.toContain('Dokumentasi');
    expect(render(<DokumentasiGaleri images={null} />)).not.toContain('<section');
  });

  it('merender judul dan satu item per gambar', () => {
    const html = render(<DokumentasiGaleri images={[{ id: 'a', link: '/a.webp' }, { id: 'b', link: '/b.webp' }]} />);
    expect(html).toContain('Dokumentasi');
    expect(count(html, 'data-dokumentasi-item')).toBe(2);
    expect(html).toContain('src="/b.webp"');
  });

  it('judul null → tanpa heading', () => {
    expect(render(<DokumentasiGaleri images={[{ id: 'a', link: '/a.webp' }]} judul={null} />)).not.toContain('<h2');
  });
});

describe('logika media form', () => {
  it('tambahDokumentasi tidak melewati batas', () => {
    const hasil = tambahDokumentasi(tersimpan(19), [fileBaru('a.png'), fileBaru('b.png')], 20);
    expect(hasil.items).toHaveLength(20);
    expect(hasil.ditolak.map((i) => i.key)).toEqual(['new-b.png']);
  });

  it('kumpulkanImageIds: id lama dipertahankan, file baru diunggah, urutan tetap', async () => {
    const upload = vi.fn(async (file: File) => `up-${file.name}`);
    const ids = await kumpulkanImageIds([tersimpan(1)[0], fileBaru('a.png')], upload);
    expect(ids).toEqual(['g0', 'up-a.png']);
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it('kumpulkanImageIds melempar error dengan nama file bila upload gagal', async () => {
    await expect(kumpulkanImageIds([fileBaru('rusak.png')], async () => null)).rejects.toThrow('rusak.png');
  });

  it('resolveLogoId: tanpa file → id lama atau null (logo dihapus)', async () => {
    const upload = vi.fn(async () => 'baru');
    expect(await resolveLogoId({ file: null, existingId: 'lama' }, upload)).toBe('lama');
    expect(await resolveLogoId({ file: null, existingId: null }, upload)).toBeNull();
    expect(await resolveLogoId({ file: new File(['x'], 'l.png'), existingId: 'lama' }, upload)).toBe('baru');
  });

  it('labelJumlahDokumentasi', () => {
    expect(labelJumlahDokumentasi(3)).toBe('3 foto');
    expect(labelJumlahDokumentasi(0)).toBe('-');
    expect(labelJumlahDokumentasi(undefined)).toBe('-');
  });
});
