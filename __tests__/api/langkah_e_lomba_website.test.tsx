// @vitest-environment node
// Perbaikan kecil persiapan Lomba Website Desa 2027: kontak resmi kantor desa + pengelola website di footer,
// kontak PPID tanpa nomor contoh, tab statistik Posyandu disembunyikan.
// (Angka penduduk miskin tahun terbaru diuji di ekonomi_jumlah_penduduk_miskin_*.test.*.)
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FooterKontakDesa } from '@/app/(public)/_com/FooterKontakDesa';
import { DaftarKontak } from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/DaftarKontak';
import {
  POSYANDU_TABS,
  POSYANDU_TABS_TAMPIL,
  POSYANDU_TABS_TERSEMBUNYI,
  RINGKASAN_STATISTIK_TAMPIL,
} from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.meta';
import stateKontakDesa from '@/app/admin/(dashboard)/_state/desa/kontakDesa';
import { PENGELOLA_WEBSITE } from '@/con/kontak-desa';

// test-only: kontak desa seperti dikirim API (sumber data footer & PPID kini state CMS, bukan konstanta kode).
const KONTAK_DESA = {
  id: 'kontak-desa',
  namaKantor: 'Kantor Perbekel Desa Darmasaba',
  alamat: 'Jl. Raya Darmasaba – Lukluk, Desa Darmasaba, Kec. Abiansemal, Kab. Badung, Bali 80352',
  telepon: '(0361) 8441518',
  email: 'ddarmasaba@gmail.com',
  updatedAt: '2026-11-19T00:00:00.000Z',
};
Object.assign(stateKontakDesa.findUnique, { data: KONTAK_DESA, loaded: true });

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('Footer: kontak kantor desa & pengelola website', () => {
  const html = render(<FooterKontakDesa />);

  it('menampilkan alamat, telepon (tautan tel:), dan email (tautan mailto:) resmi', () => {
    expect(html).toContain('Kontak Kantor Desa');
    expect(html).toContain(KONTAK_DESA.alamat);
    expect(html).toContain('href="tel:+623618441518"');
    expect(html).toContain(`href="mailto:${KONTAK_DESA.email}"`);
  });

  it('mencantumkan pengelola website; tanpa nama redaksi selama SK belum diterima', () => {
    expect(html).toContain(`Pengelola website: ${PENGELOLA_WEBSITE.lembaga}`);
    expect(PENGELOLA_WEBSITE.timRedaksi).toHaveLength(0);
    expect(html).not.toContain(' (');
  });
});

describe('Kontak PPID (Daftar Informasi Publik)', () => {
  const html = render(<DaftarKontak />);

  it('memakai email & telepon resmi kantor desa, tanpa nomor WhatsApp contoh', () => {
    expect(html).toContain(KONTAK_DESA.email);
    expect(html).toContain(KONTAK_DESA.telepon);
    expect(html).not.toContain('081-xxx');
    expect(html).not.toContain('ppid@desadarmasaba.id');
  });
});

describe('Posyandu: tab & kartu statistik disembunyikan sementara', () => {
  it('tab Balita & Ibu Hamil tidak tampil, Ringkasan & Data Posyandu tetap', () => {
    expect(POSYANDU_TABS_TERSEMBUNYI).toEqual(['balita', 'ibu-hamil']);
    expect(POSYANDU_TABS_TAMPIL).toEqual(['ringkasan', 'posyandu']);
    expect(POSYANDU_TABS).toHaveLength(4);
  });

  it('kartu angka gabungan di Ringkasan dimatikan', () => {
    expect(RINGKASAN_STATISTIK_TAMPIL).toBe(false);
  });
});
