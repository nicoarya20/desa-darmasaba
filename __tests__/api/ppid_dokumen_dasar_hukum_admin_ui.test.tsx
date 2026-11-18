// @vitest-environment node
// Lomba 2.5: UI admin dokumen Dasar Hukum (SSR) — dropzone multi-PDF bersama, pengelola (daftar, naik/turun,
// lihat, hapus) dan pratinjau. Klik/unggah tidak teruji (jsdom rusak); yang diuji markup untuk tiap keadaan.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: {} } }));

import PdfMultiDropzoneField, {
  pdfTitleFromFileName,
  type PdfMultiItem,
} from '@/app/admin/_com/upload/PdfMultiDropzoneField';
import { DokumenDasarHukumManager } from '@/app/admin/(dashboard)/ppid/dasar-hukum/_com/DokumenDasarHukumManager';
import { DokumenDasarHukumPreview } from '@/app/admin/(dashboard)/ppid/dasar-hukum/_com/DokumenDasarHukumPreview';
import state from '@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dokumenDasarHukum';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: berkas dan baris rekaan.
const pdf = (name: string) => new File(['x'], name, { type: 'application/pdf' });
const doc = (id: string, urutan: number) => ({
  id,
  judul: `Peraturan ${id}`,
  urutan,
  file: { id: `f-${id}`, link: `/api/fileStorage/findUnique/${id}.pdf`, realName: `${id}.pdf` },
});
/** Tag tombol aksi (ActionIcon) menurut aria-label, supaya status disabled-nya bisa diperiksa. */
const button = (html: string, label: string, nth = 0) =>
  [...html.matchAll(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`, 'g'))][nth]?.[0] ?? '';

beforeEach(() => {
  state.list.data = [];
  state.list.drafts = {};
  state.list.busyId = null;
  state.pending.setItems([]);
  state.pending.saving = false;
});

describe('PdfMultiDropzoneField', () => {
  const field = (items: PdfMultiItem[], props: Partial<React.ComponentProps<typeof PdfMultiDropzoneField>> = {}) =>
    render(<PdfMultiDropzoneField label="Tambah dokumen" items={items} onChange={() => {}} {...props} />);

  it('kosong: label, petunjuk banyak berkas, dan tanpa baris judul', () => {
    const html = field([], { description: 'Pilih beberapa PDF' });
    expect(html).toContain('Tambah dokumen');
    expect(html).toContain('Pilih beberapa PDF');
    expect(html).toContain('Seret satu atau beberapa PDF');
    expect(html).toContain('multiple');
    expect(html).not.toContain('Batalkan');
  });

  it('tiap berkas: judul awal bisa diedit (value), nama berkas jadi label, batas panjang, tombol batal', () => {
    const items: PdfMultiItem[] = [
      { key: 'a', file: pdf('Perdes 1.pdf'), judul: 'Perdes 1' },
      { key: 'b', file: pdf('SK Perbekel.pdf'), judul: 'SK Perbekel' },
    ];
    const html = field(items, { maxJudulLength: 200 });
    expect(html).toContain('Perdes 1.pdf');
    expect(html).toContain('SK Perbekel.pdf');
    expect(html).toContain('value="Perdes 1"');
    expect(html).toContain('value="SK Perbekel"');
    expect(html).toContain('maxLength="200"');
    expect(html).toContain('aria-label="Batalkan Perdes 1.pdf"');
  });

  it('hasil per berkas: badge status dan pesan galat tampil, hanya untuk berkas yang punya status', () => {
    const html = field([
      { key: 'a', file: pdf('a.pdf'), judul: 'A', status: 'berhasil' },
      { key: 'b', file: pdf('b.pdf'), judul: 'B', status: 'gagal', pesan: 'Unggah berkas gagal' },
      { key: 'c', file: pdf('c.pdf'), judul: 'C' },
    ]);
    expect(html).toContain('Berhasil');
    expect(html).toContain('Gagal');
    expect(html).toContain('Unggah berkas gagal');
    expect(html.match(/Berhasil|Gagal/g)).toHaveLength(2);
  });

  it('disabled mematikan kolom judul dan tombol batal', () => {
    const html = field([{ key: 'a', file: pdf('a.pdf'), judul: 'A' }], { disabled: true });
    expect(button(html, 'Batalkan a.pdf')).toContain('disabled');
    expect(html).toMatch(/<input[^>]*disabled/);
  });

  it('pdfTitleFromFileName: buang .pdf (huruf besar juga) dan pangkas ke batas', () => {
    expect(pdfTitleFromFileName('Perdes Nomor 1.PDF')).toBe('Perdes Nomor 1');
    expect(pdfTitleFromFileName('tanpa-ekstensi')).toBe('tanpa-ekstensi');
    expect(pdfTitleFromFileName('x'.repeat(250) + '.pdf', 200)).toHaveLength(200);
  });
});

describe('DokumenDasarHukumManager', () => {
  it('belum ada dokumen: pesan kosong, tanpa tombol simpan', () => {
    const html = render(<DokumenDasarHukumManager />);
    expect(html).toContain('Dokumen Dasar Hukum');
    expect(html).toContain('Belum ada dokumen dasar hukum.');
    expect(html).not.toContain('Simpan dokumen');
  });

  it('daftar: judul bisa diedit, tautan "Lihat" tab baru, naik/turun & hapus per baris', () => {
    state.list.data = [doc('a', 0), doc('b', 1), doc('c', 2)];
    const html = render(<DokumenDasarHukumManager />);
    expect(html).not.toContain('Belum ada dokumen dasar hukum.');
    expect(html).toContain('value="Peraturan a"');
    expect(html).toContain('value="Peraturan c"');
    expect(html).toContain('href="/api/fileStorage/findUnique/b.pdf"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html.match(/aria-label="Hapus"/g)).toHaveLength(3);
  });

  it('naik dimatikan di baris pertama, turun dimatikan di baris terakhir', () => {
    state.list.data = [doc('a', 0), doc('b', 1), doc('c', 2)];
    const html = render(<DokumenDasarHukumManager />);
    expect(button(html, 'Naikkan', 0)).toContain('disabled');
    expect(button(html, 'Naikkan', 1)).not.toContain('disabled');
    expect(button(html, 'Turunkan', 1)).not.toContain('disabled');
    expect(button(html, 'Turunkan', 2)).toContain('disabled');
  });

  it('judul diedit (draft berbeda): tombol "Simpan judul" muncul hanya untuk baris itu', () => {
    state.list.data = [doc('a', 0), doc('b', 1)];
    state.list.drafts = { b: 'Judul Baru B' };
    const html = render(<DokumenDasarHukumManager />);
    expect(html).toContain('value="Judul Baru B"');
    expect(html.match(/aria-label="Simpan judul"/g)).toHaveLength(1);
  });

  it('ada operasi berjalan (busyId): semua tombol aksi baris dimatikan', () => {
    state.list.data = [doc('a', 0), doc('b', 1)];
    state.list.busyId = 'a';
    const html = render(<DokumenDasarHukumManager />);
    expect(button(html, 'Hapus', 0)).toContain('disabled');
    expect(button(html, 'Hapus', 1)).toContain('disabled');
  });

  it('antrean berkas baru: baris judul dan tombol "Simpan dokumen" muncul', () => {
    state.pending.setItems([{ key: 'p1', file: pdf('Perdes Baru.pdf'), judul: 'Perdes Baru' }]);
    const html = render(<DokumenDasarHukumManager />);
    expect(html).toContain('Perdes Baru.pdf');
    expect(html).toContain('value="Perdes Baru"');
    expect(html).toContain('Simpan dokumen');
  });
});

describe('DokumenDasarHukumPreview', () => {
  it('tersembunyi bila belum ada dokumen', () => {
    expect(render(<DokumenDasarHukumPreview />)).toBe('');
  });

  it('menampilkan daftar bernomor dengan tautan "Lihat" ke tab baru', () => {
    state.list.data = [doc('a', 0), doc('b', 1)];
    const html = render(<DokumenDasarHukumPreview />);
    expect(html).toContain('1. Peraturan a');
    expect(html).toContain('2. Peraturan b');
    expect(html).toContain('href="/api/fileStorage/findUnique/a.pdf"');
    expect(html.match(/target="_blank"/g)).toHaveLength(2);
  });
});
