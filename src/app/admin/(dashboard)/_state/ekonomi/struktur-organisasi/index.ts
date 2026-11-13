import ApiFetch from "@/lib/api-fetch";
import { createStrukturState } from "../../struktur-organisasi";

/** State Struktur BUMDes (admin + publik): `posisi` (jabatan) dan `pegawai` dari `/api/ekonomi/struktur-organisasi`. */
export const stateStrukturBumdes = createStrukturState({
  logTag: "strukturBumdes",
  pegawaiLabel: "Pegawai BUMDes",
  pegawaiLabelLower: "pegawai BUMDes",
  api: {
    posisi: () => ApiFetch.api.ekonomi["struktur-organisasi"]["posisi-organisasi"],
    pegawai: () => ApiFetch.api.ekonomi["struktur-organisasi"].pegawai,
  },
});

export default stateStrukturBumdes;
