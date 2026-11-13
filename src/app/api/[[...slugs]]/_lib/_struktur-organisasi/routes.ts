import Elysia, { t } from "elysia";
import type { StrukturHandlers } from "./handlers";
import { strukturPlugin } from "./plugin";

const optionalText = t.Optional(t.Nullable(t.String()));
const idParams = t.Object({ id: t.String() });

const posisiCreateBody = t.Object({
  nama: t.String(),
  hierarki: t.Number(),
  deskripsi: optionalText,
  urutan: t.Optional(t.Number()),
  parentId: optionalText,
});

const posisiUpdateBody = t.Object({
  ...posisiCreateBody.properties,
  isActive: t.Optional(t.Boolean()),
});

// Sama untuk create & update (kontrak: PUT mengirim field form; yang kosong = dikosongkan, tidak dikirim = tetap).
// gelarAkademik/tanggalMasuk/alamat tidak lagi dikirim form admin; tetap diterima demi kompatibilitas.
const pegawaiBody = t.Object({
  namaLengkap: t.String(),
  posisiId: t.String(),
  gelarAkademik: optionalText,
  imageId: optionalText,
  tanggalMasuk: optionalText, // YYYY-MM-DD
  email: optionalText,
  telepon: optionalText,
  alamat: optionalText,
  isActive: t.Optional(t.Boolean()),
});

export type StrukturRouteOptions<Prefix extends string, PosisiPath extends string, PegawaiPath extends string> = {
  /** Prefix modul, mis. "/strukturperangkat" (di bawah prefix domain "/desa"). */
  prefix: Prefix;
  /** Segmen rute jabatan, mis. "/posisi" (Perangkat Desa) atau "/posisiorganisasi" (PPID, path lama). */
  posisiPath: PosisiPath;
  /** Segmen rute pegawai, mis. "/pegawai". */
  pegawaiPath: PegawaiPath;
  /** Tag Swagger induk, mis. "Desa/Struktur Perangkat Desa". */
  tag: string;
  /** Penanda log error 500, mis. "strukturperangkat". */
  logTag: string;
};

/**
 * Modul Elysia satu struktur organisasi: `{posisiPath}/{find-many-all,:id,create,:id,del/:id}` dan
 * `{pegawaiPath}/{find-many,:id,create,:id,del/:id}`. Literal path dibawa generik agar tipe Eden (ApiFetch) tepat.
 */
export function createStrukturModule<
  const Prefix extends string,
  const PosisiPath extends string,
  const PegawaiPath extends string,
>(options: StrukturRouteOptions<Prefix, PosisiPath, PegawaiPath>, handlers: StrukturHandlers) {
  const { posisi, pegawai } = handlers;

  const posisiRoutes = strukturPlugin(options.posisiPath, `${options.tag}/Jabatan`, options.logTag)
    .get("/find-many-all", posisi.findManyAll)
    .get("/:id", posisi.findUnique, { params: idParams })
    .post("/create", posisi.create, { body: posisiCreateBody })
    .put("/:id", posisi.update, { params: idParams, body: posisiUpdateBody })
    .delete("/del/:id", posisi.delete, { params: idParams });

  const pegawaiRoutes = strukturPlugin(options.pegawaiPath, `${options.tag}/Pegawai`, options.logTag)
    .get("/find-many", pegawai.findMany)
    .get("/:id", pegawai.findUnique, { params: idParams })
    .post("/create", pegawai.create, { body: pegawaiBody })
    .put("/:id", pegawai.update, { params: idParams, body: pegawaiBody })
    .delete("/del/:id", pegawai.delete, { params: idParams });

  return new Elysia({ prefix: options.prefix, tags: [options.tag] }).use(posisiRoutes).use(pegawaiRoutes);
}
