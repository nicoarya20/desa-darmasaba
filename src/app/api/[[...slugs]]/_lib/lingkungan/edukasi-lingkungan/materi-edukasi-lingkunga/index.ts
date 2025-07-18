import Elysia, { t } from "elysia";

import materiEdukasiLingkunganUpdate from "./updt";
import materiEdukasiLingkunganFindUnique from "./findUnique";

const MateriEdukasiLingkungan = new Elysia({
    prefix: "/materiedukasilingkungan",
    tags: ["Lingkungan/Edukasi Lingkungan/Materi Edukasi Lingkungan"]
})
    .get("/find-by-id", materiEdukasiLingkunganFindUnique)
    .post("/update", materiEdukasiLingkunganUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default MateriEdukasiLingkungan