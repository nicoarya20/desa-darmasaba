// @vitest-environment node
// Halaman Polsek Terdekat: semua polsek urut jarak, call-first, satu iframe peta, tanpa badge/teks "-" palsu.
// jsdom rusak di repo ini → markup via renderToStaticMarkup; interaksi (pilih peta, gulir) dicek manual.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

import { PolsekTerdekatView } from '@/app/(public)/(pages)/keamanan/polsek-terdekat/_com/PolsekTerdekatPage';
import type { PolsekTerdekat } from '@/app/(public)/(pages)/keamanan/polsek-terdekat/_com/polsek.logic';
import { POLSEK_TEXT as T } from '@/app/(public)/(pages)/keamanan/polsek-terdekat/_com/polsek.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;
const noop = () => {};
const embed = (name: string) => `https://www.google.com/maps/embed?pb=!1m18!2s${name}`; // test-only
const layanan = [
  { layanan: { nama: 'Layanan Administrasi &amp; Surat-Menyurat'.replace('&amp;', '&') } },
  { layanan: { nama: 'Penanganan Laporan & Pengaduan' } },
];

// test-only: mirip data stg (4 polsek, Ahmad Yani tanpa telepon/jam), urutan API = createdAt desc.
const items: PolsekTerdekat[] = [
  {
    id: 'ahmad-yani',
    nama: 'Pos Polisi Ahmad Yani',
    jarakKeDesa: '7 Km',
    alamat: 'Jl. Ahmad Yani Utara No.5, Peguyangan',
    nomorTelepon: '-',
    jamOperasional: '-',
    embedMapUrl: embed('AhmadYani'),
    namaTempatMaps: 'Pos Polisi Simpang Ahmad Yani',
    linkPetunjukArah: 'https://maps.app.goo.gl/D8HGs4mSAQqJm9KRA',
    LayananToPolsek: layanan,
  },
  {
    id: 'mengwi',
    nama: 'Polsek Mengwi',
    jarakKeDesa: '9,7 Km',
    alamat: 'Jl. I Gusti Ngurah Rai No.110, Mengwi',
    nomorTelepon: '0361411270',
    jamOperasional: 'Buka 24 Jam',
    embedMapUrl: embed('Mengwi'),
    linkPetunjukArah: 'https://maps.app.goo.gl/cJD44NSUdpA7Ly2m6',
    LayananToPolsek: layanan,
  },
  {
    id: 'polres',
    nama: 'Polres Badung',
    jarakKeDesa: '5,8 Km',
    alamat: 'Jl. Kebo Iwa No.1, Mengwitani',
    nomorTelepon: '0361829949',
    jamOperasional: 'Buka 24 Jam',
    embedMapUrl: embed('PolresBadung'),
    namaTempatMaps: 'Polres Badung',
    alamatMaps: 'Jl. Kebo Iwa No.1, Mengwitani, Kec. Mengwi',
    linkPetunjukArah: 'https://maps.app.goo.gl/7yQQod4PFhpqqe7Z8',
    LayananToPolsek: layanan,
  },
  {
    id: 'abiansemal',
    nama: 'Kantor Polisi Abian Semal',
    jarakKeDesa: '9,6 Km',
    alamat: 'Abiansemal, Badung',
    nomorTelepon: '0361813972',
    jamOperasional: 'Senin-Jumat 08.00-16.00',
    embedMapUrl: embed('AbianSemal'),
    namaTempatMaps: 'Abian Semal Police Station',
    linkPetunjukArah: 'https://maps.app.goo.gl/GhHVNQqffNrXSMFX7',
    LayananToPolsek: layanan,
  },
];

const listHtml = (html: string) => html.slice(html.indexOf(`aria-label="${T.listLabel}"`), html.indexOf('id="peta-polsek"'));

describe('PolsekTerdekatView (siap)', () => {
  const html = render(<PolsekTerdekatView state={{ status: 'ready', items }} onRetry={noop} />);
  const list = listHtml(html);

  it('judul h1, semua 4 polsek tampil sekaligus tanpa paginasi dan tanpa tautan "semua polsek"', () => {
    expect(html).toMatch(new RegExp(`<h1[^>]*>${T.title}</h1>`));
    expect(count(list, '<li')).toBe(4);
    expect(html).not.toContain('mantine-Pagination');
    expect(html).not.toContain('semua-polsek');
  });

  it('urut jarak terdekat; hanya baris pertama berlabel Terdekat', () => {
    const order = ['Polres Badung', 'Pos Polisi Ahmad Yani', 'Kantor Polisi Abian Semal', 'Polsek Mengwi'].map((n) =>
      list.indexOf(n),
    );
    expect(order.every((pos, i) => pos > -1 && (i === 0 || pos > order[i - 1]))).toBe(true);
    expect(count(html, `>${T.nearest}</span>`)).toBe(1);
    expect(list.indexOf(T.nearest)).toBeLessThan(list.indexOf('Pos Polisi Ahmad Yani'));
    expect(list).toContain(`aria-label="${T.distanceLabel('5,8', 'km')}"`);
  });

  it('nomor bisa diketuk (tel:+62, tanpa tab baru); polsek tanpa nomor tidak menampilkan "-"', () => {
    expect(list).toContain('href="tel:+62361829949"');
    expect(list).toContain('href="tel:+62361411270"');
    expect(list).toContain('href="tel:+62361813972"');
    expect(count(list, 'href="tel:')).toBe(3);
    expect(list).not.toMatch(/href="tel:[^"]*"[^>]*target=/);
    expect(list).not.toContain('wa.me');
    expect(html).not.toMatch(/>\s*-\s*</);
  });

  it('badge "Buka 24 jam" hanya untuk jam 24 jam; jam lain tampil apa adanya; tanpa badge "Buka" palsu', () => {
    expect(count(list, T.open24)).toBe(2);
    expect(list).toContain('Senin-Jumat 08.00-16.00');
    expect(html).not.toMatch(/>Buka</);
  });

  it('Petunjuk arah per polsek: tab baru, noopener', () => {
    expect(count(list, 'href="https://maps.app.goo.gl/')).toBe(4);
    expect(list).toContain(
      'href="https://maps.app.goo.gl/7yQQod4PFhpqqe7Z8" target="_blank" rel="noopener noreferrer"',
    );
  });

  it('SATU iframe peta (lazy, ber-title) untuk polsek terdekat, bukan iframe per kartu', () => {
    expect(count(html, '<iframe')).toBe(1);
    expect(html).toContain(`src="${embed('PolresBadung')}"`);
    expect(html).toContain(`title="${T.mapFrameTitle('Polres Badung')}"`);
    expect(html).toMatch(/<iframe[^>]*loading="lazy"/);
    expect(count(list, `aria-controls="peta-polsek"`)).toBe(4);
    expect(list).toMatch(/aria-pressed="true"[^>]*aria-label="Tampilkan Polres Badung di peta"/);
  });

  it('panel peta: pemilih 4 polsek, alamat Maps, layanan, Petunjuk arah', () => {
    expect(html).toContain(`aria-label="${T.mapPickerLabel}"`);
    const map = html.slice(html.indexOf('id="peta-polsek"'));
    expect(count(map, 'aria-pressed=')).toBe(4);
    expect(map).toContain('Jl. Kebo Iwa No.1, Mengwitani, Kec. Mengwi');
    expect(map).toContain('Penanganan Laporan &amp; Pengaduan');
    expect(map).not.toContain(T.mapsName); // namaTempatMaps sama dengan nama → tidak diulang
  });
});

describe('PolsekTerdekatView (keadaan lain)', () => {
  it('memuat → kerangka aria-busy, tanpa peta', () => {
    const html = render(<PolsekTerdekatView state={{ status: 'loading' }} onRetry={noop} />);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('<iframe');
  });

  it('galat API → pesan + Coba lagi (bukan daftar kosong)', () => {
    const html = render(<PolsekTerdekatView state={{ status: 'error' }} onRetry={noop} />);
    expect(html).toContain('role="alert"');
    expect(html).toContain(T.error);
    expect(html).toContain(T.retry);
    expect(html).not.toContain(T.empty);
  });

  it('kosong → pesan jujur, tanpa peta', () => {
    const html = render(<PolsekTerdekatView state={{ status: 'ready', items: [] }} onRetry={noop} />);
    expect(html).toContain(T.empty);
    expect(html).not.toContain('<iframe');
  });

  it('satu polsek tanpa jarak/peta/arah: tanpa label Terdekat, pemilih, iframe, ataupun tombol peta', () => {
    const one: PolsekTerdekat = { id: 'x', nama: 'Pos Polisi Contoh', jarakKeDesa: '-', embedMapUrl: '-', linkPetunjukArah: '' };
    const html = render(<PolsekTerdekatView state={{ status: 'ready', items: [one] }} onRetry={noop} />);
    expect(html).toContain('Pos Polisi Contoh');
    expect(html).not.toContain(`>${T.nearest}</span>`);
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain(T.showOnMap);
    expect(html).not.toContain(T.directions);
  });
});
