import { isJadwalEmpty } from "@/lib/jadwal-pelayanan";
import { MAX_ALAMAT_POSYANDU } from "@/lib/posyandu/posyandu-konten.validation";

/** Nilai form admin posyandu banjar (create & edit); gambar utama dikelola terpisah sebagai file. */
export type PosyanduForm = {
  name: string;
  nomor: string;
  banjarId: string;
  alamat: string;
  deskripsi: string;
  jadwalPelayanan: string;
};

export const FORM_POSYANDU_KOSONG: PosyanduForm = {
  name: "",
  nomor: "",
  banjarId: "",
  alamat: "",
  deskripsi: "",
  jadwalPelayanan: "",
};

/** Isi form edit dari detail API (nilai null → string kosong). */
export function formDariPosyandu(d: {
  name: string;
  nomor: string | null;
  banjarId: string | null;
  alamat?: string | null;
  deskripsi: string | null;
  jadwalPelayanan: string | null;
}): PosyanduForm {
  return {
    name: d.name ?? "",
    nomor: d.nomor ?? "",
    banjarId: d.banjarId ?? "",
    alamat: d.alamat ?? "",
    deskripsi: d.deskripsi ?? "",
    jadwalPelayanan: d.jadwalPelayanan ?? "",
  };
}

/**
 * Pesan error pertama form posyandu banjar, atau null bila valid. Banjar wajib di UI (API tetap menerima
 * kosong agar data lama tidak rusak); keterangan per posyandu opsional karena deskripsi umum kini di Profil.
 */
export function cekFormPosyandu(form: PosyanduForm, adaGambar: boolean): string | null {
  if (!form.name.trim()) return "Nama posyandu wajib diisi";
  if (!form.nomor.trim()) return "Nomor telepon wajib diisi";
  if (!form.banjarId) return "Banjar wajib dipilih";
  if (form.alamat.trim().length > MAX_ALAMAT_POSYANDU) return `Alamat maksimal ${MAX_ALAMAT_POSYANDU} karakter`;
  if (isJadwalEmpty(form.jadwalPelayanan)) return "Jadwal pelayanan wajib diisi";
  if (!adaGambar) return "Gambar wajib dipilih";
  return null;
}
