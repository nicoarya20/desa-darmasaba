import Elysia, { t } from "elysia";
import kegiatanDesaFindMany from "./find-many";
import kegiatanDesaFindUnique from "./findUnique";
import kegiatanDesaCreate from "./create";
import kegiatanDesaDelete from "./del";
import kegiatanDesaUpdate from "./updt";

const KegiatanDesa = new Elysia({ prefix: "/kegiatandesa", tags: ["Desa/Kegiatan Desa"] })
  .get("/find-many", kegiatanDesaFindMany)
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
    }),
  })
  .delete("/del/:id", kegiatanDesaDelete);

export default KegiatanDesa;
