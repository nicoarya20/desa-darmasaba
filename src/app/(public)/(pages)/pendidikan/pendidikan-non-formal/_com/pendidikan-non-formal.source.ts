import ApiFetch from "@/lib/api-fetch";
import { readProgramInfoRecord } from "../../_com/program-info/program-info.logic";
import type { ProgramInfoLoader } from "../../_com/program-info/use-program-info";

/*
 * Tiap tabel hanya berisi satu baris; `find-by-id` mengembalikan baris pertama (query `id` diabaikan backend,
 * docs/BACKEND-TODO.md). `id: "edit"` tetap dikirim sesuai id seed supaya benar begitu backend membacanya.
 */
const BARIS_ID = "edit";
const API = ApiFetch.api.pendidikan.pendidikannonformal;

/** Kunci bagian Jenis Program (isinya dirender khusus sebagai daftar bernomor). */
export const JENIS_PROGRAM_KEY = "jenis-program";

/** Bagian halaman Pendidikan Non Formal, urut tampil: Tujuan → Jenis Program → Tempat Kegiatan. */
export const PENDIDIKAN_NON_FORMAL_LOADERS: readonly ProgramInfoLoader[] = [
  {
    key: "tujuan",
    title: "Tujuan Program",
    load: async () => {
      const res = await API.tujuanpendidikannonformal["find-by-id"].get({ query: { id: BARIS_ID } });
      return readProgramInfoRecord("pendidikan non formal: tujuan program", res.status, res.data);
    },
  },
  {
    key: JENIS_PROGRAM_KEY,
    title: "Jenis Program",
    load: async () => {
      const res = await API.jenisprogramyangdiselenggarakan["find-by-id"].get({ query: { id: BARIS_ID } });
      return readProgramInfoRecord("pendidikan non formal: jenis program", res.status, res.data);
    },
  },
  {
    key: "tempat",
    title: "Tempat Kegiatan",
    load: async () => {
      const res = await API.tempatkegiatan["find-by-id"].get({ query: { id: BARIS_ID } });
      return readProgramInfoRecord("pendidikan non formal: tempat kegiatan", res.status, res.data);
    },
  },
];
