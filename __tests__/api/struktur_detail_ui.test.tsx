// @vitest-environment node
// Profil pegawai dari bagan struktur (PPID, Perangkat Desa, BUMDes): satu komponen generik, baris kosong disembunyikan,
// avatar inisial saat tanpa foto; Alamat & Tanggal Masuk tidak lagi ditampilkan (keputusan coordinator, ADR fleksibel). jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup
// (effect tidak jalan, jadi komponen penampung hanya teruji di keadaan memuat).
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';

const ppid = vi.hoisted(() => ({
  pegawai: { findUnique: { load: vi.fn(async (): Promise<unknown> => null) } },
}));
vi.mock('@/app/admin/(dashboard)/_state/ppid/struktur_ppid', () => ({ default: ppid }));
vi.mock('@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi', () => ({ default: ppid }));
vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'p1' }) }));

import { StrukturDetail } from '@/app/(public)/_com/struktur-organisasi/StrukturDetail';
import { StrukturDetailView } from '@/app/(public)/_com/struktur-organisasi/StrukturDetailView';
import {
  detailRows,
  displayName,
  initialsOf,
  type StrukturDetailData,
} from '@/app/(public)/_com/struktur-organisasi/struktur-person.logic';
import PpidDetailPage from '@/app/(public)/(pages)/ppid/struktur-ppid/[id]/page';
import { loadPegawaiPpidDetail } from '@/app/(public)/(pages)/ppid/struktur-ppid/_com/struktur-ppid.source';
import PerangkatDetailPage from '@/app/(public)/(pages)/pemerintahan/profil/struktur-perangkat-desa/[id]/page';
import BumdesDetailPage from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/[id]/page';

const render = (ui: ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);

// test-only: profil minimal (hanya nama + jabatan wajib) dan profil lengkap.
const MINIMAL: StrukturDetailData = {
  namaLengkap: 'Ni Wayan Sari',
  gelarAkademik: '  ',
  image: null,
  posisi: { nama: 'Kaur Keuangan' },
  email: null,
  telepon: '',
  isActive: true,
};
// Data lama di DB masih bisa membawa alamat/tanggalMasuk (API tetap mengirimnya); profil tidak boleh menampilkannya.
const FULL: StrukturDetailData & { alamat: string; tanggalMasuk: string } = {
  ...MINIMAL,
  gelarAkademik: 'S.E.',
  image: { link: '/api/img/sari.webp' },
  email: 'sari@example.test',
  telepon: '0812000000',
  alamat: 'Banjar Bucu',
  tanggalMasuk: '2024-01-05T00:00:00.000Z',
  isActive: false,
};

describe('struktur-person.logic', () => {
  it('initialsOf: huruf pertama kata pertama + terakhir, abaikan tanda baca', () => {
    expect(initialsOf('Ni Wayan Sari')).toBe('NS');
    expect(initialsOf('i ketut')).toBe('IK');
    expect(initialsOf('I.B. Surya Prabhawa')).toBe('IP');
    expect(initialsOf('Sukra')).toBe('S');
    expect(initialsOf('  ')).toBe('');
  });

  it('displayName: gelar ditambahkan hanya bila terisi', () => {
    expect(displayName(MINIMAL)).toBe('Ni Wayan Sari');
    expect(displayName(FULL)).toBe('Ni Wayan Sari, S.E.');
  });

  it('detailRows: hanya email → telepon yang terisi; alamat/tanggal masuk lama diabaikan', () => {
    expect(detailRows(MINIMAL)).toEqual([]);
    expect(detailRows(FULL).map((row) => row.label)).toEqual(['Email', 'Telepon']);
    expect(detailRows({ ...MINIMAL, telepon: ' 0812 ' })).toEqual([{ key: 'telepon', label: 'Telepon', value: '0812' }]);
  });
});

describe('StrukturDetailView', () => {
  it('profil minimal: field kosong tidak dirender, avatar inisial menggantikan foto', () => {
    const html = render(<StrukturDetailView data={MINIMAL} infoTitle="Informasi Pegawai" />);
    expect(html).toMatch(/<h1[^>]*>Ni Wayan Sari<\/h1>/);
    expect(html).toContain('Kaur Keuangan');
    for (const label of ['Email', 'Telepon', 'Alamat', 'Tanggal Masuk']) expect(html).not.toContain(`>${label}<`);
    expect(html).not.toContain('>-<');
    expect(html).toContain('data-initials="true"');
    expect(html).toMatch(/>NS<\/span>/);
    expect(html).not.toContain('<img');
    expect(html).toMatch(/>Status<\/dt>.*>Aktif<\/dd>/);
  });

  it('profil lengkap: foto, nama + gelar, email/telepon, status tidak aktif; tanpa Alamat & Tanggal Masuk', () => {
    const html = render(<StrukturDetailView data={FULL} infoTitle="Informasi Pegawai" />);
    expect(html).toContain('src="/api/img/sari.webp"');
    expect(html).toContain('alt="Foto Ni Wayan Sari"');
    expect(html).not.toContain('data-initials');
    expect(html).toContain('Ni Wayan Sari, S.E.');
    for (const value of ['sari@example.test', '0812000000', 'Tidak Aktif']) expect(html).toContain(value);
    for (const hidden of ['Alamat', 'Tanggal Masuk', 'Banjar Bucu', 'Januari 2024']) expect(html).not.toContain(hidden);
    expect(html).toMatch(/<h2[^>]*>Informasi Pegawai<\/h2>/);
  });
});

describe('StrukturDetail & halaman pembungkus', () => {
  it('sebelum data tiba menampilkan kerangka berlabel', () => {
    const html = render(<StrukturDetail id="x" load={() => new Promise(() => {})} text={{ infoTitle: 'I', notFound: 'N' }} />);
    expect(html).toContain('role="status" aria-label="Memuat profil pegawai…"');
  });

  it('halaman PPID, Perangkat Desa & BUMDes memakai komponen yang sama', () => {
    expect(render(<PpidDetailPage />)).toContain('aria-label="Memuat profil pegawai…"');
    expect(render(<PerangkatDetailPage />)).toContain('aria-label="Memuat profil pegawai…"');
    expect(render(<BumdesDetailPage />)).toContain('aria-label="Memuat profil pegawai…"');
  });

  it('pemuat PPID memanggil findUnique.load(id) dan mengembalikan hasilnya (null = tidak ditemukan)', async () => {
    ppid.pegawai.findUnique.load.mockResolvedValueOnce(MINIMAL);
    await expect(loadPegawaiPpidDetail('p9')).resolves.toBe(MINIMAL);
    expect(ppid.pegawai.findUnique.load).toHaveBeenCalledWith('p9');
    ppid.pegawai.findUnique.load.mockResolvedValueOnce(null);
    await expect(loadPegawaiPpidDetail('p9')).resolves.toBeNull();
  });
});
