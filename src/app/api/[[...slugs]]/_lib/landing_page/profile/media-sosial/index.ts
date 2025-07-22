import Elysia, { t } from "elysia";
import MediaSosialCreate from "./create";
import MediaSosialDelete from "./del";
import MediaSosialFindMany from "./findMany";
import MediaSosialFindUnique from "./findUnique";
import MediaSosialUpdate from "./updt";

const MediaSosial = new Elysia({
  prefix: "/mediasosial",
  tags: ["Landing Page/Profile/Media Sosial"],
})

  // ✅ Find all
  .get("/find-many", MediaSosialFindMany)

  // ✅ Find by ID
  .get("/:id", MediaSosialFindUnique)

  // ✅ Create
  .post("/create", MediaSosialCreate, {
    body: t.Object({
      imageId: t.String(),
      iconUrl: t.String(),
    }),
  })

  // ✅ Update
  .put("/:id", MediaSosialUpdate, {
    body: t.Object({
      imageId: t.Optional(t.String()),
      iconUrl: t.Optional(t.String()),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", MediaSosialDelete);

export default MediaSosial;
