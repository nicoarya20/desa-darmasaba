import Elysia, { t } from "elysia";
import grafikKepuasanCreate from "./create";
import grafikKepuasanFindMany from "./find-many";
import grafikKepuasanFindUnique from "./findUnique";
import grafikKepuasanUpdate from "./updt";
import grafikKepuasanDelete from "./del";

const GrafikKepuasan = new Elysia({
    prefix: "/grafikkepuasan",
    tags: ["Data Kesehatan/Grafik Kepuasan"]
})
    .get("/:uuid", async (context) => {
        const response = await grafikKepuasanFindUnique(new Request(context.request));
        return response;
    })
    .get("/find-many", grafikKepuasanFindMany)
    .post("/create", grafikKepuasanCreate, {
        body: t.Object({
            label: t.String(),
            jumlah: t.String(),
        }),
    })
    .put("/:uuid", grafikKepuasanUpdate, {
        params: t.Object({
            uuid: t.String(),
        }),
        body: t.Object({
            label: t.String(),
            jumlah: t.String(),
        }),
    })
    .delete("/del/:uuid", grafikKepuasanDelete, {
        params: t.Object({
            uuid: t.String(),
        }),
    })
export default GrafikKepuasan