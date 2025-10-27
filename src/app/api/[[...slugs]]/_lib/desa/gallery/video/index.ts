import Elysia, { t } from "elysia";
import galleryVideoFindMany from "./find-many";
import galleryVideoFindUnique from "./findUnique";
import galleryVideoCreate from "./create";
import galleryVideoDelete from "./del";
import galleryVideoUpdate from "./updt";

const GalleryVideo = new Elysia({
  prefix: "/gallery/video",
  tags: ["Desa/Gallery/Video"],
})
  .get("/find-many", galleryVideoFindMany)
  .get("/:id", async (context) => {
    const response = await galleryVideoFindUnique(new Request(context.request));
    return response;
  })
  .post("/create", galleryVideoCreate, {
    body: t.Object({
      name: t.String(),
      deskripsi: t.String(),
      linkVideo: t.String(),
    }),
  })
  .delete("/del/:id", galleryVideoDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await galleryVideoUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        linkVideo: t.String(),
      }),
    }
  );
export default GalleryVideo;