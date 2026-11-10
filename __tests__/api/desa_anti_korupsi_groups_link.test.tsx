// @vitest-environment node
// Panel indikator Desa Anti Korupsi dipakai bersama: beranda (butir teks biasa, tanpa prop baru) dan
// halaman utama DAK (butir & kategori bertaut lewat prop opsional itemHref / kategoriHref).
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup (hover/klik diverifikasi manual).
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AntiKorupsiGroups } from '@/app/darmasaba/_com/main-page/desaantikorupsi/AntiKorupsiGroups';
import {
  groupByKategori,
  type AntiKorupsiApiItem,
} from '@/app/darmasaba/_com/main-page/desaantikorupsi/desaantikorupsi.logic';

// test-only: bentuk meniru item ringkas desaAntikorupsi.findMany.
const items: AntiKorupsiApiItem[] = [
  { id: 'a', name: '1.1 ADANYA PERDES', kategoriId: 'k1', kategori: { name: 'PENGUATAN TATA LAKSANA' }, jumlahDokumen: 3 },
  { id: 'b', name: '1.2 ADANYA SOP', kategoriId: 'k1', kategori: { name: 'PENGUATAN TATA LAKSANA' }, jumlahDokumen: 0 },
  { id: 'c', name: '5.1 BUDAYA LOKAL', kategoriId: 'k5', kategori: { name: 'KEARIFAN LOKAL' } },
];

describe('groupByKategori — jumlahDokumen (additive)', () => {
  const groups = groupByKategori(items);

  it('membawa jumlahDokumen ke butir bila item sumber memilikinya, termasuk nilai 0', () => {
    expect(groups[0].items).toEqual([
      { id: 'a', number: '1.1', text: 'Adanya Perdes', jumlahDokumen: 3 },
      { id: 'b', number: '1.2', text: 'Adanya SOP', jumlahDokumen: 0 },
    ]);
  });

  it('tidak menambah key jumlahDokumen bila item sumber tidak membawanya (output lama tetap)', () => {
    expect(Object.keys(groups[1].items[0])).toEqual(['id', 'number', 'text']);
  });
});

describe('AntiKorupsiGroups — beranda tanpa prop baru (regresi)', () => {
  const html = renderToStaticMarkup(<AntiKorupsiGroups groups={groupByKategori(items)} loading={false} />);

  it('butir & kategori tidak menjadi tautan, tanpa badge dokumen', () => {
    expect(html).not.toContain('<a');
    expect(html).not.toContain('dokumen');
    expect(html).toContain('Adanya Perdes');
    expect(html).toContain('<h3 id="antikorupsi-kategori-k1"');
  });
});

describe('AntiKorupsiGroups — dengan itemHref & kategoriHref', () => {
  const html = renderToStaticMarkup(
    <AntiKorupsiGroups
      groups={groupByKategori(items)}
      loading={false}
      itemHref={(item) => `/program/${item.id}`}
      kategoriHref={(group) => `/detail?kategori=${group.id}`}
    />,
  );

  it('tiap butir dan nama kategori bertaut ke href dari prop', () => {
    expect(html).toContain('href="/program/a"');
    expect(html).toContain('href="/program/c"');
    expect(html).toContain('href="/detail?kategori=k1"');
    expect(html).toContain('Lihat dokumen');
  });

  it('badge jumlah dokumen: angka bila >0, "Belum ada dokumen" bila 0, tidak ada bila data tanpa angka', () => {
    expect(html).toContain('3 dokumen');
    expect(html.match(/Belum ada dokumen/g)).toHaveLength(1);
  });

  it('section tetap berlabel nama kategori (id pindah ke span di dalam tautan)', () => {
    expect(html).toContain('aria-labelledby="antikorupsi-kategori-k1"');
    expect(html).toContain('<span id="antikorupsi-kategori-k1">Penguatan tata laksana</span>');
  });
});
