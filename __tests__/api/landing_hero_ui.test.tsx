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
import { HERO_PROGRAM_LIMIT, HeroPrograms, type ProgramInovasiItem } from '@/app/darmasaba/_com/main-page/landing-page/HeroPrograms';
import {
  describeWorkStatus,
  getCurrentTime,
  getDayOfWeek,
  getSosmedIconSrc,
  getTodayDate,
  getWorkStatus,
} from '@/app/darmasaba/_com/main-page/landing-page/landing.logic';
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
    image: i === 3 ? null : { link: `/u/logo-${i + 1}.png` },
  })) as ProgramInovasiItem[];

  it('hanya 4 program pertama yang tampil, masing-masing tautan ke halaman detailnya', () => {
    const html = render(<HeroPrograms items={items} loading={false} />);
    expect(HERO_PROGRAM_LIMIT).toBe(4);
    expect(html).toContain(`<h2`);
    expect(html).toContain(LANDING_TEXT.programsTitle);
    expect(html.match(/<li/g)).toHaveLength(4);
    for (const item of items.slice(0, 4)) {
      expect(html).toContain(`href="/darmasaba/program-inovasi/${item.id}"`);
      expect(html).toContain(`>${item.name}<`);
    }
    for (const item of items.slice(4)) {
      expect(html).not.toContain(`href="/darmasaba/program-inovasi/${item.id}"`);
    }
    expect(html).not.toContain('ScrollArea');
  });

  it('kurang dari 4 program → tampil seadanya', () => {
    const html = render(<HeroPrograms items={items.slice(0, 2)} loading={false} />);
    expect(html.match(/<li/g)).toHaveLength(2);
  });

  it('program tanpa logo tetap punya ubin (ikon pengganti)', () => {
    const html = render(<HeroPrograms items={items} loading={false} />);
    expect(html.match(/<img/g)).toHaveLength(3);
    expect(html.match(/<svg/g)).toHaveLength(1);
  });

  it('kosong → satu kalimat; memuat → placeholder tanpa tautan', () => {
    const empty = render(<HeroPrograms items={[]} loading={false} />);
    expect(empty).toContain(LANDING_TEXT.programsEmpty);
    expect(empty).not.toContain('<li');

    const loading = render(<HeroPrograms items={[]} loading />);
    expect(loading).not.toContain(LANDING_TEXT.programsEmpty);
    expect(loading).not.toContain('<a ');
    expect(loading.match(/<li/g)).toHaveLength(4);
  });
});
