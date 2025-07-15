import Elysia from "elysia";
import jenisLayananFindMany from "./findMany";
import jenisLayananFindUnique from "./findUnique";
import jenisLayananDelete from "./del";
import jenisLayananCreate from "./create";
import jenisLayananUpdate from "./updt";
import { t } from "elysia";

const JenisLayanan = new Elysia({
    prefix: "/jenislayanan",
    tags: ["Inovasi/Jenis Layanan"],
})
    .get("/find-many", jenisLayananFindMany)
    .get("/:id", async (context) => {
        const response = await jenisLayananFindUnique(context);
        return response;
    })
    .delete("/del/:id", jenisLayananDelete)
    .post("/create", jenisLayananCreate, {
        body: t.Object({
            nama: t.String(),
            deskripsi: t.String(),
        }),
    })
    .put("/:id", jenisLayananUpdate, {
        body: t.Object({
            nama: t.String(),
            deskripsi: t.String(),
        }),
    });

export default JenisLayanan;