import Elysia from "elysia";
import kategoriMakananFindMany from "./findMany";
import kategoriMakananFindUnique from "./findUnique";
import kategoriMakananDelete from "./del";
import kategoriMakananCreate from "./create";
import kategoriMakananUpdate from "./updt";
import { t } from "elysia";

const KategoriMakanan = new Elysia({
    prefix: "/kategori-makanan",
    tags: ["Ekonomi/Kategori Makanan"],
})
    .get("/find-many", kategoriMakananFindMany)
    .get("/:id", async (context) => {
        const response = await kategoriMakananFindUnique(context);
        return response;
    })
    .delete("/del/:id", kategoriMakananDelete)
    .post("/create", kategoriMakananCreate, {
        body: t.Object({
            nama: t.String(),
        }),
    })
    .put("/:id", kategoriMakananUpdate, {
        body: t.Object({
            nama: t.String(),
        }),
    });

export default KategoriMakanan;