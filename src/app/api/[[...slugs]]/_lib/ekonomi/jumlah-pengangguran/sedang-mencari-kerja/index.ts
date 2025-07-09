import Elysia, { t } from "elysia";
import sedangMencariKerjaFindUnique from "./findUnique";
import sedangMencariKerjaFindMany from "./findMany";
import sedangMencariKerjaCreate from "./create";
import sedangMencariKerjaUpdate from "./updt";
import sedangMencariKerjaDelete from "./del";

const SedangMencariKerja = new Elysia({
    prefix: "/sedangmencarikerja",
    tags: ["Ekonomi/Jumlah Pengangguran/Sedang Mencari Kerja"],
})
.get("/:id", async (context) => {
    const response = await sedangMencariKerjaFindUnique(
        new Request(context.request)
    );
    return response;
})
.get("/find-many", sedangMencariKerjaFindMany)
.post("/create", sedangMencariKerjaCreate, {
    body: t.Object({
        count: t.Number(),
        percentageOfTotal: t.Number(),
        recordedDate: t.String(),
    }),
})
.put("/:id", sedangMencariKerjaUpdate, {
    params: t.Object({
        id: t.String(),
    }),
    body: t.Object({
        count: t.Number(),
        percentageOfTotal: t.Number(),
        recordedDate: t.String(),
    }),
})
.delete("/del/:id", sedangMencariKerjaDelete, {
    params: t.Object({
        id: t.String(),
    }),
});

export default SedangMencariKerja;
