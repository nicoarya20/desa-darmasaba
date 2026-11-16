import type { FotoGaleriItem, PengurusItem } from "@/lib/konten-bersama/konten-bersama.types";
import { createDaftarAnakState } from "../../konten-bersama/daftar-anak.state";

const BASE = "/api/kesehatan/puskesmas";

/** State admin galeri foto PUSTU (hapus permanen). */
export const fotoKegiatanPustu = createDaftarAnakState<FotoGaleriItem>({
  url: (id) => `${BASE}/${encodeURIComponent(id)}/foto-kegiatan`,
  label: "foto",
  tag: "galeri pustu",
});

/** State admin struktur pengurus PUSTU. */
export const pengurusPustu = createDaftarAnakState<PengurusItem>({
  url: (id) => `${BASE}/${encodeURIComponent(id)}/pengurus`,
  label: "pengurus",
  tag: "pengurus pustu",
});
