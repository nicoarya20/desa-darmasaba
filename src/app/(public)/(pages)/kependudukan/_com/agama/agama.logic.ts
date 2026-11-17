import { isPathHidden } from '@/app/(public)/_com/menu-visibility.logic';
import { compareStatValueDesc, parseJumlah, type StatBarItem } from '@/app/(public)/_com/stat-bars/stat-bars.logic';

/**
 * Href submenu "Distribusi Agama" di navbar = kunci visibilitas admin. URL lama ini tetap dipakai sebagai menuKey
 * walau halamannya kini redirect ke `/kependudukan/dashboard#agama`.
 */
export const AGAMA_MENU_KEY = '/kependudukan/distribusi-agama';

/** True bila admin menyembunyikan submenu Distribusi Agama (atau induknya): section + pil Agama tidak dirender. */
export function isAgamaHidden(hiddenHrefs: readonly string[]): boolean {
  return isPathHidden(AGAMA_MENU_KEY, hiddenHrefs);
}

/** Kode "lain-lain" yang selalu ditaruh paling akhir, berapa pun jumlahnya. */
const KODE_LAINNYA = 'LAINNYA';

/** Label baku untuk kode agama dari form admin (`DistribusiAgama.agama`, teks bebas berisi kode kapital). */
const AGAMA_LABEL: Readonly<Record<string, string>> = {
  HINDU: 'Hindu',
  ISLAM: 'Islam',
  KRISTEN: 'Kristen',
  KRISTEN_PROTESTAN: 'Kristen Protestan',
  KRISTEN_KATOLIK: 'Kristen Katolik',
  BUDDHA: 'Buddha',
  KONGHUCU: 'Konghucu',
  LAINNYA: 'Lainnya',
};

/** Satu baris agama yang sudah tervalidasi untuk satu tahun. */
export type AgamaRow = {
  id: string;
  kode: string;
  label: string;
  jumlah: number;
  tahun: number;
  updatedAt: string | Date | null;
};

/** Kode baku: rapikan spasi/tanda hubung jadi `_`, kapital. `"kristen katolik"` → `KRISTEN_KATOLIK`. */
export function agamaKode(raw: string): string {
  return raw.trim().replace(/[\s-]+/g, '_').toUpperCase();
}

/** Label manusiawi; kode tak dikenal → title-case (`SUNDA_WIWITAN` → "Sunda Wiwitan"). */
export function agamaLabel(raw: string): string {
  const kode = agamaKode(raw);
  return AGAMA_LABEL[kode] ?? kode.toLowerCase().split('_').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/**
 * Baris mentah API `distribusiagama/find-many` → `AgamaRow[]`. Dibuang: bukan objek, agama kosong,
 * jumlah bukan bilangan bulat ≥ 0, tahun tak terbaca. Baris ganda (agama sama, tahun sama) tidak digabung.
 */
export function parseAgamaRows(rows: readonly unknown[]): AgamaRow[] {
  return rows.flatMap((raw, index) => {
    if (!isRecord(raw) || typeof raw.agama !== 'string' || raw.agama.trim() === '') return [];
    const jumlah = parseJumlah(raw.jumlah);
    const tahun = Number(raw.tahun);
    if (jumlah === null || !Number.isInteger(tahun)) return [];
    const kode = agamaKode(raw.agama);
    const updatedAt = typeof raw.updatedAt === 'string' || raw.updatedAt instanceof Date ? raw.updatedAt : null;
    const id = typeof raw.id === 'string' && raw.id ? raw.id : `${kode}-${tahun}-${index}`;
    return [{ id, kode, label: agamaLabel(raw.agama), jumlah, tahun, updatedAt }];
  });
}

/** Item stat-bars + kode agama (untuk urutan "Lainnya" di akhir). */
export type AgamaStatItem = StatBarItem & { kode: string };

/** `AgamaRow[]` → item panel stat-bars. */
export function toAgamaStatItems(rows: readonly AgamaRow[]): AgamaStatItem[] {
  return rows.map((r) => ({ id: r.id, kode: r.kode, label: r.label, value: r.jumlah, updatedAt: r.updatedAt }));
}

/** Urut jumlah terbanyak dulu; "Lainnya" selalu terakhir. */
export function compareAgama(a: AgamaStatItem, b: AgamaStatItem): number {
  const la = a.kode === KODE_LAINNYA;
  const lb = b.kode === KODE_LAINNYA;
  if (la !== lb) return la ? 1 : -1;
  return compareStatValueDesc(a, b);
}

/**
 * Persen porsi dengan angka asli (keputusan user, bukan "< 0,1%"): ≥ 0,1% satu desimal ("91,3%");
 * di bawah 0,1% satu angka penting ("0,05%") agar porsi kecil tidak tertulis 0%.
 */
export function formatAgamaShare(share: number): string {
  const small = share > 0 && share < 0.1;
  const nf = new Intl.NumberFormat('id-ID', small ? { maximumSignificantDigits: 1 } : { maximumFractionDigits: 1 });
  return `${nf.format(share)}%`;
}
