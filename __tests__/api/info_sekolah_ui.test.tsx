// @vitest-environment node
// Info Sekolah publik: filter jenjang pindah dari pil di layout ke Select di tiap tabel. jsdom rusak di repo ini →
// markup diuji via renderToStaticMarkup (efek fetch tidak jalan di server; data diisi lewat props/state).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

import {
  InfoSekolahListPanel,
  type InfoSekolahColumn,
} from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/InfoSekolahListPanel';
import type { InfoSekolahQuery } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/info-sekolah.logic';
import Layout from '@/app/(public)/(pages)/pendidikan/info-sekolah/layout';
import SekolahPage from '@/app/(public)/(pages)/pendidikan/info-sekolah/page';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

type Row = { id: string; nama: string; jenjang: string };
// test-only: baris lembaga sederhana.
const ROWS: Row[] = [
  { id: '1', nama: 'SD No. 1 Darmasaba', jenjang: 'SD' },
  { id: '2', nama: 'SD No. 2 Darmasaba', jenjang: 'SD' },
];
const COLUMNS: InfoSekolahColumn<Row>[] = [
  { header: 'Nama Lembaga', width: '60%', render: (r) => r.nama },
  { header: 'Jenjang Pendidikan', width: '40%', render: (r) => r.jenjang },
];

const panel = (over: Partial<Parameters<typeof InfoSekolahListPanel<Row>>[0]> = {}, query: Partial<InfoSekolahQuery> = {}) =>
  render(
    <InfoSekolahListPanel<Row>
      title="Daftar Lembaga Pendidikan"
      icon={null}
      noun="lembaga"
      columns={COLUMNS}
      rows={ROWS}
      loading={false}
      total={19}
      totalPages={2}
      query={{ jenjang: '', search: '', page: 1, ...query }}
      jenjangNames={['SD', 'SMP', 'SMA']}
      onJenjang={vi.fn()}
      onSearch={vi.fn()}
      onPage={vi.fn()}
      {...over}
    />,
  );

describe('InfoSekolahListPanel', () => {
  it('filter jenjang (Select) dan kolom cari ada di kepala tabel', () => {
    const html = panel();
    expect(html).toContain('aria-label="Filter jenjang pendidikan"');
    expect(html).toContain('placeholder="Semua jenjang"');
    expect(html).toContain('aria-label="Cari lembaga"');
  });

  it('jenjang aktif dari URL tampil sebagai nilai Select', () => {
    expect(panel({}, { jenjang: 'smp' })).toMatch(/aria-label="Filter jenjang pendidikan"[^>]*value="SMP"|value="SMP"[^>]*aria-label="Filter jenjang pendidikan"/);
  });

  it('menampilkan baris, jumlah hasil, dan paginasi bila > 1 halaman', () => {
    const html = panel();
    expect(html).toContain('SD No. 1 Darmasaba');
    expect(html).toContain('SD No. 2 Darmasaba');
    expect(html).toMatch(/Menampilkan[\s\S]*19[\s\S]*lembaga/);
    expect(html).toContain('mantine-Pagination-root');
  });

  it('paginasi tidak dirender bila hanya 1 halaman', () => {
    expect(panel({ totalPages: 1 })).not.toContain('mantine-Pagination-root');
  });

  it('saat memuat: kontrol tetap ada (fokus kolom cari tidak hilang), tabel diganti kerangka', () => {
    const html = panel({ loading: true });
    expect(html).toContain('aria-label="Cari lembaga"');
    expect(html).toContain('aria-label="Filter jenjang pendidikan"');
    expect(html).not.toContain('SD No. 1 Darmasaba');
    expect(html).not.toContain('mantine-Pagination-root');
  });

  it('kosong karena filter → pesan menyebut jenjang & kata kunci, bukan "belum ada data"', () => {
    expect(panel({ rows: [], total: 0, totalPages: 0 }, { jenjang: 'sd', search: 'zzz' })).toContain(
      'Tidak ada lembaga “zzz” di jenjang SD.',
    );
    expect(panel({ rows: [], total: 0, totalPages: 0 })).toContain('Belum ada data lembaga.');
  });
});

describe('layout & ringkasan Info Sekolah', () => {
  it('layout tidak lagi merender pil jenjang (hanya tombol kembali + isi)', () => {
    const html = render(<Layout><p>isi</p></Layout>);
    expect(html).toContain('isi');
    expect(html).toContain('aria-label="Kembali ke halaman sebelumnya"');
    for (const pill of ['>Semua<', '>SMA<', '>SD<', '>PAUD<']) expect(html).not.toContain(pill);
  });

  it('ringkasan: judul + tiga kartu, tanpa pil jenjang', () => {
    const html = render(<SekolahPage />);
    expect(html).toContain('Cari Informasi Sekolah');
    for (const nama of ['Lembaga Pendidikan', 'Siswa Terdaftar', 'Tenaga Pengajar']) {
      expect(html).toContain(`aria-label="Lihat detail ${nama}"`);
    }
    expect(html).not.toContain('>Semua<');
  });
});
