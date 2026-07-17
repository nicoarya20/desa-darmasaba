import Elysia, { t } from "elysia";
import kesejahteraanFindMany from "./find-many";
import kesejahteraanCreate from "./create";
import kesejahteraanDelete from "./del";
import kesejahteraanUpdate from "./updt";
import findKesejahteraanById from "./find-by-id";
import kesejahteraanFindFirst from "./findFirst";
import findRecentKesejahteraan from "./findRecent";

const KesejahteraanMasyarakat = new Elysia({
  prefix: "/kesejahteraanmasyarakat",
  tags: ["Ekonomi/Kesejahteraan Masyarakat"],
})
  .get("/find-many", kesejahteraanFindMany)
  .get("/find-many-ui", kesejahteraanFindMany)
  .get("/:id", async (context) => {
    const response = await findKesejahteraanById(new Request(context.request));
    return response;
  })
  .post("/create", kesejahteraanCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
      content: t.String(),
      imageIds: t.Array(t.String()),
      linkVideo: t.Optional(t.String()),
    }),
  })
  .get("/find-first", kesejahteraanFindFirst)
  .get("/find-recent", findRecentKesejahteraan)
  .delete("/delete/:id", kesejahteraanDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await kesejahteraanUpdate(context);
      return response;
    },
    {
      body: t.Object({
        judul: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
        content: t.String(),
        imageIds: t.Array(t.String()),
        linkVideo: t.Optional(t.String()),
      }),
    },
  );

export default KesejahteraanMasyarakat;
