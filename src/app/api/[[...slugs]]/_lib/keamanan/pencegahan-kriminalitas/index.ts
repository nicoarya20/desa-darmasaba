import Elysia, { t } from "elysia";
import pencegahanKriminalitasCreate from "./create";
import pencegahanKriminalitasFindUnique from "./findUnique";
import pencegahanKriminalitasFindMany from "./findMany";
import pencegahanKriminalitasDelete from "./del";
import pencegahanKriminalitasUpdate from "./updt";
import pencegahanKriminalitasFindFirst from "./findFirst";

const PencegahanKriminalitas = new Elysia({
  prefix: "pencegahankriminalitas",
  tags: ["Keamanan/Pencegahan Kriminalitas"],
})
  .post("/create", pencegahanKriminalitasCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      deskripsiSingkat: t.String(),
      linkVideo: t.String(),
    }),
  })
  .get("/find-many", pencegahanKriminalitasFindMany)
  .get("/:id", async (context) => {
    const response = await pencegahanKriminalitasFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .get("/find-first", pencegahanKriminalitasFindFirst)
  .delete("/del/:id", pencegahanKriminalitasDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await pencegahanKriminalitasUpdate(context);
      return response;
    },
    {
      body: t.Object({
        judul: t.String(),
        deskripsi: t.String(),
        deskripsiSingkat: t.String(),
        linkVideo: t.String(),
      }),
    }
  );
export default PencegahanKriminalitas;
