import { htmlToText } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { ADMINISTRASI_RULES as R } from "./administrasi.meta";
import { ADMINISTRASI_TEXT } from "./administrasi.text";

/** Isian formulir; nama field = body `POST /api/inovasi/layananonlinedesa/administrasionline/create`. */
export type AdministrasiValues = { name: string; alamat: string; nomorTelepon: string; jenisLayananId: string };
export type AdministrasiField = keyof AdministrasiValues;
export type AdministrasiErrors = Partial<Record<AdministrasiField, string>>;

export const EMPTY_ADMINISTRASI: AdministrasiValues = { name: "", alamat: "", nomorTelepon: "", jenisLayananId: "" };

/** Bentuk minimal item find-many jenis layanan. */
export type JenisLayananApiItem = { id: string; nama?: string | null; deskripsi?: string | null };
export type JenisLayanan = { id: string; nama: string; deskripsi: string };

/** Saring ketikan per isian: nama tanpa angka (perilaku lama), telepon hanya digit dan maksimal 13. */
export function normalizeAdministrasiField(field: AdministrasiField, raw: string): string {
  if (field === "name") return raw.replace(/[0-9]/g, "");
  if (field === "nomorTelepon") return raw.replace(/\D/g, "").slice(0, R.maxPhone);
  return raw;
}

/** Pesan galat per isian; objek kosong = siap dikirim. */
export function validateAdministrasi(values: AdministrasiValues): AdministrasiErrors {
  const E = ADMINISTRASI_TEXT.errors;
  const errors: AdministrasiErrors = {};
  if (values.name.trim().length < R.minName) errors.name = E.name;
  if (values.alamat.trim().length < R.minAlamat) errors.alamat = E.alamat;
  const digits = values.nomorTelepon.replace(/\D/g, "").length;
  if (digits < R.minPhone || digits > R.maxPhone) errors.nomorTelepon = E.nomorTelepon;
  if (!values.jenisLayananId.trim()) errors.jenisLayananId = E.jenisLayananId;
  return errors;
}

export function hasAdministrasiErrors(errors: AdministrasiErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Body kirim: teks dirapikan, telepon hanya digit. */
export function toAdministrasiPayload(values: AdministrasiValues): AdministrasiValues {
  return {
    name: values.name.trim().replace(/\s+/g, " "),
    alamat: values.alamat.trim(),
    nomorTelepon: values.nomorTelepon.replace(/\D/g, ""),
    jenisLayananId: values.jenisLayananId.trim(),
  };
}

/**
 * Keterangan jenis layanan sebagai teks polos: sebagian baris admin berisi HTML editor, sebagian teks biasa. Keterangan
 * yang hanya mengulang nama (stg: "Administrasi Online Surat Keterangan Usaha") dikosongkan agar daftar tidak berulang.
 */
export function jenisDeskripsi(nama: string, deskripsi: string | null | undefined): string {
  const text = htmlToText(deskripsi);
  return text.toLowerCase().includes(nama.toLowerCase()) ? "" : text;
}

/** Normalisasi + urut abjad (API mengurutkan terbaru dibuat, tidak berguna untuk memilih); entri tanpa nama dibuang. */
export function toJenisLayananList(items: readonly JenisLayananApiItem[]): JenisLayanan[] {
  return items
    .map((item) => {
      const nama = item.nama?.trim() ?? "";
      return { id: item.id, nama, deskripsi: nama ? jenisDeskripsi(nama, item.deskripsi) : "" };
    })
    .filter((item) => item.nama)
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
}
