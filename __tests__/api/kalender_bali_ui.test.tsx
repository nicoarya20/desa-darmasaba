// @vitest-environment node
// Lapisan kalender Bali di halaman Agenda: wuku per minggu, wewaran & ikon bulan per tanggal, rerainan
// bergaya beda dari blok agenda (bisa dimatikan), agenda admin menang, judul sasih, kartu Hari ini,
// modal hari dengan wariga lengkap, dan tampilan ponsel. Markup via renderToStaticMarkup (jsdom rusak).
import { createTheme, MantineProvider, Modal } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

import { AGENDA_TEXT } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda.text';
import { AgendaDaftarBulan } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-daftar-bulan';
import { AgendaDetailModal } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-detail-modal';
import { AgendaKalender } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-kalender';
import { AgendaMendatang } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-mendatang';
import { baliBulan, lapisanBali } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-bali.logic';
import { KalenderBulan } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-bulan';
import { KalenderRingkas } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-ringkas';
import {
  hariDariTanggal,
  hariWita,
  type AgendaItem,
  type BulanKe,
} from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender.logic';

const theme = createTheme({ components: { Modal: Modal.extend({ defaultProps: { withinPortal: false } }) } });
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string | RegExp) =>
  typeof needle === 'string' ? html.split(needle).length - 1 : (html.match(new RegExp(needle, 'g')) ?? []).length;
const noop = () => {};
const rr = (tingkat: 'besar' | 'rutin', nama: string) =>
  new RegExp(`data-tingkat="${tingkat}"[^>]*>(<svg[^]*?</svg>)?<span class="[^"]*rrNama[^"]*">${nama}</span>`);

// test-only: acara minimal seperti data stg.
const acara = (id: string, nama: string, tanggal: string): AgendaItem => ({
  id,
  nama,
  tanggal,
  tanggalSelesai: null,
  kategori: 'BUDAYA',
  lokasi: 'Pura Desa',
  deskripsi: null,
});

const NOW = new Date('2026-11-12T02:00:00.000Z');
const HARI_INI = hariWita(NOW);
const NOV: BulanKe = { tahun: 2026, bulan: 11 };
const MAR: BulanKe = { tahun: 2026, bulan: 3 };
const nyepi = acara('ny', 'Hari Raya Nyepi', '2026-03-19T00:00:00.000Z');
const pujawali = acara('pj', 'Pujawali Pura Puseh', '2026-11-20T06:00:00.000Z');
const bali = (b: BulanKe, items: AgendaItem[], tampil = true) => lapisanBali(baliBulan(b), b, items, tampil);
const bulanDesktop = (b: BulanKe, items: AgendaItem[], tampil = true) =>
  render(<KalenderBulan bulan={b} items={items} hariIni={HARI_INI} bali={bali(b, items, tampil)} tampilRerainan={tampil} onBuka={noop} />);

describe('Kalender bulan desktop — lapisan Bali', () => {
  const html = bulanDesktop(NOV, [pujawali]);

  it('wuku di tiap baris minggu (wuku berganti hari Minggu)', () => {
    for (const w of ['Sinta', 'Landep', 'Ukir', 'Kulantir', 'Tolu']) expect(html).toContain(`${AGENDA_TEXT.bali.wuku}</span> ${w}`);
  });

  it('nama hari Bali per tanggal + ikon purnama/tilem', () => {
    expect(html).toContain('>Wraspati Pon<');
    expect(count(html, 'aria-label="Purnama"')).toBe(1); // 24 Nov
    expect(count(html, 'aria-label="Tilem"')).toBe(1); // 9 Nov
  });

  it('ikon bulan tepat di kanan angka tanggal, di luar blok wewaran (wewaran tak terpotong)', () => {
    // 24 Nov: tombol tanggal → svg ikon bulan → blok wewaran; svg tidak berada di dalam blok wewaran.
    expect(html).toMatch(/>24<\/button><svg class="[^"]*bulan[^"]*bulanTanggal[^"]*" data-fase="purnama"[^>]*>.*?<\/svg><span class="[^"]*kepala[^"]*"><span class="[^"]*wewaran[^"]*">Anggara Kliwon</);
  });

  it('rerainan = teks bertingkat, bukan blok agenda; agenda tetap blok berwarna', () => {
    expect(html).toMatch(rr('besar', 'Pagerwesi'));
    expect(html).toMatch(rr('besar', 'Tumpek Landep'));
    expect(html).toMatch(rr('rutin', 'Purnama Kanem'));
    expect(html).not.toMatch(/--ev:[^"]*"[^>]*>Pagerwesi</);
    expect(html).toMatch(/--ev:var\(--mantine-color-[a-z]+-6\)[^>]*>Pujawali Pura Puseh</);
  });

  it('tiap tanggal bulan ini membuka modal hari; tepi bulan tetangga tidak', () => {
    expect(count(html, /<button[^>]*aria-label="[A-Za-z]+, \d+ November 2026"/)).toBe(30);
    expect(html).not.toMatch(/<button[^>]*aria-label="[A-Za-z]+, \d+ Desember 2026"/);
  });

  it('saklar mati → rerainan & ikon bulan hilang, wuku/wewaran tetap', () => {
    const mati = bulanDesktop(NOV, [pujawali], false);
    expect(mati).not.toContain('Pagerwesi');
    expect(mati).not.toContain('aria-label="Purnama"');
    expect(mati).toContain(`${AGENDA_TEXT.bali.wuku}</span> Landep`);
    expect(mati).toContain('>Wraspati Pon<');
  });

  it('lebih dari batas per sel → "+N rerainan" (lengkap di modal)', () => {
    expect(html).toContain(AGENDA_TEXT.bali.lainnya(2)); // 24 Nov: Purnama Kanem, Kajeng Kliwon, Anggara Kasih
  });
});

describe('Agenda admin menang (Maret 2026, data stg)', () => {
  it('agenda "Hari Raya Nyepi" 19 Mar → rerainan Nyepi tidak ditulis ulang; Ngembak Geni tetap', () => {
    const html = bulanDesktop(MAR, [nyepi]);
    expect(html).toContain('>Hari Raya Nyepi<');
    expect(html).not.toMatch(rr('besar', 'Nyepi'));
    expect(html).toMatch(rr('besar', 'Ngembak Geni'));
    expect(bulanDesktop(MAR, [])).toMatch(rr('besar', 'Nyepi'));
  });
});

describe('Bilah alat & kartu Hari ini', () => {
  it('judul bulan memuat sasih & tahun Çaka', () => {
    const html = render(
      <AgendaKalender
        bulan={NOV}
        bulanIni={NOV}
        arah={0}
        items={[pujawali]}
        error={false}
        hariIni={HARI_INI}
        now={NOW}
        tampilRerainan
        onGeser={noop}
        onHariIni={noop}
        onMuatUlang={noop}
        onBuka={noop}
        onPilihHari={noop}
      />,
    );
    // Jumlah acara menumpang di baris sasih (1 acara: Pujawali 20 Nov).
    expect(html).toMatch(/<h2[^>]*>November 2026<\/h2><p[^>]*>Sasih Kalima – Kanem · Çaka 1948<span class="[^"]*monthCount[^"]*"> · 1 acara<\/span><\/p>/);
  });

  it('Hari ini: hari Bali & wuku, tanggal sasih, rerainan berikutnya (tiap info satu baris); saklar mati → tanpa rerainan berikutnya', () => {
    const props = { data: { items: [], total: 0 }, error: false, now: NOW, onPilih: noop };
    const html = render(<AgendaMendatang {...props} tampilRerainan />);
    expect(html).toMatch(/<span class="[^"]*hariIniBaris[^"]*">Wraspati Pon · Wuku Landep<\/span><span class="[^"]*hariIniBaris[^"]*">Penanggal 3 · Sasih Kanem<\/span>/);
    expect(html).toContain(`${AGENDA_TEXT.bali.berikutnya}: <strong>Tumpek Landep</strong> · 2 hari lagi`);
    expect(render(<AgendaMendatang {...props} tampilRerainan={false} />)).not.toContain(AGENDA_TEXT.bali.berikutnya);
  });
});

describe('Modal hari — wariga lengkap', () => {
  const hari = hariDariTanggal(2026, 11, 24);
  const modal = (items: AgendaItem[], tampil = true) =>
    render(
      <AgendaDetailModal detail={{ judul: 'Selasa, 24 November 2026', items, hari }} now={NOW} tampilRerainan={tampil} onClose={noop} />,
    );

  it('tanpa agenda: keterangan kosong, ringkasan Bali, rerainan, lalu 24 butir wariga', () => {
    const html = modal([]);
    expect(html).toContain(AGENDA_TEXT.detail.tanpaAgenda);
    expect(html).toContain('Anggara Kliwon · Wuku Kulantir · Purnama, Sasih Kanem · Çaka 1948');
    expect(html).toMatch(rr('rutin', 'Purnama Kanem'));
    expect(html).toMatch(rr('rutin', 'Anggara Kasih'));
    expect(count(html, '<dt>')).toBe(24);
    for (const label of ['Ekawara', 'Dasawara', 'Ingkel', 'Jejepan', 'Lintang', 'Pancasuda', 'Pararasan', 'Rakam', 'Watek Alit', 'Watek Madya', 'Eka Jala Rsi', 'Pratithi Samut Pada']) {
      expect(html).toContain(`<dt>${label}</dt>`);
    }
    expect(html).toContain('<dd>Kulantir (urip 6)</dd>');
    expect(html).toContain('<dd>Purnama (penanggal 15)</dd>');
  });

  it('dengan agenda: kartu acara + rerainan bernama sama disembunyikan; saklar mati → wariga saja', () => {
    const html = modal([acara('pr', 'Persembahyangan Purnama Kanem', '2026-11-24T00:00:00.000Z')]);
    expect(count(html, '<article')).toBe(1);
    expect(html).not.toContain(AGENDA_TEXT.detail.tanpaAgenda);
    expect(html).not.toMatch(rr('rutin', 'Purnama Kanem'));
    expect(html).toMatch(rr('rutin', 'Kajeng Kliwon'));
    const mati = modal([], false);
    expect(mati).not.toContain(AGENDA_TEXT.bali.catatan);
    expect(count(mati, '<dt>')).toBe(24);
  });
});

describe('Ponsel', () => {
  it('kalender ringkas: ikon bulan & belah ketupat hari raya besar, tanpa teks wuku', () => {
    const html = render(<KalenderRingkas bulan={NOV} items={[]} hariIni={HARI_INI} bali={bali(NOV, [])} onPilihHari={noop} />);
    expect(count(html, 'aria-label="Purnama"')).toBe(1);
    expect(count(html, 'aria-label="Tilem"')).toBe(1);
    expect(count(html, /class="[^"]*tanda[^"]*"/)).toBe(5); // 1–4 Nov (Banyu Pinaruh..Pagerwesi) + 14 Nov
    expect(html).not.toContain(AGENDA_TEXT.bali.wuku);
    expect(html).not.toContain('Wraspati Pon');
  });

  it('daftar hari: hari rerainan ikut tampil dengan wewaran · wuku dan tautan wariga', () => {
    const html = render(
      <AgendaDaftarBulan bulan={NOV} items={[pujawali]} hariIni={HARI_INI} now={NOW} bali={bali(NOV, [pujawali])} onPilih={noop} onBukaHari={noop} />,
    );
    expect(html).toContain(`id="agenda-hari-${hariDariTanggal(2026, 11, 4)}"`);
    expect(html).toContain('Buda Kliwon · Wuku Sinta');
    expect(html).toMatch(rr('besar', 'Pagerwesi'));
    expect(html).toContain('aria-label="Wariga Rabu, 4 November 2026: Buda Kliwon, Wuku Sinta"');
    expect(html.indexOf('Hari Bhatara Sri')).toBeLessThan(html.indexOf('Pujawali Pura Puseh'));
    expect(html).not.toContain(`id="agenda-hari-${hariDariTanggal(2026, 11, 12)}"`); // hari biasa tanpa acara
  });
});

// Tanpa mesin tata letak (jsdom rusak, browser tidak dipakai di test) lebar teks tak bisa diukur; yang dijaga
// adalah syarat elipsis: nama = elemen sendiri yang boleh menyusut (min-width 0) dan memotong dengan "…".
describe('nama rerainan di sel terpotong dengan elipsis', () => {
  const css = readFileSync(path.resolve('src/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-bali.module.css'), 'utf8');
  const aturan = (sel: string) => css.match(new RegExp(`(?:^|\\n)${sel.replace('.', '\\.')} \\{([^}]*)\\}`))?.[1] ?? '';

  it('nama tiap baris rerainan dibungkus span sendiri, bukan teks lepas di dalam flex', () => {
    const html = bulanDesktop({ tahun: 2027, bulan: 5 }, []);
    const baris = [...html.matchAll(/data-tingkat="(?:besar|rutin)"[^>]*>(?:<svg[^]*?<\/svg>)?(.{0,120})/g)].map((m) => m[1]);
    expect(baris.length).toBeGreaterThan(5);
    for (const isi of baris) expect(isi).toMatch(/^<span class="[^"]*rrNama[^"]*">[^<]+<\/span><\/span>/);
    expect(html).toMatch(rr('besar', 'Tumpek Wayang')); // 8 Mei 2027, terpotong keras sebelum perbaikan
    expect(html).toMatch(rr('rutin', 'Hari Bhatara Sri')); // 14 Mei 2027
  });

  it('nama boleh menyusut & memotong "…"; baris tetap satu baris di sel', () => {
    expect(aturan('.rrNama')).toMatch(/min-width: 0;[^]*overflow: hidden;[^]*text-overflow: ellipsis;/);
    expect(aturan('.rr')).toMatch(/min-width: 0;[^]*white-space: nowrap;[^]*overflow: hidden;/);
    expect(aturan('.sel')).toContain('min-width: 0;');
  });
});
