// @vitest-environment node
// Bimbingan Belajar Desa: panel info praktis (Lokasi dan Jadwal) di slot `before` modul program-info.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { BimbinganBelajarContent } from '@/app/(public)/(pages)/pendidikan/bimbingan-belajar-desa/_com/BimbinganBelajarPage';
import s from '@/app/(public)/(pages)/pendidikan/bimbingan-belajar-desa/_com/bimbingan.module.css';
import { InfoPraktis } from '@/app/(public)/(pages)/pendidikan/bimbingan-belajar-desa/_com/InfoPraktis';
import type { ProgramInfoEntry } from '@/app/(public)/(pages)/pendidikan/_com/program-info/program-info.logic';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: isi stg 2026-11-15 (dipangkas).
const LOKASI =
  '<ul><li><p>Lokasi: Balai Desa Darmasaba</p></li><li><p>Jadwal: Senin, Rabu, dan Jumat pukul 16.00–18.00 WITA</p></li><li><p>Peserta: Siswa SD–SMP</p></li></ul>';
// test-only
const entry = (key: string, title: string, html: string | null, failed = false): ProgramInfoEntry => ({ key, title, html, failed });
const entries = (lokasi: ProgramInfoEntry = entry('lokasi', 'Lokasi dan Jadwal', LOKASI)) => [
  entry('tujuan', 'Tujuan Program', '<ul><li><p>Pendampingan belajar gratis</p></li></ul>'),
  lokasi,
  entry('fasilitas', 'Fasilitas yang Disediakan', '<ul><li><p>Buku pelajaran dan alat tulis</p></li></ul>'),
];

describe('InfoPraktis', () => {
  it('judul CMS sebagai h2 + <dl> label/nilai; ikon hanya untuk label yang dikenali', () => {
    const html = render(
      <InfoPraktis
        data={{
          judul: 'Lokasi dan Jadwal',
          items: [
            { label: 'Lokasi', value: 'Balai Desa', kind: 'lokasi' },
            { label: 'Biaya', value: 'Gratis', kind: null },
          ],
        }}
      />,
    );
    expect(html).toContain('aria-labelledby="bimbingan-info-praktis"');
    expect(html).toContain(`<h2 id="bimbingan-info-praktis" class="${s.infoTitle}">Lokasi dan Jadwal</h2>`);
    expect(html).toContain(`<dd class="${s.infoValue}">Balai Desa</dd>`);
    expect(html).toContain(`<dd class="${s.infoValue}">Gratis</dd>`);
    expect(html.match(/<svg/g)).toHaveLength(1);
    expect(html).toMatch(/<dt class="[^"]*"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>Lokasi<\/dt>/);
    expect(html).toContain(`<dt class="${s.infoLabel}">Biaya</dt>`);
  });
});

describe('BimbinganBelajarContent', () => {
  it('kepala: h1 nama menu + pengantar lama, tanpa judul lama "Program Bimbingan Belajar Desa"', () => {
    const html = render(<BimbinganBelajarContent entries={entries()} />);
    expect(html).toMatch(/<h1[^>]*>Bimbingan Belajar Desa<\/h1>/);
    expect(html).toContain('Program unggulan untuk mendukung siswa Desa Darmasaba');
    expect(html).not.toContain('Program Bimbingan Belajar Desa');
  });

  it('Lokasi berlabel → panel sebelum bagian, Lokasi tidak diulang sebagai bagian', () => {
    const html = render(<BimbinganBelajarContent entries={entries()} />);
    const panel = html.indexOf(`class="${s.info}"`);
    expect(panel).toBeGreaterThan(-1);
    expect(panel).toBeLessThan(html.indexOf('Tujuan Program'));
    expect(html.indexOf('Tujuan Program')).toBeLessThan(html.indexOf('Fasilitas yang Disediakan'));
    expect(html.match(/Lokasi dan Jadwal/g)).toHaveLength(1);
    expect(html).not.toContain('id="program-info-lokasi"');
    expect(html).toContain('Senin, Rabu, dan Jumat pukul 16.00–18.00 WITA');
  });

  it('Lokasi gagal dimuat → tanpa panel, bagian Lokasi menampilkan pesan galatnya', () => {
    const html = render(<BimbinganBelajarContent entries={entries(entry('lokasi', 'Lokasi dan Jadwal', null, true))} />);
    expect(html).not.toContain(`class="${s.info}"`);
    expect(html).toContain('id="program-info-lokasi"');
    expect(html).toContain('Informasi Lokasi dan Jadwal gagal dimuat.');
  });

  it('Lokasi bukan daftar berlabel → bagian biasa berisi daftar butir', () => {
    const lokasi = entry('lokasi', 'Lokasi dan Jadwal', '<ul><li><p>Balai Desa Darmasaba</p></li></ul>');
    const html = render(<BimbinganBelajarContent entries={entries(lokasi)} />);
    expect(html).not.toContain(`class="${s.info}"`);
    expect(html).toContain('id="program-info-lokasi"');
    expect(html).toContain('Balai Desa Darmasaba');
  });

  it('panel tampil + Tujuan/Fasilitas kosong → pesan per bagian, bukan kalimat halaman "belum tersedia"', () => {
    const html = render(
      <BimbinganBelajarContent
        entries={[
          entry('tujuan', 'Tujuan Program', null),
          entry('lokasi', 'Lokasi dan Jadwal', LOKASI),
          entry('fasilitas', 'Fasilitas yang Disediakan', null, true),
        ]}
      />,
    );
    expect(html).toContain(`class="${s.info}"`);
    expect(html).toContain('Belum ada informasi Tujuan Program.');
    expect(html).toContain('Informasi Fasilitas yang Disediakan gagal dimuat.');
    expect(html).not.toContain('Informasi Bimbingan Belajar Desa belum tersedia.');
  });

  it('memuat → kerangka role=status, tanpa panel', () => {
    const html = render(<BimbinganBelajarContent entries={null} />);
    expect(html).toContain('role="status"');
    expect(html).not.toContain(`class="${s.info}"`);
  });
});
