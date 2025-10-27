import Elysia, { t } from "elysia";
import tujuanEdukasiLingkunganFindUnique from "./findUnqiue";
import tujuanEdukasiLingkunganUpdate from "./updt";

const TujuanEdukasiLingkungan = new Elysia({
    prefix: "/tujuanedukasilingkungan",
    tags: ["Lingkungan/Edukasi Lingkungan/Tujuan Edukasi Lingkungan"]
})
    .get("/find-by-id", tujuanEdukasiLingkunganFindUnique)
    .post("/update", tujuanEdukasiLingkunganUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default TujuanEdukasiLingkungan