import Elysia, { t } from "elysia";
import pelayananPendudukNonPermanenFindUnique from "./findUnique";
import pelayananPendudukNonPermanenUpdate from "./updt";
import { waktuBiayaBodySchema } from "../waktu-biaya.schema";

const PelayananPendudukNonPermanen = new Elysia({ prefix: "/pelayananpenduduknonpermanen", tags: ["Desa/Layanan/Pelayanan Penduduk Non Permanen"] })
.get("/:id", async (context) => {
    const response = await pelayananPendudukNonPermanenFindUnique(context.request);
    return response;
})
.put("/:id", async (context) => {
    const response = await pelayananPendudukNonPermanenUpdate(context);
    return response;
},
{
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        ...waktuBiayaBodySchema,
    }),
})
export default PelayananPendudukNonPermanen;