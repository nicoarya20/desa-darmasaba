import { proxy } from "valtio";
import pegawai from "./pegawai";
import posisi from "./posisi";

/** State Struktur Perangkat Desa (admin + publik): `posisi` (jabatan) dan `pegawai`. */
export const stateStrukturPerangkat = proxy({ posisi, pegawai });

export default stateStrukturPerangkat;
export { default as statePegawaiPerangkat, templatePegawai } from "./pegawai";
export { default as statePosisiPerangkat, templatePosisi } from "./posisi";
export type { Pegawai, PegawaiForm, Posisi, PosisiForm } from "./types";
