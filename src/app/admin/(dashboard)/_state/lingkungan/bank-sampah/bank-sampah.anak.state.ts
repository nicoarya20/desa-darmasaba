import type { FotoGaleriItem, PengurusItem } from "@/lib/konten-bersama/konten-bersama.types";
import { createDaftarAnakState } from "../../konten-bersama/daftar-anak.state";

const BASE = "/api/lingkungan/keteranganbankterdekat";

/** State admin galeri foto kegiatan bank sampah (hapus permanen). */
export const fotoKegiatanBankSampah = createDaftarAnakState<FotoGaleriItem>({
  url: (id) => `${BASE}/${encodeURIComponent(id)}/foto-kegiatan`,
  label: "foto",
  tag: "galeri bank sampah",
});

/** State admin struktur pengurus bank sampah. */
export const pengurusBankSampah = createDaftarAnakState<PengurusItem>({
  url: (id) => `${BASE}/${encodeURIComponent(id)}/pengurus`,
  label: "pengurus",
  tag: "pengurus bank sampah",
});
