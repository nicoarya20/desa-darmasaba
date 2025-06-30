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
    .get("/:id", async (context) => {
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
    .put("/:id", grafikKepuasanUpdate, {
        params: t.Object({
            id: t.String(),
        }),
        body: t.Object({
            label: t.String(),
            jumlah: t.String(),
        }),
    })
    .delete("/del/:id", grafikKepuasanDelete, {
        params: t.Object({
            id: t.String(),
        }),
    })
export default GrafikKepuasan