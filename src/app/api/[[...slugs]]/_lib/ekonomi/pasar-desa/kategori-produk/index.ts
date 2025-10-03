import Elysia from "elysia";
import kategoriProdukFindMany from "./findMany";
import kategoriProdukFindUnique from "./findUnique";
import kategoriProdukDelete from "./del";
import kategoriProdukCreate from "./create";
import kategoriProdukUpdate from "./updt";
import { t } from "elysia";
import kategoriProdukFindManyAll from "./findManyAll";

const KategoriProduk = new Elysia({
    prefix: "/kategoriproduk",
    tags: ["Ekonomi/Kategori Produk"],
})
    .get("/find-many", kategoriProdukFindMany)
    .get("/find-many-all", kategoriProdukFindManyAll)
    .get("/:id", async (context) => {
        const response = await kategoriProdukFindUnique(context);
        return response;
    })
    .delete("/del/:id", kategoriProdukDelete)
    .post("/create", kategoriProdukCreate, {
        body: t.Object({
            nama: t.String(),
        }),
    })
    .put("/:id", kategoriProdukUpdate, {
        body: t.Object({
            nama: t.String(),
        }),
    });

export default KategoriProduk;