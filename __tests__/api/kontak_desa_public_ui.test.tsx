// @vitest-environment node
// Kontak Desa (pembaca publik): footer dan kontak PPID membaca state CMS, bukan konstanta kode. Diuji per keadaan:
// berisi (alamat, tautan tel:/mailto:), WhatsApp opsional (baris hanya ada bila terisi), memuat (kerangka, TANPA nilai
// bawaan), gagal (kosong, tanpa kerangka abadi), dan data berubah setelah admin menyimpan. jsdom rusak → renderToStaticMarkup (efek tidak berjalan).
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
  whatsapp: null,
  jamLayanan: null,
  updatedAt: '2026-11-19T00:00:00.000Z',
};
// test-only: jam layanan rekaan untuk keadaan terisi (teks bebas).
const JAM = 'Senin–Jumat 07.30–15.30';
// test-only: nomor seluler rekaan untuk keadaan WhatsApp terisi.
const WA = '0812 3958 0000';
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

describe('FooterKontakDesa: WhatsApp opsional', () => {
  it('belum diisi (null): tidak ada baris WhatsApp dan tidak ada tautan wa.me', () => {
    state.findUnique.data = KONTAK;
    const html = render(<FooterKontakDesa />);
    expect(html).not.toContain('WhatsApp');
    expect(html).not.toContain('wa.me');
    expect(html).toContain('href="tel:+623618441518"');
  });

  it('terisi: baris WhatsApp bertautan wa.me (tab baru, rel aman), di antara telepon dan email', () => {
    state.findUnique.data = { ...KONTAK, whatsapp: WA };
    const html = render(<FooterKontakDesa />);
    expect(html).toMatch(/WhatsApp:\s*<a[^>]*href="https:\/\/wa\.me\/6281239580000"[^>]*>0812 3958 0000<\/a>/);
    expect(html).toMatch(/href="https:\/\/wa\.me\/[^"]*"[^>]*target="_blank"/);
    expect(html).toMatch(/rel="noopener noreferrer"/);
    expect(html.indexOf('Telepon:')).toBeLessThan(html.indexOf('WhatsApp:'));
    expect(html.indexOf('WhatsApp:')).toBeLessThan(html.indexOf('Email:'));
  });

  it('data di luar aturan API (bukan seluler) tampil sebagai teks biasa tanpa tautan wa.me', () => {
    state.findUnique.data = { ...KONTAK, whatsapp: '(0361) 8441518' };
    const html = render(<FooterKontakDesa />);
    expect(html).toContain('WhatsApp: (0361) 8441518');
    expect(html).not.toContain('wa.me');
  });

  it('memuat atau gagal dimuat: tidak ada baris WhatsApp (tidak ada label tanpa nilai)', () => {
    expect(render(<FooterKontakDesa />)).not.toContain('WhatsApp');
    state.findUnique.error = 'HTTP error! status: 500';
    expect(render(<FooterKontakDesa />)).not.toContain('WhatsApp');
  });
});

describe('FooterKontakDesa: jam layanan opsional', () => {
  it('belum diisi (null): tidak ada baris jam layanan', () => {
    state.findUnique.data = KONTAK;
    expect(render(<FooterKontakDesa />)).not.toContain('Jam layanan');
  });

  it('terisi: baris jam layanan tampil apa adanya, setelah email', () => {
    state.findUnique.data = { ...KONTAK, jamLayanan: JAM };
    const html = render(<FooterKontakDesa />);
    expect(html).toContain(`Jam layanan: ${JAM}`);
    expect(html.indexOf('Email:')).toBeLessThan(html.indexOf('Jam layanan:'));
  });

  it('memuat atau gagal dimuat: tidak ada baris jam layanan', () => {
    expect(render(<FooterKontakDesa />)).not.toContain('Jam layanan');
    state.findUnique.error = 'HTTP error! status: 500';
    expect(render(<FooterKontakDesa />)).not.toContain('Jam layanan');
  });
});

describe('kontak PPID: jam layanan opsional', () => {
  it('hanya ada bila terisi; selebihnya tidak ada label tanpa nilai', () => {
    state.findUnique.data = KONTAK;
    expect(render(<DaftarKontak />)).not.toContain('Jam layanan');
    expect(render(<KontakDesaValue field="jamLayanan" />)).toBe('');

    state.findUnique.data = { ...KONTAK, jamLayanan: JAM };
    const html = render(<DaftarKontak />);
    expect(html).toContain('Jam layanan:');
    expect(html).toContain(JAM);
    expect(render(<KontakDesaValue field="jamLayanan" />)).toBe(JAM);
  });

  it('memuat: baris jam layanan tidak ikut kerangka (tetap dua kerangka: email dan telepon)', () => {
    const html = render(<DaftarKontak />);
    expect(html).not.toContain('Jam layanan');
    expect(skeletons(html)).toBe(2);
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

  it('PPID: baris WhatsApp hanya ada bila terisi; tanpa nomor tidak ada label WhatsApp', () => {
    state.findUnique.data = KONTAK;
    expect(render(<DaftarKontak />)).not.toContain('WhatsApp');
    expect(render(<KontakDesaValue field="whatsapp" />)).toBe('');

    state.findUnique.data = { ...KONTAK, whatsapp: WA };
    const html = render(<DaftarKontak />);
    expect(html).toContain('WhatsApp:');
    expect(html).toContain(WA);
    expect(render(<KontakDesaValue field="whatsapp" />)).toBe(WA);
  });

  it('PPID memuat: baris WhatsApp tidak ikut kerangka (tetap dua kerangka: email dan telepon)', () => {
    const html = render(<DaftarKontak />);
    expect(html).not.toContain('WhatsApp');
    expect(skeletons(html)).toBe(2);
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
