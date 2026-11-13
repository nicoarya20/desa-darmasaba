// Logika murni kalender Agenda Desa: hari kalender WITA, kisi bulan, susunan lajur acara per minggu,
// pengelompokan per hari, dan hitung mundur. Tanpa I/O; `now` selalu dioper agar deterministik.
import { isKategoriEvent, KATEGORI_EVENT, type KategoriEvent } from '@/lib/agenda-desa';
import { AGENDA_TIME_ZONE, formatRentangTanggal, NAMA_BULAN } from '@/lib/agenda-desa-waktu';

/** Satu acara seperti dipakai halaman publik (tanggal sebagai string ISO dari API). */
export type AgendaItem = {
  id: string;
  nama: string;
  tanggal: string;
  tanggalSelesai: string | null;
  kategori: string;
  lokasi: string;
  deskripsi: string | null;
};

/** Bulan kalender; `bulan` 1–12. */
export type BulanKe = { tahun: number; bulan: number };

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const HARI_PER_MINGGU = 7;
const HARI_PER_MINGGU_TAMPIL = 14; // ≤ 13 hari lagi → ditulis dalam hari
const HARI_PER_BULAN_KIRA = 30;
const BATAS_HITUNG_MINGGU = 60; // 14–59 hari → minggu; ≥ 60 → bulan
const SINGKATAN = 3;

/** Nama hari, indeks 0 = Minggu (kalender dinding Indonesia dimulai hari Minggu). */
export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

export const singkat = (nama: string) => nama.slice(0, SINGKATAN);

const tanggalWita = new Intl.DateTimeFormat('en-US', {
  timeZone: AGENDA_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

/**
 * Nomor hari kalender (hari sejak 1 Jan 1970) dari sebuah instan, menurut tanggal di WITA.
 * Mis. 2026-06-10T19:00Z = 11 Juni 03:00 WITA → hari 11 Juni, bukan 10 Juni.
 */
export function hariWita(value: Date | string): number {
  const parts = tanggalWita.formatToParts(new Date(value));
  const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return Date.UTC(pick('year'), pick('month') - 1, pick('day')) / MS_PER_DAY;
}

/** Nomor hari kalender untuk tanggal sipil (bulan 1–12). */
export function hariDariTanggal(tahun: number, bulan: number, tanggal: number): number {
  return Date.UTC(tahun, bulan - 1, tanggal) / MS_PER_DAY;
}

/** Komponen tanggal dari nomor hari; `hariMinggu` 0 = Minggu. */
export function tanggalDariHari(hari: number) {
  const d = new Date(hari * MS_PER_DAY);
  return { tahun: d.getUTCFullYear(), bulan: d.getUTCMonth() + 1, tanggal: d.getUTCDate(), hariMinggu: d.getUTCDay() };
}

export function bulanDariHari(hari: number): BulanKe {
  const { tahun, bulan } = tanggalDariHari(hari);
  return { tahun, bulan };
}

/** Geser bulan sejauh `delta` (boleh negatif, melintasi tahun). */
export function geserBulan({ tahun, bulan }: BulanKe, delta: number): BulanKe {
  const indeks = tahun * 12 + (bulan - 1) + delta;
  return { tahun: Math.floor(indeks / 12), bulan: (((indeks % 12) + 12) % 12) + 1 };
}

export const samaBulan = (a: BulanKe, b: BulanKe) => a.tahun === b.tahun && a.bulan === b.bulan;

export const judulBulan = ({ tahun, bulan }: BulanKe) => `${NAMA_BULAN[bulan - 1]} ${tahun}`;

/** Hari pertama & terakhir bulan (nomor hari, inklusif). */
export function batasBulan({ tahun, bulan }: BulanKe): { awal: number; akhir: number } {
  const awal = hariDariTanggal(tahun, bulan, 1);
  const berikut = geserBulan({ tahun, bulan }, 1);
  return { awal, akhir: hariDariTanggal(berikut.tahun, berikut.bulan, 1) - 1 };
}

/** Kisi bulan: daftar minggu (Minggu–Sabtu) berisi 7 nomor hari, termasuk hari bulan tetangga di tepi. */
export function mingguBulan(b: BulanKe): number[][] {
  const { awal, akhir } = batasBulan(b);
  const mulai = awal - tanggalDariHari(awal).hariMinggu;
  const minggu: number[][] = [];
  for (let s = mulai; s <= akhir; s += HARI_PER_MINGGU) {
    minggu.push(Array.from({ length: HARI_PER_MINGGU }, (_, i) => s + i));
  }
  return minggu;
}

/** Rentang hari acara (inklusif); tanggal selesai sebelum mulai dianggap satu hari. */
export function rentangHari(item: Pick<AgendaItem, 'tanggal' | 'tanggalSelesai'>): { mulai: number; selesai: number } {
  const mulai = hariWita(item.tanggal);
  const selesai = item.tanggalSelesai ? hariWita(item.tanggalSelesai) : mulai;
  return { mulai, selesai: Math.max(mulai, selesai) };
}

/** Urutan tampil: mulai lebih awal, lalu acara lebih panjang, lalu jam tersimpan, lalu nama. */
function bandingAcara(a: AgendaItem, b: AgendaItem): number {
  const ra = rentangHari(a);
  const rb = rentangHari(b);
  return (
    ra.mulai - rb.mulai ||
    rb.selesai - rb.mulai - (ra.selesai - ra.mulai) ||
    new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime() ||
    a.nama.localeCompare(b.nama, 'id')
  );
}

export const urutkanAcara = (items: readonly AgendaItem[]) => [...items].sort(bandingAcara);

/** Acara yang rentangnya menyentuh bulan `b`, terurut. */
export function acaraDalamBulan(items: readonly AgendaItem[], b: BulanKe): AgendaItem[] {
  const { awal, akhir } = batasBulan(b);
  return urutkanAcara(
    items.filter((it) => {
      const r = rentangHari(it);
      return r.mulai <= akhir && r.selesai >= awal;
    }),
  );
}

/** Acara yang berlangsung pada hari `hari`, terurut. */
export function acaraPadaHari(items: readonly AgendaItem[], hari: number): AgendaItem[] {
  return urutkanAcara(
    items.filter((it) => {
      const r = rentangHari(it);
      return r.mulai <= hari && r.selesai >= hari;
    }),
  );
}

/** Potongan satu acara di satu baris minggu kalender bulan. */
export type SegmenMinggu = {
  item: AgendaItem;
  /** Kolom awal 0–6 (0 = Minggu). */
  kolom: number;
  panjang: number;
  lajur: number;
  /** Acara sudah mulai sebelum potongan ini / berlanjut sesudahnya (tampil sebagai pita terpotong). */
  lanjutKiri: boolean;
  lanjutKanan: boolean;
};

/**
 * Susun acara satu minggu jadi potongan berlajur (pola tampilan bulan Outlook): acara beberapa hari
 * jadi pita melintang, tiap acara menempati lajur terendah yang kosong di semua kolomnya.
 * Hanya hari di dalam `batas` (bulan yang dibuka) yang diisi; hari bulan tetangga dibiarkan kosong.
 */
export function susunMinggu(
  minggu: readonly number[],
  items: readonly AgendaItem[],
  batas: { awal: number; akhir: number },
): SegmenMinggu[] {
  const dari = Math.max(minggu[0], batas.awal);
  const sampai = Math.min(minggu[minggu.length - 1], batas.akhir);
  if (dari > sampai) return [];

  const terisi: boolean[][] = [];
  const hasil: SegmenMinggu[] = [];
  for (const item of urutkanAcara(items)) {
    const r = rentangHari(item);
    if (r.selesai < dari || r.mulai > sampai) continue;
    const awal = Math.max(r.mulai, dari);
    const akhir = Math.min(r.selesai, sampai);
    const kolom = awal - minggu[0];
    const panjang = akhir - awal + 1;

    let lajur = 0;
    while (terisi[lajur]?.slice(kolom, kolom + panjang).some(Boolean)) lajur++;
    terisi[lajur] ??= Array(HARI_PER_MINGGU).fill(false);
    for (let k = kolom; k < kolom + panjang; k++) terisi[lajur][k] = true;

    hasil.push({ item, kolom, panjang, lajur, lanjutKiri: r.mulai < awal, lanjutKanan: r.selesai > akhir });
  }
  return hasil;
}

/** Jumlah potongan tersembunyi (lajur ≥ `maks`) per kolom hari — untuk tautan "+N lainnya". */
export function tersembunyiPerHari(segmen: readonly SegmenMinggu[], maks: number): number[] {
  const hasil = Array(HARI_PER_MINGGU).fill(0);
  for (const s of segmen) {
    if (s.lajur < maks) continue;
    for (let k = s.kolom; k < s.kolom + s.panjang; k++) hasil[k]++;
  }
  return hasil;
}

/**
 * Daftar acara bulan dikelompokkan per hari untuk tampilan daftar (ponsel). Acara beberapa hari hanya
 * dicantumkan sekali, di hari pertamanya dalam bulan ini (teks tanggalnya memuat rentang lengkap).
 */
export function kelompokPerHari(items: readonly AgendaItem[], b: BulanKe): { hari: number; items: AgendaItem[] }[] {
  const { awal } = batasBulan(b);
  const peta = new Map<number, AgendaItem[]>();
  for (const item of acaraDalamBulan(items, b)) {
    const hari = Math.max(rentangHari(item).mulai, awal);
    peta.set(hari, [...(peta.get(hari) ?? []), item]);
  }
  return [...peta.entries()].sort(([a], [b2]) => a - b2).map(([hari, list]) => ({ hari, items: list }));
}

/** Kategori acara per hari dalam bulan (unik, urutan kategori baku) — untuk titik di kalender ringkas. */
export function kategoriPerHari(items: readonly AgendaItem[], b: BulanKe): Map<number, KategoriEvent[]> {
  const { awal, akhir } = batasBulan(b);
  const peta = new Map<number, Set<KategoriEvent>>();
  for (const item of items) {
    const r = rentangHari(item);
    for (let h = Math.max(r.mulai, awal); h <= Math.min(r.selesai, akhir); h++) {
      const set = peta.get(h) ?? new Set<KategoriEvent>();
      set.add(kategoriBaku(item.kategori));
      peta.set(h, set);
    }
  }
  return new Map([...peta].map(([h, set]) => [h, KATEGORI_EVENT.filter((k) => set.has(k))]));
}

/** Kategori dikenal; nilai asing jatuh ke LAINNYA (sama dengan label & warna badge). */
export const kategoriBaku = (value: string): KategoriEvent => (isKategoriEvent(value) ? value : 'LAINNYA');

/** Kategori yang muncul di data beserta jumlahnya, urutan kategori baku. */
export function kategoriTersedia(items: readonly AgendaItem[]): { kategori: KategoriEvent; jumlah: number }[] {
  return KATEGORI_EVENT.map((kategori) => ({
    kategori,
    jumlah: items.filter((it) => kategoriBaku(it.kategori) === kategori).length,
  })).filter((k) => k.jumlah > 0);
}

/** Buang acara berkategori tersembunyi (legenda kategori dimatikan). */
export function saringKategori(items: readonly AgendaItem[], tersembunyi: readonly string[]): AgendaItem[] {
  if (tersembunyi.length === 0) return [...items];
  return items.filter((it) => !tersembunyi.includes(kategoriBaku(it.kategori)));
}

/** Nada hitung mundur: menentukan warna penanda. */
export type NadaHitung = 'berlangsung' | 'segera' | 'nanti' | 'selesai';

export type HitungMundur = {
  /** Satu kalimat, mis. "8 hari lagi", "Besok", "Berlangsung · hari ke-2 dari 3". */
  teks: string;
  /** Bagian besar & keterangan kecil untuk tampilan sorotan, mis. "8" + "hari lagi". */
  utama: string;
  keterangan: string;
  nada: NadaHitung;
};

const HARI_SEGERA = 6;

/** Hitung mundur acara terhadap hari ini (WITA), dalam bahasa sehari-hari warga. */
export function hitungMundur(item: Pick<AgendaItem, 'tanggal' | 'tanggalSelesai'>, now: Date): HitungMundur {
  const hariIni = hariWita(now);
  const { mulai, selesai } = rentangHari(item);
  const selisih = mulai - hariIni;

  if (selesai < hariIni) return { teks: 'Sudah lewat', utama: 'Selesai', keterangan: '', nada: 'selesai' };
  if (selisih <= 0) {
    if (mulai === selesai) return { teks: 'Hari ini', utama: 'Hari ini', keterangan: '', nada: 'berlangsung' };
    const ke = hariIni - mulai + 1;
    const total = selesai - mulai + 1;
    return {
      teks: `Berlangsung · hari ke-${ke} dari ${total}`,
      utama: `Hari ke-${ke}`,
      keterangan: `dari ${total} hari`,
      nada: 'berlangsung',
    };
  }
  if (selisih === 1) return { teks: 'Besok', utama: 'Besok', keterangan: '', nada: 'segera' };
  if (selisih === 2) return { teks: 'Lusa', utama: 'Lusa', keterangan: '', nada: 'segera' };

  const nada: NadaHitung = selisih <= HARI_SEGERA ? 'segera' : 'nanti';
  if (selisih < HARI_PER_MINGGU_TAMPIL) return angka(selisih, 'hari lagi', nada);
  if (selisih < BATAS_HITUNG_MINGGU) return angka(Math.floor(selisih / HARI_PER_MINGGU), 'minggu lagi', nada);
  return angka(Math.floor(selisih / HARI_PER_BULAN_KIRA), 'bulan lagi', nada);
}

const angka = (n: number, satuan: string, nada: NadaHitung): HitungMundur => ({
  teks: `${n} ${satuan}`,
  utama: String(n),
  keterangan: satuan,
  nada,
});

/** "Jumat, 20 November 2026". */
export function formatHari(hari: number): string {
  const { tahun, bulan, tanggal, hariMinggu } = tanggalDariHari(hari);
  return `${NAMA_HARI[hariMinggu]}, ${tanggal} ${NAMA_BULAN[bulan - 1]} ${tahun}`;
}

/** Tanggal lengkap acara: satu hari → dengan nama hari; beberapa hari → rentang + jumlah hari. */
export function teksTanggalAcara(item: Pick<AgendaItem, 'tanggal' | 'tanggalSelesai'>): string {
  const { mulai, selesai } = rentangHari(item);
  if (mulai === selesai) return formatHari(mulai);
  return `${formatRentangTanggal(item)} (${selesai - mulai + 1} hari)`;
}
