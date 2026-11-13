import ApiFetch from "@/lib/api-fetch";
import { createStrukturState } from "../../struktur-organisasi";

/** State Struktur PPID (admin + publik): `posisi` (jabatan) dan `pegawai` dari `/api/ppid/strukturppid`. */
export const stateStrukturPpid = createStrukturState({
  logTag: "strukturPpid",
  pegawaiLabel: "Pegawai PPID",
  pegawaiLabelLower: "pegawai PPID",
  api: {
    posisi: () => ApiFetch.api.ppid.strukturppid.posisiorganisasi,
    pegawai: () => ApiFetch.api.ppid.strukturppid.pegawai,
  },
});

export default stateStrukturPpid;
