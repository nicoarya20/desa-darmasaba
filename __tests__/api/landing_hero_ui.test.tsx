// @vitest-environment node
// Hero beranda: logika status kantor + markup identitas, status, media sosial, Perbekel, dan rel program inovasi.
// Catatan: environment jsdom gagal start di repo ini, jadi markup diuji via renderToStaticMarkup.
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { HeroSosmed, HeroStatus } from '@/app/darmasaba/_com/main-page/landing-page/HeroInfo';
import { HeroProfile } from '@/app/darmasaba/_com/main-page/landing-page/HeroProfile';
import { HeroRibbons } from '@/app/darmasaba/_com/main-page/landing-page/HeroRibbons';
import { HeroPrograms, type ProgramInovasiItem } from '@/app/darmasaba/_com/main-page/landing-page/HeroPrograms';
import {
  getInitialRailState,
  getRailState,
  getThumbStyle,
  RAIL_VISIBLE_TILES,
} from '@/app/darmasaba/_com/main-page/landing-page/rail.logic';
import {
  describeWorkStatus,
  getCurrentTime,
  getDayOfWeek,
  getSosmedIconSrc,
  getTodayDate,
  getWorkStatus,
} from '@/app/darmasaba/_com/main-page/landing-page/landing.logic';
import {
  buildRibbonPaths,
  RIBBON_STRIPES,
  RIBBON_VIEWBOX,
  ribbonScale,
} from '@/app/darmasaba/_com/main-page/landing-page/ribbons.logic';
import { LANDING_TEXT } from '@/app/darmasaba/_com/main-page/landing-page/landing.text';
import type { PejabatItem, SosmedItem } from '@/app/darmasaba/_com/main-page/landing-page/use-landing-data';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const NO_HOLIDAY = { isHoliday: false, holidayName: null };

describe('landing.logic — status kantor', () => {
  it('Senin–Kamis buka setelah 07:30 sampai 15:30', () => {
    expect(getWorkStatus('Senin', '07:30', NO_HOLIDAY)).toEqual({ status: 'Tutup', message: '07:30 - 15:30' });
    expect(getWorkStatus('Senin', '07:31', NO_HOLIDAY)).toEqual({ status: 'Buka', message: '07:30 - 15:30' });
    expect(getWorkStatus('Kamis', '15:30', NO_HOLIDAY).status).toBe('Buka');
    expect(getWorkStatus('Kamis', '15:31', NO_HOLIDAY).status).toBe('Tutup');
  });

  it('Jumat tutup pukul 12:00', () => {
    expect(getWorkStatus('Jumat', '11:59', NO_HOLIDAY)).toEqual({ status: 'Buka', message: '07:30 - 12:00' });
    expect(getWorkStatus('Jumat', '12:01', NO_HOLIDAY).status).toBe('Tutup');
  });

  it('akhir pekan dan hari libur nasional selalu tutup', () => {
    expect(getWorkStatus('Sabtu', '10:00', NO_HOLIDAY)).toEqual({ status: 'Tutup', message: 'Libur Akhir Pekan' });
    expect(getWorkStatus('Selasa', '10:00', { isHoliday: true, holidayName: 'Hari Raya Nyepi' })).toEqual({
      status: 'Tutup',
      message: 'Hari Raya Nyepi',
    });
    expect(getWorkStatus('Selasa', '10:00', { isHoliday: true, holidayName: null }).message).toBe('Hari Libur Nasional');
  });

  it('keterangan: jam layanan diberi awalan, nama libur apa adanya', () => {
    expect(describeWorkStatus({ status: 'Buka', message: '07:30 - 15:30' }, 'Jam layanan')).toBe('Jam layanan 07:30 - 15:30');
    expect(describeWorkStatus({ status: 'Tutup', message: 'Libur Akhir Pekan' }, 'Jam layanan')).toBe('Libur Akhir Pekan');
  });

  it('pemformat tanggal & jam', () => {
    const date = new Date(2026, 10, 9, 8, 5); // test-only: Senin 9 Nov 2026 08:05 waktu lokal
    expect(getDayOfWeek(date)).toBe('Senin');
    expect(getCurrentTime(date)).toBe('08:05');
    expect(getTodayDate(date)).toBe('2026-11-09');
  });

  it('ikon media sosial: unggahan admin dulu, lalu ikon bawaan, lalu null', () => {
    expect(getSosmedIconSrc({ icon: 'instagram', image: { link: '/u/ig.png' } })).toBe('/u/ig.png');
    expect(getSosmedIconSrc({ icon: 'instagram', image: null })).toBe('/assets/images/sosmed/instagram.png');
    expect(getSosmedIconSrc({ icon: 'custom', image: null })).toBeNull();
  });
});

describe('HeroStatus', () => {
  it('buka: satu baris "Kantor buka" + jam layanan', () => {
    const html = render(<HeroStatus status={{ status: 'Buka', message: '07:30 - 15:30' }} />);
    expect(html).toContain(LANDING_TEXT.open);
    expect(html).toContain('Jam layanan 07:30 - 15:30');
    expect(html).not.toContain(LANDING_TEXT.closed);
  });

  it('tutup karena libur: nama hari libur tampil', () => {
    const html = render(<HeroStatus status={{ status: 'Tutup', message: 'Hari Raya Nyepi' }} />);
    expect(html).toContain(LANDING_TEXT.closed);
    expect(html).toContain('Hari Raya Nyepi');
  });

  it('selama memuat tidak menebak buka/tutup', () => {
    const html = render(<HeroStatus status={null} />);
    expect(html).not.toContain(LANDING_TEXT.open);
    expect(html).not.toContain(LANDING_TEXT.closed);
  });
});

describe('HeroSosmed', () => {
  // test-only: entri fiktif berbentuk respons mediasosial/findMany.
  const sosmed = (over: Partial<SosmedItem>) =>
    ({ id: 's1', name: 'Instagram', icon: 'instagram', iconUrl: 'https://instagram.com/desa', image: null, ...over }) as SosmedItem;

  it('tautan asli yang aman dibuka di tab baru; nomor WhatsApp jadi wa.me', () => {
    const html = render(
      <HeroSosmed data={[sosmed({}), sosmed({ id: 's2', name: 'WA Desa', icon: 'whatsapp', iconUrl: '0812-3456' })]} />,
    );
    expect(html.match(/<a /g)).toHaveLength(2);
    expect(html).toContain('href="https://instagram.com/desa"');
    expect(html).toContain('href="https://wa.me/628123456"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('aria-label="WA Desa"');
  });

  it('entri tanpa tautan dilewati; semuanya kosong → tidak merender apa pun', () => {
    expect(render(<HeroSosmed data={[sosmed({ iconUrl: '' })]} />)).not.toContain('<ul');
    expect(render(<HeroSosmed data={[]} />)).not.toContain('<ul');
  });
});

describe('HeroProfile', () => {
  // test-only: pejabat fiktif berbentuk respons pejabatdesa/edit.
  const pejabat = (link: string | null) =>
    ({ id: 'p1', name: 'Nama Perbekel Uji', position: 'Perbekel periode uji', image: link ? { link } : null }) as PejabatItem;

  it('dengan foto: gambar + jabatan + nama', () => {
    const html = render(<HeroProfile data={pejabat('/u/perbekel.png')} />);
    expect(html).toContain('src="/u/perbekel.png"');
    expect(html).toContain('Perbekel periode uji');
    expect(html).toContain('Nama Perbekel Uji');
  });

  it('tanpa foto: hanya kartu nama, tanpa gambar atau teks "Belum ada foto"', () => {
    const html = render(<HeroProfile data={pejabat(null)} />);
    expect(html).not.toContain('<img');
    expect(html).not.toContain('Belum ada foto');
    expect(html).toContain('Nama Perbekel Uji');
  });
});

describe('HeroPrograms', () => {
  // test-only: 8 program fiktif — jumlah yang sama dengan data desa saat ini.
  const items = Array.from({ length: 8 }, (_, i) => ({
    id: `prog-${i + 1}`,
    name: `Program ${i + 1}`,
    image: i === 7 ? null : { link: `/u/logo-${i + 1}.png` },
  })) as ProgramInovasiItem[];

  it('semua program ada di rel sebagai tautan ke halaman detailnya', () => {
    const html = render(<HeroPrograms items={items} loading={false} />);
    expect(html).toContain(`<h2`);
    expect(html).toContain(LANDING_TEXT.programsTitle);
    expect(html.match(/<li/g)).toHaveLength(8);
    for (const item of items) {
      expect(html).toContain(`href="/darmasaba/program-inovasi/${item.id}"`);
      expect(html).toContain(`>${item.name}<`);
    }
  });

  it('lebih dari 4 program → ada panah geser (kiri mati di awal) dan garis posisi', () => {
    const html = render(<HeroPrograms items={items} loading={false} />);
    expect(html).toMatch(new RegExp(`<button[^>]*disabled=""[^>]*aria-label="${LANDING_TEXT.programsPrev}"`));
    expect(html).toMatch(new RegExp(`<button(?![^>]*disabled)[^>]*aria-label="${LANDING_TEXT.programsNext}"`));
    expect(html).toContain('width:50.00%');
    // Di awal hanya tepi kanan yang memudar (ada ubin tersembunyi di sana).
    expect(html).toContain('data-fade-end');
    expect(html).not.toContain('data-fade-start');
  });

  it('4 program atau kurang → tanpa panah dan tanpa garis posisi', () => {
    const html = render(<HeroPrograms items={items.slice(0, 4)} loading={false} />);
    expect(html.match(/<li/g)).toHaveLength(4);
    expect(html).not.toContain('<button');
    expect(html).not.toContain('translateX');
    expect(html).not.toContain('data-fade-');
  });

  it('program tanpa logo tetap punya ubin (ikon pengganti)', () => {
    const html = render(<HeroPrograms items={items.slice(4)} loading={false} />);
    expect(html.match(/<img/g)).toHaveLength(3);
    expect(html.match(/<svg/g)).toHaveLength(1);
  });

  it('kosong → satu kalimat; memuat → placeholder tanpa tautan dan tanpa panah', () => {
    const empty = render(<HeroPrograms items={[]} loading={false} />);
    expect(empty).toContain(LANDING_TEXT.programsEmpty);
    expect(empty).not.toContain('<li');

    const loading = render(<HeroPrograms items={items} loading />);
    expect(loading).not.toContain(LANDING_TEXT.programsEmpty);
    expect(loading).not.toContain('<a ');
    expect(loading).not.toContain('<button');
    expect(loading.match(/<li/g)).toHaveLength(RAIL_VISIBLE_TILES);
  });
});

describe('rail.logic — rel program', () => {
  it('isi muat di bingkai → tidak bisa digeser', () => {
    expect(getRailState(0, 800, 800)).toEqual({
      scrollable: false,
      canPrev: false,
      canNext: false,
      visible: 1,
      progress: 0,
    });
    expect(getRailState(0, 0, 0).scrollable).toBe(false);
  });

  it('awal, tengah, dan ujung rel', () => {
    expect(getRailState(0, 800, 1600)).toMatchObject({ canPrev: false, canNext: true, visible: 0.5, progress: 0 });
    expect(getRailState(400, 800, 1600)).toMatchObject({ canPrev: true, canNext: true, progress: 0.5 });
    expect(getRailState(800, 800, 1600)).toMatchObject({ canPrev: true, canNext: false, progress: 1 });
    // Pantulan di ujung (overscroll) tidak membuat progress keluar dari 0–1.
    expect(getRailState(-30, 800, 1600).progress).toBe(0);
    expect(getRailState(900, 800, 1600).progress).toBe(1);
  });

  it('tebakan awal sebelum DOM terukur', () => {
    expect(getInitialRailState(8)).toMatchObject({ scrollable: true, canPrev: false, canNext: true, visible: 0.5 });
    expect(getInitialRailState(4)).toMatchObject({ scrollable: false, canNext: false, visible: 1 });
  });

  it('garis posisi: lebar = porsi terlihat, di ujung menempel tepi kanan', () => {
    expect(getThumbStyle(getRailState(0, 800, 1600))).toEqual({ width: '50.00%', transform: 'translateX(0.00%)' });
    // Lebar 50% → geser 100% dari lebarnya sendiri = tepat di tepi kanan.
    expect(getThumbStyle(getRailState(800, 800, 1600)).transform).toBe('translateX(100.00%)');
    // Lebar 25% → sisa lintasan 3× lebarnya.
    expect(getThumbStyle(getRailState(2400, 800, 3200)).transform).toBe('translateX(300.00%)');
  });
});

describe('pita latar hero', () => {
  it('porsi lebar semua pita berjumlah 1', () => {
    const total = RIBBON_STRIPES.reduce((sum, stripe) => sum + stripe.share, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it('melebar di pangkal, lebar dasar di belakang foto, menyempit di ujung kanan', () => {
    expect(ribbonScale(0)).toBeCloseTo(1.35);
    expect(ribbonScale(1)).toBe(1);
    expect(ribbonScale(2)).toBeCloseTo(0.9);
  });

  it('satu path tertutup per pita, berurutan warna, hanya berisi angka valid', () => {
    const paths = buildRibbonPaths();
    expect(paths.map((path) => path.color)).toEqual(RIBBON_STRIPES.map((stripe) => stripe.color));
    for (const { d } of paths) {
      expect(d).toMatch(/^M-?[\d.]+ -?[\d.]+(L-?[\d.]+ -?[\d.]+)+Z$/);
    }
    // Pita terluar punya bidang, bukan garis nol: tepi dalamnya tidak sama dengan tepi luar berkas.
    const [first, ...rest] = paths[paths.length - 1].d.slice(1, -1).split('L');
    expect(first).not.toBe(rest[rest.length - 1]);
  });

  it('SVG dekoratif: tersembunyi dari pembaca layar, melar mengikuti hero', () => {
    const html = render(<HeroRibbons />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('preserveAspectRatio="none"');
    expect(html).toContain(`viewBox="0 0 ${RIBBON_VIEWBOX.width} ${RIBBON_VIEWBOX.height}"`);
    expect(html.match(/<path/g)).toHaveLength(RIBBON_STRIPES.length);
  });
});
