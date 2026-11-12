// @vitest-environment node
// Halaman publik Agenda & Kalender Desa: kepala, panel Acara mendatang, kalender bulan (blok/pita),
// kalender ringkas + daftar ponsel, legenda kategori, ringkasan tahun, rincian acara.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek fetch tidak jalan di server).
import { createTheme, MantineProvider, Modal } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

import Page from '@/app/(public)/(pages)/pemerintahan/event-budaya/page';
import { AGENDA_TEXT } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda.text';
import { AgendaDaftarBulan } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-daftar-bulan';
import { AgendaDetailIsi, AgendaDetailModal } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-detail-modal';
import { AgendaKalender } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-kalender';
import { AgendaKategori } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-kategori';
import { AgendaMendatang } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-mendatang';
import { AgendaTahun } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-tahun';
import { KalenderBulan } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-bulan';
import { KalenderRingkas } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-ringkas';
import { baliBulan, lapisanBali } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-bali.logic';
import { hariDariTanggal, hariWita, type AgendaItem } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender.logic';

// Modal di portal tidak dirender di server; matikan portal agar isinya bisa diperiksa.
const theme = createTheme({ components: { Modal: Modal.extend({ defaultProps: { withinPortal: false } }) } });
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;
const noop = () => {};

// test-only: acara minimal.
const acara = (id: string, nama: string, tanggal: string, extra: Partial<AgendaItem> = {}): AgendaItem => ({
  id,
  nama,
  tanggal,
  tanggalSelesai: null,
  kategori: 'BUDAYA',
  lokasi: 'Pura Puseh Desa Darmasaba',
  deskripsi: null,
  ...extra,
});

const NOW = new Date('2026-11-12T02:00:00.000Z');
const HARI_INI = hariWita(NOW);
const NOV = { tahun: 2026, bulan: 11 };
const pujawali = acara('pj', 'Pujawali Pura Puseh', '2026-11-20T06:00:00.000Z', { deskripsi: 'Upacara piodalan.' });
const rapat = acara('mr', 'Musyawarah Rencana Pembangunan', '2026-11-03T00:00:00.000Z', {
  tanggalSelesai: '2026-11-05T00:00:00.000Z',
  kategori: 'MUSYAWARAH',
});
const lewat = acara('lw', 'Hari Raya Saraswati', '2026-11-02T06:00:00.000Z');
const baliNov = (items: AgendaItem[]) => lapisanBali(baliBulan(NOV), NOV, items, true);

describe('Halaman', () => {
  it('kepala senada Pengumuman: tombol kembali, h1, pengantar; kalender memuat (tanpa data di server)', () => {
    const html = render(<Page />);
    expect(html).toContain('aria-label="Kembali ke halaman sebelumnya"');
    expect(html).toMatch(/<h1[^>]*>Agenda &amp; Kalender Desa<\/h1>/);
    expect(html).toContain(AGENDA_TEXT.mendatang.title);
    expect(html).toContain('aria-busy="true"');
    // filter lama (select Tahun/Bulan, chip kategori, paginasi) sudah tidak ada
    expect(html).not.toContain('Semua kategori');
    expect(html).not.toContain('Semua bulan');
  });
});

describe('AgendaMendatang', () => {
  it('sorotan acara terdekat dengan hitung mundur besar, lalu baris berikutnya + sisa', () => {
    const html = render(
      <AgendaMendatang
        data={{ items: [pujawali, acara('x', 'Rapat Banjar', '2026-11-13T06:00:00.000Z')], total: 4 }}
        error={false}
        now={NOW}
        tampilRerainan={false}
        onPilih={noop}
      />,
    );
    expect(html).toContain('Kamis, 12 November 2026');
    expect(html).toContain(AGENDA_TEXT.mendatang.terdekat);
    expect(html).toMatch(/>8<\/span><span[^>]*>hari lagi<\/span>/);
    expect(html).toContain('Jumat, 20 November 2026');
    expect(html).toContain('Rapat Banjar');
    expect(html).toContain('>Besok<');
    expect(html).toContain(AGENDA_TEXT.mendatang.lainnya(2));
  });

  it('keadaan kosong tetap informatif', () => {
    const html = render(<AgendaMendatang data={{ items: [], total: 0 }} error={false} now={NOW} tampilRerainan onPilih={noop} />);
    expect(html).toContain(AGENDA_TEXT.mendatang.kosongJudul);
    expect(html).toContain(AGENDA_TEXT.mendatang.kosongIsi);
  });

  it('galat dimuat → pesan, bukan kosong', () => {
    const html = render(<AgendaMendatang data={null} error now={NOW} tampilRerainan onPilih={noop} />);
    expect(html).toContain(AGENDA_TEXT.mendatang.galat);
    expect(html).not.toContain(AGENDA_TEXT.mendatang.kosongJudul);
  });
});

describe('KalenderBulan', () => {
  const items = [pujawali, rapat, lewat];
  const html = render(
    <KalenderBulan bulan={NOV} items={items} hariIni={HARI_INI} bali={baliNov(items)} tampilRerainan onBuka={noop} />,
  );

  it('kolom dimulai Minggu, hari ini ditandai sekali', () => {
    expect(html.indexOf('Minggu')).toBeLessThan(html.indexOf('Sabtu'));
    expect(count(html, 'data-hari-ini="true"')).toBe(1);
  });

  it('acara multi-hari = satu pita 3 kolom; acara lampau diredupkan', () => {
    expect(html).toMatch(/grid-column:3 \/ span 3[^"]*"[^>]*>Musyawarah Rencana Pembangunan</);
    expect(html).toMatch(/data-lewat="true"[^>]*>Hari Raya Saraswati</);
    expect(html).toContain('aria-label="Pujawali Pura Puseh, Jumat, 20 November 2026"');
    expect(html).toContain('--ev:var(--mantine-color-violet-6)');
  });
});

describe('Kalender ponsel', () => {
  it('KalenderRingkas: titik warna di hari berisi acara (tebal); semua tanggal bulan ini bisa diketuk', () => {
    const items = [pujawali, rapat];
    const html = render(<KalenderRingkas bulan={NOV} items={items} hariIni={HARI_INI} bali={baliNov(items)} onPilihHari={noop} />);
    expect(count(html, '<button')).toBe(30);
    expect(count(html, 'data-ada="true"')).toBe(4); // 3–5 Nov + 20 Nov
    expect(html).toContain('aria-label="Jumat, 20 November 2026: 1 acara, Hari Bhatara Sri"');
    expect(html).toContain('aria-label="Kamis, 12 November 2026: Tidak ada acara"');
  });

  it('AgendaDaftarBulan: dikelompokkan per hari, hitung mundur hanya untuk yang belum lewat', () => {
    const html = render(
      <AgendaDaftarBulan
        bulan={NOV}
        items={[pujawali, rapat, lewat]}
        hariIni={HARI_INI}
        now={NOW}
        bali={baliNov([pujawali, rapat, lewat])}
        onPilih={noop}
        onBukaHari={noop}
      />,
    );
    expect(html).toContain(`id="agenda-hari-${hariDariTanggal(2026, 11, 20)}"`);
    expect(html.indexOf('Hari Raya Saraswati')).toBeLessThan(html.indexOf('Musyawarah Rencana'));
    expect(html).toContain('3–5 November 2026 (3 hari)');
    expect(html).toContain('8 hari lagi');
    expect(html).not.toContain('Sudah lewat');
  });
});

describe('AgendaKalender (bilah alat & keadaan)', () => {
  const base = {
    bulan: NOV,
    bulanIni: NOV,
    arah: 0,
    error: false,
    hariIni: HARI_INI,
    now: NOW,
    tampilRerainan: true,
    onGeser: noop,
    onHariIni: noop,
    onMuatUlang: noop,
    onBuka: noop,
    onPilihHari: noop,
  };

  it('judul bulan, tombol Hari ini (mati di bulan berjalan), jumlah acara', () => {
    const html = render(<AgendaKalender {...base} items={[pujawali]} />);
    expect(html).toMatch(/<h2[^>]*>November 2026<\/h2>/);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Hari ini<\/button>/);
    expect(html).toContain('aria-label="Bulan sebelumnya"');
    expect(html).toContain('> · 1 acara<'); // menumpang di baris sasih
  });

  it('bulan kosong → pesan; galat → tombol coba lagi', () => {
    expect(render(<AgendaKalender {...base} bulan={{ tahun: 2026, bulan: 12 }} items={[pujawali]} />)).toContain(
      'Belum ada acara di Desember 2026.',
    );
    const galat = render(<AgendaKalender {...base} items={null} error />);
    expect(galat).toContain(AGENDA_TEXT.kalender.galat);
    expect(galat).toContain(AGENDA_TEXT.kalender.muatUlang);
  });
});

describe('Legenda kategori & ringkasan tahun', () => {
  const bali = { tampilRerainan: true, onToggleRerainan: noop };

  it('satu kategori → keterangan warna (titik, bukan kotak centang); banyak → tombol aria-pressed bercentang', () => {
    const satu = render(<AgendaKategori tersedia={[{ kategori: 'BUDAYA', jumlah: 14 }]} tersembunyi={[]} onToggle={noop} {...bali} />);
    expect(satu).toContain('Budaya');
    expect(satu).toContain('data-static');
    expect(count(satu, 'legendDot')).toBe(1);
    expect(count(satu, 'legendBox')).toBe(1); // hanya kotak saklar Rerainan Bali
    expect(count(satu, '<button')).toBe(1); // hanya saklar Rerainan Bali
    const dua = render(
      <AgendaKategori
        tersedia={[
          { kategori: 'BUDAYA', jumlah: 2 },
          { kategori: 'MUSYAWARAH', jumlah: 1 },
        ]}
        tersembunyi={['MUSYAWARAH']}
        onToggle={noop}
        {...bali}
      />,
    );
    expect(count(dua, 'aria-pressed="true"')).toBe(2); // Budaya + Rerainan Bali
    expect(dua).toContain('aria-pressed="false"');
    expect(dua).not.toContain('legendDot');
    expect(count(dua, 'legendBox')).toBe(3); // 2 kategori + Rerainan Bali
    const kosong = render(<AgendaKategori tersedia={[]} tersembunyi={[]} onToggle={noop} {...bali} />);
    expect(count(kosong, '<button')).toBe(1);
    expect(kosong).toContain(AGENDA_TEXT.bali.legend);
  });

  it('12 sel bulan, bulan aktif aria-current, jumlah per bulan', () => {
    const html = render(
      <AgendaTahun tahun={2026} items={[pujawali, rapat, lewat]} bulanAktif={NOV} bulanIni={NOV} onPilih={noop} />,
    );
    expect(count(html, '<button')).toBe(12);
    expect(html).toContain('aria-label="November 2026: 3 acara"');
    expect(html).toMatch(/aria-current="date"[^>]*aria-label="November 2026/);
    expect(html).toContain('3 acara');
  });
});

describe('Rincian acara', () => {
  it('kategori, nama, hitung mundur, tanggal lengkap, lokasi, deskripsi', () => {
    const html = render(<AgendaDetailIsi item={pujawali} now={NOW} />);
    expect(html).toContain('Budaya');
    expect(html).toMatch(/<h2[^>]*>Pujawali Pura Puseh<\/h2>/);
    expect(html).toContain('8 hari lagi');
    expect(html).toContain('Jumat, 20 November 2026');
    expect(html).toContain('Pura Puseh Desa Darmasaba');
    expect(html).toContain('Upacara piodalan.');
  });

  it('modal hari memuat semua acara hari itu dengan judul tanggal', () => {
    const html = render(
      <AgendaDetailModal
        detail={{ judul: 'Jumat, 20 November 2026', items: [pujawali, rapat] }}
        now={NOW}
        tampilRerainan
        onClose={noop}
      />,
    );
    expect(html).toContain('Jumat, 20 November 2026');
    expect(count(html, '<article')).toBe(2);
    expect(render(<AgendaDetailModal detail={null} now={NOW} tampilRerainan onClose={noop} />)).not.toContain('<article');
  });
});
