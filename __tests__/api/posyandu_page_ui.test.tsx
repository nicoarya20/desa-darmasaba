// @vitest-environment node
// Halaman publik Posyandu: ringkasan gaya APBDes, direktori baris (tanpa badge "Aktif" palsu & gambar "No image"),
// tab Balita/Ibu Hamil berisi angka per banjar tanpa nama (angka asli), dan detail 860px.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek/fetch tidak jalan di server).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ tab: null as string | null }));
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(nav.tab ? `tab=${nav.tab}` : ''),
}));

import { BalitaTable } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/BalitaPanel';
import { PosyanduDetailBody } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/detail/PosyanduDetail';
import { IbuHamilTiles } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/IbuHamilPanel';
import type { BanjarStatsRow, PosyanduStats } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.logic';
import type { PosyanduItem } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.source';
import { POSYANDU_TEXT as T } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.text';
import { PosyanduRows } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/PosyanduDirectory';
import { PosyanduPage } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/PosyanduPage';
import { RingkasanContent } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/RingkasanPanel';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/\s+/g, ' ');

// test-only: respons agregat GET /ringkasankesehatan/stats.
const stats = (extra: Partial<PosyanduStats> = {}): PosyanduStats => ({
  ibuHamilAktif: 11,
  balitaTerdaftar: 26,
  alertStunting: 17,
  imunisasiLengkapPct: 73,
  pemeriksaanRutinPct: 88,
  giziBaikPct: 58,
  targetStuntingPct: 10,
  ...extra,
});
// test-only: posyandu berbentuk respons find-many.
const posyandu = (id: string, extra: Partial<PosyanduItem> = {}): PosyanduItem => ({
  id,
  name: `Posyandu ${id}`,
  nomor: '0812-3456-789',
  deskripsi: '<p>Melayani penimbangan balita.</p>',
  jadwalPelayanan: '[{"hari":"senin-jumat","buka":"08:00","tutup":"12:00"}]',
  image: null,
  banjar: { id: 'b1', name: 'Banjar Anggrek' },
  ...extra,
});

describe('Ringkasan', () => {
  it('menampilkan 3 hitungan + 3 persentase seluruh desa', () => {
    const out = text(render(<RingkasanContent stats={stats()} />));
    expect(out).toContain(T.ibuHamilLabel);
    expect(out).toContain('11 orang');
    expect(out).toContain('26 balita');
    expect(out).toContain('17 balita');
    expect(out).toContain('73%');
    expect(out).toContain('58%');
    expect(out).toContain('88%');
    expect(out).toContain(T.privacyNote);
  });

  it('hitungan 1-2 tampil angka asli; 0 tetap 0; persen disembunyikan bila balita < 3', () => {
    const out = text(render(<RingkasanContent stats={stats({ ibuHamilAktif: 2, balitaTerdaftar: 2, alertStunting: 0, imunisasiLengkapPct: 50, targetStuntingPct: 0 })} />));
    expect(out).toContain('2 orang');
    expect(out).toContain('2 balita');
    expect(out).not.toContain('< 3');
    expect(out).toContain('0 balita');
    expect(out).toContain(T.pctTooFew);
    expect(out).not.toMatch(/\d+%/);
  });

  it('target stunting desa tampil di kartu Alert stunting, tanpa bar/persen capaian', () => {
    const html = render(<RingkasanContent stats={stats({ targetStuntingPct: 10 })} />);
    const out = text(html);
    expect(out).toContain(`${T.targetLabel} 10%`);
    const alertCard = text(html.split('<article').find((a) => a.includes(T.alertLabel)) ?? '');
    expect(alertCard).toContain(`${T.targetLabel} 10%`);
    // 3 bar hanya milik kartu persentase; target tidak punya bar/capaian.
    expect((html.match(/role="progressbar"/g) ?? []).length).toBe(3);
  });

  it('target 0 → baris target tidak tampil (bukan "0%")', () => {
    const out = text(render(<RingkasanContent stats={stats({ targetStuntingPct: 0 })} />));
    expect(out).not.toContain(T.targetLabel);
    expect(out).not.toContain('0%');
  });

  it('tanpa balita → "Belum ada data", bukan 0%', () => {
    const out = text(render(<RingkasanContent stats={stats({ balitaTerdaftar: 0, alertStunting: 0, imunisasiLengkapPct: 0, giziBaikPct: 0, pemeriksaanRutinPct: 0, targetStuntingPct: 0 })} />));
    expect(out).toContain(T.pctNoData);
    expect(out).not.toContain('0%');
  });
});

describe('Balita per banjar', () => {
  const rows: BanjarStatsRow[] = [
    { id: 'b1', name: 'Banjar Anggrek', stats: stats({ balitaTerdaftar: 2, alertStunting: 1, imunisasiLengkapPct: 50 }) },
    { id: 'b2', name: 'Dahlia', stats: stats({ balitaTerdaftar: 4, alertStunting: 3, imunisasiLengkapPct: 75, giziBaikPct: 50, pemeriksaanRutinPct: 75 }) },
    { id: 'b3', name: 'Banjar Kamboja', stats: stats({ balitaTerdaftar: 0, alertStunting: 0, imunisasiLengkapPct: 0 }) },
    { id: 'b4', name: 'Banjar Melur', stats: null },
  ];
  const html = render(<BalitaTable desa={stats()} rows={rows} />);
  const out = text(html);
  const rowText = (name: string) => text(html.split('<li').find((li) => li.includes(`>${name}<`)) ?? '');

  it('baris seluruh desa + tiap banjar, nama banjar tidak dobel', () => {
    expect(out).toContain(T.desaRow);
    expect(out).toContain('Banjar Anggrek');
    expect(out).toContain('Banjar Dahlia');
    expect(out).not.toContain('Banjar Banjar');
  });

  it('banjar dengan 2 balita: hitungan angka asli dan persen "belum cukup data"', () => {
    const r = rowText('Banjar Anggrek');
    expect(r).toMatch(/Balita terdaftar 2 /);
    expect(r).toMatch(/Alert stunting 1 /);
    expect(r).not.toContain('< 3');
    expect(r).toContain(T.pctFewShort);
    expect(r).not.toContain('50%');
  });

  it('banjar dengan ≥ 3 balita: angka & persen tampil', () => {
    const r = rowText('Banjar Dahlia');
    expect(r).toMatch(/Balita terdaftar 4 /);
    expect(r).toMatch(/Alert stunting 3 /);
    expect(r).toContain('75%');
  });

  it('banjar tanpa balita: 0 dan "belum ada data"; banjar gagal → "Gagal dimuat"', () => {
    expect(rowText('Banjar Kamboja')).toContain(T.pctNoneShort);
    expect(rowText('Banjar Kamboja')).not.toContain('0%');
    expect(rowText('Banjar Melur')).toContain(T.rowFailed);
  });

  it('angka desa gagal → baris desa tetap ada berketerangan gagal', () => {
    const r = text(render(<BalitaTable desa={null} rows={rows.slice(0, 1)} />));
    expect(r).toContain(`${T.desaRow} ${T.rowFailed}`);
  });
});

describe('Ibu hamil per banjar', () => {
  it('ubin per banjar: angka asli (1 tetap 1), 0 tetap 0, desa angka penuh', () => {
    const rows: BanjarStatsRow[] = [
      { id: 'b1', name: 'Banjar Anggrek', stats: stats({ ibuHamilAktif: 1 }) },
      { id: 'b2', name: 'Banjar Dahlia', stats: stats({ ibuHamilAktif: 0 }) },
      { id: 'b3', name: 'Banjar Mawar', stats: stats({ ibuHamilAktif: 5 }) },
    ];
    const out = text(render(<IbuHamilTiles desa={stats({ ibuHamilAktif: 11 })} rows={rows} />));
    expect(out).toContain(`${T.desaRow} 11 orang`);
    expect(out).toContain('Banjar Anggrek 1 orang');
    expect(out).toContain('Banjar Dahlia 0 orang');
    expect(out).toContain('Banjar Mawar 5 orang');
  });
});

describe('Direktori posyandu', () => {
  const html = render(
    <PosyanduRows
      items={[
        posyandu('a', { image: { link: '/api/img/a.webp' } }),
        posyandu('b', { nomor: '', jadwalPelayanan: '', banjar: null }),
        posyandu('c', { jadwalPelayanan: 'Senin, 23 Feb 2026, 08:00 - 11:00 WITA' }),
      ]}
    />,
  );
  const out = text(html);

  it('baris = tautan detail + pil tel:, tanpa badge "Aktif" palsu dan tanpa gambar "No image"', () => {
    expect(html).toContain('href="/kesehatan/posyandu/a"');
    expect(html).toContain('href="tel:08123456789"');
    expect(out).not.toMatch(/\bAktif\b/i);
    expect(html).not.toContain('no-image');
    expect((html.match(/<img/g) ?? []).length).toBe(1);
  });

  it('jadwal terstruktur & teks lama tampil; nilai kosong ditulis jujur', () => {
    expect(out).toContain('Senin–Jumat 08.00–12.00');
    expect(out).toContain('Senin, 23 Feb 2026, 08:00 - 11:00 WITA');
    expect(out).toContain(T.nomorKosong);
    expect(out).toContain(T.jadwalKosong);
    expect(out).toContain(T.banjarKosong);
  });

  it('tanpa em dash', () => {
    expect(out).not.toContain('—');
  });
});

describe('Detail posyandu', () => {
  it('banjar, judul, jadwal per baris, tombol Telepon, deskripsi; tanpa placeholder gambar', () => {
    const html = render(<PosyanduDetailBody data={posyandu('a')} />);
    const out = text(html);
    expect(html).toContain('<h1');
    expect(out).toContain('Posyandu a');
    expect(out).toContain('Banjar Anggrek');
    expect(out).toContain('Senin–Jumat 08.00–12.00');
    expect(html).toContain('href="tel:08123456789"');
    expect(out).toContain(T.tentang);
    expect(out).toContain('Melayani penimbangan balita.');
    expect(out).not.toContain('Tidak ada gambar');
    expect(html).not.toContain('<img');
    expect(out).not.toContain('—');
  });

  it('nilai kosong → "belum diisi", deskripsi kosong tidak dirender, foto hanya bila ada', () => {
    const html = render(
      <PosyanduDetailBody data={posyandu('b', { nomor: null, jadwalPelayanan: null, banjar: null, deskripsi: '<p>&nbsp;</p>', image: { link: '/api/img/b.webp' } })} />,
    );
    const out = text(html);
    expect(out).toContain(T.nomorKosong);
    expect(out).toContain(T.jadwalKosong);
    expect(out).toContain(T.banjarKosong);
    expect(out).not.toContain(T.tentang);
    expect(html).not.toContain('href="tel:');
    expect((html.match(/<img/g) ?? []).length).toBe(1);
  });
});

describe('Kerangka halaman', () => {
  it('judul, 4 tab, dan ringkasan memuat sebagai tab bawaan', () => {
    nav.tab = null;
    const html = render(<PosyanduPage />);
    const out = text(html);
    expect(html).toContain('<h1');
    expect(out).toContain(T.pageTitle);
    for (const label of [T.tabRingkasan, T.tabPosyanduShort, T.tabBalita, T.tabIbuHamil]) expect(out).toContain(label);
    expect(html).toContain(`aria-label="${T.statsLoading}"`);
  });

  it('?tab=balita membuka panel balita per banjar (memuat)', () => {
    nav.tab = 'balita';
    const html = render(<PosyanduPage />);
    expect(text(html)).toContain(T.balitaTitle);
    expect(html).toContain(`aria-label="${T.banjarLoading}"`);
  });

  it('?tab=posyandu membuka direktori', () => {
    nav.tab = 'posyandu';
    expect(text(render(<PosyanduPage />))).toContain(T.directoryTitle);
  });
});
