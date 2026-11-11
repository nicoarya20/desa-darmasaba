// @vitest-environment node
// Admin Struktur Perangkat Desa: markup list/detail (field kosong "—"), tanda wajib di form, tabel jabatan, bagan.
// jsdom gagal start di repo ini → markup via renderToStaticMarkup; klik tidak diuji.
import type { AnchorHTMLAttributes } from 'react';
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));

import { PegawaiTable } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PegawaiTable';
import { PegawaiDetail } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PegawaiDetail';
import { PegawaiFormFields } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PegawaiFormFields';
import { PosisiFormFields } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PosisiFormFields';
import { PosisiTable } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PosisiTable';
import { StrukturBaganAdmin } from '@/app/admin/(dashboard)/_com/struktur-organisasi/StrukturBaganAdmin';
import type { PegawaiRow, PosisiRow } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.logic';

const render = (ui: React.ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const count = (html: string, needle: string) => html.split(needle).length - 1;
const REQUIRED = 'mantine-InputWrapper-required';

// test-only: pegawai tanpa field opsional
const PEGAWAI: PegawaiRow = {
  id: 'pg-1',
  namaLengkap: 'I Made Ari',
  gelarAkademik: null,
  email: null,
  telepon: '',
  alamat: null,
  tanggalMasuk: null,
  isActive: true,
  image: null,
  posisi: { nama: 'Perbekel' },
};
const POSISI: PosisiRow[] = [
  { id: 'pd-perbekel', nama: 'Perbekel', hierarki: 1, urutan: 1, parentId: null, isActive: true, _count: { pegawai: 1 } },
  { id: 'pd-sekretaris-desa', nama: 'Sekretaris Desa', hierarki: 2, urutan: null, parentId: 'pd-perbekel', isActive: false, _count: { pegawai: 3 } },
];
const EMPTY_FORM = { namaLengkap: '', gelarAkademik: '', imageId: '', tanggalMasuk: '', email: '', telepon: '', alamat: '', posisiId: '', isActive: true };
const noop = () => {};

/** Teks label input beserta penanda wajib (bila ada) — dari <label> sampai </label>. */
const labelOf = (html: string, text: string) => html.match(new RegExp(`<label[^>]*>${text}(.*?)</label>`))?.[0] ?? '';

describe('list & detail pegawai', () => {
  it('tabel menampilkan "—" untuk gelar & telepon kosong', () => {
    const html = render(<PegawaiTable items={[PEGAWAI]} onDetail={noop} />);
    expect(html).toContain('I Made Ari');
    expect(html).toContain('Perbekel');
    // desktop (gelar + telepon) + kartu ponsel (gelar + telepon)
    expect(count(html, '>—<')).toBe(4);
  });

  it('detail menampilkan "—" untuk semua field opsional kosong dan teks foto kosong', () => {
    const html = render(<PegawaiDetail data={PEGAWAI} />);
    expect(count(html, '>—<')).toBe(5); // gelar, tanggal masuk, email, telepon, alamat
    expect(html).toContain('Belum ada foto');
    expect(html).toContain('Aktif');
  });
});

describe('form pegawai', () => {
  const html = render(
    <PegawaiFormFields
      values={EMPTY_FORM}
      onChange={noop}
      posisiOptions={[{ value: 'pd-perbekel', label: 'Perbekel' }]}
      foto={{ preview: null, onPick: noop, onRemove: noop }}
    />,
  );

  it('hanya Nama Lengkap + Jabatan bertanda wajib', () => {
    expect(count(html, REQUIRED)).toBe(2);
    expect(labelOf(html, 'Nama Lengkap')).toContain(REQUIRED);
    expect(labelOf(html, 'Jabatan')).toContain(REQUIRED);
    for (const opsional of ['Gelar Akademik', 'Tanggal Masuk', 'Email', 'Nomor Telepon', 'Alamat']) {
      const label = labelOf(html, opsional);
      expect(label, opsional).not.toBe('');
      expect(label, opsional).not.toContain(REQUIRED);
    }
  });

  it('foto opsional (tanpa tanda wajib) dan form kosong belum menampilkan error', () => {
    expect(html).toContain('Opsional. Maksimal 5MB');
    expect(html).not.toContain('Format email tidak valid');
    expect(html).not.toContain('aria-invalid="true"');
  });

  it('email salah yang sudah diisi ditandai error', () => {
    const invalid = render(
      <PegawaiFormFields values={{ ...EMPTY_FORM, email: 'salah' }} onChange={noop} posisiOptions={[]} foto={{ preview: null, onPick: noop, onRemove: noop }} />,
    );
    expect(count(invalid, 'aria-invalid="true"')).toBe(1);
  });
});

describe('jabatan', () => {
  it('form: hanya Nama Jabatan + Hierarki bertanda wajib, atasan opsional', () => {
    const values = { nama: '', deskripsi: '', hierarki: null, urutan: null, parentId: '', isActive: true };
    const html = render(<PosisiFormFields values={values} onChange={noop} atasanOptions={[]} />);
    expect(count(html, REQUIRED)).toBe(2);
    expect(labelOf(html, 'Atasan')).not.toContain(REQUIRED);
  });

  it('tabel menampilkan nama atasan, "Puncak", jumlah pegawai, dan "—" untuk urutan kosong', () => {
    const html = render(<PosisiTable items={POSISI} onEdit={noop} onDelete={noop} />);
    expect(html).toContain('Puncak');
    expect(html).toContain('>Perbekel<'); // atasan Sekretaris Desa
    expect(html).toContain('>3<');
    expect(html).toContain('>—<');
    expect(html).toContain('Tidak Aktif');
  });
});

describe('bagan admin', () => {
  it('jabatan kosong tampil "Belum ditugaskan", kartu pegawai menuju detail admin', () => {
    const roots = [
      { posisiId: 'pd-perbekel', title: 'Perbekel', hierarki: 1, people: [{ id: 'pg-1', name: 'I Made Ari', image: null }], children: [
        { posisiId: 'pd-sekretaris-desa', title: 'Sekretaris Desa', hierarki: 2, people: [], children: [] },
      ] },
    ];
    const html = render(<StrukturBaganAdmin roots={roots} label="Bagan" hrefFor={(id) => `/admin/x/${id}`} />);
    expect(html).toContain('Belum ditugaskan');
    expect(html).toContain('href="/admin/x/pg-1"');
  });

  it('tanpa jabatan → pesan kosong', () => {
    expect(render(<StrukturBaganAdmin roots={[]} label="Bagan" hrefFor={String} />)).toContain('Belum ada jabatan');
  });
});
