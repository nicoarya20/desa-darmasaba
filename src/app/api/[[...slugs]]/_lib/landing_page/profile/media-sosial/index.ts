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
  .get("/findMany", MediaSosialFindMany)

  // ✅ Find by ID
  .get("/:id", MediaSosialFindUnique)

  // ✅ Create
  .post("/create", MediaSosialCreate, {
    body: t.Object({
      name: t.String(),
      imageId: t.Union([t.String(), t.Null()]),
      iconUrl: t.Union([t.String(), t.Null()]),
      icon: t.Union([t.String(), t.Null()]),
    }),
  })

  // ✅ Update
  .put("/:id", MediaSosialUpdate, {
    body: t.Object({
      name: t.String(),
      imageId: t.Optional(t.Union([t.String(), t.Null()])),
      iconUrl: t.Optional(t.Union([t.String(), t.Null()])),
      icon: t.Optional(t.Union([t.String(), t.Null()])),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", MediaSosialDelete);

export default MediaSosial;
