// @vitest-environment node
// Halaman Pengaturan → Sampah (SSR): guard role, bar tab semua kelompok + jumlah (termasuk 0),
// empty state, skeleton, item merender asal & sisa hari.
import { beforeEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import SampahPage from '@/app/admin/(dashboard)/pengaturan/sampah/page';
import sampahState from '@/app/admin/(dashboard)/_state/pengaturan/sampah-state';
import type { SampahItem } from '@/lib/sampah/sampah-item';
import { sampahKelompokList } from '@/lib/sampah/sampah-kelompok';
import { authStore } from '@/store/authStore';

const render = (roleId: number) => {
  authStore.setUser({ id: 'u1', name: 'Admin', roleId, menuIds: null, isActive: true });
  return renderToStaticMarkup(
    <MantineProvider env="test">
      <SampahPage />
    </MantineProvider>,
  );
};

const item = (over: Partial<SampahItem> = {}): SampahItem => ({
  id: 'file:f1',
  jenis: 'file',
  judul: 'sk-ppid.pdf',
  mimeType: 'application/pdf',
  kategori: 'document',
  ukuran: 2048,
  pratinjauUrl: '/api/pengaturan/sampah/file%3Af1/pratinjau',
  dihapusPada: '2026-11-10T00:00:00.000Z',
  sisaHari: 5,
  asal: { kelompokId: 'PPID', kelompokNama: 'PPID', menuId: 'ppid.profil-ppid', menuNama: 'Profil PPID' },
  ...over,
}); // test-only

beforeEach(() => {
  Object.assign(sampahState, {
    kelompokAktif: 'semua',
    page: 1,
    cari: '',
    items: [],
    counts: { semua: 0 },
    kelompok: sampahKelompokList(),
    total: 0,
    loading: false,
    error: null,
    busy: null,
  });
});

describe('guard halaman Sampah', () => {
  it('role 3: akses ditolak, isi halaman tidak dirender', () => {
    const html = render(3);
    expect(html).toContain('Akses ditolak');
    expect(html).not.toContain('role="tablist"');
  });

  it('role 0 & 1: judul + keterangan retensi 30 hari + penjelasan Pulihkan', () => {
    for (const role of [0, 1]) {
      const html = render(role);
      expect(html).not.toContain('Akses ditolak');
      expect(html).toContain('Sampah');
      expect(html).toContain('selama 30 hari sebelum terhapus permanen otomatis');
      expect(html).toContain('Pustaka File');
    }
  });
});

describe('bar tab kelompok', () => {
  it('semua kelompok tampil dengan jumlah, termasuk 0; tab aktif ditandai', () => {
    sampahState.counts = { semua: 3, PPID: 2, lainnya: 1 };
    const html = render(1);
    expect(html).toContain('Semua (3)');
    expect(html).toContain('PPID (2)');
    expect(html).toContain('Lainnya (1)');
    for (const k of sampahKelompokList().filter((k) => !['PPID', 'lainnya'].includes(k.id))) {
      expect(html).toContain(`${k.nama} (0)`);
    }
    expect(html.match(/role="tab"/g)).toHaveLength(sampahKelompokList().length + 1);
    expect(html).toMatch(/aria-selected="true"[^>]*data-kelompok="semua"/);
  });
});

describe('daftar item', () => {
  it('empty state per tab; Kosongkan nonaktif bila kelompok kosong', () => {
    Object.assign(sampahState, { kelompokAktif: 'PPID', counts: { semua: 1, PPID: 0 } });
    const html = render(1);
    expect(html).toContain('data-testid="sampah-kosong"');
    expect(html).toContain('Sampah PPID kosong');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>(?:(?!<\/button>).)*Kosongkan/);
  });

  it('memuat pertama → skeleton', () => {
    sampahState.loading = true;
    expect(render(1)).toContain('data-testid="sampah-skeleton"');
  });

  it('item merender judul, asal, ukuran, tanggal hapus, sisa hari, dan aksi', () => {
    Object.assign(sampahState, { items: [item()], counts: { semua: 1, PPID: 1 }, total: 1 });
    const html = render(1);
    expect(html).toContain('sk-ppid.pdf');
    expect(html).toContain('PPID › Profil PPID');
    expect(html).toContain('2 KB · Dihapus 10 Nov 2026');
    expect(html).toContain('Sisa 5 hari');
    expect(html).toContain('Pulihkan');
    expect(html).toContain('Hapus permanen');
    expect(html).toContain('aria-label="Pratinjau sk-ppid.pdf"');
    expect(html).not.toContain('data-testid="sampah-kosong"');
  });

  it('gambar → thumbnail dari pratinjauUrl; banyak halaman → pagination', () => {
    Object.assign(sampahState, {
      items: [item({ kategori: 'image', mimeType: 'image/png', judul: 'foto.png' })],
      counts: { semua: 45 },
      total: 45,
    });
    const html = render(1);
    expect(html).toContain('src="/api/pengaturan/sampah/file%3Af1/pratinjau"');
    expect(html).toContain('mantine-Pagination-root');
  });
});
