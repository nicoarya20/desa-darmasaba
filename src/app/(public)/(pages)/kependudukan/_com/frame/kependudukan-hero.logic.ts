import { formatJumlah } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { formatSelisih } from '@/lib/dinamika-penduduk';
import { banjarTotals, formatJiwaPerKk, parseBanjarRows } from '../banjar/banjar.logic';
import type { DatasetSlice } from '../data/kependudukan-data.types';
import { dinamikaNeraca, parseDinamikaRows } from '../dinamika/dinamika.logic';
import { KEPENDUDUKAN_TEXT } from './kependudukan.text';

const T = KEPENDUDUKAN_TEXT.hero;

/** Satu kartu ringkasan. `value` hanya ada bila `status` ready; kosong/galat ditulis dengan kalimat, bukan 0. */
export type HeroCard = {
  key: 'penduduk' | 'kk' | 'jiwaPerKk' | 'pertumbuhan';
  label: string;
  status: 'loading' | 'error' | 'empty' | 'ready';
  value?: string;
  unit?: string;
  note?: string;
};

type Filled = { value: string; unit: string; note: string };

function card(key: HeroCard['key'], label: string, slice: DatasetSlice, filled: Filled | null): HeroCard {
  if (slice.status !== 'ready') return { key, label, status: slice.status };
  return filled ? { key, label, status: 'ready', ...filled } : { key, label, status: 'empty' };
}

/**
 * Empat kartu hero: total penduduk, KK, jiwa per KK (tahun terbaru Data per Banjar) dan pertumbuhan bersih
 * (tahun terbaru Dinamika). Tiap kartu menulis tahunnya sendiri karena kedua dataset bisa berbeda tahun.
 */
export function heroCards(banjar: DatasetSlice, dinamika: DatasetSlice): HeroCard[] {
  const rows = parseBanjarRows(banjar.rows);
  const totals = banjarTotals(rows);
  const tahunBanjar = banjar.tahun;
  const latest = parseDinamikaRows(dinamika.rows)[0] ?? null;

  const penduduk = totals.penduduk !== null && tahunBanjar !== null
    ? { value: formatJumlah(totals.penduduk), unit: T.unitJiwa, note: T.banjar(rows.length, tahunBanjar) }
    : null;
  const kk = totals.kk !== null && tahunBanjar !== null
    ? { value: formatJumlah(totals.kk), unit: T.unitKk, note: T.data(tahunBanjar) }
    : null;
  const jiwaPerKk = totals.jiwaPerKk !== null && tahunBanjar !== null
    ? { value: formatJiwaPerKk(totals.jiwaPerKk), unit: T.unitJiwa, note: T.jiwaPerKkNote(tahunBanjar) }
    : null;
  const pertumbuhan = latest
    ? { value: formatSelisih(dinamikaNeraca(latest).bersih), unit: T.unitJiwa, note: T.pertumbuhanNote(latest.tahun) }
    : null;

  return [
    card('penduduk', T.penduduk, banjar, penduduk),
    card('kk', T.kk, banjar, kk),
    card('jiwaPerKk', T.jiwaPerKk, banjar, jiwaPerKk),
    card('pertumbuhan', T.pertumbuhan, dinamika, pertumbuhan),
  ];
}
