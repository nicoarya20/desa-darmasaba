import type { StrukturApiConfig } from "./config";
import { createPegawaiReadHandlers } from "./pegawai.read";
import { createPegawaiWriteHandlers } from "./pegawai.write";
import { createPosisiHandlers } from "./posisi.handlers";

/** Semua handler satu struktur organisasi (jabatan + pegawai) dari konfigurasi tabelnya. */
export function createStrukturHandlers(config: StrukturApiConfig) {
  return {
    posisi: createPosisiHandlers(config),
    pegawai: { ...createPegawaiReadHandlers(config), ...createPegawaiWriteHandlers(config) },
  };
}

export type StrukturHandlers = ReturnType<typeof createStrukturHandlers>;
