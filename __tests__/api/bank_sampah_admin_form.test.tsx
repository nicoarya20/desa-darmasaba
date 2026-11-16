// @vitest-environment node
// Logika form admin Bank Sampah (isi dari detail, body API, validasi sama dengan server) dan section admin
// bersama pengurus/galeri yang dipasang di halaman edit.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api-fetch', () => ({ default: { api: {} } }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import GaleriFotoAdmin from '@/app/admin/(dashboard)/_com/konten-bersama/galeri-foto.admin';
import StrukturPengurusAdmin from '@/app/admin/(dashboard)/_com/konten-bersama/struktur-pengurus.admin';
import {
  cekFormBankSampah,
  FORM_BANK_SAMPAH_KOSONG,
  formDariDetail,
  payloadDariForm,
} from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.form';
import { createDaftarAnakState } from '@/app/admin/(dashboard)/_state/konten-bersama/daftar-anak.state';
import type { BankSampahDetail } from '@/lib/bank-sampah/bank-sampah.types';
import type { FotoGaleriItem, PengurusItem } from '@/lib/konten-bersama/konten-bersama.types';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: data rekaan.
const detail: BankSampahDetail = {
  id: 'bs1',
  name: 'TPS Contoh',
  alamat: 'Jl. Contoh',
  namaTempatMaps: 'TPS Contoh',
  linkPetunjukArah: 'https://www.google.com/maps/dir/?api=1&destination=-8.6,115.2',
  lat: -8.6,
  lng: 115.2,
  deskripsi: null,
  kontak: '081200001111',
  mediaSosial: [{ platform: 'instagram', url: 'https://www.instagram.com/a' }],
  fotoBaganStrukturId: 'bagan',
  fotoBaganStruktur: { id: 'bagan', link: '/api/img/bagan.webp' },
  pengurus: [],
  fotoKegiatan: [],
  programInovasi: [{ id: 'inov-1', name: 'Inovasi Contoh' }],
};

describe('form bank sampah', () => {
  it('isi dari detail: link rute otomatis tampil kosong, link Google Maps sendiri dipertahankan', () => {
    const form = formDariDetail(detail);
    expect(form).toMatchObject({ linkMaps: '', deskripsi: '', programInovasiIds: ['inov-1'], fotoBaganLink: '/api/img/bagan.webp' });
    expect(formDariDetail({ ...detail, linkPetunjukArah: 'https://maps.app.goo.gl/x' }).linkMaps).toBe('https://maps.app.goo.gl/x');
  });

  it('body API: baris medsos tanpa URL dibuang, bagan memakai id yang diberikan', () => {
    const form = { ...formDariDetail(detail), mediaSosial: [...detail.mediaSosial, { platform: 'tiktok' as const, url: ' ' }] };
    const body = payloadDariForm(form, null);
    expect(body.mediaSosial).toEqual(detail.mediaSosial);
    expect(body).toMatchObject({ lat: -8.6, lng: 115.2, fotoBaganStrukturId: null, programInovasiIds: ['inov-1'] });
  });

  it('validasi sama dengan server: lokasi wajib, medsos invalid & link non-Google ditolak', () => {
    expect(cekFormBankSampah({ ...FORM_BANK_SAMPAH_KOSONG, name: 'A', alamat: 'B', namaTempatMaps: 'C' })).toBe('Silakan pilih lokasi di peta');
    const valid = formDariDetail(detail);
    expect(cekFormBankSampah(valid)).toBeNull();
    expect(cekFormBankSampah({ ...valid, mediaSosial: [{ platform: 'instagram', url: 'akun' }] })).toBe('URL harus diawali http:// atau https://');
    expect(cekFormBankSampah({ ...valid, linkMaps: 'https://evil.example/x' })).toContain('Google Maps');
    expect(cekFormBankSampah({ ...valid, name: ' ' })).toBe('Nama bank sampah wajib diisi');
  });
});

describe('section admin bersama', () => {
  it('pengurus: daftar nama + jabatan dengan aksi berlabel', () => {
    const state = createDaftarAnakState<PengurusItem>({ url: (id) => `/x/${id}`, label: 'pengurus', tag: 'test' });
    state.loaded = true;
    state.data = [{ id: 'p1', nama: 'Ketua Contoh', jabatan: 'Ketua', urutan: 0, imageId: null, image: null }];
    const html = render(<StrukturPengurusAdmin state={state} max={50} />);
    expect(html).toContain('Ketua Contoh');
    expect(html).toContain('aria-label="Edit Ketua Contoh"');
    expect(html).toMatch(/aria-label="Geser Ketua Contoh ke atas"[^>]*disabled/);
  });

  it('galeri: jumlah/batas dan grid foto', () => {
    const state = createDaftarAnakState<FotoGaleriItem>({ url: (id) => `/x/${id}`, label: 'foto', tag: 'test' });
    state.loaded = true;
    state.data = [{ id: 'g1', imageId: 'i1', keterangan: 'Kegiatan', urutan: 0, image: { id: 'i1', link: '/api/img/i1.webp' } }];
    const html = render(<GaleriFotoAdmin state={state} max={50} />);
    expect(html).toContain('1/50 foto');
    expect(html).toContain('value="Kegiatan"');
    expect(html).toContain('Dokumentasi Kegiatan');
  });
});
