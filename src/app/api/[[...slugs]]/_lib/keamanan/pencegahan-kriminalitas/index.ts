import Elysia, { t } from "elysia";
import pencegahanKriminalitasCreate from "./create";
import pencegahanKriminalitasFindUnique from "./findUnique";
import pencegahanKriminalitasFindMany from "./findMany";
import pencegahanKriminalitasDelete from "./del";
import pencegahanKriminalitasUpdate from "./updt";

const PencegahanKriminalitas = new Elysia({
  prefix: "pencegahankriminalitas",
  tags: ["Keamanan/Pencegahan Kriminalitas"],
})
  .post("/create", pencegahanKriminalitasCreate, {
    body: t.Object({
      programKeamanan: t.Object({
        nama: t.String(),
        deskripsi: t.String(),
        slug: t.String(),
      }),
      tipsKeamanan: t.Object({
        judul: t.String(),
        konten: t.String(),
        slug: t.String(),
      }),
      videoKeamanan: t.Object({
        judul: t.String(),
        deskripsi: t.String(),
        videoUrl: t.String(),
        slug: t.String(),
      }),
    }),
  })
  .get("/find-many", pencegahanKriminalitasFindMany)
  .get("/:id", async (context) => {
    const response = await pencegahanKriminalitasFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .delete("/del/:id", pencegahanKriminalitasDelete)
  .put(
    ":/id",
    async (context) => {
      const response = await pencegahanKriminalitasUpdate(context);
      return response;
    },
    {
      body: t.Object({
        programKeamanan: t.Object({
          nama: t.String(),
          deskripsi: t.String(),
          slug: t.String(),
        }),
        tipsKeamanan: t.Object({
          judul: t.String(),
          konten: t.String(),
          slug: t.String(),
        }),
        videoKeamanan: t.Object({
          judul: t.String(),
          deskripsi: t.String(),
          videoUrl: t.String(),
          slug: t.String(),
        }),
      }),
    }
  );
export default PencegahanKriminalitas;
