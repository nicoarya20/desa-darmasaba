import { z } from "zod";

/** ID tetap baris singleton WilayahDesa (upsert atomik, tak mungkin ada baris ganda). */
export const WILAYAH_DESA_ID = "wilayah-desa";

export const BATAS_MAX_LENGTH = 255;
export const KETERANGAN_MAX_LENGTH = 2000;
export const PETA_URL_MAX_LENGTH = 2048;

/** True jika `value` URL https absolut tanpa kredensial (aman dipakai sebagai src iframe). */
export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname !== "" &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}

const batasField = (label: string) =>
  z
    .string({
      required_error: `${label} wajib diisi`,
      invalid_type_error: `${label} harus berupa teks`,
    })
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(BATAS_MAX_LENGTH, `${label} maksimal ${BATAS_MAX_LENGTH} karakter`);

/** Teks opsional: string kosong / null / undefined dinormalkan jadi null. */
const optionalText = (label: string, max: number) =>
  z
    .string({ invalid_type_error: `${label} harus berupa teks` })
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .nullish()
    .transform((value) => (value ? value : null));

/** Skema input upsert Letak & Batas Wilayah (dipakai API dan form admin). */
export const wilayahDesaSchema = z.object({
  batasUtara: batasField("Batas utara"),
  batasSelatan: batasField("Batas selatan"),
  batasTimur: batasField("Batas timur"),
  batasBarat: batasField("Batas barat"),
  luasWilayah: z
    .number({ invalid_type_error: "Luas wilayah harus berupa angka (hektar)" })
    .finite("Luas wilayah harus berupa angka (hektar)")
    .positive("Luas wilayah harus lebih dari 0 hektar")
    .nullish()
    .transform((value) => value ?? null),
  keterangan: optionalText("Keterangan", KETERANGAN_MAX_LENGTH),
  petaEmbedUrl: optionalText("URL peta", PETA_URL_MAX_LENGTH).refine(
    (value) => value === null || isHttpsUrl(value),
    "URL peta harus diawali https:// dan berupa URL yang valid",
  ),
});

export type WilayahDesaInput = z.output<typeof wilayahDesaSchema>;

export type WilayahDesaParseResult =
  | { ok: true; data: WilayahDesaInput }
  | { ok: false; message: string };

/** Validasi body mentah; pesan error = isu pertama (konsisten untuk toast). */
export function parseWilayahDesaInput(body: unknown): WilayahDesaParseResult {
  const result = wilayahDesaSchema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    message: result.error.issues[0]?.message ?? "Data tidak valid",
  };
}
