import type { FotoGaleriItem, PengurusItem } from "@/lib/konten-bersama/konten-bersama.types";
import { createDaftarAnakState } from "../../konten-bersama/daftar-anak.state";

/** URL API lembaga pendidikan (dipakai state lembaga & daftar anaknya). */
export const LEMBAGA_API = "/api/pendidikan/infosekolahpaud/lembagapendidikan";

/** State admin galeri foto kegiatan lembaga (hapus permanen). */
export const fotoKegiatanLembaga = createDaftarAnakState<FotoGaleriItem>({
  url: (id) => `${LEMBAGA_API}/${encodeURIComponent(id)}/foto-kegiatan`,
  label: "foto",
  tag: "galeri lembaga",
});

/** State admin struktur pengurus lembaga. */
export const pengurusLembaga = createDaftarAnakState<PengurusItem>({
  url: (id) => `${LEMBAGA_API}/${encodeURIComponent(id)}/pengurus`,
  label: "pengurus",
  tag: "pengurus lembaga",
});
