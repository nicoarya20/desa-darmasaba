/**
 * Utilitas tampilan satuan produk UMKM (PasarDesa.satuan, nullable).
 * Fallback aman: produk tanpa satuan tampil seperti sebelumnya (tanpa satuan).
 */

// Preset satuan umum untuk Autocomplete admin (boleh diketik bebas di luar ini).
export const SATUAN_PRESETS: readonly string[] = [
  'kg',
  'ons',
  'gram',
  'ekor',
  'ikat',
  'butir',
  'buah',
  'pcs',
  'bungkus',
  'liter',
  'lusin',
  'porsi',
];

/** Normalisasi satuan: trim, buang jadi undefined bila kosong. */
export function normalizeSatuan(satuan?: string | null): string | undefined {
  const s = (satuan ?? '').trim();
  return s === '' ? undefined : s;
}

/** " / kg" untuk ditempel di belakang harga. Kosong bila tak ada satuan. */
export function perSatuanSuffix(satuan?: string | null): string {
  const s = normalizeSatuan(satuan);
  return s ? ` / ${s}` : '';
}

/** Gabung angka + satuan, mis. (12,"ekor") → "12 ekor"; tanpa satuan → "12". */
export function withSatuan(value: number, satuan?: string | null): string {
  const s = normalizeSatuan(satuan);
  return s ? `${value} ${s}` : `${value}`;
}

/** Label field jumlah: "Jumlah (ekor)" bila ada satuan, else "Jumlah". */
export function jumlahLabel(satuan?: string | null): string {
  const s = normalizeSatuan(satuan);
  return s ? `Jumlah (${s})` : 'Jumlah';
}
