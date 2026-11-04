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
        const response = await grafikKepuasanFindUnique(context.request);
        return response;
    })
    .get("/find-many", grafikKepuasanFindMany)
    .post("/create", grafikKepuasanCreate, {
        body: t.Object({
            nama: t.String(),
            tanggal: t.String(),
            jenisKelamin: t.String(),
            alamat: t.String(),
            penyakit: t.String(),
            banjarId: t.Optional(t.String()),
        }),
    })
    .put("/:id", grafikKepuasanUpdate, {
        body: t.Object({
            nama: t.String(),
            tanggal: t.String(),
            jenisKelamin: t.String(),
            alamat: t.String(),
            penyakit: t.String(),
            banjarId: t.Optional(t.String()),
        }),
    })
    .delete("/del/:id", grafikKepuasanDelete)
export default GrafikKepuasan