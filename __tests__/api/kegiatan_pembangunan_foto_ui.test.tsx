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

describe('DokumentasiPembangunan (publik)', () => {
  it('tanpa satu pun foto → tidak dirender', () => {
    expect(render(<DokumentasiPembangunan judul="X" />)).toBe('');
    expect(render(<DokumentasiPembangunan judul="X" fotoSebelum={null} fotoSesudah={null} fotoProgres={[]} />)).toBe('');
  });

  it('hanya satu foto → satu figure (.pairSingle), tanpa slot kosong dan tanpa galeri', () => {
    const html = render(<DokumentasiPembangunan judul="Balai" fotoSesudah={f('s')} />);
    expect(html).toContain('data-kegiatan-dokumentasi');
    expect(html).toContain(s.pairSingle);
    expect(html).toContain('data-dokumentasi-foto="sesudah"');
    expect(html).not.toContain('data-dokumentasi-foto="sebelum"');
    expect(html).not.toContain('data-dokumentasi-progres');
    expect(html).toContain('alt="Foto sesudah pembangunan Balai"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('href="/api/img/s.webp"');
  });

  it('lengkap → sebelum lalu sesudah (.pair) + galeri progres dengan alt bermakna', () => {
    const html = render(
      <DokumentasiPembangunan judul="Balai" fotoSebelum={f('b')} fotoSesudah={f('s')} fotoProgres={[f('g1'), f('g2')]} />,
    );
    expect(html).toContain(`class="${s.pair}"`);
    expect(html.indexOf('data-dokumentasi-foto="sebelum"')).toBeLessThan(html.indexOf('data-dokumentasi-foto="sesudah"'));
    expect(html).toContain('alt="Foto sebelum pembangunan Balai"');
    expect(html).toContain('Galeri Progres');
    expect(html).toContain('data-dokumentasi-progres');
    expect(html).toContain('alt="Foto progres pembangunan Balai 1"');
    expect(html).toContain('alt="Foto progres pembangunan Balai 2"');
    expect(html).toContain('Dokumentasi Pembangunan');
  });

  it('hanya galeri → tanpa blok pasangan', () => {
    const html = render(<DokumentasiPembangunan judul="Balai" fotoProgres={[f('g1')]} />);
    expect(html).toContain('data-dokumentasi-progres');
    expect(html).not.toContain('data-dokumentasi-pasangan');
  });
});

describe('KegiatanDetailBody — blok dokumentasi', () => {
  it('Pembangunan tanpa foto (API lama / field hilang) → tidak ada blok dokumentasi', () => {
    const html = render(<KegiatanDetailBody data={detail()} />);
    expect(html).toContain('data-kegiatan-pembangunan');
    expect(html).not.toContain('data-kegiatan-dokumentasi');
  });

  it('Pembangunan dengan foto → blok muncul setelah panel progres', () => {
    const html = render(<KegiatanDetailBody data={detail({ fotoSebelum: f('b'), fotoProgres: [f('g1')] })} />);
    expect(html.indexOf('data-kegiatan-pembangunan')).toBeLessThan(html.indexOf('data-kegiatan-dokumentasi'));
    expect(html).toContain('alt="Foto sebelum pembangunan Pembangunan Balai Banjar"');
  });

  it('kategori non-Pembangunan tidak merender blok walau data membawa foto', () => {
    const html = render(
      <KegiatanDetailBody
        data={detail({ kategoriKegiatanId: 'katsosia000001', kategoriKegiatan: { nama: 'Sosial' }, fotoSebelum: f('b') })}
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
    pilihSebelum: vi.fn(),
    hapusSebelum: vi.fn(),
    pilihSesudah: vi.fn(),
    hapusSesudah: vi.fn(),
    tambahGaleri: vi.fn(),
    hapusGaleri: vi.fn(),
    muat: vi.fn(),
    reset: vi.fn(),
    unggah: vi.fn(),
    adaFotoTersimpan: false,
    adaFotoDiForm: false,
    ...over,
  }) as FotoPembangunanApi;

describe('DokumentasiPembangunanFields (admin)', () => {
  it('menampilkan subjudul opsional, petunjuk format, dua slot dan galeri maks 10', () => {
    const html = render(<DokumentasiPembangunanFields api={apiStub()} />);
    expect(html).toContain('data-dokumentasi-pembangunan');
    expect(html).toContain('Dokumentasi Pembangunan (opsional)');
    expect(html).toContain('Opsional. JPG/PNG/WebP, maks 5 MB per foto.');
    expect(html).toContain('Foto Sebelum');
    expect(html).toContain('Foto Sesudah');
    expect(html).toContain('Galeri Progres');
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

  it('menampilkan pratinjau foto tersimpan', () => {
    const foto = fotoDariApi({ fotoSebelum: f('b'), fotoProgres: [f('g1')] });
    const html = render(<DokumentasiPembangunanFields api={apiStub({ foto })} />);
    expect(html).toContain('/api/img/b.webp');
    expect(html).toContain('/api/img/g1.webp');
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
    expect(adaFotoTersimpan({ fotoProgres: [] })).toBe(false);
    expect(adaFotoTersimpan({ fotoSesudah: f('s') })).toBe(true);
    const state = fotoDariApi({ fotoSebelum: f('b'), fotoSesudah: null, fotoProgres: [f('g1'), f('g2')] });
    expect(state.sebelum).toEqual({ id: 'b', file: null, preview: '/api/img/b.webp' });
    expect(state.sesudah.id).toBeNull();
    expect(state.galeri.map((g) => g.id)).toEqual(['g1', 'g2']);
    expect(adaFotoDiForm(FOTO_KOSONG)).toBe(false);
    expect(adaFotoDiForm({ ...FOTO_KOSONG, sesudah: { id: null, file: berkas('a.png'), preview: 'blob:a' } })).toBe(true);
    expect(adaFotoDiForm(state)).toBe(true);
  });

  it('peringatanFotoNonPembangunan: tersimpan diutamakan, null bila tak ada foto', () => {
    expect(peringatanFotoNonPembangunan(false, false)).toBeNull();
    expect(peringatanFotoNonPembangunan(true, true)).toContain('akan dihapus saat Simpan');
    expect(peringatanFotoNonPembangunan(false, true)).toContain('tidak akan diunggah');
  });

  it('unggahFotoPembangunan: form kosong → body kosong tanpa upload', async () => {
    const upload = vi.fn();
    const hasil = await unggahFotoPembangunan(FOTO_KOSONG, upload);
    expect(hasil.body).toEqual({ fotoSebelumId: null, fotoSesudahId: null, fotoProgresIds: [] });
    expect(upload).not.toHaveBeenCalled();
  });

  it('unggah berurutan sebelum → sesudah → galeri, id tersimpan dipakai ulang, state mengganti file dengan id', async () => {
    const urutan: string[] = [];
    const upload = vi.fn(async (file: File) => {
      urutan.push(file.name);
      return `id-${file.name}`;
    });
    const foto: FotoPembangunanState = {
      sebelum: { id: null, file: berkas('sebelum.png'), preview: 'blob:1' },
      sesudah: { id: 'lama', file: null, preview: '/api/img/lama.webp' },
      galeri: [
        { key: 'a', preview: 'blob:a', file: berkas('g-a.png') },
        { key: 'tersimpan', preview: '/api/img/t.webp', id: 't' },
        { key: 'b', preview: 'blob:b', file: berkas('g-b.png') },
      ],
    };
    const { body, state } = await unggahFotoPembangunan(foto, upload);
    expect(urutan).toEqual(['sebelum.png', 'g-a.png', 'g-b.png']);
    expect(body).toEqual({
      fotoSebelumId: 'id-sebelum.png',
      fotoSesudahId: 'lama',
      fotoProgresIds: ['id-g-a.png', 't', 'id-g-b.png'],
    });
    expect(state.sebelum).toEqual({ id: 'id-sebelum.png', file: null, preview: 'blob:1' });
    expect(state.galeri.map((g) => g.id)).toEqual(['id-g-a.png', 't', 'id-g-b.png']);
    expect(state.galeri.every((g) => !('file' in g) || g.file === undefined)).toBe(true);
  });

  it('upload gagal → melempar error berpesan Indonesia (tidak diam-diam)', async () => {
    const foto: FotoPembangunanState = { ...FOTO_KOSONG, sesudah: { id: null, file: berkas('x.png'), preview: 'blob:x' } };
    await expect(unggahFotoPembangunan(foto, async () => null)).rejects.toThrow('Gagal mengunggah foto "x.png"');
    const galeriGagal: FotoPembangunanState = { ...FOTO_KOSONG, galeri: [{ key: 'a', preview: 'blob:a', file: berkas('g.png') }] };
    await expect(unggahFotoPembangunan(galeriGagal, async () => null)).rejects.toThrow('g.png');
  });
});
