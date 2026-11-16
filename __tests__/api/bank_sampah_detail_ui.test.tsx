// @vitest-environment node
// Modal detail Bank Sampah publik (tab Profil/Struktur/Dokumentasi dengan data & state kosong) dan form admin
// memuat field detail baru. Tombol "Lihat detail" per baris lokasi diuji di lingkungan_bank-sampah_ui.test.tsx.
// jsdom rusak di repo ini → renderToStaticMarkup; klik tidak diuji.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="peta" /> }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: {} } }));

import BankSampahDetailContent, {
  type TabBankSampah,
} from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/bank-sampah.detail-content';
import BankSampahFormFields from '@/app/admin/(dashboard)/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/_com/bank-sampah.form-fields';
import { FORM_BANK_SAMPAH_KOSONG } from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.form';
import type { BankSampahDetail } from '@/lib/bank-sampah/bank-sampah.types';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;
const noop = () => {};

// test-only: data rekaan.
const kosong: BankSampahDetail = {
  id: 'bs1',
  name: 'TPS Contoh',
  alamat: 'Jl. Contoh No. 1',
  namaTempatMaps: 'TPS Contoh',
  linkPetunjukArah: 'https://www.google.com/maps/dir/?api=1&destination=-8.6,115.2',
  lat: -8.6,
  lng: 115.2,
  deskripsi: null,
  kontak: null,
  mediaSosial: [],
  fotoBaganStrukturId: null,
  fotoBaganStruktur: null,
  pengurus: [],
  fotoKegiatan: [],
  programInovasi: [],
};
const lengkap: BankSampahDetail = {
  ...kosong,
  deskripsi: 'Pengelolaan sampah berbasis masyarakat.',
  kontak: '081200001111 (Admin TPS)',
  linkPetunjukArah: 'https://maps.app.goo.gl/Contoh123',
  mediaSosial: [{ platform: 'instagram', url: 'https://www.instagram.com/akun_contoh' }],
  fotoBaganStrukturId: 'bagan',
  fotoBaganStruktur: { id: 'bagan', link: '/api/img/bagan.webp' },
  pengurus: [
    { id: 'p1', nama: 'Ketua Contoh', jabatan: 'Ketua', urutan: 0, imageId: null, image: null },
    { id: 'p2', nama: 'Bendahara Contoh', jabatan: 'Bendahara', urutan: 1, imageId: 'f', image: { id: 'f', link: '/api/img/f.webp' } },
  ],
  fotoKegiatan: [{ id: 'g1', imageId: 'i1', keterangan: 'Pemilahan sampah', urutan: 0, image: { id: 'i1', link: '/api/img/i1.webp' } }],
  programInovasi: [{ id: 'inov-1', name: 'Inovasi Contoh' }],
};

const tab = (data: BankSampahDetail, t: TabBankSampah) => render(<BankSampahDetailContent data={data} tabAwal={t} />);

describe('modal detail bank sampah', () => {
  it('ketiga tab tersedia sebagai tablist', () => {
    const html = tab(lengkap, 'profil');
    expect(html).toContain('role="tablist"');
    for (const label of ['Profil', 'Struktur', 'Dokumentasi']) expect(html).toContain(`>${label}</span>`);
  });

  it('Profil: deskripsi, alamat + Google Maps, kontak tel/wa, medsos, inovasi tertaut ke detail program', () => {
    const html = tab(lengkap, 'profil');
    expect(html).toContain('Pengelolaan sampah berbasis masyarakat.');
    expect(html).toContain('href="https://maps.app.goo.gl/Contoh123"');
    expect(html).toContain('Buka di Google Maps');
    expect(html).toContain('href="tel:+6281200001111"');
    expect(html).toContain('href="https://wa.me/6281200001111"');
    expect(html).toContain('href="https://www.instagram.com/akun_contoh"');
    expect(html).toContain('aria-label="Instagram (buka di tab baru)"');
    expect(html).toContain('href="/program-inovasi/inov-1"');
    expect(html).not.toContain('Profil lengkap bank sampah ini belum tersedia.');
  });

  it('Profil kosong: alamat tetap tampil + pesan sopan; tombol Maps memakai rute koordinat', () => {
    const html = tab(kosong, 'profil');
    expect(html).toContain('Jl. Contoh No. 1');
    expect(html).toContain('href="https://www.google.com/maps/dir/?api=1&amp;destination=-8.6,115.2"');
    expect(html).toContain('Profil lengkap bank sampah ini belum tersedia.');
    expect(html).not.toContain('data-testid="kontak-link"');
  });

  it('Struktur: bagan lalu kartu pengurus; kosong → pesan sopan', () => {
    const html = tab(lengkap, 'struktur');
    expect(html).toContain('alt="Bagan struktur organisasi TPS Contoh"');
    expect(count(html, 'data-testid="pengurus-card"')).toBe(2);
    expect(html).toContain('Bendahara Contoh');
    expect(tab(kosong, 'struktur')).toContain('Struktur organisasi belum tersedia.');
  });

  it('Dokumentasi: galeri dengan keterangan; kosong → pesan sopan', () => {
    const html = tab(lengkap, 'dokumentasi');
    expect(count(html, 'data-testid="galeri-foto-item"')).toBe(1);
    expect(html).toContain('Pemilahan sampah');
    expect(tab(kosong, 'dokumentasi')).toContain('Dokumentasi kegiatan belum tersedia.');
  });
});

describe('form admin bank sampah', () => {
  it('memuat field detail baru', () => {
    const html = render(
      <BankSampahFormFields
        value={{ ...FORM_BANK_SAMPAH_KOSONG, mediaSosial: [{ platform: 'instagram', url: 'akun' }] }}
        onChange={noop}
        baganBaru={null}
        onBaganBaru={noop}
      />,
    );
    for (const label of ['Deskripsi', 'Kontak', 'Media Sosial', 'Inovasi di TPS', 'Link Google Maps', 'Foto Bagan Struktur Organisasi (opsional)']) {
      expect(html).toContain(label);
    }
    expect(html).toContain('aria-label="URL media sosial 1"');
    expect(html).toContain('URL harus diawali http:// atau https://');
    expect(html).toContain('data-testid="lokasi-input"');
  });
});
