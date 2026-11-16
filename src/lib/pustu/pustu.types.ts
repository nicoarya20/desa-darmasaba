/** Tipe data PUSTU seperti dikirim `GET /api/kesehatan/puskesmas/*` (gambar tanpa path server). */
import type { FotoGaleriItem, GambarRingkas, PengurusItem } from "@/lib/konten-bersama/konten-bersama.types";
import type { MediaSosialItem } from "@/lib/konten-bersama/media-sosial.model";

/** Satu baris jam operasional, mis. { hari: "Senin – Kamis", jam: "08.00 – 14.00 WITA" }. */
export type JadwalPustuItem = { hari: string; jam: string };

/** Satu layanan unggulan, mis. { judul: "Imunisasi", deskripsi: "Imunisasi rutin balita." }. */
export type LayananUnggulanItem = { judul: string; deskripsi: string | null };

/** Kontak PUSTU; `kontakUGD` = kontak darurat / ambulans. */
export type KontakPustu = { kontakPuskesmas: string | null; email: string | null; kontakUGD: string | null };

/** Baris daftar PUSTU (find-many ringan, tanpa teks panjang & daftar anak). */
export type PustuRingkas = {
  id: string;
  name: string;
  alamat: string;
  imageId: string | null;
  image: GambarRingkas | null;
  jadwal: JadwalPustuItem[];
  kontak: KontakPustu | null;
};

/** Detail PUSTU lengkap (halaman publik + form edit admin). */
export type PustuDetail = PustuRingkas & {
  mediaSosial: MediaSosialItem[];
  layananUnggulan: LayananUnggulanItem[];
  linkPetunjukArah: string | null;
  prosedurPendaftaran: string | null;
  tarifBpjs: string | null;
  tarifUmum: string | null;
  fotoBaganStrukturId: string | null;
  fotoBaganStruktur: GambarRingkas | null;
  pengurus: PengurusItem[];
  fotoKegiatan: FotoGaleriItem[];
};
