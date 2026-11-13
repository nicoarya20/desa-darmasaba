// @vitest-environment node
// Logika murni kalender Agenda Desa (halaman publik): hari WITA, kisi bulan, lajur pita multi-hari,
// pengelompokan per hari, saring kategori, dan hitung mundur.
import { describe, expect, it } from 'vitest';
import {
  acaraDalamBulan,
  acaraPadaHari,
  bulanDariHari,
  formatHari,
  geserBulan,
  hariDariTanggal,
  hariWita,
  hitungMundur,
  judulBulan,
  kategoriPerHari,
  kategoriTersedia,
  kelompokPerHari,
  mingguBulan,
  saringKategori,
  susunMinggu,
  batasBulan,
  teksTanggalAcara,
  tersembunyiPerHari,
  type AgendaItem,
} from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/kalender.logic';
import { toAgendaItem } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda.source';
import { tingkatBulan } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda-tahun';

// test-only: acara minimal.
const acara = (id: string, tanggal: string, extra: Partial<AgendaItem> = {}): AgendaItem => ({
  id,
  nama: `Acara ${id}`,
  tanggal,
  tanggalSelesai: null,
  kategori: 'BUDAYA',
  lokasi: 'Balai Desa',
  deskripsi: null,
  ...extra,
});

const hari = (iso: string) => hariDariTanggal(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), Number(iso.slice(8, 10)));
const NOW = new Date('2026-11-12T02:00:00.000Z'); // Kamis 12 Nov 2026 10:00 WITA

describe('hariWita (zona Asia/Makassar)', () => {
  it('mengelompokkan menurut tanggal WITA, bukan UTC', () => {
    // 10 Jun 19:00 UTC = 11 Jun 03:00 WITA
    expect(hariWita('2026-06-10T19:00:00.000Z')).toBe(hari('2026-06-11'));
    // 18 Mar 15:00 UTC = 18 Mar 23:00 WITA (tetap 18)
    expect(hariWita('2026-03-18T15:00:00.000Z')).toBe(hari('2026-03-18'));
    // 18 Mar 16:00 UTC = 19 Mar 00:00 WITA
    expect(hariWita('2026-03-18T16:00:00.000Z')).toBe(hari('2026-03-19'));
  });

  it('formatHari menulis nama hari Indonesia', () => {
    expect(formatHari(hari('2026-11-20'))).toBe('Jumat, 20 November 2026');
    expect(formatHari(hariWita(NOW))).toBe('Kamis, 12 November 2026');
  });
});

describe('navigasi & kisi bulan', () => {
  it('geserBulan melintasi tahun ke dua arah', () => {
    expect(geserBulan({ tahun: 2026, bulan: 12 }, 1)).toEqual({ tahun: 2027, bulan: 1 });
    expect(geserBulan({ tahun: 2026, bulan: 1 }, -1)).toEqual({ tahun: 2025, bulan: 12 });
    expect(geserBulan({ tahun: 2026, bulan: 11 }, -14)).toEqual({ tahun: 2025, bulan: 9 });
    expect(judulBulan({ tahun: 2026, bulan: 11 })).toBe('November 2026');
    expect(bulanDariHari(hariWita(NOW))).toEqual({ tahun: 2026, bulan: 11 });
  });

  it('mingguBulan dimulai hari Minggu dan memuat seluruh bulan', () => {
    const minggu = mingguBulan({ tahun: 2026, bulan: 11 }); // 1 Nov 2026 = Minggu
    expect(minggu[0][0]).toBe(hari('2026-11-01'));
    expect(minggu).toHaveLength(5);
    expect(minggu.every((w) => w.length === 7)).toBe(true);
    const feb = mingguBulan({ tahun: 2026, bulan: 2 }); // 1 Feb 2026 = Minggu, 28 hari
    expect(feb).toHaveLength(4);
    const agu = mingguBulan({ tahun: 2026, bulan: 8 }); // 1 Agu 2026 = Sabtu → 6 minggu
    expect(agu).toHaveLength(6);
    expect(agu[0][0]).toBe(hari('2026-07-26'));
    expect(agu[5][6]).toBe(hari('2026-09-05'));
  });
});

describe('acara per bulan / hari', () => {
  const multi = acara('m', '2026-10-30T00:00:00.000Z', { tanggalSelesai: '2026-11-02T00:00:00.000Z' });
  const items = [acara('b', '2026-11-20T06:00:00.000Z'), multi, acara('a', '2026-11-20T01:00:00.000Z')];

  it('acara multi-hari yang melintasi bulan muncul di kedua bulan', () => {
    expect(acaraDalamBulan(items, { tahun: 2026, bulan: 10 }).map((i) => i.id)).toEqual(['m']);
    expect(acaraDalamBulan(items, { tahun: 2026, bulan: 11 }).map((i) => i.id)).toEqual(['m', 'a', 'b']);
    expect(acaraPadaHari(items, hari('2026-11-02')).map((i) => i.id)).toEqual(['m']);
    expect(acaraPadaHari(items, hari('2026-11-03'))).toEqual([]);
  });

  it('kelompokPerHari mencantumkan acara multi-hari sekali, di hari pertamanya dalam bulan', () => {
    const nov = kelompokPerHari(items, { tahun: 2026, bulan: 11 });
    expect(nov.map((g) => g.hari)).toEqual([hari('2026-11-01'), hari('2026-11-20')]);
    expect(nov[0].items.map((i) => i.id)).toEqual(['m']);
    expect(nov[1].items.map((i) => i.id)).toEqual(['a', 'b']); // urut jam tersimpan
  });

  it('kategoriPerHari: kategori unik per hari, multi-hari mengisi tiap hari', () => {
    const peta = kategoriPerHari(
      [...items, acara('p', '2026-11-20T00:00:00.000Z', { kategori: 'PEMERINTAHAN' }), acara('x', '2026-11-01T00:00:00.000Z', { kategori: 'ASING' })],
      { tahun: 2026, bulan: 11 },
    );
    expect(peta.get(hari('2026-11-01'))).toEqual(['BUDAYA', 'LAINNYA']);
    expect(peta.get(hari('2026-11-02'))).toEqual(['BUDAYA']);
    expect(peta.get(hari('2026-11-20'))).toEqual(['BUDAYA', 'PEMERINTAHAN']);
    expect(peta.has(hari('2026-10-31'))).toBe(false); // di luar bulan
  });
});

describe('susunMinggu (lajur pita ala Outlook)', () => {
  const nov = { tahun: 2026, bulan: 11 };
  const batas = batasBulan(nov);
  const [minggu1, minggu2] = mingguBulan(nov); // 1–7 Nov, 8–14 Nov

  it('acara multi-hari jadi satu pita melintang; acara lain di lajur kosong terendah', () => {
    const pita = acara('pita', '2026-11-02T00:00:00.000Z', { tanggalSelesai: '2026-11-04T00:00:00.000Z' });
    const s1 = acara('s1', '2026-11-03T00:00:00.000Z');
    const s2 = acara('s2', '2026-11-05T00:00:00.000Z');
    const seg = susunMinggu(minggu1, [s1, s2, pita], batas);
    expect(seg.find((g) => g.item.id === 'pita')).toMatchObject({ kolom: 1, panjang: 3, lajur: 0 });
    expect(seg.find((g) => g.item.id === 's1')).toMatchObject({ kolom: 2, panjang: 1, lajur: 1 });
    expect(seg.find((g) => g.item.id === 's2')).toMatchObject({ kolom: 4, lajur: 0 });
  });

  it('pita yang melewati akhir minggu terpotong dan ditandai berlanjut', () => {
    const pita = acara('p', '2026-11-06T00:00:00.000Z', { tanggalSelesai: '2026-11-09T00:00:00.000Z' });
    const [a] = susunMinggu(minggu1, [pita], batas);
    const [b] = susunMinggu(minggu2, [pita], batas);
    expect(a).toMatchObject({ kolom: 5, panjang: 2, lanjutKiri: false, lanjutKanan: true });
    expect(b).toMatchObject({ kolom: 0, panjang: 2, lanjutKiri: true, lanjutKanan: false });
  });

  it('hari bulan tetangga dibiarkan kosong; acara dari bulan lalu terpotong di tanggal 1', () => {
    const okt = { tahun: 2026, bulan: 10 };
    const pita = acara('p', '2026-10-30T00:00:00.000Z', { tanggalSelesai: '2026-11-02T00:00:00.000Z' });
    const [seg] = susunMinggu(minggu1, [pita], batas);
    expect(seg).toMatchObject({ kolom: 0, panjang: 2, lanjutKiri: true });
    const mingguTerakhirOkt = mingguBulan(okt).at(-1)!; // 25–31 Okt
    const [segOkt] = susunMinggu(mingguTerakhirOkt, [pita], batasBulan(okt));
    expect(segOkt).toMatchObject({ kolom: 5, panjang: 2, lanjutKanan: true });
  });

  it('tersembunyiPerHari menghitung acara di lajur melebihi batas', () => {
    const banyak = ['a', 'b', 'c', 'd', 'e'].map((id) => acara(id, '2026-11-03T00:00:00.000Z'));
    const seg = susunMinggu(minggu1, banyak, batas);
    expect(seg.map((g) => g.lajur)).toEqual([0, 1, 2, 3, 4]);
    expect(tersembunyiPerHari(seg, 3)).toEqual([0, 0, 2, 0, 0, 0, 0]);
  });
});

describe('kategori', () => {
  const items = [
    acara('1', '2026-01-01T00:00:00Z', { kategori: 'MUSYAWARAH' }),
    acara('2', '2026-01-02T00:00:00Z'),
    acara('3', '2026-01-03T00:00:00Z'),
  ];
  it('kategoriTersedia hanya kategori yang punya acara, urutan baku', () => {
    expect(kategoriTersedia(items)).toEqual([
      { kategori: 'BUDAYA', jumlah: 2 },
      { kategori: 'MUSYAWARAH', jumlah: 1 },
    ]);
  });
  it('saringKategori membuang kategori tersembunyi', () => {
    expect(saringKategori(items, ['BUDAYA']).map((i) => i.id)).toEqual(['1']);
    expect(saringKategori(items, [])).toHaveLength(3);
  });
});

describe('hitungMundur (dari Kamis 12 Nov 2026 WITA)', () => {
  const pada = (iso: string, selesai: string | null = null) => hitungMundur({ tanggal: iso, tanggalSelesai: selesai }, NOW);

  it('hari ini, besok, lusa', () => {
    expect(pada('2026-11-12T00:00:00Z')).toMatchObject({ teks: 'Hari ini', nada: 'berlangsung' });
    expect(pada('2026-11-12T20:00:00Z')).toMatchObject({ teks: 'Besok', nada: 'segera' }); // 13 Nov 04:00 WITA
    expect(pada('2026-11-14T06:00:00Z')).toMatchObject({ teks: 'Lusa', nada: 'segera' });
  });

  it('hari → minggu → bulan', () => {
    expect(pada('2026-11-15T06:00:00Z')).toMatchObject({ teks: '3 hari lagi', utama: '3', keterangan: 'hari lagi', nada: 'segera' });
    expect(pada('2026-11-20T06:00:00Z')).toMatchObject({ teks: '8 hari lagi', nada: 'nanti' });
    expect(pada('2026-11-25T06:00:00Z')).toMatchObject({ teks: '13 hari lagi' });
    expect(pada('2026-11-26T06:00:00Z')).toMatchObject({ teks: '2 minggu lagi' });
    expect(pada('2027-01-10T06:00:00Z')).toMatchObject({ teks: '8 minggu lagi' }); // 59 hari
    expect(pada('2027-01-11T06:00:00Z')).toMatchObject({ teks: '2 bulan lagi' }); // 60 hari
  });

  it('acara beberapa hari yang sedang berlangsung dan acara yang sudah lewat', () => {
    expect(pada('2026-11-11T00:00:00Z', '2026-11-13T00:00:00Z')).toMatchObject({
      teks: 'Berlangsung · hari ke-2 dari 3',
      nada: 'berlangsung',
    });
    expect(pada('2026-11-11T00:00:00Z')).toMatchObject({ teks: 'Sudah lewat', nada: 'selesai' });
  });
});

describe('teks tanggal & normalisasi data', () => {
  it('teksTanggalAcara: satu hari dengan nama hari, beberapa hari dengan rentang + jumlah hari', () => {
    expect(teksTanggalAcara({ tanggal: '2026-11-20T06:00:00Z', tanggalSelesai: null })).toBe('Jumat, 20 November 2026');
    expect(teksTanggalAcara({ tanggal: '2026-11-20T06:00:00Z', tanggalSelesai: '2026-11-22T06:00:00Z' })).toBe(
      '20–22 November 2026 (3 hari)',
    );
  });

  it('toAgendaItem menormalkan Date, deskripsi kosong, dan kategori null', () => {
    const item = toAgendaItem({
      id: 'x',
      nama: 'X',
      tanggal: new Date('2026-11-20T06:00:00Z'),
      tanggalSelesai: null,
      kategori: null,
      lokasi: null,
      deskripsi: '  ',
    });
    expect(item).toEqual({
      id: 'x',
      nama: 'X',
      tanggal: '2026-11-20T06:00:00.000Z',
      tanggalSelesai: null,
      kategori: 'LAINNYA',
      lokasi: '',
      deskripsi: null,
    });
  });

  it('tingkatBulan memberi 4 tingkat warna ringkasan tahun', () => {
    expect([0, 1, 2, 3, 4, 9].map(tingkatBulan)).toEqual([0, 1, 2, 2, 3, 3]);
  });
});
