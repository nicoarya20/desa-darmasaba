import type { FotoGaleriItem, GambarRingkas, PengurusItem } from "@/lib/konten-bersama/konten-bersama.types";
import type { MediaSosialItem } from "@/lib/konten-bersama/media-sosial.model";

/** Baris daftar bank sampah (find-many ringan, tanpa relasi). */
export type BankSampahRingkas = {
  id: string;
  name: string;
  alamat: string;
  namaTempatMaps: string;
  linkPetunjukArah: string;
  lat: number;
  lng: number;
};

/** Program Inovasi yang ditautkan ke bank sampah. */
export type InovasiTerkait = { id: string; name: string };

/** Detail bank sampah seperti dikirim `GET /api/lingkungan/keteranganbankterdekat/:id`. */
export type BankSampahDetail = BankSampahRingkas & {
  deskripsi: string | null;
  kontak: string | null;
  mediaSosial: MediaSosialItem[];
  fotoBaganStrukturId: string | null;
  fotoBaganStruktur: GambarRingkas | null;
  pengurus: PengurusItem[];
  fotoKegiatan: FotoGaleriItem[];
  programInovasi: InovasiTerkait[];
};
