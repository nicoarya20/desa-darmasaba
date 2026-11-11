import Elysia, { t } from "elysia";
import kegiatanDesaFindMany from "./find-many";
import kegiatanDesaFindUnique from "./findUnique";
import kegiatanDesaCreate from "./create";
import kegiatanDesaDelete from "./del";
import kegiatanDesaUpdate from "./updt";
import kegiatanDesaMonev from "./monev";

// Field khusus kategori Pembangunan — opsional & nullable (aditif, klien lama tetap valid).
// Rentang/enum divalidasi di parsePembangunanInput agar pesan error seragam.
const pembangunanBody = {
  anggaran: t.Optional(t.Union([t.Number(), t.Null()])),
  progres: t.Optional(t.Union([t.Number(), t.Null()])),
  statusPembangunan: t.Optional(t.Union([t.String(), t.Null()])),
  sumberDana: t.Optional(t.Union([t.String(), t.Null()])),
};

const KegiatanDesa = new Elysia({ prefix: "/kegiatandesa", tags: ["Desa/Kegiatan Desa"] })
  .get("/find-many", kegiatanDesaFindMany)
  .get("/monev", kegiatanDesaMonev)
  .get("/:id", kegiatanDesaFindUnique)
  .post("/create", kegiatanDesaCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsiSingkat: t.String(),
      deskripsiLengkap: t.String(),
      tanggal: t.String(),
      lokasi: t.String(),
      partisipan: t.Optional(t.Number()),
      kategoriKegiatanId: t.String(),
      imageId: t.Optional(t.String()),
      ...pembangunanBody,
    }),
  })
  .put("/:id", kegiatanDesaUpdate, {
    body: t.Object({
      judul: t.String(),
      deskripsiSingkat: t.String(),
      deskripsiLengkap: t.String(),
      tanggal: t.String(),
      lokasi: t.String(),
      partisipan: t.Optional(t.Number()),
      kategoriKegiatanId: t.String(),
      imageId: t.Optional(t.String()),
      ...pembangunanBody,
    }),
  })
  .delete("/del/:id", kegiatanDesaDelete);

export default KegiatanDesa;
