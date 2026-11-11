// @vitest-environment node
// Tampilan Tanggal Terbit Berita: isian admin (type=date, terkontrol), tanggal di detail publik (WITA,
// fallback createdAt), kartu Berita Terbaru, dan Kabar Desa. jsdom rusak → renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TanggalTerbitInput } from '@/app/admin/(dashboard)/pemerintahan/berita/list-berita/_com/TanggalTerbitInput';
import { BeritaTanggal } from '@/app/darmasaba/(pages)/pemerintahan/berita/_com/BeritaTanggal';
import BeritaCard from '@/app/darmasaba/(pages)/inovasi/layanan-online-desa/informasi-desa/_com/BeritaCard';
import { toBeritaItem } from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.logic';

const render = (ui: React.ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);

// test-only: 17 Agustus 2026 00:00 WITA = 16 Agustus 16:00 UTC
const AGUSTUS = '2026-08-16T16:00:00.000Z';
const DIBUAT = '2026-11-11T02:00:00.000Z';

afterEach(() => {
  vi.useRealTimers();
});

describe('TanggalTerbitInput (admin)', () => {
  it('input date wajib dengan nilai terkontrol dan label Tanggal Terbit', () => {
    const html = render(<TanggalTerbitInput value="2026-08-17" onChange={() => {}} />);
    expect(html).toContain('Tanggal Terbit');
    expect(html).toContain('type="date"');
    expect(html).toContain('value="2026-08-17"');
    expect(html).toContain('required');
    expect(html).toContain('default hari ini');
  });

  it('deskripsi bisa diganti (form edit)', () => {
    const html = render(<TanggalTerbitInput value="" onChange={() => {}} description="Tanggal asli berita/kegiatan" />);
    expect(html).toContain('Tanggal asli berita/kegiatan');
    expect(html).not.toContain('default hari ini');
  });
});

describe('BeritaTanggal (detail publik)', () => {
  it('menampilkan tanggalTerbit dalam WITA, bukan createdAt', () => {
    const html = render(<BeritaTanggal item={{ tanggalTerbit: AGUSTUS, createdAt: DIBUAT }} />);
    expect(html).toContain('Senin, 17 Agustus 2026');
    expect(html.toLowerCase()).toContain(`datetime="${AGUSTUS.toLowerCase()}"`);
    expect(html).not.toContain('November');
  });

  it('respons lama tanpa tanggalTerbit → createdAt', () => {
    const html = render(<BeritaTanggal item={{ createdAt: DIBUAT }} />);
    expect(html).toContain('Rabu, 11 November 2026');
  });
});

describe('BeritaCard (Berita Terbaru)', () => {
  it('waktu relatif dihitung dari tanggal yang diberikan', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(DIBUAT));
    const html = render(<BeritaCard judul="Upacara HUT RI" tanggal={new Date(AGUSTUS)} onClick={() => {}} />);
    expect(html).toContain('3 bulan yang lalu');
  });
});

describe('Kabar Desa', () => {
  it('toBeritaItem memakai tanggalTerbit, fallback createdAt', () => {
    const item = { id: 'b1', judul: 'Upacara', createdAt: DIBUAT };
    expect(toBeritaItem({ ...item, tanggalTerbit: AGUSTUS }).createdAt).toBe(new Date(AGUSTUS).getTime());
    expect(toBeritaItem(item).createdAt).toBe(new Date(DIBUAT).getTime());
  });
});
