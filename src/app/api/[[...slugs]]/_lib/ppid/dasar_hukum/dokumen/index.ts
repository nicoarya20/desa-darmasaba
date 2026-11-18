import Elysia, { t } from "elysia";
import dokumenDasarHukumCreate from "./create";
import dokumenDasarHukumDelete from "./del";
import dokumenDasarHukumFindMany from "./find-many";
import dokumenDasarHukumReorder from "./reorder";
import dokumenDasarHukumUpdate from "./updt";
import { DOKUMEN_DASAR_HUKUM_MAX } from "./dokumen.rules";

/** Dokumen PDF Dasar Hukum PPID (daftar flat, satu baris = satu dokumen). GET publik; mutasi admin-only di handler. */
const DokumenDasarHukumPPID = new Elysia({
  prefix: "/dokumen",
  tags: ["PPID/Dasar Hukum PPID/Dokumen"],
})
  .get("/find-many", dokumenDasarHukumFindMany)
  .post("/create", dokumenDasarHukumCreate, {
    body: t.Object({ judul: t.String(), fileId: t.String() }),
  })
  .put("/updt/:id", dokumenDasarHukumUpdate, {
    body: t.Object({ judul: t.String() }),
  })
  .put("/reorder", dokumenDasarHukumReorder, {
    body: t.Object({ ids: t.Array(t.String(), { minItems: 1, maxItems: DOKUMEN_DASAR_HUKUM_MAX }) }),
  })
  .delete("/del/:id", dokumenDasarHukumDelete);

export default DokumenDasarHukumPPID;
