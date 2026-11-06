import Elysia, { t } from "elysia";
import pelayananPerizinanBerusahaFindUnique from "./findUnique";
import pelayananPerizinanBerusahaUpdate from "./updt";
import { waktuBiayaBodySchema } from "../waktu-biaya.schema";

const PelayananPerizinanBerusaha = new Elysia({ prefix: "/pelayananperizinanberusaha", tags: ["Desa/Layanan/Pelayanan Perizinan Berusaha"] })
.get("/:id", async (context) => {
    const response = await pelayananPerizinanBerusahaFindUnique(context.request);
    return response;
})
.put("/:id", async (context) => {
    const response = await pelayananPerizinanBerusahaUpdate(context);
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
export default PelayananPerizinanBerusaha;
