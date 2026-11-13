import ApiFetch from "@/lib/api-fetch";
import { createStrukturState } from "../../struktur-organisasi";

/** State Struktur Perangkat Desa (admin + publik): `posisi` (jabatan) dan `pegawai` dari `/api/desa/strukturperangkat`. */
export const stateStrukturPerangkat = createStrukturState({
  logTag: "strukturPerangkat",
  pegawaiLabel: "Perangkat desa",
  pegawaiLabelLower: "perangkat desa",
  api: {
    posisi: () => ApiFetch.api.desa.strukturperangkat.posisi,
    pegawai: () => ApiFetch.api.desa.strukturperangkat.pegawai,
  },
});

export default stateStrukturPerangkat;
export const statePegawaiPerangkat = stateStrukturPerangkat.pegawai;
export const statePosisiPerangkat = stateStrukturPerangkat.posisi;
export { templatePegawai, templatePosisi } from "../../struktur-organisasi";
export type { Pegawai, PegawaiForm, Posisi, PosisiForm } from "../../struktur-organisasi";
