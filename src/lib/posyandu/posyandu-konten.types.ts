/** Tipe konten halaman Posyandu seperti dikirim API (gambar tanpa path server). */
import type { GambarRingkas } from "@/lib/konten-bersama/konten-bersama.types";
import type { SasaranKlaster } from "./posyandu-konten.validation";

/** Deskripsi umum halaman posyandu (singleton). */
export type ProfilPosyandu = {
  deskripsi: string;
  fungsiKegiatan: string | null;
};

/** Kegiatan satu klaster sasaran (Balita / Remaja / Lansia). */
export type KlasterPosyanduItem = {
  id: string;
  sasaran: SasaranKlaster;
  judul: string;
  deskripsi: string;
  jamPelayanan: string | null;
  urutan: number;
  imageId: string | null;
  image: GambarRingkas | null;
};

/** Respons `GET /api/kesehatan/posyandu/profil`: profil null = admin belum mengisi deskripsi umum. */
export type ProfilPosyanduData = {
  profil: ProfilPosyandu | null;
  klaster: KlasterPosyanduItem[];
};
