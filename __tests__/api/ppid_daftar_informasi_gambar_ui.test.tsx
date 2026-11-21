// @vitest-environment node
// Gambar opsional Daftar Informasi Publik: detail publik menampilkan gambar hanya bila ada, dan hook pilihan gambar
// admin memulai dari gambar tersimpan. jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup (klik
// pilih/lepas tidak teruji).
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/(public)/_com/rich-text/rich-text.module.css', () => ({ default: { root: 'rt' } }));

import { DaftarDetail } from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/DaftarDetail';
import type { InformasiItem } from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/daftar.logic';
import { useGambarPilihan } from '@/app/admin/(dashboard)/ppid/daftar-informasi-publik/_com/useGambarPilihan';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: informasi fiktif.
const ITEM: InformasiItem = { id: 'a1', jenisInformasi: 'Profil Desa', deskripsi: '<p>Isi</p>', tanggal: '2025-02-21T00:00:00.000Z' };

describe('DaftarDetail (publik): gambar opsional', () => {
  it('ada gambar: tampil dengan teks alternatif memuat jenis informasi', () => {
    const html = render(<DaftarDetail data={{ ...ITEM, gambar: { link: '/api/fileStorage/findUnique/foto.webp', realName: 'foto.webp' } }} />);
    expect(html).toMatch(/<img[^>]*src="\/api\/fileStorage\/findUnique\/foto\.webp"/);
    expect(html).toContain('alt="Gambar Profil Desa"');
  });

  it.each([null, undefined])('tanpa gambar (%s): tidak ada <img>, bagian lain tetap tampil', (gambar) => {
    const html = render(<DaftarDetail data={{ ...ITEM, gambar }} />);
    expect(html).not.toContain('<img');
    expect(html).toContain('Profil Desa');
    expect(html).toContain('<p>Isi</p>');
  });
});

describe('useGambarPilihan (admin)', () => {
  function Probe({ saved }: { saved: string | null }) {
    const g = useGambarPilihan(saved);
    return <output data-preview={g.previewUrl ?? 'kosong'} data-baru={String(g.baru)} data-dilepas={String(g.dilepas)} />;
  }

  it('awalnya menampilkan gambar tersimpan, tanpa pilihan baru dan belum dilepas', () => {
    const html = render(<Probe saved="/api/img/lama.webp" />);
    expect(html).toContain('data-preview="/api/img/lama.webp"');
    expect(html).toContain('data-baru="null"');
    expect(html).toContain('data-dilepas="false"');
  });

  it('tanpa gambar tersimpan: pratinjau kosong', () => {
    expect(render(<Probe saved={null} />)).toContain('data-preview="kosong"');
  });
});
