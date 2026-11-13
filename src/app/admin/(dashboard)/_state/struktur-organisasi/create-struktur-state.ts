import { proxy } from "valtio";
import { createPegawaiState } from "./create-pegawai-state";
import { createPosisiState } from "./create-posisi-state";
import type { StrukturStateConfig } from "./types";

/** State admin + publik satu struktur organisasi: `posisi` (jabatan) dan `pegawai`, memakai API struktur itu. */
export function createStrukturState(config: StrukturStateConfig) {
  return proxy({ posisi: createPosisiState(config), pegawai: createPegawaiState(config) });
}

export type StrukturState = ReturnType<typeof createStrukturState>;
