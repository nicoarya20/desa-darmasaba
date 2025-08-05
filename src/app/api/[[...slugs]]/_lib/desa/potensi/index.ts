import Elysia from "elysia";
import createPotensiDesa from "./create";
import { t } from "elysia";
import potensiDesaDelete from "./del";
import potensiDesaFindMany from "./find-many";
import potensiDesaUpdate from "./updt";
import findUnique from "./find-unique";


const PotensiDesa = new Elysia({
    prefix: "/potensi", tags: ["Desa/Potensi"]
})
    .post("/create", createPotensiDesa, {
        body: t.Object({
            name: t.String(),
            deskripsi: t.String(),
            kategoriId: t.String(),
            imageId: t.String(),
            content: t.String(),
        }),
    })
    .delete("/del/:id", potensiDesaDelete)
    .get("/find-many", potensiDesaFindMany)
    .get("/:id", async (context) => {
          const response = await findUnique(new Request(context.request));
          return response;
        })
    .put(
        "/:id",
        async (context) => {
          const response = await potensiDesaUpdate(context);
          return response;
        },
        {
            body: t.Object({
                name: t.String(),
                deskripsi: t.String(),
                kategoriId: t.String(),
                imageId: t.String(),
                content: t.String(),
            }),
        }
    )

export default PotensiDesa