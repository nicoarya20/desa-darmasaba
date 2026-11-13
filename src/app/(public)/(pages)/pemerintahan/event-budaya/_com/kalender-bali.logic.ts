// Logika murni kalender Bali di halaman Agenda: tanggal Saka & pawukon per hari (WITA), rerainan dengan
// tingkatnya, aturan "agenda admin menang", dan rerainan berikutnya. Hitungan dari balinese-date-js-lib.
import { BalineseDate, BalineseDateUtil } from 'balinese-date-js-lib';
import {
  EJAAN_BALI,
  KATA_PEMBUKA_RERAINAN,
  RERAINAN_CARI_HARI,
  RERAINAN_RUTIN_PUSTAKA,
  RERAINAN_TAMBAHAN,
  type AturanRerainan,
} from './kalender-bali.meta';
import { acaraPadaHari, batasBulan, mingguBulan, tanggalDariHari, type AgendaItem, type BulanKe } from './kalender.logic';

export type TingkatRerainan = 'besar' | 'rutin';
export type FaseBulan = 'purnama' | 'tilem';

/** Satu rerainan pada satu hari. `kunci` = nama-nama yang dicocokkan dengan nama agenda admin. */
export type Rerainan = { nama: string; tingkat: TingkatRerainan; bulan: FaseBulan | null; kunci: string[] };

/** Ringkasan Bali satu hari: pawukon, sasih, dan rerainan (belum disaring agenda admin). */
export type HariBali = {
  hari: number;
  wuku: string;
  uripWuku: number;
  saptaWara: string;
  pancaWara: string;
  sasih: string;
  saka: number;
  /** Penanggal (paruh terang), pangelong (paruh gelap), atau puncaknya: purnama / tilem. */
  fase: 'penanggal' | 'pangelong' | FaseBulan;
  /** Hari ke- dalam paruh sasih; dua angka bila ngunaratri (dua tithi jatuh di satu hari). */
  tanggalSasih: number[];
  rerainan: Rerainan[];
};

/**
 * Objek Date untuk pustaka, dibangun dari komponen tanggal kalender WITA (`new Date(y, m, d)` waktu
 * lokal), bukan dari instan mentah — pustaka membaca tanggal lokal, jadi hasilnya tetap hari WITA yang
 * benar di zona waktu peramban mana pun.
 */
export function dateUntukPustaka(hari: number): Date {
  const { tahun, bulan, tanggal } = tanggalDariHari(hari);
  return new Date(tahun, bulan - 1, tanggal);
}

const bataskan = (teks: string) => teks.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Ganti kata/frasa utuh dalam satu lintasan (frasa terpanjang dulu) agar hasil ganti tidak diganti lagi. */
function gantiFrasa(teks: string, pasangan: ReadonlyMap<string, string>): string {
  if (pasangan.size === 0) return teks;
  const pola = [...pasangan.keys()].sort((a, b) => b.length - a.length).map(bataskan).join('|');
  return teks.replace(new RegExp(`\\b(${pola})\\b`, 'gi'), (m) => pasangan.get(m.toLowerCase()) ?? m);
}

const KE_TAMPIL = new Map(EJAAN_BALI.filter((e) => e.pustaka !== e.tampil).map((e) => [e.pustaka.toLowerCase(), e.tampil]));
const KE_BAKU = new Map(
  EJAAN_BALI.flatMap((e) => [e.pustaka, ...e.varian].map((dari) => [dari.toLowerCase(), e.tampil.toLowerCase()] as const)),
);

/** Ejaan tampilan untuk nama dari pustaka (mis. "Pager Wesi" → "Pagerwesi", "Nampih Destha" → "Mala Jiyestha"). */
export const ejaanTampil = (nama: string): string => gantiFrasa(nama, KE_TAMPIL);

/**
 * Nama baku untuk dibandingkan: huruf kecil, tanpa "hari raya"/"rahina"/"hari", dan semua varian ejaan
 * (Pager Wesi, Keliwon, Kesanga, …) disamakan ke ejaan tampil.
 */
export function normalisasiNama(nama: string): string {
  let teks = ` ${nama
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')} `;
  for (const kata of KATA_PEMBUKA_RERAINAN) teks = teks.replaceAll(` ${kata} `, ' ');
  return gantiFrasa(teks, KE_BAKU).replace(/\s+/g, ' ').trim();
}

const cocokAturan = (a: AturanRerainan, bd: BalineseDate) =>
  bd.saptaWara.name === a.saptaWara &&
  bd.pancaWara.name === a.pancaWara &&
  (a.wuku === undefined || bd.wuku.name === a.wuku) &&
  !a.kecualiWuku?.includes(bd.wuku.name);

function rerainanHari(bd: BalineseDate, sasih: string): Rerainan[] {
  const dariPustaka = BalineseDateUtil.getRahinan(bd).map((r): Rerainan => {
    const bulan = r.name === 'Purnama' ? 'purnama' : r.name === 'Tilem' ? 'tilem' : null;
    const nama = bulan ? `${r.name} ${sasih}` : ejaanTampil(r.name);
    const tingkat = RERAINAN_RUTIN_PUSTAKA.includes(r.name) ? 'rutin' : 'besar';
    return { nama, tingkat, bulan, kunci: bulan ? [nama, r.name] : [nama] };
  });
  const tambahan = RERAINAN_TAMBAHAN.filter((a) => cocokAturan(a, bd)).map((a): Rerainan => {
    const nama = a.nama.replace('{wuku}', bd.wuku.name);
    return { nama, tingkat: a.tingkat ?? 'rutin', bulan: null, kunci: [nama] };
  });
  return urutkanRerainan([...dariPustaka, ...tambahan]);
}

/** Urutan tampil: hari raya besar, lalu purnama/tilem, lalu rerainan rutin lainnya (stabil). */
export function urutkanRerainan(list: readonly Rerainan[]): Rerainan[] {
  const bobot = (r: Rerainan) => (r.tingkat === 'besar' ? 0 : r.bulan ? 1 : 2);
  return [...list].sort((a, b) => bobot(a) - bobot(b));
}

/** Ringkasan Bali satu hari kalender (nomor hari WITA). */
export function hariBali(hari: number): HariBali {
  const bd = new BalineseDate(dateUntukPustaka(hari));
  const sasih = ejaanTampil(bd.sasih.name);
  const info = bd.sasihDayInfo.name.toLowerCase() as HariBali['fase'];
  return {
    hari,
    wuku: bd.wuku.name,
    uripWuku: bd.wuku.urip,
    saptaWara: bd.saptaWara.name,
    pancaWara: bd.pancaWara.name,
    sasih,
    saka: bd.saka,
    fase: info,
    tanggalSasih: [...bd.sasihDay],
    rerainan: rerainanHari(bd, sasih),
  };
}

export const faseBulan = (h: HariBali): FaseBulan | null => (h.fase === 'purnama' || h.fase === 'tilem' ? h.fase : null);

/** "Wraspati Pon". */
export const namaHariBali = (h: Pick<HariBali, 'saptaWara' | 'pancaWara'>) => `${h.saptaWara} ${h.pancaWara}`;

/** "Penanggal 3", "Pangelong 14/15", "Purnama", "Tilem". */
export function teksTanggalSasih(h: Pick<HariBali, 'fase' | 'tanggalSasih'>): string {
  if (h.fase === 'purnama') return 'Purnama';
  if (h.fase === 'tilem') return 'Tilem';
  return `${h.fase === 'penanggal' ? 'Penanggal' : 'Pangelong'} ${h.tanggalSasih.join('/')}`;
}

/** Semua hari di kisi bulan (termasuk tepi bulan tetangga) → ringkasan Bali. Dihitung sekali per bulan tampil. */
export function baliBulan(b: BulanKe): Map<number, HariBali> {
  return new Map(mingguBulan(b).flat().map((hari) => [hari, hariBali(hari)]));
}

/** Sasih & tahun Çaka yang dilalui bulan Masehi ini, mis. "Sasih Kalima – Kanem · Çaka 1948". */
export function judulSasih(peta: ReadonlyMap<number, HariBali>, batas: { awal: number; akhir: number }): string {
  const sasih: string[] = [];
  const saka: number[] = [];
  for (let h = batas.awal; h <= batas.akhir; h++) {
    const info = peta.get(h) ?? hariBali(h);
    if (sasih.at(-1) !== info.sasih) sasih.push(info.sasih);
    if (saka.at(-1) !== info.saka) saka.push(info.saka);
  }
  return `Sasih ${sasih.join(' – ')} · Çaka ${saka.join('–')}`;
}

/** Agenda admin menang: rerainan disembunyikan bila ada agenda di hari itu yang namanya memuat nama rerainan. */
export function saringRerainan(rerainan: readonly Rerainan[], agendaHariItu: readonly Pick<AgendaItem, 'nama'>[]): Rerainan[] {
  if (agendaHariItu.length === 0) return [...rerainan];
  const agenda = agendaHariItu.map((a) => ` ${normalisasiNama(a.nama)} `);
  return rerainan.filter((r) => !r.kunci.some((k) => agenda.some((a) => a.includes(` ${normalisasiNama(k)} `))));
}

/** Lapisan Bali bulan tampil: ringkasan tiap hari kisi + rerainan (sudah disaring agenda) per hari dalam bulan. */
export type BaliBulan = {
  hari: ReadonlyMap<number, HariBali>;
  /** Kosong bila legenda "Rerainan Bali" dimatikan. */
  rerainan: ReadonlyMap<number, Rerainan[]>;
};

export function lapisanBali(
  peta: ReadonlyMap<number, HariBali>,
  b: BulanKe,
  agenda: readonly AgendaItem[],
  tampilRerainan: boolean,
): BaliBulan {
  const rerainan = new Map<number, Rerainan[]>();
  if (tampilRerainan) {
    const { awal, akhir } = batasBulan(b);
    for (let h = awal; h <= akhir; h++) {
      const list = saringRerainan(peta.get(h)?.rerainan ?? [], acaraPadaHari(agenda, h));
      if (list.length > 0) rerainan.set(h, list);
    }
  }
  return { hari: peta, rerainan };
}

/** Hari untuk daftar ponsel: hari berisi acara (kelompok dari kalender.logic) ∪ hari berisi rerainan, urut naik. */
export function gabungDaftarHari(
  kelompok: readonly { hari: number; items: AgendaItem[] }[],
  rerainan: ReadonlyMap<number, Rerainan[]>,
): { hari: number; items: AgendaItem[]; rerainan: Rerainan[] }[] {
  const peta = new Map(kelompok.map((k) => [k.hari, k.items]));
  const hari = [...new Set([...peta.keys(), ...rerainan.keys()])].sort((a, b) => a - b);
  return hari.map((h) => ({ hari: h, items: peta.get(h) ?? [], rerainan: rerainan.get(h) ?? [] }));
}

/** Hari raya besar terdekat setelah `hariIni` (dalam jangkauan pencarian), untuk kartu "Hari ini". */
export function rerainanBerikutnya(hariIni: number): { hari: number; selisih: number; nama: string } | null {
  for (let h = hariIni + 1; h <= hariIni + RERAINAN_CARI_HARI; h++) {
    const besar = hariBali(h).rerainan.filter((r) => r.tingkat === 'besar');
    if (besar.length > 0) return { hari: h, selisih: h - hariIni, nama: besar.map((r) => r.nama).join(' & ') };
  }
  return null;
}

/** "besok", "3 hari lagi". */
export const teksSelisihHari = (n: number) => (n === 1 ? 'besok' : `${n} hari lagi`);
