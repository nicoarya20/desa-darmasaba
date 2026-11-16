import type { FotoGaleriItem, GambarRingkas, PengurusItem } from "@/lib/konten-bersama/konten-bersama.types";
import type { MediaSosialItem } from "@/lib/konten-bersama/media-sosial.model";

/** Detail lembaga (sekolah) seperti dikirim `GET /api/pendidikan/infosekolahpaud/lembagapendidikan/:id`. */
export type LembagaDetail = {
  id: string;
  nama: string;
  jenjangId: string;
  jenjangPendidikan: { id: string; nama: string } | null;
  isActive: boolean;
  deskripsi: string | null;
  alamat: string | null;
  kontak: string | null;
  mediaSosial: MediaSosialItem[];
  lat: number | null;
  lng: number | null;
  linkGoogleMaps: string | null;
  fotoSekolahId: string | null;
  fotoSekolah: GambarRingkas | null;
  fotoBaganStrukturId: string | null;
  fotoBaganStruktur: GambarRingkas | null;
  pengurus: PengurusItem[];
  fotoKegiatan: FotoGaleriItem[];
  /** Jumlah siswa & pengajar aktif (angka saja; nama siswa = data anak, tidak dikirim). */
  _count: { siswa: number; pengajar: number };
};
