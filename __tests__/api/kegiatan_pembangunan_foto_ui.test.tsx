// @vitest-environment node
// Dokumentasi Pembangunan: blok publik (tanpa foto / satu foto / lengkap), field admin, dan logika form.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));
vi.mock('react-toastify', () => ({ toast: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import { KegiatanDetailBody } from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/KegiatanDetail';
import DokumentasiPembangunan from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/DokumentasiPembangunan';
import type { KegiatanDetail } from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/kegiatan-detail.source';
import s from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/kegiatan-detail.module.css';
import DokumentasiPembangunanFields, {
  PeringatanFotoNonPembangunan,
} from '@/app/admin/(dashboard)/pemerintahan/kegiatan-desa/_com/DokumentasiPembangunanFields';
import {
  adaFotoDiForm,
  adaFotoTersimpan,
  FOTO_KOSONG,
  fotoDariApi,
  peringatanFotoNonPembangunan,
  unggahFotoPembangunan,
  type FotoPembangunanState,
} from '@/app/admin/(dashboard)/pemerintahan/kegiatan-desa/_lib/foto-pembangunan.logic';
import type { FotoPembangunanApi } from '@/app/admin/(dashboard)/pemerintahan/kegiatan-desa/_lib/useFotoPembangunan';
import { KATEGORI_PEMBANGUNAN_ID } from '@/lib/kegiatan-pembangunan';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: berkas API & detail kegiatan Pembangunan.
const f = (id: string) => ({ id, link: `/api/img/${id}.webp`, realName: `${id}.webp`, mimeType: 'image/webp', size: 10 });
const detail = (over: Partial<KegiatanDetail> = {}): KegiatanDetail => ({
  id: 'k1',
  judul: 'Pembangunan Balai Banjar',
  deskripsiSingkat: 'Ringkas',
  deskripsiLengkap: '<p>Lengkap</p>',
  tanggal: '2026-01-15T00:00:00.000Z',
  lokasi: 'Banjar',
  partisipan: 0,
  image: { link: '/api/img/k1.webp' },
  kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID,
  kategoriKegiatan: { nama: 'Pembangunan' },
  statusPembangunan: 'berjalan',
  progres: 40,
  ...over,
});

const banyak = (n: number, awalan: string) => Array.from({ length: n }, (_, i) => f(`${awalan}${i + 1}`));

describe('DokumentasiPembangunan (publik)', () => {
  it('tanpa satu pun foto → tidak dirender', () => {
    expect(render(<DokumentasiPembangunan judul="X" />)).toBe('');
    expect(render(<DokumentasiPembangunan judul="X" fotoSebelum={null} fotoSesudah={[]} />)).toBe('');
  });

  it('satu kelompok saja (.pairSingle) → kelompok kosong tidak tampil, tanpa slot kosong', () => {
    const html = render(<DokumentasiPembangunan judul="Balai" fotoSesudah={[f('s')]} />);
    expect(html).toContain('data-kegiatan-dokumentasi');
    expect(html).toContain(s.pairSingle);
    expect(html).toContain('data-dokumentasi-foto="sesudah"');
    expect(html).not.toContain('data-dokumentasi-foto="sebelum"');
    expect(html).toContain('alt="Foto sesudah pembangunan Balai 1"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('/api/img/s.webp');
    expect(html).toContain('Sesudah');
    expect(html).not.toContain('Galeri Progres');
  });

  it('satu foto di Sebelum saja → hanya kolom Sebelum', () => {
    const html = render(<DokumentasiPembangunan judul="Balai" fotoSebelum={[f('b')]} fotoSesudah={null} />);
    expect(html).toContain('data-dokumentasi-foto="sebelum"');
    expect(html).not.toContain('data-dokumentasi-foto="sesudah"');
  });

  it('5 + 5 → dua kolom (.pair) berurutan Sebelum lalu Sesudah, 10 foto, alt bermakna per kelompok', () => {
    const html = render(
      <DokumentasiPembangunan judul="Balai" fotoSebelum={banyak(5, 'b')} fotoSesudah={banyak(5, 't')} />,
    );
    expect(html).toContain(`class="${s.pair}"`);
    expect(html.indexOf('data-dokumentasi-foto="sebelum"')).toBeLessThan(html.indexOf('data-dokumentasi-foto="sesudah"'));
    for (let i = 1; i <= 5; i += 1) {
      expect(html).toContain(`alt="Foto sebelum pembangunan Balai ${i}"`);
      expect(html).toContain(`alt="Foto sesudah pembangunan Balai ${i}"`);
    }
    expect((html.match(/<img /g) ?? []).length).toBe(10);
    expect(html).toContain('Dokumentasi Pembangunan');
    expect(html).toContain('>Sebelum<');
    expect(html).toContain('>Sesudah<');
  });
});

describe('KegiatanDetailBody — blok dokumentasi', () => {
  it('Pembangunan tanpa foto (API lama / field hilang) → tidak ada blok dokumentasi', () => {
    const html = render(<KegiatanDetailBody data={detail()} />);
    expect(html).toContain('data-kegiatan-pembangunan');
    expect(html).not.toContain('data-kegiatan-dokumentasi');
  });

  it('Pembangunan dengan foto → blok muncul setelah panel progres', () => {
    const html = render(<KegiatanDetailBody data={detail({ fotoSebelum: [f('b')] })} />);
    expect(html.indexOf('data-kegiatan-pembangunan')).toBeLessThan(html.indexOf('data-kegiatan-dokumentasi'));
    expect(html).toContain('alt="Foto sebelum pembangunan Pembangunan Balai Banjar 1"');
  });

  it('kategori non-Pembangunan tidak merender blok walau data membawa foto', () => {
    const html = render(
      <KegiatanDetailBody
        data={detail({ kategoriKegiatanId: 'katsosia000001', kategoriKegiatan: { nama: 'Sosial' }, fotoSebelum: [f('b')] })}
      />,
    );
    expect(html).not.toContain('data-kegiatan-dokumentasi');
  });
});

// test-only: stub API hook untuk render statis field admin.
const apiStub = (over: Partial<FotoPembangunanApi> = {}): FotoPembangunanApi =>
  ({
    foto: FOTO_KOSONG,
    error: null,
    mengunggah: false,
    tambahSebelum: vi.fn(),
    hapusSebelum: vi.fn(),
    tambahSesudah: vi.fn(),
    hapusSesudah: vi.fn(),
    muat: vi.fn(),
    reset: vi.fn(),
    unggah: vi.fn(),
    adaFotoTersimpan: false,
    adaFotoDiForm: false,
    ...over,
  }) as FotoPembangunanApi;

describe('DokumentasiPembangunanFields (admin)', () => {
  it('kosong: subjudul opsional, petunjuk, dua kelompok 0/5, tanpa galeri progres', () => {
    const html = render(<DokumentasiPembangunanFields api={apiStub()} />);
    expect(html).toContain('data-dokumentasi-pembangunan');
    expect(html).toContain('Dokumentasi Pembangunan (opsional)');
    expect(html).toContain('Opsional. Maks 5 foto, JPG/PNG/WebP, maks 5 MB per foto.');
    expect(html).toContain('Foto Sebelum');
    expect(html).toContain('Foto Sesudah');
    expect((html.match(/0\/5 gambar/g) ?? []).length).toBe(2);
    expect(html).not.toContain('Galeri Progres');
    expect(html).not.toContain('Gambar Utama');
    expect(html).not.toContain('data-galeri-thumb');
    expect(html).not.toContain('data-foto-mengunggah');
    expect(html).not.toContain('data-foto-error');
  });

  it('menampilkan loader saat mengunggah dan error merah dengan role=alert', () => {
    const html = render(<DokumentasiPembangunanFields api={apiStub({ mengunggah: true, error: 'Gagal mengunggah foto "a.png"' })} />);
    expect(html).toContain('Mengunggah foto...');
    expect(html).toContain('data-foto-mengunggah');
    expect(html).toContain('role="alert"');
    expect(html).toContain('Gagal mengunggah foto &quot;a.png&quot;');
  });

  it('satu foto tersimpan di Sebelum → satu thumbnail, 1/5 dan 0/5', () => {
    const foto = fotoDariApi({ fotoSebelum: [f('b')] });
    const html = render(<DokumentasiPembangunanFields api={apiStub({ foto })} />);
    expect(html).toContain('/api/img/b.webp');
    expect(html).toContain('1/5 gambar');
    expect(html).toContain('0/5 gambar');
    expect((html.match(/data-galeri-thumb/g) ?? []).length).toBe(1);
  });

  it('5 + 5 foto → 10 thumbnail, 5/5 dan batas tercapai di kedua kelompok', () => {
    const foto = fotoDariApi({ fotoSebelum: banyak(5, 'b'), fotoSesudah: banyak(5, 't') });
    const html = render(<DokumentasiPembangunanFields api={apiStub({ foto })} />);
    expect((html.match(/data-galeri-thumb/g) ?? []).length).toBe(10);
    expect((html.match(/5\/5 gambar/g) ?? []).length).toBe(2);
    expect((html.match(/Batas 5 gambar tercapai/g) ?? []).length).toBe(2);
  });
});

describe('PeringatanFotoNonPembangunan', () => {
  it('tanpa foto → tidak dirender; foto tersimpan → peringatan hapus; hanya dipilih → tidak diunggah', () => {
    expect(render(<PeringatanFotoNonPembangunan api={apiStub()} />)).toBe('');
    const tersimpan = render(<PeringatanFotoNonPembangunan api={apiStub({ adaFotoTersimpan: true, adaFotoDiForm: true })} />);
    expect(tersimpan).toContain('data-foto-peringatan');
    expect(tersimpan).toContain('akan dihapus saat Simpan');
    const dipilih = render(<PeringatanFotoNonPembangunan api={apiStub({ adaFotoDiForm: true })} />);
    expect(dipilih).toContain('tidak akan diunggah atau disimpan');
  });
});

describe('foto-pembangunan.logic', () => {
  const berkas = (name: string) => new File(['x'], name, { type: 'image/png' });

  it('fotoDariApi / adaFotoTersimpan / adaFotoDiForm tahan null & field hilang', () => {
    expect(fotoDariApi(null)).toBe(FOTO_KOSONG);
    expect(adaFotoTersimpan(null)).toBe(false);
    expect(adaFotoTersimpan({ fotoSebelum: [] })).toBe(false);
    expect(adaFotoTersimpan({ fotoSesudah: [f('s')] })).toBe(true);
    const state = fotoDariApi({ fotoSebelum: [f('b1'), f('b2')], fotoSesudah: null });
    expect(state.sebelum.map((g) => g.id)).toEqual(['b1', 'b2']);
    expect(state.sebelum[0].preview).toBe('/api/img/b1.webp');
    expect(state.sesudah).toEqual([]);
    expect(adaFotoDiForm(FOTO_KOSONG)).toBe(false);
    expect(adaFotoDiForm({ sebelum: [], sesudah: [{ key: 'a', file: berkas('a.png'), preview: 'blob:a' }] })).toBe(true);
    expect(adaFotoDiForm(state)).toBe(true);
  });

  it('peringatanFotoNonPembangunan: tersimpan diutamakan, null bila tak ada foto', () => {
    expect(peringatanFotoNonPembangunan(false, false)).toBeNull();
    expect(peringatanFotoNonPembangunan(true, true)).toContain('akan dihapus saat Simpan');
    expect(peringatanFotoNonPembangunan(false, true)).toContain('tidak akan diunggah');
  });

  it('unggahFotoPembangunan: form kosong → dua array kosong tanpa upload', async () => {
    const upload = vi.fn();
    const hasil = await unggahFotoPembangunan(FOTO_KOSONG, upload);
    expect(hasil.body).toEqual({ fotoSebelumIds: [], fotoSesudahIds: [] });
    expect(upload).not.toHaveBeenCalled();
  });

  it('unggah berurutan sebelum → sesudah, id tersimpan dipakai ulang, state mengganti file dengan id', async () => {
    const urutan: string[] = [];
    const upload = vi.fn(async (file: File) => {
      urutan.push(file.name);
      return `id-${file.name}`;
    });
    const foto: FotoPembangunanState = {
      sebelum: [
        { key: 'a', preview: 'blob:a', file: berkas('b-a.png') },
        { key: 'tersimpan', preview: '/api/img/t.webp', id: 't' },
      ],
      sesudah: [
        { key: 'c', preview: 'blob:c', file: berkas('s-c.png') },
        { key: 'd', preview: 'blob:d', file: berkas('s-d.png') },
      ],
    };
    const { body, state } = await unggahFotoPembangunan(foto, upload);
    expect(urutan).toEqual(['b-a.png', 's-c.png', 's-d.png']);
    expect(body).toEqual({ fotoSebelumIds: ['id-b-a.png', 't'], fotoSesudahIds: ['id-s-c.png', 'id-s-d.png'] });
    expect(state.sebelum.map((g) => g.id)).toEqual(['id-b-a.png', 't']);
    expect(state.sesudah.map((g) => g.id)).toEqual(['id-s-c.png', 'id-s-d.png']);
    expect(state.sebelum[0]).toEqual({ key: 'a', preview: 'blob:a', id: 'id-b-a.png' });
  });

  it('upload gagal → melempar error berpesan Indonesia (tidak diam-diam)', async () => {
    const foto: FotoPembangunanState = { ...FOTO_KOSONG, sesudah: [{ key: 'x', preview: 'blob:x', file: berkas('x.png') }] };
    await expect(unggahFotoPembangunan(foto, async () => null)).rejects.toThrow('x.png');
  });
});
