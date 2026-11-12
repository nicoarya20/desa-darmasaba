import { createStrukturModule } from "../../_struktur-organisasi";
import { strukturBumdesHandlers } from "./handlers";

/**
 * API Struktur BUMDes (`/ekonomi/struktur-organisasi/{posisi-organisasi,pegawai}`) — path lama dipertahankan,
 * kode bersama dengan Struktur Perangkat Desa & PPID (`_struktur-organisasi`).
 */
const StrukturOrganisasi = createStrukturModule(
  {
    prefix: "/struktur-organisasi",
    posisiPath: "/posisi-organisasi",
    pegawaiPath: "/pegawai",
    tag: "Ekonomi/Struktur BUMDes",
    logTag: "strukturbumdes",
  },
  strukturBumdesHandlers
);

export default StrukturOrganisasi;
