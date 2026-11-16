/** Tipe data konten bersama seperti dikirim API (gambar tanpa path server). */

/** Gambar FileStorage ringkas. */
export type GambarRingkas = { id: string; link: string; name?: string };

/** Satu foto galeri kegiatan. */
export type FotoGaleriItem = {
  id: string;
  imageId: string;
  keterangan: string | null;
  urutan: number;
  image: GambarRingkas;
};

/** Satu pengurus di struktur organisasi sederhana. */
export type PengurusItem = {
  id: string;
  nama: string;
  jabatan: string;
  urutan: number;
  imageId: string | null;
  image: GambarRingkas | null;
};
