import { createStrukturModule } from "../../_struktur-organisasi";
import { strukturPerangkatHandlers } from "./handlers";

/** API Struktur Perangkat Desa (`/desa/strukturperangkat/{posisi,pegawai}`) — tabel sendiri, kode bersama. */
const StrukturPerangkatDesa = createStrukturModule(
  {
    prefix: "/strukturperangkat",
    posisiPath: "/posisi",
    pegawaiPath: "/pegawai",
    tag: "Desa/Struktur Perangkat Desa",
    logTag: "strukturperangkat",
  },
  strukturPerangkatHandlers
);

export default StrukturPerangkatDesa;
