// @vitest-environment node
// Bank Sampah: alur bernomor (ikon dikenal/tak dikenal, rel vs vertikal, keadaan muat/kosong/galat) dan bagian Lokasi
// (baris, tautan "Petunjuk arah", peta disembunyikan tanpa koordinat). Klik baris ↔ peta diverifikasi di peramban.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { BankSampahSteps } from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/BankSampahSteps';
import { LokasiBankSampah } from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/LokasiBankSampah';
import { LokasiRow } from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/LokasiList';
import { toLokasi, type Langkah, type Lokasi } from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/bank-sampah.logic';
import s from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/bank-sampah.module.css';
import x from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/lokasi.module.css';
import { BANK_SAMPAH_TEXT as T } from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/bank-sampah.text';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

// Leaflet butuh window: peta diganti penanda teks (komponen dinamis ssr:false).
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="peta" /> }));

const langkah = (n: number, icon = 'trash'): Langkah[] =>
  Array.from({ length: n }, (_, i) => ({ id: `s${i}`, name: `Langkah ${i + 1}`, icon }));
const ready = <D,>(data: D): LoadState<D> => ({ status: 'ready', data });
// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const tps = (over: Partial<Parameters<typeof toLokasi>[0]> = {}): Lokasi =>
  toLokasi({
    id: 'tps',
    name: 'TPS3R Pudak Mesari',
    alamat: 'JL.BUGBUG DAM TANAH PUTIH, DESA DARMASABA',
    linkPetunjukArah: 'https://www.google.com/maps/dir/?api=1&destination=-8.568,115.204',
    lat: -8.568,
    lng: 115.204,
    ...over,
  });

describe('BankSampahSteps', () => {
  it('langkah bernomor berurutan dengan judul bagian h2 dan ikon IconMapper', () => {
    const html = renderToStaticMarkup(<BankSampahSteps state={ready(langkah(3))} />);
    expect(html).toContain(`>${T.stepsTitle}</h2>`);
    expect(html.match(new RegExp(`class="${s.stepNumber}"`, 'g'))).toHaveLength(3);
    expect(html.indexOf('>1</span>')).toBeLessThan(html.indexOf('>2</span>'));
    expect(html).toContain('<svg');
    expect(html).not.toContain(s.stepsVertical);
  });

  it('ikon tak dikenal → slot ikon kosong (bukan tanda tanya); semua tak dikenal → tanpa slot', () => {
    const campur = renderToStaticMarkup(<BankSampahSteps state={ready([...langkah(1), { id: 'x', name: 'Tes', icon: 'icon-test' }])} />);
    expect(campur.match(/<svg/g)).toHaveLength(1);
    expect(campur.match(new RegExp(`class="${s.stepIcon}"`, 'g'))).toHaveLength(2);
    const semua = renderToStaticMarkup(<BankSampahSteps state={ready(langkah(2, 'icon-test'))} />);
    expect(semua).not.toContain('<svg');
    expect(semua).not.toContain(s.stepIcon);
  });

  it('lebih dari 6 langkah → alur vertikal', () => {
    expect(renderToStaticMarkup(<BankSampahSteps state={ready(langkah(7))} />)).toContain(s.stepsVertical);
  });

  it('memuat = kerangka aria-busy; kosong & galat = kotak satu kalimat', () => {
    expect(renderToStaticMarkup(<BankSampahSteps state={{ status: 'loading' }} />)).toContain('aria-busy="true"');
    expect(renderToStaticMarkup(<BankSampahSteps state={ready([])} />)).toContain(`<p class="${kabar.empty}">${T.stepsEmpty}</p>`);
    expect(renderToStaticMarkup(<BankSampahSteps state={{ status: 'error' }} />)).toContain(T.stepsError);
  });
});

describe('LokasiRow', () => {
  it('berkoordinat + peta: tombol pilih + tautan petunjuk arah tab baru di luar tombol', () => {
    const html = renderToStaticMarkup(<LokasiRow item={tps()} selected={false} onPick={() => {}} onDetail={() => {}} />);
    expect(html).toContain('<button type="button"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('href="https://www.google.com/maps/dir/?api=1&amp;destination=-8.568,115.204"');
    expect(html).toContain('target="_blank" rel="noopener noreferrer"');
    expect(html.indexOf('</button>')).toBeLessThan(html.indexOf('<a '));
  });

  it('tombol "Lihat detail" (modal) terpisah dari tombol pilih, sebelum tautan petunjuk arah', () => {
    const html = renderToStaticMarkup(<LokasiRow item={tps()} selected={false} onPick={() => {}} onDetail={() => {}} />);
    expect(html).toContain(`aria-label="${T.detailLabel('TPS3R Pudak Mesari')}"`);
    expect(html).toContain(T.detail);
    expect(html.split('<button').length - 1).toBe(2);
    expect(html.indexOf(T.detail)).toBeLessThan(html.indexOf('<a '));
  });

  it('tanpa koordinat & tautan: baris bukan tombol pilih, label "belum ada titik", tanpa tautan; detail tetap ada', () => {
    const html = renderToStaticMarkup(
      <LokasiRow item={tps({ lat: null, lng: null, linkPetunjukArah: '' })} selected={false} onPick={() => {}} onDetail={() => {}} />,
    );
    expect(html).not.toContain('aria-pressed');
    expect(html).not.toContain('<a ');
    expect(html).toContain(T.notOnMap);
    expect(html).toContain(`aria-label="${T.detailLabel('TPS3R Pudak Mesari')}"`);
  });

  it('terpilih → kelas sorot + aria-pressed', () => {
    const html = renderToStaticMarkup(<LokasiRow item={tps()} selected onPick={() => {}} onDetail={() => {}} />);
    expect(html).toContain(x.rowSelected);
    expect(html).toContain('aria-pressed="true"');
  });
});

describe('LokasiBankSampah', () => {
  it('berkoordinat → peta + pengantar; tanpa kolom cari untuk daftar pendek', () => {
    const html = renderToStaticMarkup(<LokasiBankSampah state={ready([tps()])} />);
    expect(html).toContain('data-testid="peta"');
    expect(html).toContain(T.lokasiLead);
    expect(html).not.toContain('type="search"');
  });

  it('lebih dari 6 lokasi → kolom cari tampil', () => {
    const banyak = Array.from({ length: 7 }, (_, i) => tps({ id: `l${i}`, name: `Lokasi ${i}` }));
    expect(renderToStaticMarkup(<LokasiBankSampah state={ready(banyak)} />)).toContain('type="search"');
  });

  it('tanpa satu pun koordinat → peta & pengantar disembunyikan, daftar selebar penuh', () => {
    const html = renderToStaticMarkup(<LokasiBankSampah state={ready([tps({ lat: null, lng: null })])} />);
    expect(html).not.toContain('data-testid="peta"');
    expect(html).not.toContain(T.lokasiLead);
    expect(html).toContain(x.noMap);
    // Tanpa peta: baris bukan tombol pilih (hanya tombol "Lihat detail").
    expect(html).not.toContain('aria-pressed');
  });

  it('memuat = kerangka aria-busy; kosong & galat = kotak satu kalimat', () => {
    expect(renderToStaticMarkup(<LokasiBankSampah state={{ status: 'loading' }} />)).toContain('aria-busy="true"');
    expect(renderToStaticMarkup(<LokasiBankSampah state={ready([])} />)).toContain(T.lokasiEmpty);
    expect(renderToStaticMarkup(<LokasiBankSampah state={{ status: 'error' }} />)).toContain(T.lokasiError);
  });
});
