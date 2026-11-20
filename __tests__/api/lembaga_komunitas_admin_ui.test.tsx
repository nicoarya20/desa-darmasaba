// @vitest-environment node
// Lembaga & Komunitas: UI admin (SSR) — form (field, nilai terkontrol dari proxy, saran jenis, foto saat ini), tabel (foto,
// aksi berlabel nama), dan daftar (keadaan memuat/kosong/isi + paginasi + pesan kosong per filter). Klik tidak teruji
// (jsdom rusak); yang diuji markup tiap keadaan.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: {} } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: 'lk-1' }),
}));

import LembagaKomunitasForm from '@/app/admin/(dashboard)/pemerintahan/lembaga-komunitas/_com/LembagaKomunitasForm';
import { emptyMessage, LembagaKomunitasList } from '@/app/admin/(dashboard)/pemerintahan/lembaga-komunitas/_com/LembagaKomunitasList';
import { LembagaKomunitasTable } from '@/app/admin/(dashboard)/pemerintahan/lembaga-komunitas/_com/LembagaKomunitasTable';
import { LEMBAGA_KOMUNITAS_ADMIN_TEXT as T } from '@/app/admin/(dashboard)/pemerintahan/lembaga-komunitas/_com/lembaga-komunitas.text';
import state, { type LembagaKomunitasItem } from '@/app/admin/(dashboard)/_state/desa/lembagaKomunitas';
import { DESKRIPSI_LEMBAGA_MAX, KONTAK_LEMBAGA_MAX, NAMA_LEMBAGA_MAX } from '@/lib/lembaga-komunitas';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: baris rekaan untuk menguji markup, bukan lembaga nyata Desa Darmasaba.
const ROW_A: LembagaKomunitasItem = {
  id: 'a',
  nama: 'PKK Banjar A',
  jenis: 'PKK',
  deskripsi: null,
  ketua: 'Ni Contoh',
  kontak: null,
  urutan: 1,
  foto: { id: 'f1', link: '/api/img/a.webp' },
};
const ROW_B: LembagaKomunitasItem = { ...ROW_A, id: 'b', nama: 'STT Banjar B', jenis: 'STT', ketua: null, urutan: 2, foto: null };
/** Tag tombol aksi menurut aria-label. */
const action = (html: string, label: string) => html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? '';

beforeEach(() => {
  state.findMany.data = [];
  state.findMany.page = 1;
  state.findMany.totalPages = 1;
  state.findMany.loading = false;
  state.jenis.data = [];
  state.delete.loading = false;
  state.create.reset();
});

describe('LembagaKomunitasForm', () => {
  const form = (props: Partial<React.ComponentProps<typeof LembagaKomunitasForm>> = {}) =>
    render(
      <LembagaKomunitasForm
        form={state.create.form}
        loading={false}
        submitLabel={T.submitCreate}
        jenisOptions={[]}
        onSubmit={() => {}}
        {...props}
      />,
    );

  it('field: nama, jenis, ketua, kontak, deskripsi, urutan, foto, dan tombol simpan', () => {
    const html = form();
    for (const label of [T.formNama, T.formJenis, T.formKetua, T.formKontak, T.formDeskripsi, T.formUrutan, T.formFoto]) {
      expect(html).toContain(label);
    }
    expect(html).toContain(`maxLength="${NAMA_LEMBAGA_MAX}"`);
    expect(html).toContain(`maxLength="${KONTAK_LEMBAGA_MAX}"`);
    expect(html).toContain(`maxLength="${DESKRIPSI_LEMBAGA_MAX}"`);
    expect(html).toContain(T.submitCreate);
  });

  it('kontak diberi petunjuk: kontak lembaga, bukan nomor pribadi', () => {
    expect(form()).toContain('bukan nomor pribadi pengurus');
  });

  it('nilai terkontrol dari proxy form', () => {
    Object.assign(state.create.form, { nama: 'Nama Uji', jenis: 'STT', ketua: 'Ketua Uji', kontak: '0361-123456', deskripsi: 'Isi uji', urutan: 7 });
    const html = form();
    for (const value of ['value="Nama Uji"', 'value="STT"', 'value="Ketua Uji"', 'value="0361-123456"', 'value="7"']) {
      expect(html).toContain(value);
    }
    expect(html).toContain('Isi uji');
  });

  it('mode edit: foto tersimpan jadi pratinjau (dengan tombol lepas); mode tambah: tanpa pratinjau', () => {
    const edit = form({ currentFoto: { id: 'f1', link: '/api/img/a.webp' } });
    expect(edit).toContain('src="/api/img/a.webp"');
    expect(edit).toContain('aria-label="Lepas foto"');
    const baru = form();
    expect(baru).not.toContain('<img');
    expect(baru).not.toContain('aria-label="Lepas foto"');
  });
});

describe('LembagaKomunitasTable', () => {
  const table = (items: LembagaKomunitasItem[]) => render(<LembagaKomunitasTable items={items} onEdit={() => {}} onDelete={() => {}} />);

  it('baris: nama, ketua (bila ada), jenis, urutan; foto hanya bila ada', () => {
    const html = table([ROW_A, ROW_B]);
    for (const teks of ['PKK Banjar A', 'STT Banjar B', 'Ni Contoh', 'PKK', 'STT']) expect(html).toContain(teks);
    expect(html).toContain('src="/api/img/a.webp"');
    expect(html.match(/<img/g)).toHaveLength(1);
  });

  it('edit dan hapus ada per baris, berlabel nama', () => {
    const html = table([ROW_A, ROW_B]);
    for (const item of [ROW_A, ROW_B]) {
      expect(action(html, T.editLabel(item.nama))).not.toBe('');
      expect(action(html, T.deleteLabel(item.nama))).not.toBe('');
    }
  });
});

describe('LembagaKomunitasList', () => {
  const list = (search = '') => render(<LembagaKomunitasList search={search} />);

  it('memuat: kerangka, tanpa tabel dan tanpa pesan kosong', () => {
    state.findMany.loading = true;
    const html = list();
    expect(html).not.toContain('<table');
    expect(html).not.toContain(T.empty);
  });

  it('kosong: pesan kosong dan tombol Tambah Baru tetap ada', () => {
    const html = list();
    expect(html).toContain(T.empty);
    expect(html).toContain(T.addNew);
    expect(html).not.toContain('<table');
  });

  it('isi: tabel dengan baris, filter jenis tersedia; paginasi hanya bila > 1 halaman', () => {
    state.findMany.data = [ROW_A, ROW_B];
    state.jenis.data = ['PKK', 'STT'];
    const satu = list();
    expect(satu).toContain('<table');
    expect(satu).toContain(`aria-label="${T.filterJenis}"`);
    expect(satu).not.toContain('mantine-Pagination-root');

    state.findMany.totalPages = 3;
    expect(list()).toContain('mantine-Pagination-root');
  });

  it('dialog hapus tertutup saat belum ada baris dipilih', () => {
    state.findMany.data = [ROW_A];
    expect(list()).not.toContain(T.confirmDelete);
  });

  it('emptyMessage: kata kunci > jenis > tanpa filter', () => {
    expect(emptyMessage('pkk', 'PKK')).toBe(T.emptySearch);
    expect(emptyMessage('', 'PKK')).toBe(T.emptyJenis);
    expect(emptyMessage('', '')).toBe(T.empty);
  });
});
