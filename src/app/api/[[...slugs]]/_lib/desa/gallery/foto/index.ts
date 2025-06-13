import Elysia, { t } from "elysia";
import galleryFotoCreate from "./create";
import galleryFotoDelete from "./del";
import galleryFotoFindMany from "./find-many";
import galleryFotoUpdate from "./updt";
import galleryFotoFindUnique from "./findUnique";

const GalleryFoto = new Elysia({ prefix: "/gallery/foto", tags: ["Desa/Gallery/Foto"] })
    .get("/find-many", galleryFotoFindMany)
    .get("/:id", async (context) => {
        const response = await galleryFotoFindUnique(new Request(context.request));
        return response;
    })
    .post("/create", galleryFotoCreate, {
        body: t.Object({
            name: t.String(),
            deskripsi: t.String(),
            imagesId: t.String(),
        }),
    })
    .delete("/del/:id", galleryFotoDelete)
    .put("/:id", async (context) => {
        const response = await galleryFotoUpdate(context);
        return response;
    },
    {
        body: t.Object({
            name: t.String(),
            deskripsi: t.String(),
            imagesId: t.String(),
        }),
    })

export default GalleryFoto