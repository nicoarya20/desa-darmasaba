import { z } from "zod";

const teksDasar = ({ label, max }: { label: string; max: number }) =>
  z
    .string({ invalid_type_error: `${label} harus berupa teks` })
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .nullable()
    .optional();

/** Teks opsional: kosong/spasi/tidak dikirim → null, melebihi `max` ditolak dengan pesan berlabel. */
export function teksOpsional(opsi: { label: string; max: number }) {
  return teksDasar(opsi).transform((v) => (v ? v : null));
}

/** Seperti `teksOpsional`, tetapi tidak dikirim tetap `undefined` (PUT: field dibiarkan apa adanya). */
export function teksOpsionalParsial(opsi: { label: string; max: number }) {
  return teksDasar(opsi).transform((v) => (v === undefined ? undefined : v || null));
}
