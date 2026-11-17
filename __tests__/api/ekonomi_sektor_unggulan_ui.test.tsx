// @vitest-environment node
// Sektor Unggulan Desa publik: panel peringkat stat-bars (angka polos, tanpa "Ton"/persen), rincian deskripsi, keadaan muat/kosong/galat, tautan Potensi.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { PotensiLink } from '@/app/(public)/(pages)/ekonomi/sektor-unggulan-desa/_com/PotensiLink';
import { SektorUnggulanContent } from '@/app/(public)/(pages)/ekonomi/sektor-unggulan-desa/_com/SektorUnggulanContent';
import { toSektor, type Sektor, type SektorApiItem } from '@/app/(public)/(pages)/ekonomi/sektor-unggulan-desa/_com/sektor-unggulan.logic';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';

vi.mock('next-view-transitions', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: bentuk entri stg 2026-11-16; sanitize diganti identitas karena DOMPurify butuh DOM.
const sektor = (over: Partial<SektorApiItem> & { id: string; name: string }): Sektor =>
  toSektor(
    { description: `<p>Deskripsi ${over.name}</p>`, value: 10, satuan: null, periode: null, updatedAt: '2026-04-14T02:00:00.000Z', ...over },
    (html) => html,
  );
const ready = (items: Sektor[]): LoadState<Sektor[]> => ({ status: 'ready', data: items });
const content = (state: LoadState<Sektor[]>) => render(<SektorUnggulanContent state={state} />);

describe('SektorUnggulanContent', () => {
  const stg = [
    sektor({ id: '1', name: 'Kawasan Kuliner', value: 15 }),
    sektor({ id: '2', name: 'Pertanian', value: 90 }),
    sektor({ id: '3', name: 'Pariwisata', value: 35 }),
  ];

  it('panel peringkat: judul, urut nilai tertinggi, angka polos tanpa "Ton" dan tanpa persen, tanggal pembaruan', () => {
    const html = content(ready(stg));
    expect(html).toContain('Peringkat sektor</h2>');
    expect(html).toContain('Data diperbarui 14 April 2026');
    const order = ['Pertanian', 'Pariwisata', 'Kawasan Kuliner'].map((name) => html.indexOf(`>${name}</span>`));
    expect(order.every((pos, i) => pos > 0 && (i === 0 || pos > order[i - 1]))).toBe(true);
    expect(html).toContain('>90</span>');
    expect(html).not.toMatch(/\bTon\b/);
    expect(html).not.toMatch(/>[^<]*%[^<]*</); // persen hanya boleh di style lebar batang, bukan teks
  });

  it('rincian: h3 nama + angka, deskripsi; sektor tanpa deskripsi tidak diulang', () => {
    const html = content(ready([...stg, sektor({ id: '4', name: 'Genteng', value: 25, description: '<p></p>' })]));
    expect(html).toContain('Tentang tiap sektor</h2>');
    expect(html).toContain('>Pertanian</h3>');
    expect(html).toContain('<p>Deskripsi Pertanian</p>');
    expect(html).not.toContain('>Genteng</h3>');
    expect(html).toContain('>Genteng</span>');
  });

  it('tanpa satu pun deskripsi → bagian rincian tidak dirender', () => {
    const html = content(ready([sektor({ id: '1', name: 'A', description: null })]));
    expect(html).not.toContain('Tentang tiap sektor');
  });

  it('nilai belum diisi → "Belum diisi" + catatan kaki', () => {
    const html = content(ready([...stg, sektor({ id: '5', name: 'Kosong', value: null })]));
    expect(html).toContain('Belum diisi');
    expect(html).toContain('1 sektor belum diisi nilainya');
  });

  it('memuat: kerangka aria-busy; kosong ≠ galat', () => {
    expect(content({ status: 'loading' })).toContain('aria-busy="true"');
    const empty = content(ready([]));
    expect(empty).toContain('akan tampil di sini');
    expect(empty).not.toContain('role="alert"');
    const error = content({ status: 'error' });
    expect(error).toContain('role="alert"');
    expect(error).toContain('gagal dimuat');
    expect(error).not.toContain('akan tampil di sini');
  });
});

describe('PotensiLink', () => {
  it('menaut ke /pemerintahan/potensi dengan teks "Lihat potensi desa"', () => {
    const html = render(<PotensiLink />);
    expect(html).toContain('href="/pemerintahan/potensi"');
    expect(html).toContain('Lihat potensi desa');
  });
});
