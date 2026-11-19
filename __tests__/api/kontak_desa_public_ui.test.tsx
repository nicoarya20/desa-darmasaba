// @vitest-environment node
// Kontak Desa (pembaca publik): footer dan kontak PPID membaca state CMS, bukan konstanta kode. Diuji per keadaan:
// berisi (alamat, tautan tel:/mailto:), memuat (kerangka, TANPA nilai bawaan), gagal (kosong, tanpa kerangka abadi),
// dan data berubah setelah admin menyimpan. jsdom rusak → renderToStaticMarkup (efek tidak berjalan).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { DaftarKontak } from '@/app/(public)/(pages)/ppid/daftar-informasi-publik/_com/DaftarKontak';
import { FooterKontakDesa } from '@/app/(public)/_com/FooterKontakDesa';
import { KontakDesaValue } from '@/app/(public)/_com/KontakDesaValue';
import state from '@/app/admin/(dashboard)/_state/desa/kontakDesa';
import * as konstantaKontak from '@/con/kontak-desa';
import type { KontakDesaRecord } from '@/lib/kontak-desa';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: kontak rekaan (bukan nilai produksi) supaya terlihat jelas bahwa teks berasal dari state.
const KONTAK: KontakDesaRecord = {
  id: 'kontak-desa',
  namaKantor: 'Kantor Uji Desa',
  alamat: 'Jl. Uji No. 1, Desa Uji',
  telepon: '(0361) 8441518',
  email: 'kontak-uji@example.com',
  updatedAt: '2026-11-19T00:00:00.000Z',
};
// Nilai produksi lama: tidak boleh muncul sebagai nilai bawaan saat data belum ada.
const NILAI_LAMA = ['8441518', 'ddarmasaba@gmail.com', 'Kantor Perbekel Desa Darmasaba', 'Lukluk'];
const skeletons = (html: string) => html.match(/mantine-Skeleton-root/g)?.length ?? 0;

beforeEach(() => {
  Object.assign(state.findUnique, { data: null, loaded: false, loading: false, error: null });
});

describe('FooterKontakDesa', () => {
  it('berisi: nama kantor, alamat, telepon bertautan tel:, email bertautan mailto:, tanpa kerangka', () => {
    state.findUnique.data = KONTAK;
    const html = render(<FooterKontakDesa />);
    expect(html).toContain('Kontak Kantor Desa');
    expect(html).toContain('Kantor Uji Desa');
    expect(html).toContain('Jl. Uji No. 1, Desa Uji');
    expect(html).toContain('href="tel:+623618441518"');
    expect(html).toContain('href="mailto:kontak-uji@example.com"');
    expect(skeletons(html)).toBe(0);
  });

  it('telepon tanpa digit (data di luar aturan API) tampil sebagai teks biasa, tanpa tautan tel:', () => {
    state.findUnique.data = { ...KONTAK, telepon: 'belum ada' };
    const html = render(<FooterKontakDesa />);
    expect(html).toContain('Telepon: belum ada');
    expect(html).not.toContain('href="tel:');
  });

  it('memuat: kerangka tampil dan tidak ada nilai lama/bawaan (tanpa fallback hardcode)', () => {
    const html = render(<FooterKontakDesa />);
    expect(skeletons(html)).toBeGreaterThan(0);
    for (const lama of NILAI_LAMA) expect(html).not.toContain(lama);
    expect(html).not.toContain('href="tel:');
    expect(html).not.toContain('href="mailto:');
    expect(html).toContain('Pengelola website:');
  });

  it('gagal dimuat: kosong, tanpa kerangka abadi dan tanpa nilai bawaan', () => {
    state.findUnique.error = 'HTTP error! status: 500';
    const html = render(<FooterKontakDesa />);
    expect(skeletons(html)).toBe(0);
    for (const lama of NILAI_LAMA) expect(html).not.toContain(lama);
    expect(html).toContain('Pengelola website:');
  });

  it('admin menyimpan nilai baru → footer menampilkan nilai baru (state bersama)', () => {
    state.findUnique.data = KONTAK;
    expect(render(<FooterKontakDesa />)).toContain('kontak-uji@example.com');
    state.findUnique.data = { ...KONTAK, email: 'baru@example.com' };
    const html = render(<FooterKontakDesa />);
    expect(html).toContain('href="mailto:baru@example.com"');
    expect(html).not.toContain('kontak-uji@example.com');
  });
});

describe('KontakDesaValue & kontak PPID', () => {
  it('berisi: email dan telepon dari state', () => {
    state.findUnique.data = KONTAK;
    expect(render(<KontakDesaValue field="email" />)).toBe('kontak-uji@example.com');
    expect(render(<KontakDesaValue field="telepon" />)).toBe('(0361) 8441518');
    const html = render(<DaftarKontak />);
    expect(html).toContain('kontak-uji@example.com');
    expect(html).toContain('(0361) 8441518');
    expect(skeletons(html)).toBe(0);
  });

  it('memuat: kerangka per nilai, tanpa nilai lama', () => {
    const html = render(<DaftarKontak />);
    expect(skeletons(html)).toBe(2);
    for (const lama of NILAI_LAMA) expect(html).not.toContain(lama);
  });

  it('gagal dimuat: nilai kosong tanpa kerangka', () => {
    state.findUnique.error = 'HTTP error! status: 500';
    expect(render(<KontakDesaValue field="email" />)).toBe('');
    expect(skeletons(render(<DaftarKontak />))).toBe(0);
  });
});

describe('konstanta kode', () => {
  it('KONTAK_DESA sudah dihapus; pengelola website tetap ada', () => {
    expect('KONTAK_DESA' in konstantaKontak).toBe(false);
    expect(konstantaKontak.PENGELOLA_WEBSITE.lembaga).toBeTruthy();
  });
});
