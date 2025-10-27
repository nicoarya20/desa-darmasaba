import Elysia, { t } from "elysia";
import artikelKesehatanCreate from "./create";
import artikelKesehatanFindMany from "./findMany";
import artikelKesehatanDelete from "./del";
import { artikelKesehatanFindUnique } from "./findUnique";
import artikelKesehatanUpdate from "./updt";

const ArtikelKesehatan = new Elysia({
  prefix: "artikel-kesehatan",
  tags: ["Kesehatan/Artikel Kesehatan"],
})
  .post("/create", artikelKesehatanCreate, {
    body: t.Object({
      title: t.String(),
      content: t.String(),
      introduction: t.Object({
        content: t.String(),
      }),
      symptom: t.Object({
        title: t.String(),
        content: t.String(),
      }),
      prevention: t.Object({
        title: t.String(),
        content: t.String(),
      }),
      firstAid: t.Object({
        title: t.String(),
        content: t.String(),
      }),
      mythVsFact: t.Object({
        title: t.String(),
        mitos: t.String(),
        fakta: t.String(),
      }),
      doctorSign: t.Object({
        content: t.String(),
      }),
      imageId: t.String(),
    }),
  })
  .get("/find-many", artikelKesehatanFindMany)
  .delete("/del/:id", artikelKesehatanDelete)
  .get("/:id", async (context) => {
    const response = await artikelKesehatanFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .put(
    "/:id",
    async (context) => {
      const response = await artikelKesehatanUpdate(context);
      return response;
    },
    {
      body: t.Object({
        title: t.String(),
        content: t.String(),
        introduction: t.Object({
          content: t.String(),
        }),
        symptom: t.Object({
          title: t.String(),
          content: t.String(),
        }),
        prevention: t.Object({
          title: t.String(),
          content: t.String(),
        }),
        firstAid: t.Object({
          title: t.String(),
          content: t.String(),
        }),
        mythVsFact: t.Object({
          title: t.String(),
          mitos: t.String(),
          fakta: t.String(),
        }),
        doctorSign: t.Object({
          content: t.String(),
        }),
        imageId: t.String(),
      }),
    }
  );
export default ArtikelKesehatan;