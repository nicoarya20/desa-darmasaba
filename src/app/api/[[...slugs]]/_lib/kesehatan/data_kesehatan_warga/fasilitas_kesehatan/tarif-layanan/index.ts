import Elysia, { t } from "elysia";
import tarifLayananCreate from "./create";
import tarifLayananFindMany from "./findMany";
import tarifLayananFindUnique from "./findUnique";
import tarifLayananDelete from "./del";
import tarifLayananUpdate from "./updt";

const TarifLayanan = new Elysia({
    prefix: "/tarifdanlayanan",
    tags: ["Data Kesehatan/Fasilitas Kesehatan/Tarif Layanan"]
})
    .get("/:id", async (context) => {
        const response = await tarifLayananFindUnique(new Request(context.request));
        return response;
    })
    .get("/findMany", tarifLayananFindMany)
    .post("/create", tarifLayananCreate, {
        body: t.Object({
            tarif: t.String(),
            layanan: t.String()
        }),
    })
    .put("/:id", tarifLayananUpdate, {
        body: t.Object({
            tarif: t.String(),
            layanan: t.String(),
        }),
    })
    .delete("/del/:id", tarifLayananDelete)
export default TarifLayanan