// @vitest-environment node
// Admin Posyandu: form "Profil & Klaster" (isi dari API, body PUT, validasi = server), form posyandu banjar
// (banjar wajib di UI, alamat, keterangan opsional) dan markup field-nya. Editor teks kaya di-mock (tiptap
// tidak dirender di server).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api-fetch', () => ({ default: { api: {} } }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/app/admin/(dashboard)/_com/editEditor', () => ({
  default: ({ value }: { value: string }) => <div data-testid="editor">{value}</div>,
}));
vi.mock('@/components/admin/JadwalPelayananInput', () => ({ default: () => <div data-testid="jadwal-input" /> }));

import KlasterFields from '@/app/admin/(dashboard)/kesehatan/posyandu/_com/klaster.fields';
import PosyanduFormFields from '@/app/admin/(dashboard)/kesehatan/posyandu/_com/posyandu.form-fields';
import ProfilKlasterForm from '@/app/admin/(dashboard)/kesehatan/posyandu/_com/profil-klaster.form';
import {
  cekFormProfil,
  formDariProfil,
  payloadDariProfil,
} from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu-profil.form';
import { cekFormPosyandu, FORM_POSYANDU_KOSONG, formDariPosyandu } from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.form';
import type { ProfilPosyanduData } from '@/lib/posyandu/posyandu-konten.types';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

// test-only: respons GET /profil rekaan (klaster remaja belum ada barisnya).
const data: ProfilPosyanduData = {
  profil: { deskripsi: '<p>Deskripsi umum contoh</p>', fungsiKegiatan: null },
  klaster: [
    { id: 'k1', sasaran: 'lansia', judul: 'Lansia Contoh', deskripsi: 'Senam', jamPelayanan: '16.00 WITA', urutan: 3, imageId: 'g1', image: { id: 'g1', link: '/api/img/g1.webp' } },
    { id: 'k2', sasaran: 'balita', judul: 'Balita Contoh', deskripsi: 'Timbang', jamPelayanan: null, urutan: 1, imageId: null, image: null },
  ],
};
// test-only: posyandu banjar rekaan.
const posyandu = { name: 'Posyandu Contoh', nomor: '081200000000', banjarId: 'b1', alamat: null, deskripsi: '', jadwalPelayanan: '[{"hari":"senin","buka":"09:00","tutup":"11:00"}]' };

describe('form Profil & Klaster', () => {
  it('selalu 3 klaster urut balita, remaja, lansia; yang belum ada diisi judul default', () => {
    const form = formDariProfil(data);
    expect(form.klaster.map((k) => k.sasaran)).toEqual(['balita', 'remaja', 'lansia']);
    expect(form.klaster[1]).toMatchObject({ judul: 'Posyandu Remaja', deskripsi: '', imageId: null });
    expect(form.klaster[2]).toMatchObject({ judul: 'Lansia Contoh', jamPelayanan: '16.00 WITA', imageLink: '/api/img/g1.webp' });
    expect(formDariProfil(null).deskripsi).toBe('');
  });

  it('body PUT memakai gambar baru per sasaran, gambar tersimpan tetap, gambar dilepas = null', () => {
    const form = formDariProfil(data);
    form.klaster[0].imageId = null;
    const body = payloadDariProfil(form, { remaja: 'baru-r' });
    expect(body.klaster.map((k) => k.imageId)).toEqual([null, 'baru-r', 'g1']);
    expect(body.deskripsi).toBe('<p>Deskripsi umum contoh</p>');
  });

  it('validasi sama dengan server: fokus layanan klaster wajib, deskripsi umum wajib', () => {
    expect(cekFormProfil(formDariProfil(data))).toBe('Fokus layanan klaster wajib diisi');
    const lengkap = formDariProfil(data);
    lengkap.klaster[1].deskripsi = 'Edukasi gizi remaja';
    expect(cekFormProfil(lengkap)).toBeNull();
    expect(cekFormProfil({ ...lengkap, deskripsi: '<p></p>' })).toBe('Deskripsi umum wajib diisi');
  });

  it('markup form: editor deskripsi + 3 kartu klaster berlabel', () => {
    const out = text(render(<ProfilKlasterForm awal={formDariProfil(data)} />));
    expect(out).toContain('Deskripsi Umum Posyandu');
    expect(out).toContain('Deskripsi umum contoh');
    for (const label of ['Klaster Balita', 'Klaster Remaja', 'Klaster Lansia & PROLANIS']) expect(out).toContain(label);
  });

  it('kartu klaster memuat judul, fokus layanan, jam, dan gambar tersimpan', () => {
    const html = render(<KlasterFields value={formDariProfil(data).klaster[2]} onChange={vi.fn()} gambarBaru={null} onGambarBaru={vi.fn()} />);
    expect(text(html)).toContain('Fokus layanan');
    expect(html).toContain('value="16.00 WITA"');
    expect(html).toContain('/api/img/g1.webp');
  });
});

describe('form posyandu banjar', () => {
  it('banjar wajib dipilih di UI; keterangan per posyandu boleh kosong', () => {
    const form = formDariPosyandu(posyandu);
    expect(form.alamat).toBe('');
    expect(cekFormPosyandu(form, true)).toBeNull();
    expect(cekFormPosyandu({ ...form, banjarId: '' }, true)).toBe('Banjar wajib dipilih');
    expect(cekFormPosyandu(form, false)).toBe('Gambar wajib dipilih');
    expect(cekFormPosyandu({ ...form, alamat: 'x'.repeat(501) }, true)).toBe('Alamat maksimal 500 karakter');
    expect(cekFormPosyandu(FORM_POSYANDU_KOSONG, true)).toBe('Nama posyandu wajib diisi');
  });

  it('field form memuat alamat, banjar wajib, dan info deskripsi umum di tab Profil & Klaster', () => {
    const html = render(
      <PosyanduFormFields
        value={{ ...formDariPosyandu(posyandu), alamat: 'Balai Banjar Contoh' }}
        onChange={vi.fn()}
        banjar={[{ id: 'b1', name: 'Banjar Contoh' }]}
        gambarUrl="/api/img/lokasi.webp"
        gambarBaru={null}
        onGambarBaru={vi.fn()}
      />,
    );
    const out = text(html);
    expect(out).toContain('Alamat');
    expect(html).toContain('Balai Banjar Contoh');
    expect(out).toContain('Banjar');
    expect(html).toMatch(/<input[^>]*required[^>]*value="Banjar Contoh"|value="Banjar Contoh"[^>]*required/);
    expect(out).toContain('Profil & Klaster');
    expect(html).toContain('/api/img/lokasi.webp');
  });
});
