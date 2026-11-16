// @vitest-environment node
// Admin Lembaga Pendidikan: form memuat field detail sekolah (medsos, lokasi, foto sekolah & bagan), logika form
// (isi dari detail, body API, validasi sama dengan server), dan simpan (unggah foto, galat berkonteks, bersihkan
// unggahan yatim). jsdom rusak di repo ini → renderToStaticMarkup; klik tidak diuji.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { toast, upload, hapusBerkas } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn() },
  upload: vi.fn(),
  hapusBerkas: vi.fn(),
}));
vi.mock('react-toastify', () => ({ toast }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: { fileStorage: { create: { post: upload } } } } }));
vi.mock('@/lib/file-storage-delete.client', () => ({ hapusBerkas }));
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="peta" /> }));

import LembagaFormFields from '@/app/admin/(dashboard)/pendidikan/info-sekolah/lembaga/_com/lembaga.form-fields';
import lembagaPendidikan from '@/app/admin/(dashboard)/_state/pendidikan/infoSekolahPaud/lembaga-pendidikan';
import {
  cekFormLembaga,
  FORM_LEMBAGA_KOSONG,
  FOTO_LEMBAGA_KOSONG,
  formDariDetail,
  payloadDariForm,
} from '@/app/admin/(dashboard)/_state/pendidikan/infoSekolahPaud/lembaga.form';
import { createDetailEntriState } from '@/app/admin/(dashboard)/_state/konten-bersama/detail-entri.state';
import type { LembagaDetail } from '@/lib/lembaga-pendidikan/lembaga.types';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: data rekaan.
const detail: LembagaDetail = {
  id: 'lb1',
  nama: 'TK Contoh Ceria',
  jenjangId: 'j-tk',
  jenjangPendidikan: { id: 'j-tk', nama: 'TK' },
  isActive: true,
  deskripsi: 'Profil contoh',
  alamat: 'Jl. Contoh No. 1',
  kontak: null,
  mediaSosial: [{ platform: 'facebook', url: 'https://facebook.com/tk_contoh' }],
  lat: -8.6,
  lng: 115.2,
  linkGoogleMaps: 'https://maps.app.goo.gl/Contoh123',
  fotoSekolahId: 'img-sekolah',
  fotoSekolah: { id: 'img-sekolah', link: '/api/img/sekolah.webp' },
  fotoBaganStrukturId: null,
  fotoBaganStruktur: null,
  pengurus: [],
  fotoKegiatan: [],
  _count: { siswa: 0, pengajar: 0 },
};

describe('form lembaga', () => {
  it('isi dari detail: koordinat, link Maps, foto tersimpan; tanpa titik → koordinat null', () => {
    expect(formDariDetail(detail)).toMatchObject({
      koordinat: { lat: -8.6, lng: 115.2 },
      linkMaps: 'https://maps.app.goo.gl/Contoh123',
      kontak: '',
      fotoSekolahLink: '/api/img/sekolah.webp',
      fotoBaganLink: null,
    });
    expect(formDariDetail({ ...detail, lat: null, lng: null }).koordinat).toBeNull();
  });

  it('body API: medsos tanpa URL dibuang, koordinat kosong → null, foto memakai id yang diberikan', () => {
    const form = { ...formDariDetail(detail), koordinat: null, mediaSosial: [...detail.mediaSosial, { platform: 'tiktok' as const, url: ' ' }] };
    const body = payloadDariForm(form, { fotoSekolahId: 'baru', fotoBaganStrukturId: null });
    expect(body).toMatchObject({ lat: null, lng: null, fotoSekolahId: 'baru', fotoBaganStrukturId: null, linkGoogleMaps: 'https://maps.app.goo.gl/Contoh123' });
    expect(body.mediaSosial).toEqual(detail.mediaSosial);
  });

  it('validasi sama dengan server: nama & jenjang wajib, medsos invalid & link non-Google ditolak, lokasi opsional', () => {
    expect(cekFormLembaga(FORM_LEMBAGA_KOSONG)).toBe('Nama lembaga wajib diisi');
    expect(cekFormLembaga({ ...FORM_LEMBAGA_KOSONG, nama: 'TK A' })).toBe('Jenjang pendidikan wajib dipilih');
    expect(cekFormLembaga({ ...FORM_LEMBAGA_KOSONG, nama: 'TK A', jenjangId: 'j-tk' })).toBeNull();
    const valid = formDariDetail(detail);
    expect(cekFormLembaga({ ...valid, mediaSosial: [{ platform: 'instagram', url: 'akun' }] })).toBe('URL harus diawali http:// atau https://');
    expect(cekFormLembaga({ ...valid, linkMaps: 'https://evil.example/x' })).toContain('Google Maps');
  });

  it('field form memuat semua field detail baru', () => {
    const html = render(
      <LembagaFormFields
        value={formDariDetail(detail)}
        onChange={vi.fn()}
        jenjangOptions={[{ value: 'j-tk', label: 'TK' }]}
        fotoBaru={FOTO_LEMBAGA_KOSONG}
        onFotoBaru={vi.fn()}
      />,
    );
    for (const label of ['Nama Lembaga', 'Jenjang Pendidikan', 'Deskripsi', 'Alamat', 'Kontak', 'Link Google Maps', 'Foto Sekolah (opsional)', 'Foto Bagan Struktur Organisasi (opsional)']) {
      expect(html).toContain(label);
    }
    expect(html).toContain('data-testid="lokasi-input"');
    expect(html).toContain('value="https://facebook.com/tk_contoh"');
    expect(html).toContain('src="/api/img/sekolah.webp"');
    expect(html).toContain('Hapus titik'); // lokasi sekolah opsional → titik bisa dikosongkan
  });
});

describe('lembagaPendidikan.simpan', () => {
  const form = { ...FORM_LEMBAGA_KOSONG, nama: 'TK Contoh Ceria', jenjangId: 'j-tk' };
  const file = new File(['x'], 'sekolah.webp', { type: 'image/webp' });

  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('form invalid → toast, tanpa request', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    expect(await lembagaPendidikan.simpan(null, FORM_LEMBAGA_KOSONG, FOTO_LEMBAGA_KOSONG)).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('Nama lembaga wajib diisi');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sukses: foto sekolah diunggah dulu, body POST memuat id-nya, id lembaga dikembalikan', async () => {
    upload.mockResolvedValueOnce({ data: { data: { id: 'img-baru' } } });
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ success: true, data: { id: 'lb-baru' } })));
    vi.stubGlobal('fetch', fetchSpy);
    expect(await lembagaPendidikan.simpan(null, form, { fotoSekolah: file, bagan: null })).toBe('lb-baru');
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/pendidikan/infosekolahpaud/lembagapendidikan/create');
    expect(JSON.parse(init.body as string)).toMatchObject({ nama: 'TK Contoh Ceria', fotoSekolahId: 'img-baru', fotoBaganStrukturId: null });
    expect(toast.success).toHaveBeenCalled();
    expect(lembagaPendidikan.saving).toBe(false);
  });

  it('server menolak → console.error berkonteks, unggahan yatim dihapus, pesan server di toast', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    upload.mockResolvedValueOnce({ data: { data: { id: 'img-yatim' } } });
    hapusBerkas.mockResolvedValueOnce(undefined);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: false, message: 'Jenjang tidak ada' }), { status: 400 })));
    expect(await lembagaPendidikan.simpan('lb1', form, { fotoSekolah: null, bagan: file })).toBeNull();
    expect(error).toHaveBeenCalledWith('[lembaga] Gagal menyimpan lembaga lb1:', expect.any(Error));
    expect(hapusBerkas).toHaveBeenCalledWith('img-yatim');
    expect(toast.error).toHaveBeenCalledWith('Jenjang tidak ada');
    error.mockRestore();
  });
});

describe('createDetailEntriState (bersama Bank Sampah & Lembaga)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('respons id lama diabaikan; 404 → gagal', async () => {
    let lepasPertama: (r: Response) => void = () => undefined;
    const pertama = new Promise<Response>((resolve) => (lepasPertama = resolve));
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => (url.endsWith('/a') ? pertama : Promise.resolve(new Response(JSON.stringify({ success: true, data: { id: 'b' } }))))),
    );
    const state = createDetailEntriState<{ id: string }>({ url: (id) => `/x/${id}`, tag: 'test' });
    const muatA = state.load('a');
    await state.load('b');
    lepasPertama(new Response(JSON.stringify({ success: true, data: { id: 'a' } })));
    await muatA;
    expect(state.data).toEqual({ id: 'b' });
    expect(state.loading).toBe(false);

    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: false }), { status: 404 })));
    await state.load('c');
    expect(state).toMatchObject({ data: null, gagal: true, loading: false });
  });
});
