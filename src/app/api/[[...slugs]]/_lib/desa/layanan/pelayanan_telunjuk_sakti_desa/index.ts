import Elysia, { t } from "elysia";
import pelayananTelunjukSaktiDesaFindUnique from "./findUnique";
import pelayananTelunjukSaktiDesaUpdate from "./updt";
import pelayananTelunjukSaktiDesaCreate from "./create";
import pelayananTelunjukSaktiDesaDelete from "./del";
import pelayananTelunjukSaktiDesaFindMany from "./find-many";
import { waktuBiayaBodySchema } from "../waktu-biaya.schema";

const pelayananTelunjukSaktiDesa = new Elysia({ prefix: "/pelayanantelunjuksaktidesa", tags: ["Desa/Layanan/Pelayanan Telunjuk Sakti Desa"] })
.get("/find-many", pelayananTelunjukSaktiDesaFindMany)
.get("/:id", async (context) => {
    const response = await pelayananTelunjukSaktiDesaFindUnique(context.request);
    return response;
})
.put("/:id", async (context) => {
    const response = await pelayananTelunjukSaktiDesaUpdate(context);
    return response;
},
{
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        link: t.String(),
        ...waktuBiayaBodySchema,
    }),
})
.post("/create", pelayananTelunjukSaktiDesaCreate, {
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        link: t.String(),
        ...waktuBiayaBodySchema,
    }),
})
.delete("/:id", pelayananTelunjukSaktiDesaDelete)
export default pelayananTelunjukSaktiDesa;
