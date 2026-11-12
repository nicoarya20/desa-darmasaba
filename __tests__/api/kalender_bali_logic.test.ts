// @vitest-environment node
// Kalender Bali di halaman Agenda: kecocokan dengan data uji 2026–2027 (purnama/tilem & rerainan),
// tabel ejaan, aturan "agenda admin menang", tanggal dari komponen WITA, judul sasih, rerainan berikutnya.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { EJAAN_BALI, RERAINAN_TAMBAHAN } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-bali.meta';
import {
  baliBulan,
  dateUntukPustaka,
  ejaanTampil,
  hariBali,
  judulSasih,
  namaHariBali,
  normalisasiNama,
  rerainanBerikutnya,
  saringRerainan,
  teksTanggalSasih,
} from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-bali.logic';
import { warigaHari } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-bali.wariga';
import { batasBulan, hariDariTanggal, hariWita } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender.logic';

const H = hariDariTanggal;
const LOGIC = path.resolve('src/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender-bali.logic.ts');
const nama = (hari: number) => hariBali(hari).rerainan.map((r) => r.nama);

// test-only: fakta tanggal purnama/tilem 2026–2027 (ejaan kalenderbali.org), [bulan, tanggal, nama].
const PURNAMA_TILEM: Record<number, [number, number, string][]> = {
  2026: [
    [1, 3, 'Purnama Kepitu'], [1, 18, 'Tilem Kepitu'], [2, 2, 'Purnama Kewulu'], [2, 16, 'Tilem Kewulu'],
    [3, 3, 'Purnama Kesanga'], [3, 18, 'Tilem Kesanga'], [4, 2, 'Purnama Kedasa'], [4, 16, 'Tilem Kedasa'],
    [5, 1, 'Purnama Jiyestha'], [5, 16, 'Tilem Jiyestha'], [5, 31, 'Purnama Sadha'], [6, 14, 'Tilem Sadha'],
    [6, 29, 'Purnama Kasa'], [7, 14, 'Tilem Kasa'], [7, 29, 'Purnama Karo'], [8, 12, 'Tilem Karo'],
    [8, 27, 'Purnama Ketiga'], [9, 11, 'Tilem Ketiga'], [9, 26, 'Purnama Kapat'], [10, 11, 'Tilem Kapat'],
    [10, 25, 'Purnama Kelima'], [11, 9, 'Tilem Kelima'], [11, 24, 'Purnama Kenam'], [12, 9, 'Tilem Kenam'],
    [12, 23, 'Purnama Kepitu'],
  ],
  2027: [
    [1, 7, 'Tilem Kepitu'], [1, 22, 'Purnama Kewulu'], [2, 6, 'Tilem Kewulu'], [2, 20, 'Purnama Kesanga'],
    [3, 7, 'Tilem Kesanga'], [3, 22, 'Purnama Kedasa'], [4, 6, 'Tilem Kedasa'], [4, 20, 'Purnama Jiyestha'],
    [5, 5, 'Tilem Jiyestha'], [5, 20, 'Purnama Mala Jiyestha'], [6, 4, 'Tilem Mala Jiyestha'], [6, 19, 'Purnama Sadha'],
    [7, 3, 'Tilem Sadha'], [7, 18, 'Purnama Kasa'], [8, 2, 'Tilem Kasa'], [8, 17, 'Purnama Karo'],
    [8, 31, 'Tilem Karo'], [9, 15, 'Purnama Ketiga'], [9, 30, 'Tilem Ketiga'], [10, 15, 'Purnama Kapat'],
    [10, 29, 'Tilem Kapat'], [11, 13, 'Purnama Kelima'], [11, 28, 'Tilem Kelima'], [12, 13, 'Purnama Kenam'],
    [12, 28, 'Tilem Kenam'],
  ],
};

// test-only: fakta nama rerainan per tanggal (ejaan kalenderbali.org, tanpa teks keterangan), [tanggal, nama].
// Dua entri gabungan dipecah: "Kajeng Keliwon Pamelastali/Watugunung Runtuh" (29 Mar 2026) dan
// "Tumpek Uduh/Pengatag/Pengarah/Bubuh" (19 Des 2026, nama lain hari yang sama → cukup Tumpek Uduh).
const RERAINAN: { tahun: number; bulan: number; isi: [number, string][] }[] = [
  { tahun: 2026, bulan: 3, isi: [
    [3, 'Purnama Kesanga'], [4, 'Buda Keliwon Ugu'], [14, 'Kajeng Keliwon Uwudan'], [14, 'Tumpek Wayang'],
    [18, 'Buda Wage Kulawu'], [18, 'Tilem Kesanga'], [19, 'Hari Raya Nyepi'], [20, 'Hari Bhatara Sri'],
    [20, 'Ngembak Geni'], [24, 'Anggar Kasih Dukut'], [29, 'Kajeng Keliwon Enyitan'], [29, 'Kajeng Keliwon Pamelastali'],
    [29, 'Watugunung Runtuh'], [31, 'Paid-Paidan'],
  ] },
  { tahun: 2026, bulan: 11, isi: [
    [1, 'Banyu Pinaruh'], [2, 'Soma Ribek'], [3, 'Sabuh Mas'], [4, 'Pagerwesi'], [9, 'Tilem Kelima'],
    [14, 'Tumpek Landep'], [15, 'Redite Umanis Ukir'], [18, 'Buda Wage Ukir'], [20, 'Hari Bhatara Sri'],
    [24, 'Anggar Kasih Kulantir'], [24, 'Purnama Kenam'], [30, 'Soma Umanis Tolu'],
  ] },
  { tahun: 2026, bulan: 12, isi: [
    [9, 'Buda Keliwon Gumbreg'], [9, 'Tilem Kenam'], [19, 'Tumpek Uduh'], [21, 'Soma Paing Warigadean'],
    [23, 'Buda Wage Warigadean'], [23, 'Purnama Kepitu'], [24, 'Kajeng Keliwon Uwudan'], [25, 'Hari Bhatara Sri'],
    [29, 'Anggar Kasih Julungwangi'],
  ] },
  { tahun: 2027, bulan: 1, isi: [
    [6, 'Hari Siwa Ratri'], [7, 'Sugihan Jawa'], [7, 'Tilem Kepitu'], [8, 'Sugihan Bali'], [10, 'Hari Penyekeban'],
    [11, 'Penyajaan Galungan'], [12, 'Penampahan Galungan'], [13, 'Hari Raya Galungan'], [14, 'Manis Galungan'],
    [16, 'Pemaridan Guru'], [17, 'Ulihan'], [18, 'Pemacekan Agung'], [20, 'Buda Paing Kuningan'],
    [22, 'Penampahan Kuningan'], [22, 'Purnama Kewulu'], [23, 'Kajeng Keliwon Uwudan'], [23, 'Hari Raya Kuningan'],
    [27, 'Buda Wage Langkir'], [29, 'Hari Bhatara Sri'],
  ] },
  { tahun: 2027, bulan: 3, isi: [
    [3, 'Buda Wage Merakih'], [5, 'Hari Bhatara Sri'], [7, 'Tilem Kesanga'], [8, 'Hari Raya Nyepi'],
    [9, 'Anggar Kasih Tambir'], [9, 'Ngembak Geni'], [16, 'Anggara Paing Medangkungan'], [22, 'Purnama Kedasa'],
    [24, 'Kajeng Keliwon Uwudan'], [24, 'Buda Keliwon Matal'],
  ] },
  { tahun: 2026, bulan: 6, isi: [
    [2, 'Anggar Kasih Julungwangi'], [11, 'Sugihan Jawa'], [12, 'Kajeng Keliwon Uwudan'], [12, 'Sugihan Bali'],
    [14, 'Hari Penyekeban'], [14, 'Tilem Sadha'], [15, 'Penyajaan Galungan'], [16, 'Penampahan Galungan'],
    [17, 'Hari Raya Galungan'], [18, 'Manis Galungan'], [20, 'Pemaridan Guru'], [21, 'Ulihan'],
    [22, 'Pemacekan Agung'], [24, 'Buda Paing Kuningan'], [26, 'Penampahan Kuningan'],
    [27, 'Kajeng Keliwon Enyitan'], [27, 'Hari Raya Kuningan'], [29, 'Purnama Kasa'],
  ] },
  { tahun: 2026, bulan: 8, isi: [
    [1, 'Tumpek Krulut'], [5, 'Buda Wage Merakih'], [7, 'Hari Bhatara Sri'], [11, 'Anggar Kasih Tambir'],
    [11, 'Kajeng Keliwon Uwudan'], [12, 'Tilem Karo'], [18, 'Anggara Paing Medangkungan'],
    [26, 'Kajeng Keliwon Enyitan'], [26, 'Buda Keliwon Matal'], [27, 'Purnama Ketiga'],
  ] },
  { tahun: 2027, bulan: 2, isi: [
    [2, 'Anggar Kasih Medangsia'], [6, 'Tilem Kewulu'], [17, 'Buda Keliwon Pegatuwakan'], [20, 'Purnama Kesanga'],
    [22, 'Kajeng Keliwon Uwudan'], [27, 'Tumpek Krulut'],
  ] },
];

// test-only: kalenderbali.org menambah nama wuku/paruh sasih di belakang tiga rerainan rutin; kita tidak.
const tanpaAkhiran = (n: string) => n.replace(/^(Buda Wage|Anggar Kasih|Kajeng Keliwon) .+$/, '$1');
// Selisih yang disengaja: Kajeng Kliwon tampil di setiap siklus 15 hari (kalenderbali.org melewatkannya
// bila jatuh bersama purnama/tilem/hari raya), dan Tawur Agung Kasanga dari pustaka.
const LEBIH_YANG_DIBOLEHKAN = new Set(['kajeng kliwon', 'tawur agung kasanga']);

describe('tanggal dari komponen WITA', () => {
  it('membangun Date lokal dari tanggal WITA, bukan dari instan mentah', () => {
    const hari = hariWita('2026-11-23T16:30:00.000Z'); // 24 Nov 00:30 WITA, masih 23 Nov di UTC
    const d = dateUntukPustaka(hari);
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours()]).toEqual([2026, 11, 24, 0]);
    expect(hariBali(hari).fase).toBe('purnama');
  });

  // Zona waktu tidak bisa diganti di tengah proses (pustaka menyimpan tanggal patokan saat dimuat), jadi
  // tiap zona dijalankan di proses bun tersendiri — sama seperti peramban warga di zona mana pun.
  it('hasil sama di zona waktu peramban mana pun', () => {
    const skrip = `import { hariBali, namaHariBali } from '${LOGIC}';
      import { hariDariTanggal } from '${LOGIC.replace('kalender-bali.logic', 'kalender.logic')}';
      const h = hariBali(hariDariTanggal(2026, 11, 24));
      console.log(JSON.stringify([h.fase, h.wuku, namaHariBali(h)]));`;
    for (const tz of ['America/Los_Angeles', 'Pacific/Kiritimati', 'UTC']) {
      const out = execFileSync('bun', ['-e', skrip], { env: { ...process.env, TZ: tz }, encoding: 'utf8' });
      expect(JSON.parse(out), tz).toEqual(['purnama', 'Kulantir', 'Anggara Kliwon']);
    }
  }, 20_000);
});

describe('purnama & tilem 2026–2027', () => {
  it.each(Object.entries(PURNAMA_TILEM))('tahun %s cocok semua tanggal & sasih', (tahun, daftar) => {
    for (const [bulan, tanggal, n] of daftar) {
      const h = hariBali(H(Number(tahun), bulan, tanggal));
      const bulanRerainan = h.rerainan.find((r) => r.bulan);
      expect(h.fase, `${tanggal}/${bulan}/${tahun}`).toBe(n.startsWith('Purnama') ? 'purnama' : 'tilem');
      expect(normalisasiNama(bulanRerainan?.nama ?? ''), `${tanggal}/${bulan}/${tahun}`).toBe(normalisasiNama(n));
    }
  });

  it('tidak ada purnama/tilem lain di luar daftar uji', () => {
    let n = 0;
    for (let h = H(2026, 1, 1); h <= H(2027, 12, 31); h++) if (hariBali(h).rerainan.some((r) => r.bulan)) n++;
    expect(n).toBe(PURNAMA_TILEM[2026].length + PURNAMA_TILEM[2027].length);
  });

  it('sasih sisipan 2027 tampil "Mala Jiyestha" seperti kalenderbali.org (pustaka: Nampih Destha)', () => {
    expect(nama(H(2027, 5, 20))).toContain('Purnama Mala Jiyestha');
    expect(nama(H(2027, 6, 4))).toContain('Tilem Mala Jiyestha');
    expect(hariBali(H(2027, 5, 20)).sasih).toBe('Mala Jiyestha');
  });
});

describe('rerainan vs data uji per bulan', () => {
  it.each(RERAINAN.map((b) => [`${b.bulan}/${b.tahun}`, b] as const))('%s: tidak ada yang hilang', (_, b) => {
    const harapan = new Map<number, Set<string>>();
    for (const [tgl, n] of b.isi) harapan.set(tgl, (harapan.get(tgl) ?? new Set()).add(normalisasiNama(tanpaAkhiran(n))));
    const { awal, akhir } = batasBulan(b);
    for (let hari = awal; hari <= akhir; hari++) {
      const tgl = hari - awal + 1;
      const kita = new Set(nama(hari).map(normalisasiNama));
      const ingin = harapan.get(tgl) ?? new Set<string>();
      expect([...ingin].filter((n) => !kita.has(n)), `hilang ${tgl}/${b.bulan}`).toEqual([]);
      expect([...kita].filter((n) => !ingin.has(n) && !LEBIH_YANG_DIBOLEHKAN.has(n)), `lebih ${tgl}/${b.bulan}`).toEqual([]);
    }
  });

  it('hari raya besar jatuh di tanggal yang benar & bertingkat besar', () => {
    const besar: [number, number, number, string][] = [
      [2026, 3, 19, 'Nyepi'], [2027, 3, 8, 'Nyepi'], [2027, 1, 6, 'Siwaratri'], [2027, 1, 13, 'Galungan'],
      [2027, 1, 23, 'Kuningan'], [2026, 11, 4, 'Pagerwesi'], [2026, 11, 14, 'Tumpek Landep'], [2026, 3, 14, 'Tumpek Wayang'],
      [2026, 8, 1, 'Tumpek Krulut'], [2027, 2, 27, 'Tumpek Krulut'], [2026, 6, 17, 'Galungan'], [2026, 6, 27, 'Kuningan'],
    ];
    for (const [y, m, d, n] of besar) {
      expect(hariBali(H(y, m, d)).rerainan.find((r) => r.nama === n)?.tingkat, `${n} ${d}/${m}/${y}`).toBe('besar');
    }
  });

  it('rerainan rutin bertingkat rutin; urutan besar → purnama/tilem → rutin', () => {
    const h = hariBali(H(2026, 11, 24));
    expect(h.rerainan.map((r) => [r.nama, r.tingkat])).toEqual([
      ['Purnama Kanem', 'rutin'],
      ['Kajeng Kliwon', 'rutin'],
      ['Anggara Kasih', 'rutin'],
    ]);
    expect(hariBali(H(2026, 3, 18)).rerainan.map((r) => r.nama)).toEqual(['Tawur Agung Kasanga', 'Tilem Kasanga', 'Buda Cemeng']);
  });

  it('Buda Kliwon tambahan tidak menimpa Pagerwesi/Galungan', () => {
    expect(nama(H(2026, 11, 4))).toEqual(['Pagerwesi']);
    expect(nama(H(2027, 1, 13)).some((n) => n.startsWith('Buda Kliwon'))).toBe(false);
    expect(nama(H(2026, 3, 4))).toEqual(['Buda Kliwon Ugu']);
  });

  it('setiap aturan tambahan punya pemicu wewaran yang dikenal pustaka', () => {
    const sapta = ['Redite', 'Soma', 'Anggara', 'Buda', 'Wraspati', 'Sukra', 'Saniscara'];
    const panca = ['Paing', 'Pon', 'Wage', 'Kliwon', 'Umanis'];
    for (const a of RERAINAN_TAMBAHAN) expect([sapta.includes(a.saptaWara), panca.includes(a.pancaWara)]).toEqual([true, true]);
  });
});

describe('ejaan', () => {
  it('nama pustaka diganti ejaan tampil', () => {
    expect(['Sabuh Emas', 'Pager Wesi', 'Siwa Ratri', 'Destha', 'Nampih Destha', 'Kawolu'].map(ejaanTampil)).toEqual([
      'Sabuh Mas',
      'Pagerwesi',
      'Siwaratri',
      'Jiyestha',
      'Mala Jiyestha',
      'Kawolu',
    ]);
    expect(nama(H(2026, 11, 3))).toEqual(['Sabuh Mas']);
  });

  it('setiap ejaan mencatat sumbernya & tiap ejaan pustaka unik', () => {
    for (const e of EJAAN_BALI) expect(e.sumber.length, e.pustaka).toBeGreaterThan(10);
    expect(new Set(EJAAN_BALI.map((e) => e.pustaka)).size).toBe(EJAAN_BALI.length);
  });

  it('normalisasi menyamakan varian & membuang "hari raya"', () => {
    expect(normalisasiNama('Hari Raya Pager Wesi')).toBe('pagerwesi');
    expect(normalisasiNama('Buda Keliwon Pegatuwakan')).toBe(normalisasiNama('Pegat Uwakan'));
    expect(normalisasiNama('Kajeng Keliwon')).toBe('kajeng kliwon');
    expect(normalisasiNama('Anggar Kasih')).toBe('anggara kasih');
    expect(normalisasiNama('Purnama Kesanga')).toBe('purnama kasanga');
    expect(normalisasiNama('HARI RAYA NYEPI')).toBe('nyepi');
    expect(normalisasiNama('Hari Bhatara Sri')).toBe('bhatara sri');
    expect(normalisasiNama('Purnama Nampih Destha')).toBe(normalisasiNama('Purnama Mala Jiyestha'));
  });
});

describe('agenda admin menang', () => {
  const ag = (n: string) => ({ nama: n });

  it('Nyepi disembunyikan bila admin punya "Hari Raya Nyepi" di hari yang sama', () => {
    const r = hariBali(H(2026, 3, 19)).rerainan;
    expect(saringRerainan(r, [ag('Hari Raya Nyepi')])).toEqual([]);
    expect(saringRerainan(r, [ag('Lomba Ogoh-Ogoh Desa')]).map((x) => x.nama)).toEqual(['Nyepi']);
  });

  it('"Perayaan Galungan dan Kuningan" menyembunyikan Galungan & Kuningan, bukan Penampahan', () => {
    const agenda = [ag('Perayaan Galungan dan Kuningan')];
    expect(saringRerainan(hariBali(H(2027, 1, 13)).rerainan, agenda)).toEqual([]);
    expect(saringRerainan(hariBali(H(2027, 1, 23)).rerainan, agenda).map((x) => x.nama)).toEqual(['Kajeng Kliwon']);
    expect(saringRerainan(hariBali(H(2027, 1, 12)).rerainan, agenda).map((x) => x.nama)).toEqual(['Penampahan Galungan']);
  });

  it('"Hari Raya Kuningan" & ejaan varian ikut dikenali', () => {
    expect(saringRerainan(hariBali(H(2027, 1, 23)).rerainan, [ag('Hari Raya Kuningan')]).map((x) => x.nama)).toEqual(['Kajeng Kliwon']);
    expect(saringRerainan(hariBali(H(2026, 11, 4)).rerainan, [ag('Upacara Pager Wesi')])).toEqual([]);
  });

  it('purnama dikenali dari nama dasarnya; kata sebagian tidak cukup', () => {
    const r = hariBali(H(2026, 11, 24)).rerainan;
    expect(saringRerainan(r, [ag('Persembahyangan Purnama di Pura Desa')]).map((x) => x.nama)).toEqual(['Kajeng Kliwon', 'Anggara Kasih']);
    expect(saringRerainan(r, [ag('Anggaran Kasih Sayang')]).length).toBe(3);
  });
});

describe('ringkasan hari & bulan', () => {
  it('hari ini 12 Nov 2026: Wraspati Pon, wuku Landep, penanggal 3 sasih Kanem', () => {
    const h = hariBali(H(2026, 11, 12));
    expect([namaHariBali(h), h.wuku, h.uripWuku, teksTanggalSasih(h), h.sasih, h.saka]).toEqual([
      'Wraspati Pon', 'Landep', 1, 'Penanggal 3', 'Kanem', 1948,
    ]);
  });

  it('judul sasih bulan memuat semua sasih & tahun Çaka yang dilalui', () => {
    expect(judulSasih(baliBulan({ tahun: 2026, bulan: 11 }), batasBulan({ tahun: 2026, bulan: 11 }))).toBe('Sasih Kalima – Kanem · Çaka 1948');
    expect(judulSasih(baliBulan({ tahun: 2026, bulan: 3 }), batasBulan({ tahun: 2026, bulan: 3 }))).toBe('Sasih Kasanga – Kadasa · Çaka 1947–1948');
  });

  it('peta bulan mencakup seluruh kisi (termasuk tepi bulan tetangga)', () => {
    const peta = baliBulan({ tahun: 2026, bulan: 11 });
    expect(peta.size).toBe(35);
    expect(peta.get(H(2026, 11, 1))?.wuku).toBe('Sinta');
  });

  it('rerainan berikutnya dari 12 Nov 2026 = Tumpek Landep, 2 hari lagi', () => {
    expect(rerainanBerikutnya(H(2026, 11, 12))).toEqual({ hari: H(2026, 11, 14), selisih: 2, nama: 'Tumpek Landep' });
  });
});

describe('wariga', () => {
  it('memuat eka–dasa wara, pawukon lengkap, dan sasih', () => {
    const w = warigaHari(H(2026, 11, 24));
    const peta = Object.fromEntries(w.flatMap((k) => k.baris.map((b) => [b.label, b.nilai])));
    expect(w.map((k) => k.judul)).toEqual(['Wewaran', 'Pawukon', 'Sasih']);
    expect(peta).toMatchObject({
      Ekawara: 'Luang',
      Pancawara: 'Kliwon',
      Saptawara: 'Anggara',
      Dasawara: 'Pati',
      Wuku: 'Kulantir (urip 6)',
      Ingkel: 'Manuk',
      Lintang: 'Depat',
      Pancasuda: 'Sumur Sinaba',
      'Eka Jala Rsi': 'Manggih Suka',
      'Pratithi Samut Pada': 'Awidya',
      Sasih: 'Kanem',
      'Hari sasih': 'Purnama (penanggal 15)',
      'Tahun Çaka': '1948',
    });
    expect(Object.keys(peta)).toHaveLength(24);
  });

  it('ekawara kosong ditulis "—"', () => {
    const w = warigaHari(H(2026, 11, 9));
    expect(w[0].baris[0]).toEqual({ label: 'Ekawara', nilai: '—' });
  });
});
