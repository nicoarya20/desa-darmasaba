// @vitest-environment node
// Alarm dini kalender Bali 2028–2030: hari raya besar & purnama/tilem harus tetap cocok dengan kalender
// resmi. Diuji lewat fungsi publik kalender-bali.logic (bukan pustaka langsung) supaya pemetaan ejaan ikut teruji.
import { describe, expect, it } from 'vitest';
import { hariBali, normalisasiNama } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-bali.logic';
import { hariDariTanggal as H } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender.logic';

// test-only: sumber kalenderbali.org (rerainan.php), diverifikasi 2026-11-12. [tahun, bulan, tanggal] per nama tampil.
// Daftar ini lengkap untuk 2028–2030: Galungan/Kuningan/Saraswati/Pagerwesi berulang tiap 210 hari,
// Siwaratri & Nyepi setahun sekali.
const HARI_RAYA_BESAR: Record<string, [number, number, number][]> = {
  Siwaratri: [[2028, 1, 25], [2029, 1, 13], [2030, 1, 3]],
  Nyepi: [[2028, 3, 26], [2029, 3, 15], [2030, 3, 5]],
  Galungan: [[2028, 3, 8], [2028, 10, 4], [2029, 5, 2], [2029, 11, 28], [2030, 6, 26]],
  Kuningan: [[2028, 3, 18], [2028, 10, 14], [2029, 5, 12], [2029, 12, 8], [2030, 7, 6]],
  Saraswati: [[2028, 7, 22], [2029, 2, 17], [2029, 9, 15], [2030, 4, 13], [2030, 11, 9]],
  Pagerwesi: [[2028, 7, 26], [2029, 2, 21], [2029, 9, 19], [2030, 4, 17], [2030, 11, 13]],
};

// test-only: sumber kalenderbali.org (purnamatilem.php), diverifikasi 2026-11-12. [bulan, tanggal, nama].
// Ejaan sumber dibiarkan apa adanya (Kepitu, Mala Sadha, …); normalisasiNama yang menyamakan dengan ejaan tampil.
const PURNAMA_TILEM: Record<number, [number, number, string][]> = {
  2028: [
    [1, 11, 'Purnama Kepitu'], [1, 26, 'Tilem Kepitu'], [2, 10, 'Purnama Kewulu'], [2, 25, 'Tilem Kewulu'],
    [3, 10, 'Purnama Kesanga'], [3, 25, 'Tilem Kesanga'], [4, 9, 'Purnama Kedasa'], [4, 24, 'Tilem Kedasa'],
    [5, 8, 'Purnama Jiyestha'], [5, 23, 'Tilem Jiyestha'], [6, 7, 'Purnama Sadha'], [6, 22, 'Tilem Sadha'],
    [7, 6, 'Purnama Kasa'], [7, 21, 'Tilem Kasa'], [8, 5, 'Purnama Karo'], [8, 20, 'Tilem Karo'],
    [9, 4, 'Purnama Ketiga'], [9, 18, 'Tilem Ketiga'], [10, 3, 'Purnama Kapat'], [10, 18, 'Tilem Kapat'],
    [11, 2, 'Purnama Kelima'], [11, 16, 'Tilem Kelima'], [12, 1, 'Purnama Kenam'], [12, 16, 'Tilem Kenam'],
    [12, 31, 'Purnama Kepitu'],
  ],
  2029: [
    [1, 14, 'Tilem Kepitu'], [1, 29, 'Purnama Kewulu'], [2, 13, 'Tilem Kewulu'], [2, 28, 'Purnama Kesanga'],
    [3, 14, 'Tilem Kesanga'], [3, 29, 'Purnama Kedasa'], [4, 13, 'Tilem Kedasa'], [4, 28, 'Purnama Jiyestha'],
    [5, 13, 'Tilem Jiyestha'], [5, 27, 'Purnama Sadha'], [6, 11, 'Tilem Sadha'], [6, 26, 'Purnama Kasa'],
    [7, 11, 'Tilem Kasa'], [7, 25, 'Purnama Karo'], [8, 9, 'Tilem Karo'], [8, 24, 'Purnama Ketiga'],
    [9, 8, 'Tilem Ketiga'], [9, 22, 'Purnama Kapat'], [10, 7, 'Tilem Kapat'], [10, 22, 'Purnama Kelima'],
    [11, 6, 'Tilem Kelima'], [11, 20, 'Purnama Kenam'], [12, 5, 'Tilem Kenam'], [12, 20, 'Purnama Kepitu'],
  ],
  2030: [
    [1, 4, 'Tilem Kepitu'], [1, 19, 'Purnama Kewulu'], [2, 2, 'Tilem Kewulu'], [2, 17, 'Purnama Kesanga'],
    [3, 4, 'Tilem Kesanga'], [3, 19, 'Purnama Kedasa'], [4, 2, 'Tilem Kedasa'], [4, 17, 'Purnama Jiyestha'],
    [5, 2, 'Tilem Jiyestha'], [5, 17, 'Purnama Sadha'], [5, 31, 'Tilem Sadha'], [6, 15, 'Purnama Mala Sadha'],
    [6, 30, 'Tilem Mala Sadha'], [7, 15, 'Purnama Kasa'], [7, 30, 'Tilem Kasa'], [8, 13, 'Purnama Karo'],
    [8, 28, 'Tilem Karo'], [9, 12, 'Purnama Ketiga'], [9, 27, 'Tilem Ketiga'], [10, 11, 'Purnama Kapat'],
    [10, 26, 'Tilem Kapat'], [11, 10, 'Purnama Kelima'], [11, 25, 'Tilem Kelima'], [12, 9, 'Purnama Kenam'],
    [12, 24, 'Tilem Kenam'],
  ],
};

const AWAL = H(2028, 1, 1);
const AKHIR = H(2030, 12, 31);

describe('hari raya besar 2028–2030', () => {
  it.each(Object.entries(HARI_RAYA_BESAR))('%s jatuh di tanggal resmi & bertingkat besar', (nama, daftar) => {
    for (const [y, m, d] of daftar) {
      const r = hariBali(H(y, m, d)).rerainan.find((x) => x.nama === nama);
      expect(r?.tingkat, `${nama} ${d}/${m}/${y}`).toBe('besar');
    }
  });

  it('tidak ada hari raya besar tersebut di tanggal lain', () => {
    const kita: string[] = [];
    for (let h = AWAL; h <= AKHIR; h++) {
      for (const r of hariBali(h).rerainan) if (r.nama in HARI_RAYA_BESAR) kita.push(`${r.nama}@${h}`);
    }
    const ingin = Object.entries(HARI_RAYA_BESAR).flatMap(([n, l]) => l.map(([y, m, d]) => `${n}@${H(y, m, d)}`));
    expect(kita.sort()).toEqual(ingin.sort());
  });
});

describe('purnama & tilem 2028–2030', () => {
  it.each(Object.entries(PURNAMA_TILEM))('tahun %s cocok semua tanggal & sasih', (tahun, daftar) => {
    for (const [bulan, tanggal, n] of daftar) {
      const h = hariBali(H(Number(tahun), bulan, tanggal));
      const label = `${tanggal}/${bulan}/${tahun}`;
      expect(h.fase, label).toBe(n.startsWith('Purnama') ? 'purnama' : 'tilem');
      expect(normalisasiNama(h.rerainan.find((r) => r.bulan)?.nama ?? ''), label).toBe(normalisasiNama(n));
    }
  });

  it('tidak ada purnama/tilem lain di luar daftar (74 hari)', () => {
    let n = 0;
    for (let h = AWAL; h <= AKHIR; h++) if (hariBali(h).rerainan.some((r) => r.bulan)) n++;
    const total = Object.values(PURNAMA_TILEM).reduce((s, l) => s + l.length, 0);
    expect(total).toBe(74);
    expect(n).toBe(total);
  });

  it('sasih sisipan 2030 tampil "Mala Sadha" seperti kalenderbali.org (pustaka: Nampih Sadha)', () => {
    expect(hariBali(H(2030, 6, 15)).rerainan.map((r) => r.nama)).toContain('Purnama Mala Sadha');
    expect(hariBali(H(2030, 6, 30)).rerainan.map((r) => r.nama)).toContain('Tilem Mala Sadha');
  });
});
