import Elysia, { t } from "elysia";
import migrasiPendudukFindUnique from "./findUnique";
import migrasiPendudukUpdate from "./updt";
import migrasiPendudukFindMany from "./findMany";
import migrasiPendudukCreate from "./create";
import migrasiPendudukDelete from "./del";

const MigrasiPenduduk = new Elysia({
    prefix: "/migrasipenduduk",
    tags: ["Kependudukan/Migrasi Penduduk"],
})
.get("/:id", async (context) => {
    const response = await migrasiPendudukFindUnique(new Request(context.request))
    return response
  })
  .get("/find-many", migrasiPendudukFindMany)
  .post("/create", migrasiPendudukCreate, {
    body: t.Object({
      jenis: t.String(),
      nama: t.String(),
      tanggal: t.String(),
      asalTujuan: t.String(),
      alasan: t.Optional(t.String()),
    }),
  })
  .put("/:id", migrasiPendudukUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      jenis: t.String(),
      nama: t.String(),
      tanggal: t.String(),
      asalTujuan: t.String(),
      alasan: t.Optional(t.String()),
    }),
  })
  .delete("/del/:id", migrasiPendudukDelete, {
    params: t.Object({
      id: t.String(),
    }),
  })
export default MigrasiPenduduk;
