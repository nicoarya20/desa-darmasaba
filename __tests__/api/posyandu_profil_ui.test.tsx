// @vitest-environment node
// Halaman publik Posyandu setelah konten baru: deskripsi umum + 3 kartu klaster di tab Ringkasan (state kosong
// jujur), direktori banjar dengan alamat, detail dengan alamat & galeri foto lokasi/kader. Panel statistik tetap.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek/fetch tidak jalan di server).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}));

import { PosyanduDetailBody } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/detail/PosyanduDetail';
import type { PosyanduItem } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.source';
import { POSYANDU_TEXT as T } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.text';
import { PosyanduRows } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/PosyanduDirectory';
import { PosyanduPage } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/PosyanduPage';
import { ProfilPosyanduContent, ProfilPosyanduPanel } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/ProfilPosyandu';
import type { KlasterPosyanduItem, ProfilPosyanduData } from '@/lib/posyandu/posyandu-konten.types';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

// test-only: klaster & profil rekaan.
const klaster = (sasaran: KlasterPosyanduItem['sasaran'], extra: Partial<KlasterPosyanduItem> = {}): KlasterPosyanduItem => ({
  id: `k-${sasaran}`,
  sasaran,
  judul: `Posyandu ${sasaran} contoh`,
  deskripsi: `Fokus ${sasaran} contoh`,
  jamPelayanan: '09.00 WITA',
  urutan: 1,
  imageId: null,
  image: null,
  ...extra,
});
const profil: ProfilPosyanduData = {
  profil: { deskripsi: '<p>Wadah pemberdayaan masyarakat contoh.</p>', fungsiKegiatan: '<ul><li>Imunisasi contoh</li></ul>' },
  klaster: [klaster('balita'), klaster('remaja', { jamPelayanan: '18.00 WITA' }), klaster('lansia', { jamPelayanan: null, image: { id: 'g', link: '/api/img/lansia.webp' } })],
};
// test-only: posyandu banjar rekaan.
const posyandu = (id: string, extra: Partial<PosyanduItem> = {}): PosyanduItem => ({
  id,
  name: `Posyandu ${id}`,
  nomor: '0812-3456-789',
  deskripsi: '',
  jadwalPelayanan: '[{"hari":"senin","buka":"09:00","tutup":"11:00"}]',
  image: null,
  banjar: { id: 'b1', name: 'Banjar Contoh' },
  ...extra,
});

describe('Profil & klaster (tab Ringkasan)', () => {
  const html = render(<ProfilPosyanduContent data={profil} />);
  const out = text(html);

  it('deskripsi umum + fungsi & kegiatan utama dirender', () => {
    expect(out).toContain(T.profilTitle);
    expect(out).toContain('Wadah pemberdayaan masyarakat contoh.');
    expect(out).toContain(T.fungsiTitle);
    expect(html).toContain('<li>Imunisasi contoh</li>');
  });

  it('3 kartu klaster urut API: judul, fokus, jam; jam kosong ditulis jujur; gambar hanya bila ada', () => {
    expect([...html.matchAll(/data-sasaran="(\w+)"/g)].map((m) => m[1])).toEqual(['balita', 'remaja', 'lansia']);
    for (const s of ['balita', 'remaja', 'lansia']) {
      expect(out).toContain(`Posyandu ${s} contoh`);
      expect(out).toContain(`Fokus ${s} contoh`);
    }
    expect(out).toContain(T.jamLabel('09.00 WITA'));
    expect(out).toContain(T.jamLabel('18.00 WITA'));
    expect(out).toContain(T.jamKosong);
    expect(out).toContain('Lansia & PROLANIS');
    expect((html.match(/<img/g) ?? []).length).toBe(1);
  });

  it('profil belum diisi → hanya kartu klaster; semua kosong → pesan kosong', () => {
    const tanpaProfil = text(render(<ProfilPosyanduContent data={{ profil: null, klaster: profil.klaster }} />));
    expect(tanpaProfil).not.toContain(T.profilTitle);
    expect(tanpaProfil).toContain(T.klasterTitle);
    const kosong = text(render(<ProfilPosyanduContent data={{ profil: { deskripsi: '<p></p>', fungsiKegiatan: null }, klaster: [] }} />));
    expect(kosong).toContain(T.profilEmpty);
    expect(kosong).not.toContain(T.klasterTitle);
  });

  it('gagal dimuat → pesan + tombol coba lagi', () => {
    const out = text(render(<ProfilPosyanduPanel state={{ status: 'error' }} onRetry={vi.fn()} />));
    expect(out).toContain(T.profilFailed);
    expect(out).toContain(T.retry);
  });

  it('halaman: tab Ringkasan memuat profil; kartu statistik disembunyikan (RINGKASAN_STATISTIK_TAMPIL false)', () => {
    const page = render(<PosyanduPage />);
    expect(page.indexOf(`aria-label="${T.profilLoading}"`)).toBeGreaterThan(-1);
    expect(page).not.toContain(`aria-label="${T.statsLoading}"`);
  });
});

describe('Posyandu per banjar', () => {
  it('baris direktori menampilkan alamat bila ada', () => {
    const out = text(render(<PosyanduRows items={[posyandu('a', { alamat: 'Balai Banjar Contoh' }), posyandu('b')]} />));
    expect(out).toContain('Balai Banjar Contoh');
    expect(out.match(/Balai Banjar Contoh/g)?.length).toBe(1);
  });

  it('detail: alamat + galeri foto lokasi & kader (urut data)', () => {
    const foto = [
      { id: 'f1', imageId: 'i1', keterangan: 'Kader contoh', urutan: 0, image: { id: 'i1', link: '/api/img/f1.webp' } },
      { id: 'f2', imageId: 'i2', keterangan: null, urutan: 1, image: { id: 'i2', link: '/api/img/f2.webp' } },
    ];
    const html = render(<PosyanduDetailBody data={posyandu('a', { alamat: 'Balai Banjar Contoh', fotoKegiatan: foto })} />);
    const out = text(html);
    expect(out).toContain(`${T.infoAlamat} Balai Banjar Contoh`);
    expect(out).toContain(T.galeriTitle);
    expect(html.indexOf('/api/img/f1.webp')).toBeLessThan(html.indexOf('/api/img/f2.webp'));
    expect((html.match(/data-testid="galeri-foto-item"/g) ?? []).length).toBe(2);
  });

  it('detail tanpa alamat & galeri → "Alamat belum diisi", tanpa bagian galeri', () => {
    const out = text(render(<PosyanduDetailBody data={posyandu('b')} />));
    expect(out).toContain(T.alamatKosong);
    expect(out).not.toContain(T.galeriTitle);
  });
});
