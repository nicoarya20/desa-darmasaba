import Elysia, { t } from "elysia";
import musikFindMany from "./find-many";
import musikCreate from "./create";
import musikDelete from "./del";
import musikUpdate from "./updt";
import findMusikById from "./find-by-id";

const Musik = new Elysia({ prefix: "/musik", tags: ["Desa/Musik"] })
  .get("/find-many", musikFindMany)
  .get("/:id", async (context) => {
    const response = await findMusikById(new Request(context.request));
    return response;
  })
  .post("/create", musikCreate, {
    body: t.Object({
      judul: t.String(),
      artis: t.String(),
      deskripsi: t.Optional(t.String()),
      durasi: t.String(),
      audioFileId: t.String(),
      coverImageId: t.String(),
      genre: t.Optional(t.String()),
      tahunRilis: t.Optional(t.Number()),
    }),
  })
  .delete("/delete/:id", musikDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await musikUpdate(context);
      return response;
    },
    {
      body: t.Object({
        judul: t.String(),
        artis: t.String(),
        deskripsi: t.Optional(t.String()),
        durasi: t.String(),
        audioFileId: t.String(),
        coverImageId: t.String(),
        genre: t.Optional(t.String()),
        tahunRilis: t.Optional(t.Number()),
      }),
    }
  );

export default Musik;
