import type { FotoGaleriItem } from "@/lib/konten-bersama/konten-bersama.types";
import { createDaftarAnakState } from "../../konten-bersama/daftar-anak.state";

/** State admin galeri foto lokasi & kader satu posyandu banjar (hapus permanen). */
export const fotoKegiatanPosyandu = createDaftarAnakState<FotoGaleriItem>({
  url: (id) => `/api/kesehatan/posyandu/${encodeURIComponent(id)}/foto-kegiatan`,
  label: "foto",
  tag: "galeri posyandu",
});
