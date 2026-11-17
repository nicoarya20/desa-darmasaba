// @vitest-environment node
// Halaman publik PUSTU: isi detail lengkap (info, jam, kontak darurat, medsos, layanan, prosedur, tarif BPJS vs
// umum, struktur, galeri) dan minimal (bagian kosong disembunyikan), kartu daftar, form admin memuat field baru.
// jsdom rusak di repo ini → renderToStaticMarkup; DOMPurify (butuh DOM) diganti sanitize-html dengan allowlist sama.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('dompurify', async () => {
  const sanitizeHtml = (await import('sanitize-html')).default;
  return {
    default: {
      sanitize: (html: string, opsi: { ALLOWED_TAGS: string[] }) =>
        sanitizeHtml(html, { allowedTags: opsi.ALLOWED_TAGS, allowedAttributes: {} }),
    },
  };
});
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: {} } }));
// Editor tiptap tidak bisa dirender di server tanpa DOM; cukup tandai posisinya.
vi.mock('@/app/admin/(dashboard)/_com/createEditor', () => ({ default: () => <div data-testid="editor" /> }));

import PustuFormFields from '@/app/admin/(dashboard)/kesehatan/puskesmas/_com/pustu.form-fields';
import PustuKontenFields from '@/app/admin/(dashboard)/kesehatan/puskesmas/_com/pustu.konten-fields';
import { FORM_PUSTU_KOSONG } from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.form';
import PustuDetailBody from '@/app/(public)/(pages)/kesehatan/puskesmas/_com/detail/PustuDetailBody';
import { PustuCard } from '@/app/(public)/(pages)/kesehatan/puskesmas/_com/PustuListPage';
import type { PustuDetail } from '@/lib/pustu/pustu.types';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const noop = () => {};

// test-only: data rekaan.
const minimal: PustuDetail = {
  id: 'pu1',
  name: 'PUSTU Contoh',
  alamat: 'Jl. Contoh No. 1, Banjar Contoh',
  imageId: null,
  image: null,
  jadwal: [],
  kontak: { kontakPuskesmas: null, email: null, kontakUGD: null },
  mediaSosial: [],
  layananUnggulan: [],
  linkPetunjukArah: null,
  prosedurPendaftaran: null,
  tarifBpjs: null,
  tarifUmum: '<p></p>',
  fotoBaganStrukturId: null,
  fotoBaganStruktur: null,
  pengurus: [],
  fotoKegiatan: [],
};

// test-only: data rekaan.
const lengkap: PustuDetail = {
  ...minimal,
  imageId: 'img1',
  image: { id: 'img1', link: '/api/img/gedung.jpg' },
  jadwal: [
    { hari: 'Senin – Kamis', jam: '08.00 – 14.00 WITA' },
    { hari: 'Jumat – Sabtu', jam: '08.00 – 12.00 WITA' },
  ],
  kontak: { kontakPuskesmas: '0361 000 111', email: 'pustu@contoh.id', kontakUGD: '081200001111' },
  mediaSosial: [{ platform: 'facebook', url: 'https://www.facebook.com/pustu.contoh' }],
  layananUnggulan: [
    { judul: 'Imunisasi', deskripsi: 'Imunisasi rutin balita.' },
    { judul: 'Pemantauan KIA', deskripsi: null },
  ],
  linkPetunjukArah: 'https://maps.app.goo.gl/Contoh123',
  prosedurPendaftaran: '<ol><li>Ambil nomor antrean</li></ol><script>alert(1)</script>',
  tarifBpjs: '<p><strong>Gratis (Rp 0)</strong></p>',
  tarifUmum: '<p>Rp 10.000 per kunjungan</p>',
  fotoBaganStrukturId: 'bagan1',
  fotoBaganStruktur: { id: 'bagan1', link: '/api/img/bagan.jpg' },
  pengurus: [{ id: 'p1', nama: 'Kepala Contoh', jabatan: 'Kepala PUSTU', urutan: 0, imageId: null, image: null }],
  fotoKegiatan: [{ id: 'f1', imageId: 'g1', keterangan: 'Posyandu lansia', urutan: 0, image: { id: 'g1', link: '/api/img/kegiatan.jpg' } }],
};

describe('detail publik PUSTU', () => {
  it('lengkap: info, jam, kontak + darurat, medsos, peta, layanan, prosedur, tarif dua kolom, struktur, galeri', () => {
    const html = render(<PustuDetailBody data={lengkap} />);
    expect(html).toContain('PUSTU (Puskesmas Pembantu)');
    expect(html).toContain('<h1');
    expect(html).toContain('PUSTU Contoh');
    expect(html).toContain('Senin – Kamis');
    expect(html).toContain('08.00 – 12.00 WITA');
    expect(html).toContain('Kontak Darurat / Ambulans');
    expect(html).toContain('href="tel:');
    expect(html).toContain('href="mailto:pustu@contoh.id"');
    expect(html).toContain('href="https://www.facebook.com/pustu.contoh"');
    expect(html).toContain('href="https://maps.app.goo.gl/Contoh123"');
    expect(html).toContain('Imunisasi rutin balita.');
    expect(html).toContain('Pemantauan KIA');
    expect(html).toContain('<li>Ambil nomor antrean</li>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('Pasien JKN / BPJS Kesehatan / KIS');
    expect(html).toContain('Pasien Umum (Non-BPJS)');
    expect(html).toContain('<strong>Gratis (Rp 0)</strong>');
    expect(html).toContain('Kepala Contoh');
    expect(html).toContain('/api/img/bagan.jpg');
    expect(html).toContain('data-testid="galeri-pustu"');
  });

  it('minimal: hanya nama + alamat; bagian kosong (jam, kontak, layanan, prosedur, tarif, struktur, galeri) disembunyikan', () => {
    const html = render(<PustuDetailBody data={minimal} />);
    expect(html).toContain('PUSTU Contoh');
    expect(html).toContain('Jl. Contoh No. 1, Banjar Contoh');
    for (const judul of ['Jam Operasional', 'Kontak Darurat', 'Layanan Unggulan', 'Prosedur Pendaftaran', 'Tarif Layanan', 'Struktur Organisasi', 'Galeri PUSTU']) {
      expect(html).not.toContain(judul);
    }
    expect(html).not.toContain('Buka di Google Maps');
    expect(html).not.toContain('<figure');
  });

  it('tarif hanya umum terisi → kolom BPJS tidak dirender', () => {
    const html = render(<PustuDetailBody data={{ ...minimal, tarifUmum: '<p>Rp 10.000</p>' }} />);
    expect(html).toContain('Tarif Layanan');
    expect(html).toContain('Pasien Umum (Non-BPJS)');
    expect(html).not.toContain('Pasien JKN');
  });
});

describe('kartu daftar PUSTU', () => {
  it('menampilkan nama, alamat, jam, telepon, dan tautan detail', () => {
    const html = render(<ul><PustuCard item={lengkap} /></ul>);
    expect(html).toContain('PUSTU Contoh');
    expect(html).toContain('Senin – Kamis: 08.00 – 14.00 WITA');
    expect(html).toContain('Telepon: 0361 000 111');
    expect(html).toContain('href="/kesehatan/puskesmas/pu1"');
  });
});

describe('form admin PUSTU', () => {
  it('memuat field profil (jam, kontak darurat, medsos, peta, layanan) dan konten (prosedur, tarif, bagan)', () => {
    const profil = render(<PustuFormFields value={{ ...FORM_PUSTU_KOSONG, jadwal: [{ hari: '', jam: '' }] }} onChange={noop} fotoBaru={null} onFotoBaru={noop} />);
    for (const label of ['Nama PUSTU', 'Alamat Lengkap', 'Jam Operasional', 'Kontak Darurat / Ambulans', 'Link Media Sosial', 'Link Google Maps', 'Layanan Unggulan']) {
      expect(profil).toContain(label);
    }
    expect(profil).toContain('aria-label="Hari 1"');
    const konten = render(<PustuKontenFields value={FORM_PUSTU_KOSONG} onChange={noop} baganBaru={null} onBaganBaru={noop} />);
    for (const label of ['Prosedur Pendaftaran', 'Tarif Pasien JKN / BPJS', 'Tarif Pasien Umum (Non-BPJS)', 'Foto Bagan Struktur']) {
      expect(konten).toContain(label);
    }
    expect(konten.split('data-testid="editor"').length - 1).toBe(3);
  });
});
