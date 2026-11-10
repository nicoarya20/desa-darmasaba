import Elysia, { t } from "elysia";
import { pengumumanCreate } from "./create";
import pengumumanDelete from "./del";
import pengumumanFindById from "./find-by-id";
import pengumumanFindMany from "./find-many";
import pengumumanFindFirst from "./findFirst";
import pengumumanFindRecent from "./findRecent";
import pengumumanUpdate from "./updt";

// Field lampiran & tanggal terbit opsional (kontrak additive); batas jumlah & format dicek di
// `@/lib/pengumuman-lampiran` supaya pesan error 400 seragam.
const pengumumanBody = t.Object({
  judul: t.String(),
  deskripsi: t.String(),
  content: t.String(),
  categoryPengumumanId: t.Union([t.String(), t.Null()]),
  imageId: t.Optional(t.Union([t.String(), t.Null()])),
  imageIds: t.Optional(t.Array(t.String())),
  dokumenIds: t.Optional(t.Array(t.String())),
  tanggalTerbit: t.Optional(t.Union([t.String(), t.Null()])),
});

const Pengumuman = new Elysia({ prefix: "/pengumuman", tags: ["Desa/Pengumuman"] })
  .get("/find-many", pengumumanFindMany)
  .get("/:id", pengumumanFindById)
  .delete("/del/:id", pengumumanDelete)
  .post("/create", pengumumanCreate, { body: pengumumanBody })
  .get("/find-first", pengumumanFindFirst)
  .get("/find-recent", pengumumanFindRecent)
  .put("/:id", pengumumanUpdate, { body: pengumumanBody });

export default Pengumuman;
