// @vitest-environment node
// Layanan Online Desa: ubin hub, formulir Administrasi Online (galat/kirim gagal/memuat/sukses), daftar jenis
// layanan, pemberitahuan pengalihan Informasi Desa, dan route lama yang dialihkan 307. jsdom rusak → renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { createRef, type AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});
vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirect(url),
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
// Modal bersama (editor, dropzone, state admin) tidak diuji di sini; hub hanya meneruskan opened/onClose.
vi.mock('@/app/(public)/_com/pengaduan/PengaduanMasyarakatModal', () => ({ default: () => null }));

import { LayananOnlineTiles } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/LayananOnlinePage';
import { JenisLayananSection } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/JenisLayananSection';
import { AdministrasiForm, AdministrasiSent } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/AdministrasiForm';
import f from '@/app/(public)/(pages)/inovasi/_com/inovasi-form.module.css';
import { EMPTY_ADMINISTRASI, validateAdministrasi } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/administrasi.logic';
import { ADMINISTRASI_TEXT as AT } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/administrasi.text';
import type { JenisLayananState } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/use-jenis-layanan';
import { InformasiRedirectNotice } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/informasi/InformasiRedirect';
import { LAYANAN_ONLINE_TEXT as T } from '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/layanan-online.text';
import InformasiDesaPage from '@/app/(public)/(pages)/inovasi/layanan-online-desa/informasi-desa/page';
import PengaduanPage from '@/app/(public)/(pages)/inovasi/layanan-online-desa/pengaduan-masyarakat/page';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: dua jenis layanan stg 2026-11-16 (dipangkas).
const READY: JenisLayananState = {
  status: 'ready',
  items: [
    { id: 'a', nama: 'Perizinan Berusaha OSS', deskripsi: 'Bantuan pendaftaran NIB.' },
    { id: 'b', nama: 'Surat Keterangan Usaha', deskripsi: '' },
  ],
};
// test-only
const VALID = { name: 'Ni Made Ayu', alamat: 'Br. Gede', nomorTelepon: '081234567890', jenisLayananId: 'a' };

const form = (props: Partial<Parameters<typeof AdministrasiForm>[0]> = {}) =>
  render(
    <AdministrasiForm
      values={EMPTY_ADMINISTRASI}
      errors={{}}
      status="idle"
      jenis={READY}
      onField={() => {}}
      onSubmit={() => {}}
      firstFieldRef={createRef<HTMLInputElement>()}
      {...props}
    />,
  );

describe('LayananOnlineTiles', () => {
  it('tiga ubin: Administrasi (tautan halaman), Pengaduan (tombol modal), Informasi (Berita + Pengumuman)', () => {
    const html = render(<LayananOnlineTiles onPengaduan={() => {}} />);
    expect(html).toContain(`aria-label="${T.listLabel}"`);
    expect(html.match(/<li /g)).toHaveLength(3);
    for (const title of [T.administrasi.title, T.pengaduan.title, T.informasi.title]) expect(html).toContain(`>${title}</h2>`);
    expect(html).toContain('href="/inovasi/layanan-online-desa/administrasi-online"');
    expect(html).toMatch(new RegExp(`<button type="button"[^>]*>${T.pengaduan.action}`));
    expect(html).toContain('href="/pemerintahan/berita/semua"');
    expect(html).toContain('href="/pemerintahan/pengumuman"');
    // Tidak ada lagi tautan ke Informasi Desa lama.
    expect(html).not.toContain('informasi-desa');
  });
});

describe('AdministrasiForm', () => {
  it('empat isian berlabel + tombol kirim, tanpa pesan galat awal', () => {
    const html = form();
    for (const label of [AT.name.label, AT.alamat.label, AT.nomorTelepon.label, AT.jenisLayanan.label]) expect(html).toContain(label);
    expect(html).toContain(`>${AT.formTitle}</h2>`);
    expect(html).toContain(AT.submit);
    // React SSR mengeluarkan atribut ini sebagai `inputMode` (camelCase), jadi dicocokkan tanpa peka huruf.
    expect(html).toMatch(/inputmode="numeric"/i);
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain(AT.errors.name);
  });

  it('galat per isian tampil setelah percobaan kirim', () => {
    const html = form({ errors: validateAdministrasi(EMPTY_ADMINISTRASI) });
    for (const message of Object.values(AT.errors)) expect(html).toContain(message);
    expect(html).toContain('aria-invalid="true"');
  });

  it('tiap isian punya id `<prefix>-<field>` (target fokus isian salah pertama) + tombol kirim bertipe submit', () => {
    const html = form();
    for (const field of Object.keys(EMPTY_ADMINISTRASI)) expect(html).toMatch(new RegExp(`<input[^>]*id="[^"]+-${field}"`));
    expect(html).toMatch(/<button[^>]*type="submit"/);
  });

  it('kirim gagal → isian tetap + pesan role=alert', () => {
    const html = form({ values: VALID, status: 'failed' });
    expect(html).toContain(`value="${VALID.name}"`);
    expect(html).toContain(`value="${VALID.nomorTelepon}"`);
    expect(html).toMatch(new RegExp(`role="alert"[^>]*>${AT.failed}`));
  });

  it('jenis layanan memuat/kosong → dropdown nonaktif dengan keterangan', () => {
    expect(form({ jenis: { status: 'loading' } })).toContain(`placeholder="${AT.jenisLayanan.loading}"`);
    const empty = form({ jenis: { status: 'ready', items: [] } });
    expect(empty).toContain(`placeholder="${AT.jenisLayanan.unavailable}"`);
    expect(empty).toMatch(/<input[^>]*disabled=""[^>]*placeholder="Jenis layanan belum tersedia"|placeholder="Jenis layanan belum tersedia"[^>]*disabled=""/);
  });
});

describe('AdministrasiSent & JenisLayananSection', () => {
  it('sukses: terima kasih menyebut jenis layanan + tombol ajukan lagi', () => {
    const html = render(<AdministrasiSent jenisNama="Surat Keterangan Usaha" onReset={() => {}} />);
    expect(html).toContain(`>${AT.sentTitle}</h2>`);
    // Judul menerima fokus program setelah sukses (formulir di-unmount), tanpa masuk urutan Tab.
    // React SSR menulis `tabIndex` (camelCase), jadi dicocokkan tanpa peka huruf.
    expect(html).toMatch(new RegExp(`<h2[^>]*tabindex="-1"[^>]*>${AT.sentTitle}</h2>`, 'i'));
    // Tanpa cincin fokus lewat kelas kartu bersama (`focusTitle`), bukan inline style.
    expect(html).toContain(`class="${f.title} ${f.titleFocus}"`);
    expect(html).not.toMatch(/style="[^"]*outline/);
    expect(html).toMatch(/<section[^>]*aria-labelledby="([^"]+)"[\s\S]*<h2 id="\1"/);
    expect(html).toContain('role="status"');
    expect(html).toContain('Pengajuan Surat Keterangan Usaha sudah kami terima');
    expect(html).toContain(AT.sentAgain);
  });

  it('jenis layanan: nama + keterangan (bila ada)', () => {
    const html = render(<JenisLayananSection jenis={READY} />);
    expect(html).toContain(`>${AT.jenisTitle}</h2>`);
    expect(html.match(/<dt/g)).toHaveLength(2);
    expect(html).toContain('Perizinan Berusaha OSS');
    expect(html).toContain('Bantuan pendaftaran NIB.');
    expect(html.match(/<dd/g)).toHaveLength(1);
  });

  it('jenis layanan memuat / galat / kosong', () => {
    expect(render(<JenisLayananSection jenis={{ status: 'loading' }} />)).toContain('aria-busy="true"');
    expect(render(<JenisLayananSection jenis={{ status: 'error' }} />)).toContain(AT.jenisError);
    expect(render(<JenisLayananSection jenis={{ status: 'ready', items: [] }} />)).toContain(AT.jenisEmpty);
  });
});

describe('Informasi Desa & route lama', () => {
  it('pemberitahuan pengalihan: memuat + tautan cadangan ke daftar', () => {
    const html = render(<InformasiRedirectNotice kind="pengumuman" />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('Membuka pengumuman');
    expect(html).toContain('href="/pemerintahan/pengumuman"');
  });

  it('informasi-desa → daftar Berita; pengaduan-masyarakat → hub dengan modal pengaduan', () => {
    expect(() => InformasiDesaPage()).toThrow('NEXT_REDIRECT /pemerintahan/berita/semua');
    expect(() => PengaduanPage()).toThrow('NEXT_REDIRECT /inovasi/layanan-online-desa?layanan=pengaduan');
  });
});
