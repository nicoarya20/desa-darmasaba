import Elysia, { t } from "elysia";
import dokterTenagaMedisCreate from "./create";
import dokterTenagaMedisFindMany from "./findMany";
import dokterTenagaMedisFindUnique from "./findUnique";
import dokterTenagaMedisUpdate from "./updt";
import dokterTenagaMedisDelete from "./del";

const DokterTenagaMedis = new Elysia({
    prefix: "/doktertenagamedis",
    tags: ["Data Kesehatan/Fasilitas Kesehatan/Dokter Tenaga Medis"]
})
    .get("/:id", async (context) => {
        const response = await dokterTenagaMedisFindUnique(new Request(context.request));
        return response;
    })
    .get("/findMany", dokterTenagaMedisFindMany)
    .post("/create", dokterTenagaMedisCreate, {
        body: t.Object({
            name: t.String(),
            specialist: t.String(),
            jadwal: t.String(),
            jadwalLibur: t.String(),
            jamBukaOperasional: t.String(),
            jamTutupOperasional: t.String(),
            jamBukaLibur: t.String(),
            jamTutupLibur: t.String(),
        }),
    })
    .put("/:id", dokterTenagaMedisUpdate, {
        body: t.Object({
            name: t.String(),
            specialist: t.String(),
            jadwal: t.String(),
            jadwalLibur: t.String(),
            jamBukaOperasional: t.String(),
            jamTutupOperasional: t.String(),
            jamBukaLibur: t.String(),
            jamTutupLibur: t.String(),
        }),
    })
    .delete("/del/:id", dokterTenagaMedisDelete)
export default DokterTenagaMedis