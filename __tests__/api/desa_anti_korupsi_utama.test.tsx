// @vitest-environment node
// Halaman utama Desa Anti Korupsi (/desa-anti-korupsi): gaya section beranda, tetapi SEMUA indikator
// tampil, tiap butir membuka halaman programnya dan nama kategori membuka halaman detail per kategori.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup (hover/klik diverifikasi manual).
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AntiKorupsiUtama } from '@/app/(public)/(tambahan)/desa-anti-korupsi/_com/AntiKorupsiUtama';
import { buildAntiKorupsiUtamaView } from '@/app/(public)/(tambahan)/desa-anti-korupsi/_lib/antikorupsi-utama.logic';
import type { AntiKorupsiApiItem } from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.logic';
import { ANTIKORUPSI_LIMIT } from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.meta';

// test-only: 8 indikator (> batas beranda 6) berbentuk item ringkas desaAntikorupsi.findMany.
const item = (id: string, name: string, kategoriId: string, kategori: string, jumlahDokumen?: number): AntiKorupsiApiItem => ({
  id,
  name,
  kategoriId,
  kategori: { name: kategori },
  ...(jumlahDokumen === undefined ? {} : { jumlahDokumen }),
});
const items: AntiKorupsiApiItem[] = [
  item('a', '1.1 ADANYA PERDES', 'k1', 'PENGUATAN TATA LAKSANA', 3),
  item('b', '1.2 ADANYA SOP', 'k1', 'PENGUATAN TATA LAKSANA', 0),
  item('c', '2.1 PENGAWASAN BPD', 'k2', 'PENGUATAN PENGAWASAN', 2),
  item('d', '2.2 PENGAWASAN WARGA', 'k2', 'PENGUATAN PENGAWASAN', 1),
  item('e', '3.1 MAKLUMAT PELAYANAN', 'k3', 'PENGUATAN KUALITAS PELAYANAN PUBLIK', 4),
  item('f', '4.1 MUSYAWARAH DESA', 'k4', 'PENGUATAN PARTISIPASI MASYARAKAT', 0),
  item('g', '5.1 BUDAYA LOKAL', 'k5', 'KEARIFAN LOKAL'),
  item('h', '5.2 TOKOH ADAT', 'k5', 'KEARIFAN LOKAL', 5),
];

// MantineProvider menyisipkan <style> global; dibuang agar tersisa markup komponen saja.
const render = (node: ReactNode) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('buildAntiKorupsiUtamaView', () => {
  const view = buildAntiKorupsiUtamaView(items);

  it('mengelompokkan SEMUA indikator tanpa batas beranda', () => {
    expect(items.length).toBeGreaterThan(ANTIKORUPSI_LIMIT);
    expect(view.groups.map((g) => g.id)).toEqual(['k1', 'k2', 'k3', 'k4', 'k5']);
    expect(view.groups.flatMap((g) => g.items.map((i) => i.id))).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
  });

  it('ringkasan: jumlah kategori, indikator, dan total dokumen (tanpa angka dihitung 0)', () => {
    expect(view.ringkasan).toEqual({ kategori: 5, indikator: 8, dokumen: 15 });
  });

  it('jumlahDokumen tiap butir ikut terbawa', () => {
    expect(view.groups[0].items.map((i) => i.jumlahDokumen)).toEqual([3, 0]);
    expect(view.groups[4].items[0].jumlahDokumen).toBeUndefined();
  });

  it('tautan kategori memakai nama kategori asli ke halaman detail', () => {
    expect(view.kategoriLinks.k1).toBe('/desa-anti-korupsi/detail?kategori=PENGUATAN%20TATA%20LAKSANA');
  });

  it('data kosong → tanpa grup dan ringkasan nol', () => {
    expect(buildAntiKorupsiUtamaView([])).toEqual({
      groups: [],
      ringkasan: { kategori: 0, indikator: 0, dokumen: 0 },
      kategoriLinks: {},
    });
  });
});

describe('AntiKorupsiUtama — render', () => {
  const html = render(<AntiKorupsiUtama view={buildAntiKorupsiUtamaView(items)} loading={false} />);

  it('judul halaman h1 + ringkasan angka di bawah lead', () => {
    expect(html).toMatch(/<h1[^>]*>Desa Anti Korupsi<\/h1>/);
    expect(html).toContain('5 kategori · 8 indikator · 15 dokumen');
  });

  it('setiap indikator bertaut ke halaman programnya', () => {
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(html).toContain(`href="/desa-anti-korupsi/program/${id}"`);
    }
  });

  it('nama kategori bertaut ke detail?kategori= dengan petunjuk "Lihat dokumen"', () => {
    expect(html).toContain('href="/desa-anti-korupsi/detail?kategori=KEARIFAN%20LOKAL"');
    expect(html.match(/Lihat dokumen/g)).toHaveLength(5);
  });

  it('badge jumlah dokumen & teks redup untuk 0 dokumen', () => {
    expect(html).toContain('3 dokumen');
    expect(html.match(/Belum ada dokumen/g)).toHaveLength(2);
  });

  it('tidak ada tombol "Selengkapnya" di halaman utama', () => {
    expect(html).not.toContain('Selengkapnya');
  });

  it('loading → skeleton beranda tanpa ringkasan; data kosong → pesan kosong beranda', () => {
    const loadingHtml = render(<AntiKorupsiUtama view={buildAntiKorupsiUtamaView([])} loading />);
    expect(loadingHtml).toContain('aria-busy="true"');
    expect(loadingHtml).toContain('Memuat indikator desa anti korupsi');
    expect(loadingHtml).not.toContain('kategori ·');

    const emptyHtml = render(<AntiKorupsiUtama view={buildAntiKorupsiUtamaView([])} loading={false} />);
    expect(emptyHtml).toContain('Belum ada indikator desa anti korupsi.');
    expect(emptyHtml).not.toContain('kategori ·');
  });
});
