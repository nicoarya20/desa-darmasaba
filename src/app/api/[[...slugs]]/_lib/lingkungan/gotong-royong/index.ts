import Elysia, { t } from "elysia";
import KegiatanDesaCreate from "./create";
import KegiatanDesaDelete from "./del";
import KegiatanDesaFindMany from "./findMany";
import KegiatanDesaFindUnique from "./findUnique";
import KegiatanDesaUpdate from "./updt";
import KategoriKegiatan from "./kategori-kegiatan";

const KegiatanDesa = new Elysia({
  prefix: "/kegiatandesa",
  tags: ["Lingkungan/Gotong Royong/Kegiatan Desa"],
})

  // ✅ Find all
  .get("/find-many", KegiatanDesaFindMany)

  // ✅ Find by ID
  .get("/:id", KegiatanDesaFindUnique)

  // ✅ Create
  .post("/create", KegiatanDesaCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsiSingkat: t.String(),
      deskripsiLengkap: t.String(),
      tanggal: t.String(),
      lokasi: t.String(),
      partisipan: t.Optional(t.Number()),
      imageId: t.String(),
      kategoriKegiatanId: t.String(),
    }),
  })

  // ✅ Update
  .put("/:id", KegiatanDesaUpdate, {
    body: t.Object({
      judul: t.Optional(t.String()),
      deskripsiSingkat: t.Optional(t.String()),
      deskripsiLengkap: t.Optional(t.String()),
      tanggal: t.Optional(t.String()),
      lokasi: t.Optional(t.String()),
      partisipan: t.Optional(t.Number()),
      imageId: t.Optional(t.String()),
      kategoriKegiatanId: t.Optional(t.String()),
    }),
  })
  

  // ✅ Kategori kegiatan routes (nested)
  .use(KategoriKegiatan)

  // ✅ Delete
  .delete("/del/:id", KegiatanDesaDelete);

export default KegiatanDesa;
