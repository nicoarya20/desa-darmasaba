import Elysia, { t } from "elysia";
import grafikKepuasanCreate from "./create";
import grafikKepuasanFindMany from "./find-many";

const GrafikKepuasan = new Elysia({
    prefix: "/grafikkepuasan",
    tags: ["Data Kesehatan/Grafik Kepuasan"]
})
    .get("/find-many", grafikKepuasanFindMany)
    .post("/create", grafikKepuasanCreate, {
        body: t.Object({
            label: t.String(),
            jumlah: t.String(),
        }),
    })
export default GrafikKepuasan